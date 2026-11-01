// Requisiten für Maßstabsreisen (EXPERIMENT 2026-11-01, Branch experiment/reference-insights-2026-11;
// ergänzt für productions/what-if-fold-paper-42-times). Gleiche Konventionen wie props.js: Füße auf y = 0,
// Vorderseite +z, Zufall nur über rng, keine Schrift.
//
//   const st = P.paperStack({ w: 0.21, d: 0.15 });  st.userData.setHeight(0.0128);   // Höhe in Metern (Weltmaß)
//   const sh = P.paperSheet();                        sh.userData.setFold(k);           // 0 = flach, 1 = halb gefaltet
//   P.cloud({ size: 6 }) · P.airliner() (Länge ≈ 38 m, Nase +z; userData.setBank(a)) · P.moon({ radius: 1 })

export function createScaleProps(THREE, core, rng, base) {
  const { box, mat } = core;
  const { canvasTex } = base;

  // Papierkanten: feine helle/graue Streifen (Lagen), seitlich auf dem Stapel
  const edgeTex = canvasTex(64, 256, (c, W, H) => {
    c.fillStyle = '#f4f1ea';
    c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 4) {
      c.fillStyle = rng.next() < 0.5 ? '#d9d4c8' : '#e6e1d6';
      c.fillRect(0, y, W, 1);
    }
  });
  edgeTex.wrapS = edgeTex.wrapT = THREE.RepeatWrapping;

  // Stapel/Säule: Einheitswürfel, Höhe über scale.y. stripe = Weltmaß einer Texturkachel (m); bei großen Höhen wird
  // die Kachel mitwachsen gelassen (sonst flimmert die Textur), Schwelle über maxRepeat.
  const paperStack = ({ w = 0.21, d = 0.15, stripe = 0.02, maxRepeat = 60, glow = 0 } = {}) => {
    const g = new THREE.Group();
    const map = edgeTex.clone();
    map.needsUpdate = true;
    const side = new THREE.MeshStandardMaterial({ color: 0xffffff, map, roughness: 0.9, emissive: 0xffffff, emissiveIntensity: glow });
    const top = new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.85, emissive: 0xffffff, emissiveIntensity: glow });
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [side, side, top, top, side, side]);
    m.castShadow = true;
    m.receiveShadow = w < 5; // große Säulen: keine Schattenempfänger (Software-Renderer, stage.js MAX_RECEIVER_EDGE_M)
    m.position.y = 0.5;
    const body = new THREE.Group();
    body.add(m);
    body.scale.set(w, 0.0001, d);
    g.add(body);
    g.userData.setHeight = (h) => {
      body.scale.y = Math.max(0.0001, h);
      side.map.repeat.set(1, Math.min(maxRepeat, Math.max(1, h / stripe)));
    };
    g.userData.setGlow = (k) => {
      side.emissiveIntensity = k;
      top.emissiveIntensity = k;
    };
    g.userData.body = body;
    return g;
  };

  // Einzelnes Blatt, das sich um die Mittelachse (x) faltet: zwei Hälften, die vordere klappt nach hinten oben.
  const paperSheet = ({ w = 0.21, d = 0.297, color = 0xfbfaf6 } = {}) => {
    const g = new THREE.Group();
    const m = mat(color, { roughness: 0.85 });
    const back = box(w, 0.002, d / 2, m, [0, 0.001, -d / 4]);
    const hinge = new THREE.Group();
    const front = box(w, 0.002, d / 2, m, [0, 0.001, d / 4]);
    hinge.add(front);
    g.add(back, hinge);
    g.userData.setFold = (k) => {
      hinge.rotation.x = -Math.PI * Math.min(1, Math.max(0, k)) * 0.98;
      hinge.position.y = 0.002 * k;
    };
    return g;
  };

  // Wolke: Gruppe weicher Würfel (Low-Poly), leicht transparent
  const cloud = ({ size = 6, puffs = 7, opacity = 0.92 } = {}) => {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: opacity < 1, opacity, flatShading: true });
    for (let i = 0; i < puffs; i++) {
      const s = size * rng.range(0.35, 0.6);
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), m);
      p.position.set(rng.range(-size, size) * 0.8, rng.range(-0.15, 0.25) * size, rng.range(-size, size) * 0.4);
      p.scale.y = 0.6;
      p.castShadow = false;
      g.add(p);
    }
    return g;
  };

  // Verkehrsflugzeug (≈ 38 m), Nase +z. setBank(a): Querneigung (Bogenmaß) für Ausweichmanöver.
  const airliner = ({ body = 0xf2f4f7, accent = 0xe0b23a } = {}) => {
    const g = new THREE.Group();
    const inner = new THREE.Group();
    const bm = mat(body, { roughness: 0.5 });
    const am = mat(accent, { roughness: 0.6 });
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 34, 12), bm);
    fus.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), bm);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 17;
    nose.scale.y = 1.6;
    const tailCone = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 12), bm);
    tailCone.rotation.x = -Math.PI / 2;
    tailCone.position.z = -20;
    inner.add(fus, nose, tailCone);
    inner.add(box(36, 0.5, 6, bm, [0, -0.6, 1]));
    inner.add(box(12, 0.4, 3, bm, [0, 0.4, -19]));
    inner.add(box(0.5, 7, 4, am, [0, 1.4, -19.5]));
    for (const sx of [-1, 1]) {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4, 10), mat(0xb8bec6));
      eng.rotation.x = Math.PI / 2;
      eng.position.set(sx * 6.5, -2.0, 3);
      inner.add(eng);
    }
    // Fensterband
    inner.add(box(4.08, 0.35, 26, mat(0x2a3446, { roughness: 0.3 }), [0, 0.6, 1]));
    inner.traverse((o) => o.isMesh && (o.castShadow = true));
    g.add(inner);
    g.userData.setBank = (a) => (inner.rotation.z = a);
    return g;
  };

  // Mond: graue Kugel mit dunklen Flecken (Maria) und Kratern
  const moon = ({ radius = 1 } = {}) => {
    const tex = canvasTex(512, 256, (c, W, H) => {
      c.fillStyle = '#c9c7c2';
      c.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) {
        c.fillStyle = `rgba(110,108,104,${rng.range(0.25, 0.5)})`;
        c.beginPath();
        c.ellipse(rng.range(0, W), rng.range(H * 0.2, H * 0.8), rng.range(20, 70), rng.range(14, 40), rng.range(0, 3), 0, Math.PI * 2);
        c.fill();
      }
      for (let i = 0; i < 90; i++) {
        const x = rng.range(0, W);
        const y = rng.range(0, H);
        const r = rng.range(2, 9);
        c.strokeStyle = 'rgba(90,88,84,0.55)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.stroke();
      }
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
    const g = new THREE.Group();
    g.add(m);
    return g;
  };

  return { paperStack, paperSheet, cloud, airliner, moon };
}
