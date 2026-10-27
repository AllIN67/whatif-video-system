// Vorlage für productions/<slug>/scene.js
// build() baut die Szene einmal auf; update({ t, frame, shot }) setzt den Zustand für genau einen Frame.
// Regeln: Zustand NUR aus t ableiten (keine Variablen, die zwischen Frames hochgezählt werden),
// Zufall NUR über rng (geseedet), keine Uhr, keine Animationsschleife, keine Timer – sonst bricht der Render ab.
export async function build({ THREE, scene, rng, timeline, assetUrl }) {
  scene.background = new THREE.Color(0x9cc3e6);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5a46, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(30, 60, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  // Schattenempfänger fein unterteilen (Dreiecke ≤ 25 m), sonst falsche Schatten bei einzelnen Kameraposen
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 40, 40), new THREE.MeshStandardMaterial({ color: 0x7d9a62, flatShading: true }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const hero = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), new THREE.MeshStandardMaterial({ color: 0xff6b35, flatShading: true }));
  hero.castShadow = true;
  scene.add(hero);

  return {
    update({ t }) {
      hero.position.set(0, 2 + Math.max(0, 40 * (1 - t / 8)), 0);
      hero.rotation.y = t * 0.5;
    },
  };
}
