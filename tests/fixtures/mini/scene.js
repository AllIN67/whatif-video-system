// Test-Fixture: minimale Szene. Alles hängt nur von state.t ab.
export async function build({ THREE, scene, rng }) {
  scene.background = new THREE.Color(0x9cc3e6);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x556677, 1.3));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(10, 20, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80, 8, 8), new THREE.MeshStandardMaterial({ color: 0x7a9a5a, flatShading: true }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  for (let i = 0; i < 30; i++) {
    const h = rng.range(1, 6);
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, 1.5), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(rng.next(), 0.45, 0.6), flatShading: true }));
    m.position.set(rng.range(-15, 15), h / 2, rng.range(-15, 5));
    m.castShadow = true;
    scene.add(m);
  }
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xff6b35, flatShading: true }));
  ball.castShadow = true;
  scene.add(ball);
  return {
    update({ t }) {
      ball.position.set(Math.sin(t * 2) * 3, 1.2 + Math.abs(Math.sin(t * 3)) * 2, 0);
      ball.rotation.set(t, t * 0.7, 0);
    },
  };
}
