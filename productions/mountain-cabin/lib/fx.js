// Himmel, Wolken, Nebel, Regen, Schnee, Dampf/Rauch, Feuer, Wasserfall – alles aus t berechnet.
import { clamp01, smooth } from './noise.js';

export function createSky(THREE) {
  const uniforms = {
    top: { value: new THREE.Color(0.2, 0.38, 0.68) },
    horizon: { value: new THREE.Color(0.78, 0.8, 0.82) },
    ground: { value: new THREE.Color(0.3, 0.32, 0.34) },
    sunDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() },
    sunCol: { value: new THREE.Color(1, 0.85, 0.6) },
    sunDisc: { value: 1 },
    glow: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; }',
    fragmentShader: `
      uniform vec3 top; uniform vec3 horizon; uniform vec3 ground; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunDisc; uniform float glow;
      varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.5));
        c = mix(c, ground, smoothstep(0.0, -0.25, h));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += sunCol * (smoothstep(0.9993, 0.9997, s) * 6.0 * sunDisc + pow(s, 14.0) * 0.45 * glow + pow(s, 3.0) * 0.12 * glow);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(16000, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

// Wolken als Billboards (Sprites)
export function createClouds(THREE, tex, rng) {
  const g = new THREE.Group();
  const light = [tex.cloud(0), tex.cloud(31), tex.cloud(77)];
  const dark = [tex.cloud(11, true), tex.cloud(53, true), tex.cloud(91, true)];
  const fair = [];
  for (let i = 0; i < 26; i++) {
    const m = new THREE.SpriteMaterial({ map: light[i % 3], transparent: true, depthWrite: false, fog: false, color: 0xffffff, opacity: 0.8 });
    const s = new THREE.Sprite(m);
    const a = rng.range(-1.2, 1.2);
    const r = rng.range(2600, 7000);
    s.position.set(Math.sin(a) * r - 300, rng.range(900, 2100), -Math.cos(a) * r);
    const w = rng.range(900, 2400);
    s.scale.set(w, w * rng.range(0.32, 0.5), 1);
    g.add(s);
    fair.push({ s, base: s.position.clone(), sp: rng.range(4, 12) });
  }
  // Sturmfront: kommt von hinter der fernen Kette über das Tal
  const storm = [];
  for (let i = 0; i < 46; i++) {
    const m = new THREE.SpriteMaterial({ map: dark[i % 3], transparent: true, depthWrite: false, fog: false, color: 0x6c727a, opacity: 0 });
    const s = new THREE.Sprite(m);
    const x = rng.range(-4500, 4000);
    const z0 = rng.range(-9500, -6000);
    const y = rng.range(1300, 2300);
    const w = rng.range(2200, 4200);
    s.scale.set(w, w * rng.range(0.35, 0.55), 1);
    g.add(s);
    storm.push({ s, x, z0, z1: z0 + rng.range(5500, 8000), y, ph: rng.range(0, 1) });
  }
  return { group: g, fair, storm };
}

// Nebelschichten im Tal (Textur wandert mit t)
export function createMist(THREE, tex) {
  const g = new THREE.Group();
  const layers = [];
  const t0 = tex.mist();
  for (const [y, size, cx, cz, rep, op] of [[-205, 2600, -150, -1050, 3, 0.65], [-175, 3200, -150, -1200, 2.2, 0.5], [-120, 4200, -100, -1500, 1.6, 0.35], [420, 7000, 0, -6200, 1.2, 0.3]]) {
    const t = t0.clone();
    t.repeat.set(rep, rep);
    t.needsUpdate = true;
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, depthWrite: false, color: 0xe8eef2, fog: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, y, cz);
    mesh.renderOrder = 2;
    g.add(mesh);
    layers.push({ mesh, m, t, op });
  }
  return { group: g, layers };
}

// Partikelfeld, dessen Teilchen in einem Kasten um einen Mittelpunkt (Kamera) liegen.
// mode 'rain': senkrechte Schlieren; 'snow': runde Flocken. Position = f(Basis, t) im Shader.
export function createPrecip(THREE, rng, mode, count, tex) {
  const quad = new THREE.PlaneGeometry(1, 1);
  quad.translate(0, mode === 'rain' ? -0.5 : 0, 0);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.attributes.position = quad.attributes.position;
  geo.attributes.uv = quad.attributes.uv;
  const base = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) base.set([rng.next(), rng.next(), rng.next(), rng.next()], i * 4);
  geo.setAttribute('base', new THREE.InstancedBufferAttribute(base, 4));
  geo.instanceCount = count;
  const uniforms = {
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
    uBox: { value: new THREE.Vector3(30, 18, 30) },
    uAmount: { value: 0 },
    uWind: { value: new THREE.Vector2(2.5, 0.5) },
    uColor: { value: new THREE.Color(0.75, 0.8, 0.86) },
    uOpacity: { value: 0.5 },
    map: { value: tex.puff() },
  };
  const rain = mode === 'rain';
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute vec4 base; uniform float uTime; uniform vec3 uCenter; uniform vec3 uBox; uniform float uAmount; uniform vec2 uWind;
      varying vec2 vUv; varying float vA;
      void main(){
        vUv = uv;
        float speed = ${rain ? '11.0' : '0.9'} * (0.8 + 0.4 * base.w);
        vec3 p = (base.xyz - 0.5) * uBox;
        float fall = uTime * speed;
        p.y = mod(p.y - fall + uBox.y * 0.5, uBox.y) - uBox.y * 0.5;
        p.x += uWind.x * ${rain ? '0.25' : '1.0'} * (uTime + base.y * 7.0) ${rain ? '' : '+ sin(uTime * 0.9 + base.w * 20.0) * 0.4'};
        p.z += uWind.y * (uTime + base.y * 7.0) ${rain ? '' : '+ cos(uTime * 0.7 + base.x * 20.0) * 0.4'};
        // in Kasten um die Kamera falten
        p.xz = mod(p.xz - uCenter.xz + uBox.xz * 0.5, uBox.xz) - uBox.xz * 0.5 + uCenter.xz;
        p.y += uCenter.y;
        vA = step(base.z, uAmount);
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        ${rain
          ? 'vec3 up = normalize(vec3(-uWind.x * 0.25, -speed, -uWind.y) * -1.0); float w = 0.012; float l = 0.55;'
          : 'vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]); float w = 0.035 + 0.03 * base.w; float l = w;'}
        vec3 wp = p + right * position.x * w + up * position.y * l;
        vec4 mv = viewMatrix * vec4(wp, 1.0);
        float d = -mv.z;
        vA *= smoothstep(0.25, 1.2, d) * (1.0 - smoothstep(uBox.x * 0.35, uBox.x * 0.5, d));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D map; uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; varying float vA;
      void main(){
        ${rain ? 'float a = (1.0 - abs(vUv.x - 0.5) * 2.0) * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.6, vUv.y);' : 'float a = texture2D(map, vUv).a;'}
        a *= vA * uOpacity;
        if (a < 0.003) discard;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, uniforms };
}

// Rauch/Dampf-Wolke aus Sprites mit Lebenszyklus phase = fract(t * rate + i / n)
export function createPuffs(THREE, tex, rng, n, { color = 0xffffff, size = 0.1, grow = 3, rise = 0.5, drift = [0, 0], sway = 0.03, opacity = 0.35, additive = false } = {}) {
  const g = new THREE.Group();
  const map = tex.puff();
  const items = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map, color, transparent: true, depthWrite: false, opacity: 0, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    const s = new THREE.Sprite(m);
    g.add(s);
    items.push({ s, m, off: i / n, ph: rng.range(0, 6.28), dx: rng.range(-1, 1), dz: rng.range(-1, 1) });
  }
  // amount 0..1 · rate Zyklen/s
  function update(t, amount, rate = 0.5) {
    for (const it of items) {
      const p = (((t * rate + it.off) % 1) + 1) % 1;
      const sc = size * (1 + grow * p);
      it.s.scale.set(sc, sc, 1);
      it.s.position.set(
        it.dx * size * 0.4 + Math.sin(t * 1.3 + it.ph + p * 4) * sway * (0.3 + p) + drift[0] * p,
        rise * p,
        it.dz * size * 0.4 + Math.cos(t * 1.1 + it.ph) * sway * 0.6 * p + drift[1] * p,
      );
      it.m.opacity = amount * opacity * Math.sin(Math.PI * p) * (1 - p * 0.3);
      it.s.material.rotation = it.ph + t * 0.2;
    }
    g.visible = amount > 0.001;
  }
  return { group: g, update };
}

// Feuer: additive Flammen-Sprites + Glut
export function createFire(THREE, tex, rng, n = 9) {
  const g = new THREE.Group();
  const map = tex.flame();
  const items = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false });
    const s = new THREE.Sprite(m);
    s.center.set(0.5, 0.05);
    g.add(s);
    items.push({ s, m, x: rng.range(-0.2, 0.2), z: rng.range(-0.22, 0.22), ph: rng.range(0, 6.28), f: rng.range(5, 9), h: rng.range(0.22, 0.45) });
  }
  function update(t, amount) {
    for (const it of items) {
      const flick = 0.75 + 0.15 * Math.sin(t * it.f + it.ph) + 0.1 * Math.sin(t * it.f * 2.3 + it.ph * 2);
      const hh = it.h * amount * flick;
      it.s.scale.set(hh * 0.55, hh, 1);
      it.s.position.set(it.x * (0.5 + 0.5 * amount), 0, it.z * (0.5 + 0.5 * amount));
      it.m.opacity = clamp01(amount * 1.3) * (0.55 + 0.25 * flick);
    }
    g.visible = amount > 0.001;
  }
  return { group: g, update };
}

// Wasserfall: gebogene Bänder mit wandernder Textur + Gischt
export function createWaterfall(THREE, tex, rng, { top, bottom, width, normal }) {
  const g = new THREE.Group();
  const fallTex = tex.fall();
  const sheets = [];
  const h = top[1] - bottom[1];
  for (let k = 0; k < 3; k++) {
    const t = fallTex.clone();
    t.repeat.set(1 + k * 0.3, h / 9);
    t.needsUpdate = true;
    const geo = new THREE.PlaneGeometry(width * (1 - k * 0.15), h, 8, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = (pos.getY(i) + h / 2) / h; // 0 unten, 1 oben
      // Bogen: oben leicht vorgewölbt, unten vor der Wand
      pos.setZ(i, 0.9 * Math.sin(v * Math.PI * 0.9) + (1 - v) * 1.4 + k * 0.25 + 0.15 * Math.cos(pos.getX(i) * 2));
    }
    geo.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, opacity: 0.85 - k * 0.2, roughness: 0.25, depthWrite: false, side: THREE.DoubleSide, emissive: 0x334455, emissiveIntensity: 0.25 });
    const mesh = new THREE.Mesh(geo, m);
    g.add(mesh);
    sheets.push({ mesh, t, speed: 1.6 + k * 0.4 });
  }
  g.position.set((top[0] + bottom[0]) / 2, (top[1] + bottom[1]) / 2, (top[2] + bottom[2]) / 2);
  g.rotation.y = Math.atan2(normal[0], normal[1]);
  const spray = createPuffs(THREE, tex, rng, 34, { color: 0xeef4f8, size: 1.4, grow: 2.2, rise: 3.5, drift: [0, 2.5], sway: 0.8, opacity: 0.28 });
  spray.group.position.set(bottom[0] + normal[0] * 1.2, bottom[1] - 0.2, bottom[2] + normal[1] * 1.2);
  function update(t) {
    for (const s of sheets) s.t.offset.y = (t * s.speed) % 1;
    spray.update(t, 1, 0.35);
  }
  return { group: g, spray: spray.group, update };
}
