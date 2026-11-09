// Fertige 3D-Modelle (GLB/glTF) im Baukasten – Qualitäts-Upgrade V4, Phase 4 (additiv, opt-in).
// Nur Modelle mit geprüfter Lizenz (CC0 bevorzugt) verwenden; Quelle + Lizenz stehen im Register (pipeline/runtime/kit/assets/models/registry.json)
// und werden beim Laden mitgeführt (M.credits() für LOG/Beschreibung).
//
//   const M = kit.models;
//   await M.load('truck', '/pipeline/runtime/kit/assets/models/kenney-racing/vehicle-truck-red.glb', { height: 2.6, license: 'CC0', source: 'Kenney Starter-Kit-Racing' });
//   const t = M.place('truck', [x, 0, z], { yaw: Math.PI / 2 });          // Klon, wirft/empfängt Schatten
//   M.recolor(t, { 'body': 0x7d838c });                                      // Material nach Name (Teilstring) umfärben
//   const trees = M.instances('tree', [[x, 0, z, yaw, s], …]);               // viele Kopien (InstancedMesh je Teilnetz)
//   await M.loadRegistry('/pipeline/runtime/kit/assets/models/registry.json');                    // alle freigegebenen Modelle mit Metadaten
//
// Determinismus: Laden ist deterministisch (keine Zeit, kein Zufall). Kein Zufall aus rng.

export function createModels(THREE) {
  const lib = new Map(); // name → { scene, meta }
  let loaderP = null;
  const loader = () =>
    (loaderP ||= import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader()));

  // Modell laden und normieren: Fußpunkt auf y = 0, mittig in x/z; height ODER size (größte Kante) in Metern.
  const load = async (name, url, { height, size, license, source, author } = {}) => {
    if (lib.has(name)) return lib.get(name);
    if (!license) throw new Error(`models.load("${name}"): Lizenz fehlt – nur geprüfte Modelle verwenden`);
    const gltf = await (await loader()).loadAsync(url);
    const root = gltf.scene;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const dim = box.getSize(new THREE.Vector3());
    let s = 1;
    if (height) s = height / Math.max(dim.y, 1e-6);
    else if (size) s = size / Math.max(dim.x, dim.y, dim.z, 1e-6);
    const holder = new THREE.Group();
    holder.name = `model:${name}`;
    root.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    const scaled = new THREE.Group();
    scaled.scale.setScalar(s);
    scaled.add(root);
    holder.add(scaled);
    holder.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const entry = { scene: holder, meta: { name, url, license, source: source || '', author: author || '', dims: dim.multiplyScalar(s).toArray().map((v) => +v.toFixed(3)) } };
    lib.set(name, entry);
    return entry;
  };

  const get = (name) => {
    const e = lib.get(name);
    if (!e) throw new Error(`models: "${name}" nicht geladen (zuerst await M.load / M.loadRegistry)`);
    return e;
  };

  // Klon platzieren. Materialien werden geteilt; recolor() erzeugt eigene Kopien für diese Instanz.
  const place = (name, pos = [0, 0, 0], { yaw = 0, scale = 1 } = {}) => {
    const c = get(name).scene.clone(true);
    c.position.set(pos[0], pos[1], pos[2]);
    c.rotation.y = yaw;
    c.scale.multiplyScalar(scale);
    return c;
  };

  // Umfärben nach Materialname (Teilstring, ohne Groß/Klein) oder '*' für alle.
  const recolor = (obj, map) => {
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      const out = ms.map((m) => {
        const key = Object.keys(map).find((k) => k === '*' || (m.name || '').toLowerCase().includes(k.toLowerCase()));
        if (key == null) return m;
        const c = m.clone();
        c.color.set(map[key]);
        if (c.map && map[key] != null) c.map = null; // Farbatlas entfernen, sonst wirkt die Farbe nicht
        c.needsUpdate = true;
        return c;
      });
      o.material = Array.isArray(o.material) ? out : out[0];
    });
    return obj;
  };

  // Viele Kopien eines Modells: je Teilnetz ein InstancedMesh. items: [[x, y, z, yaw = 0, scale = 1], …]
  const instances = (name, items) => {
    const src = get(name).scene;
    src.updateMatrixWorld(true);
    const group = new THREE.Group();
    group.name = `instances:${name}`;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    src.traverse((o) => {
      if (!o.isMesh) return;
      const im = new THREE.InstancedMesh(o.geometry, o.material, items.length);
      im.castShadow = true;
      im.receiveShadow = true;
      items.forEach(([x, y, z, yaw = 0, s = 1], i) => {
        q.setFromAxisAngle(up, yaw);
        m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s)).multiply(o.matrixWorld);
        im.setMatrixAt(i, m);
      });
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      group.add(im);
    });
    return group;
  };

  // Register: [{ name, file, height?, size?, license, source, author? }] – Pfade relativ zur Registerdatei.
  const loadRegistry = async (url, only) => {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    const reg = await r.json();
    const base = url.replace(/[^/]*$/, '');
    const list = (reg.models || []).filter((e) => !only || only.includes(e.name));
    for (const e of list) await load(e.name, base + e.file, e);
    return list.map((e) => e.name);
  };

  const credits = () => [...lib.values()].map((e) => e.meta);

  return { load, loadRegistry, place, recolor, instances, get, credits, has: (n) => lib.has(n) };
}
