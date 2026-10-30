// Effekte mit Erzählfunktion (Style-Guide 8): deterministisch aus t, Zufall nur über das geseedete rng.
//   const rain = kit.fx.rain({ center: [0, 0, 0], size: [16, 12, 16] }); scene.add(rain.root); rain.update(t, k)
//   const pop = kit.fx.burst({ color: 0xffe14a }); scene.add(pop.root); pop.update(t − tEreignis, [x, y, z])
export function createFx(THREE, rng) {
  // Regen: Instanzen dünner Striche, fallen mit fester Geschwindigkeit; k = Stärke 0…1 (blendet Tropfen ein/aus)
  const rain = ({ center = [0, 0, 0], size = [16, 12, 16], count = 900, speed = 14, color = 0xb8c8e0 } = {}) => {
    const geo = new THREE.BoxGeometry(0.012, 0.42, 0.012);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.frustumCulled = false;
    const seeds = Array.from({ length: count }, () => [rng.next(), rng.next(), rng.next()]);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.12);
    const sc = new THREE.Vector3(1, 1, 1);
    const p = new THREE.Vector3();
    return {
      root: mesh,
      update(t, k = 1) {
        mesh.visible = k > 0.01;
        mat.opacity = 0.55 * Math.min(1, k);
        for (let i = 0; i < count; i++) {
          const [a, b, c] = seeds[i];
          const y = size[1] - ((t * speed + c * size[1]) % size[1]);
          p.set(center[0] + (a - 0.5) * size[0] + y * 0.12, center[1] + y, center[2] + (b - 0.5) * size[2]);
          sc.setScalar(i / count < k ? 1 : 0.0001);
          m.compose(p, q, sc);
          mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
  };
  // Funken-/Konfetti-Stoß (Ereignis sichtbar machen: Aufladen, Treffer, Gewinn); s = Sekunden seit dem Ereignis
  const burst = ({ count = 26, color = 0xffe14a, speed = 2.2, life = 0.8, size = 0.05 } = {}) => {
    const root = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, transparent: true });
    const parts = Array.from({ length: count }, () => {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(size, 0), mat);
      root.add(mesh);
      const th = rng.next() * Math.PI * 2;
      const ph = rng.range(0.2, 1.3);
      return { mesh, v: [Math.cos(th) * Math.cos(ph), Math.sin(ph), Math.sin(th) * Math.cos(ph)].map((x) => x * speed * rng.range(0.5, 1)) };
    });
    return {
      root,
      update(s, at) {
        const on = s >= 0 && s < life;
        root.visible = on;
        if (!on) return;
        root.position.set(at[0], at[1], at[2]);
        mat.opacity = 1 - s / life;
        for (const pt of parts) {
          pt.mesh.position.set(pt.v[0] * s, pt.v[1] * s - 2.5 * s * s, pt.v[2] * s);
          pt.mesh.rotation.set(s * 9, s * 7, 0);
        }
      },
    };
  };
  return { rain, burst };
}
