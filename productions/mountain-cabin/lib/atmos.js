// Atmosphäre: Entfernungsdunst + Talnebel (Höhennebel) für alle Materialien.
// Ersetzt die Nebel-Bausteine der Shader; gemeinsame Uniforms werden pro Frame aus t gesetzt.
export function createAtmosphere(THREE) {
  const U = {
    uHaze: { value: new THREE.Vector4(0.00017, 0, 0, 0) }, // x Dichte Dunst
    uMist: { value: new THREE.Vector4(0, -175, 45, 0.004) }, // x Menge, y Obergrenze (m), z Abfall (m), w Dichte je m Sicht
    uMistColor: { value: new THREE.Color(0.92, 0.94, 0.96) },
    uHazeColor: { value: new THREE.Color(0.75, 0.8, 0.85) },
  };
  const parsV = `
    #ifdef USE_FOG
      varying vec3 vFogWorld;
      varying float vFogDepth;
    #endif`;
  const vert = `
    #ifdef USE_FOG
      vFogDepth = - mvPosition.z;
      vFogWorld = cameraPosition + transpose(mat3(viewMatrix)) * mvPosition.xyz;
    #endif`;
  const parsF = `
    #ifdef USE_FOG
      uniform vec4 uHaze; uniform vec4 uMist; uniform vec3 uMistColor; uniform vec3 uHazeColor;
      varying vec3 vFogWorld;
      varying float vFogDepth;
    #endif`;
  const frag = `
    #ifdef USE_FOG
      float fd = vFogDepth;
      float haze = 1.0 - exp(- uHaze.x * uHaze.x * fd * fd);
      // Höhennebel: Flächen unterhalb uMist.y vernebeln mit der Sichtweite
      float inLayer = exp(- max(0.0, vFogWorld.y - uMist.y) / uMist.z);
      float wisp = 0.62 + 0.38 * sin(vFogWorld.x * 0.0031 + vFogWorld.z * 0.0017 + uHaze.y * 0.05) * sin(vFogWorld.z * 0.0043 - vFogWorld.x * 0.0012 + 1.7);
      float mist = uMist.x * (1.0 - exp(- fd * uMist.w)) * inLayer * wisp;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, uHazeColor, haze);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, uMistColor, clamp(mist, 0.0, 0.95));
    #endif`;

  function patch(material) {
    if (material.isShaderMaterial || material.userData.atmos) return;
    material.userData.atmos = true;
    const prev = material.onBeforeCompile;
    const prevKey = material.customProgramCacheKey;
    material.onBeforeCompile = (sh, r) => {
      if (prev) prev(sh, r);
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <fog_pars_vertex>', parsV).replace('#include <fog_vertex>', vert);
      sh.fragmentShader = sh.fragmentShader.replace('#include <fog_pars_fragment>', parsF).replace('#include <fog_fragment>', frag);
    };
    material.customProgramCacheKey = () => 'atmos|' + (prevKey ? prevKey.call(material) : '');
  }
  function apply(root) {
    root.traverse((o) => {
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of ms) patch(m);
    });
  }
  return { U, apply };
}

// Vignette als Fläche vor der Kamera (Kind der Kamera)
export function createVignette(THREE, camera) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 40, 128, 128, 182);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.04)');
  g.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
  mesh.renderOrder = 1000;
  mesh.frustumCulled = false;
  camera.add(mesh);
  function update(fovDeg, strength = 1) {
    const d = 0.05;
    const h = 2 * d * Math.tan((fovDeg * Math.PI) / 360) * 1.02;
    mesh.position.set(0, 0, -d);
    mesh.scale.set(h * (1080 / 1920), h, 1);
    m.opacity = strength;
  }
  return { mesh, update };
}
