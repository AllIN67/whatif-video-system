// What If Every Lie Cost You One Minute of Your Life? – 3D-Szene.
// Regel: jeder sichtbare Zustand ist eine reine Funktion von state.t (kein Zustand, der zwischen Frames
// weitergezählt wird). Zufall nur über den geseedeten rng. Countdown-Werte kommen aus timeline.json
// (dieselben HUD-Segmente wie die Text-Ebene), damit 3D-Anzeige und HUD nie auseinanderlaufen.
import { interpolate, cameraAt } from '/pipeline/runtime/timeline.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const ramp = (t, a, b) => smooth((t - a) / (b - a)); // 0 → 1 zwischen a und b
const lerp = (a, b, x) => a + (b - a) * x;
const between = (t, a, b) => t >= a && t < b;

const SIGNAL = '#38E1C6';
const ALARM = '#FF4545';

// ---------------------------------------------------------------- Countdown über dem Kopf
// Ziffern (sprachneutral, Gruppierung mit schmalem Leerzeichen) auf einer Canvas-Textur.
// Neu gezeichnet wird nur, wenn sich der aus t abgeleitete Inhalt ändert.
function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, x) {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * x)).join(',')})`;
}
const group3 = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function makeCountdown(THREE, size = 1) {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 192;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 10;
  sprite.center.set(0.5, 0.3);
  let key = null;
  return {
    sprite,
    // value: Minuten; alarm 0..1 (Signal → Rot); delta 0..1 (Sichtbarkeit „−1:00“); scale; opacity
    set(value, alarm, delta, scale, opacity) {
      sprite.scale.set(0.5 * size * scale, 0.1875 * size * scale, 1);
      mat.opacity = opacity;
      sprite.visible = opacity > 0.001 && scale > 0.001;
      const k = `${Math.round(value)}|${alarm.toFixed(2)}|${delta.toFixed(2)}`;
      if (k === key) return;
      key = k;
      ctx.clearRect(0, 0, 512, 192);
      const col = mix(SIGNAL, ALARM, alarm);
      ctx.fillStyle = 'rgba(3,8,12,0.55)';
      ctx.beginPath();
      ctx.roundRect(24, 22, 464, 104, 52);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.font = '700 66px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = col;
      ctx.shadowBlur = 18;
      ctx.fillStyle = col;
      ctx.fillText(group3(value), 256, 76);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.9;
      ctx.fillText(group3(value), 256, 76);
      ctx.globalAlpha = 1;
      if (delta > 0.001) {
        ctx.globalAlpha = delta;
        ctx.font = '700 46px "JetBrains Mono"';
        ctx.fillStyle = ALARM;
        ctx.shadowColor = ALARM;
        ctx.shadowBlur = 14;
        ctx.fillText('−1:00', 256, 160);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      tex.needsUpdate = true;
    },
  };
}

// Countdown-Zustand aus einer Liste von Verlustzeitpunkten (−1 Minute je Lüge) und Warnpulsen
function countdownState(t, base, drops, warns = []) {
  let value = base;
  let alarm = 0;
  let delta = 0;
  let scale = 1;
  for (const d of drops) {
    if (t < d) continue;
    value -= 1;
    const x = t - d;
    if (x < 0.9) alarm = Math.max(alarm, x < 0.35 ? 1 : 1 - (x - 0.35) / 0.55);
    if (x < 1.5) delta = Math.max(delta, x < 1.0 ? 1 : 1 - (x - 1.0) / 0.5);
    if (x < 0.45) scale = Math.max(scale, 1 + 0.28 * Math.pow(1 - x / 0.45, 2));
  }
  for (const w of warns) {
    const x = (t - w) / 0.7;
    if (x >= 0 && x < 1) {
      const k = Math.sin(Math.PI * x);
      alarm = Math.max(alarm, 0.5 * k);
      scale = Math.max(scale, 1 + 0.08 * k);
    }
  }
  return { value, alarm, delta, scale };
}

// ---------------------------------------------------------------- Figuren
// Stilisierte Figur: Hüfte → Wirbelsäule → Brust/Kopf; Arme per 2-Gelenk-IK oder Winkeln, Beine per Winkeln.
// Lokale Blickrichtung +z; linke Körperseite liegt bei +x.
function makePersonFactory(THREE) {
  const matCache = new Map();
  const mat = (hex, rough = 0.8) => {
    const k = `${hex}|${rough}`;
    if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 }));
    return matCache.get(k);
  };
  const G = {
    capsule: (r, l) => new THREE.CapsuleGeometry(r, l, 4, 12),
    sphere: (r, w = 18, h = 14) => new THREE.SphereGeometry(r, w, h),
    box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  };
  const DOWN = new THREE.Vector3(0, -1, 0);
  const vS = new THREE.Vector3();
  const vT = new THREE.Vector3();
  const vP = new THREE.Vector3();
  const vE = new THREE.Vector3();
  const vU = new THREE.Vector3();
  const vV = new THREE.Vector3();
  const qW = new THREE.Quaternion();
  const qP = new THREE.Quaternion();

  return function makePerson(o) {
    const m = (geo, material, parent, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const skin = mat(o.skin || 0xc99a7a, 0.65);
    const top = mat(o.top || 0x2d3a4a);
    const bottom = mat(o.bottom || 0x23262c);
    const shoe = mat(o.shoes || 0x15161a, 0.6);
    const hairM = mat(o.hair || 0x2a1d16, 0.9);
    const dark = mat(0x140f0d, 0.4);
    const lipM = mat(o.lips || 0x7a3f37, 0.6);

    const root = new THREE.Group();
    const body = new THREE.Group(); // Skalierung (Kind) auf dieser Ebene
    root.add(body);
    const s = o.scale || 1;
    body.scale.setScalar(s);

    const hips = new THREE.Object3D();
    hips.position.y = 0.93;
    body.add(hips);
    m(G.box(0.31, 0.17, 0.2), bottom, hips, 0, 0.02, 0);
    if (o.skirt) {
      const sk = m(new THREE.CylinderGeometry(0.17, 0.27, 0.42, 16), bottom, hips, 0, -0.17, 0);
      sk.scale.z = 0.85;
    }
    const spine = new THREE.Object3D();
    spine.position.y = 0.06;
    hips.add(spine);
    const torso = m(G.capsule(0.15, 0.26), top, spine, 0, 0.25, 0);
    torso.scale.set(1.18, 1, 0.74);
    if (o.collar) m(G.box(0.1, 0.035, 0.03), mat(o.collar), spine, 0, 0.5, 0.085);
    if (o.coat) {
      const c = m(G.capsule(0.165, 0.42), mat(o.coat), spine, 0, 0.16, 0);
      c.scale.set(1.16, 1, 0.78);
    }
    const neck = new THREE.Object3D();
    neck.position.y = 0.53;
    spine.add(neck);
    m(new THREE.CylinderGeometry(0.048, 0.055, 0.1, 10), skin, neck, 0, 0.03, 0);
    const head = new THREE.Object3D();
    head.position.y = 0.075;
    neck.add(head);
    const hs = o.headScale || 1;
    const headG = new THREE.Group();
    headG.scale.setScalar(hs);
    head.add(headG);
    const skull = m(G.sphere(0.108, 24, 18), skin, headG, 0, 0.115, 0);
    skull.scale.set(0.9, 1.08, 0.98);
    m(G.sphere(0.016, 8, 6), skin, headG, 0, 0.1, 0.102); // Nase
    m(G.sphere(0.02, 8, 6), skin, headG, 0.098, 0.11, 0);
    m(G.sphere(0.02, 8, 6), skin, headG, -0.098, 0.11, 0);
    const eyes = [];
    for (const x of [0.036, -0.036]) {
      const e = m(G.sphere(0.0165, 12, 10), dark, headG, x, 0.128, 0.091);
      e.scale.z = 0.55;
      e.castShadow = false;
      eyes.push(e);
    }
    const brows = [];
    for (const x of [0.037, -0.037]) {
      const b = m(G.box(0.046, 0.012, 0.014), hairM, headG, x, 0.16, 0.095);
      b.castShadow = false;
      brows.push(b);
    }
    const mouth = m(G.box(0.05, 0.011, 0.014), lipM, headG, 0, 0.064, 0.096);
    mouth.castShadow = false;
    // Haare
    const hairStyle = o.hairStyle || 'short';
    if (hairStyle !== 'bald') {
      const cap = m(new THREE.SphereGeometry(0.117, 22, 14, 0, Math.PI * 2, 0, hairStyle === 'short' ? 1.2 : 1.4), hairM, headG, 0, 0.122, -0.008);
      cap.rotation.x = -0.2;
      cap.scale.set(0.96, 1.06, 1.03);
    }
    if (hairStyle === 'long') {
      const back = m(G.capsule(0.095, 0.16), hairM, headG, 0, 0.03, -0.055);
      back.scale.set(1.15, 1, 0.6);
    }
    if (hairStyle === 'bun') m(G.sphere(0.05, 12, 10), hairM, headG, 0, 0.2, -0.085);
    if (hairStyle === 'bob') {
      const back = m(G.capsule(0.1, 0.06), hairM, headG, 0, 0.08, -0.03);
      back.scale.set(1.12, 1, 0.85);
    }

    // Arme
    const L1 = 0.29;
    const L2 = 0.27;
    const arms = {};
    for (const side of ['l', 'r']) {
      const sx = side === 'l' ? 1 : -1;
      const sh = new THREE.Object3D();
      sh.position.set(0.2 * sx, 0.45, 0);
      spine.add(sh);
      m(G.sphere(0.062, 12, 10), o.coat ? mat(o.coat) : top, sh, 0, 0, 0);
      m(G.capsule(0.052, L1 - 0.06), o.coat ? mat(o.coat) : top, sh, 0, -L1 / 2, 0);
      const el = new THREE.Object3D();
      el.position.y = -L1;
      sh.add(el);
      m(G.capsule(0.044, L2 - 0.05), o.coat ? mat(o.coat) : top, el, 0, -L2 / 2, 0);
      const hand = new THREE.Object3D();
      hand.position.y = -L2;
      el.add(hand);
      const hm = m(G.sphere(0.042, 12, 10), skin, hand, 0, -0.035, 0);
      hm.scale.set(0.8, 1.15, 0.6);
      arms[side] = { sh, el, hand, sx };
    }
    // Beine
    const legs = {};
    for (const side of ['l', 'r']) {
      const sx = side === 'l' ? 1 : -1;
      const hip = new THREE.Object3D();
      hip.position.set(0.09 * sx, -0.02, 0);
      hips.add(hip);
      m(G.capsule(0.068, 0.3), bottom, hip, 0, -0.21, 0);
      const knee = new THREE.Object3D();
      knee.position.y = -0.44;
      hip.add(knee);
      m(G.capsule(0.055, 0.3), bottom, knee, 0, -0.2, 0);
      const ankle = new THREE.Object3D();
      ankle.position.y = -0.42;
      knee.add(ankle);
      m(G.box(0.1, 0.07, 0.24), shoe, ankle, 0, -0.035, 0.05);
      legs[side] = { hip, knee, ankle };
    }

    function solveArm(side, target, pole) {
      const a = arms[side];
      const k = s; // Gliedlängen skalieren mit der Figur
      const l1 = L1 * k;
      const l2 = L2 * k;
      a.sh.parent.updateWorldMatrix(true, false);
      vS.copy(a.sh.position);
      a.sh.parent.localToWorld(vS);
      vT.copy(target);
      const d0 = vT.distanceTo(vS);
      const d = Math.min(Math.max(d0, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
      vU.subVectors(vT, vS).normalize();
      const ca = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(0, l1 * l1 - ca * ca));
      vV.subVectors(pole, vS);
      vV.addScaledVector(vU, -vV.dot(vU)).normalize();
      vE.copy(vS).addScaledVector(vU, ca).addScaledVector(vV, h);
      // Oberarm
      a.sh.parent.getWorldQuaternion(qP);
      qW.setFromUnitVectors(DOWN, vP.subVectors(vE, vS).normalize());
      a.sh.quaternion.copy(qP.invert().multiply(qW));
      a.sh.updateWorldMatrix(false, false);
      // Unterarm (Endpunkt = Ziel, ggf. auf Reichweite begrenzt)
      vT.copy(vS).addScaledVector(vU, d);
      a.sh.getWorldQuaternion(qP);
      qW.setFromUnitVectors(DOWN, vP.subVectors(vT, vE).normalize());
      a.el.quaternion.copy(qP.invert().multiply(qW));
    }

    const p = {
      root,
      head,
      headG,
      hips,
      spine,
      arms,
      legs,
      // Gesichts-/Körperhaltung setzen. Alle Werte optional; Standard = neutral stehend.
      pose(q) {
        hips.position.y = q.sit ? lerp(0.93, (q.seat ?? 0.5) / s, q.sit) : 0.93 + (q.bob || 0);
        hips.rotation.set(q.hipPitch || 0, q.hipYaw || 0, q.hipRoll || 0);
        spine.rotation.set(q.lean || 0, q.twist || 0, q.roll || 0);
        neck.rotation.set((q.headPitch || 0) * 0.35, (q.headYaw || 0) * 0.35, 0);
        head.rotation.set((q.headPitch || 0) * 0.65, (q.headYaw || 0) * 0.65, q.headRoll || 0);
        // Beine
        for (const side of ['l', 'r']) {
          const L = q[side + 'Leg'] || [0, 0];
          const sit = q.sit || 0;
          legs[side].hip.rotation.set(L[0] - (Math.PI / 2) * sit, 0, (L[2] || 0) * (side === 'l' ? 1 : -1));
          legs[side].knee.rotation.set(L[1] + (Math.PI / 2) * sit, 0, 0);
          legs[side].ankle.rotation.set(-(L[1] + L[0]) * 0.3 * (1 - sit), 0, 0);
        }
        // Arme: Winkel [pitch, roll, elbow] (Standard locker hängend)
        for (const side of ['l', 'r']) {
          const A = q[side + 'Arm'] || [0.05, 0.08, -0.15];
          arms[side].sh.rotation.set(A[0], A[3] || 0, A[1] * arms[side].sx);
          arms[side].el.rotation.set(A[2], 0, 0);
        }
        // Gesicht: brows > 0 traurig/besorgt (innen hoch), < 0 misstrauisch/verärgert; surprise hebt beide
        const br = q.brows || 0;
        const su = q.surprise || 0;
        // innere Brauenenden (zur Gesichtsmitte) heben sich bei br > 0
        brows[0].rotation.z = -0.32 * br;
        brows[1].rotation.z = 0.32 * br;
        for (const b of brows) b.position.y = 0.16 + 0.013 * su + 0.003 * Math.abs(br);
        const blink = q.blink || 0;
        const eo = Math.max(0.12, (1 - blink) * (1 + 0.25 * su) * (1 - 0.35 * (q.squint || 0)));
        for (const e of eyes) e.scale.set(1, eo, 0.55);
        mouth.scale.set(1 + 0.25 * (q.smile || 0) - 0.15 * (q.mouth || 0), 1 + 3.2 * (q.mouth || 0), 1);
        mouth.position.y = 0.064 - 0.004 * (q.mouth || 0) + 0.003 * (q.smile || 0);
        root.updateMatrixWorld(true);
      },
      // Arm per IK auf ein Weltziel; pole = Weltpunkt, in dessen Richtung der Ellbogen zeigt
      reach(side, target, pole) {
        solveArm(side, target, pole);
        root.updateMatrixWorld(true);
      },
      local(x, y, z, obj = root) {
        return obj.localToWorld(new THREE.Vector3(x, y, z));
      },
      headTop() {
        return head.localToWorld(new THREE.Vector3(0, 0.25 * hs, 0));
      },
    };
    return p;
  };
}

// Lidschlag aus t: kurz geschlossen alle ~3–5 s, Phase pro Figur
function blinkAt(t, phase, period = 3.9) {
  const x = (((t + phase) % period) + period) % period;
  return x < 0.13 ? Math.sin((Math.PI * x) / 0.13) : 0;
}
// Sprechen: Mundöffnung als quasi-zufälliges Muster aus t, nur innerhalb der Intervalle
function talk(t, spans, phase = 0) {
  for (const [a, b] of spans) {
    if (t >= a && t < b) {
      const env = Math.min(1, (t - a) / 0.08, (b - t) / 0.08);
      return env * (0.2 + 0.55 * Math.abs(Math.sin(t * 12.7 + phase)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 4.1 + phase * 2))));
    }
  }
  return 0;
}
// Gehzyklus: Phase aus zurückgelegtem Weg
function walkPose(dist, stride = 1.35) {
  const ph = (dist / stride) * Math.PI * 2;
  const sw = Math.sin(ph);
  return {
    bob: 0.025 * Math.abs(Math.cos(ph)),
    lLeg: [0.42 * sw, Math.max(0, -Math.sin(ph + 0.6)) * 0.75],
    rLeg: [-0.42 * sw, Math.max(0, Math.sin(ph + 0.6)) * 0.75],
    lArm: [-0.32 * sw, 0.07, -0.25 - 0.15 * Math.max(0, -sw)],
    rArm: [0.32 * sw, 0.07, -0.25 - 0.15 * Math.max(0, sw)],
    twist: 0.05 * sw,
  };
}

// ---------------------------------------------------------------- Szene
export async function build({ THREE, scene, renderer, rng, timeline }) {
  // Schrift für die Countdown-Ziffern vor dem ersten Frame laden
  const face = new FontFace('JetBrains Mono', 'url(/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2)', { weight: '700' });
  await face.load();
  document.fonts.add(face);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const fogColor = new THREE.Color(0x0a1424);
  scene.background = fogColor.clone();
  scene.fog = new THREE.FogExp2(fogColor.clone(), 0.016);

  const makePerson = makePersonFactory(THREE);
  const std = (hex, rough = 0.85, metal = 0) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
  const basic = (hex) => new THREE.MeshBasicMaterial({ color: hex });
  const add = (geo, material, x, y, z, { cast = false, receive = false, parent = scene } = {}) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    parent.add(mesh);
    return mesh;
  };

  // ------------------------------------------------ Licht: feste Anzahl, pro Einstellung umgesetzt
  const hemi = new THREE.HemisphereLight(0x3a4d72, 0x0b0d12, 0.9);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x7f9ccf, 0.35);
  moon.position.set(-30, 60, 20);
  scene.add(moon);
  const key = new THREE.SpotLight(0xffb46b, 60, 30, 0.75, 0.6, 2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  scene.add(key, key.target);
  const pts = [0, 1, 2].map(() => {
    const l = new THREE.PointLight(0xffffff, 0, 12, 2);
    scene.add(l);
    return l;
  });

  // ------------------------------------------------ Straße (läuft entlang z, Blick der Kamera meist Richtung −z)
  const Z0 = 30;
  const Z1 = -330;
  const LEN = Z0 - Z1;
  const asphalt = std(0x15181d, 0.55, 0.15);
  const road = add(new THREE.PlaneGeometry(10.2, LEN, 1, 36), asphalt, 0, 0, (Z0 + Z1) / 2, { receive: true });
  road.rotation.x = -Math.PI / 2;
  const walkM = std(0x30333a, 0.9);
  for (const sx of [1, -1]) {
    const sw = add(new THREE.PlaneGeometry(4.6, LEN, 1, 36), walkM, sx * 7.3, 0.15, (Z0 + Z1) / 2, { receive: true });
    sw.rotation.x = -Math.PI / 2;
    add(new THREE.BoxGeometry(0.22, 0.15, LEN), std(0x4a4d55, 0.8), sx * 5.0, 0.075, (Z0 + Z1) / 2);
  }
  // Mittelmarkierung (gestrichelt)
  {
    const n = Math.floor(LEN / 6);
    const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 2.6), std(0x8d8a7a, 0.7), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(0, 0.012, Z0 - i * 6 - 3);
      o.rotation.x = -Math.PI / 2;
      o.updateMatrix();
      dash.setMatrixAt(i, o.matrix);
    }
    scene.add(dash);
  }

  // Gebäude mit Fensterraster (Fenster als Instanzen, selbstleuchtend)
  const winGeo = new THREE.PlaneGeometry(1.15, 1.55);
  const winList = [];
  const shopList = [];
  const facadeCols = [0x1b2029, 0x22252d, 0x1e1d24, 0x262a31, 0x1a222b];
  const officeZ = [-98, -82]; // dort steht das Büro (eigenes Modell)
  for (const sx of [1, -1]) {
    let z = Z0;
    while (z > Z1) {
      const w = rng.range(12, 22);
      const zc = z - w / 2;
      const h = rng.range(14, 34);
      const skip = sx < 0 && zc < officeZ[1] + 4 && zc > officeZ[0] - 4;
      if (!skip) {
        add(new THREE.BoxGeometry(12, h, w - 0.4), std(rng.pick(facadeCols), 0.95), sx * 15.5, h / 2, zc);
        // Fenster ab dem 1. Obergeschoss
        for (let fy = 4.6; fy < h - 1.5; fy += 3.3) {
          for (let fz = z - 1.8; fz > z - w + 1.4; fz -= 2.9) {
            const r = rng.next();
            winList.push({ x: sx * 9.48, y: fy, z: fz, sx, lit: r < 0.42 ? (rng.next() < 0.75 ? 1 : 2) : 0, b: rng.range(0.55, 1) });
          }
        }
        // Schaufenster im Erdgeschoss
        if (rng.next() < 0.7) shopList.push({ x: sx * 9.47, z: zc, w: Math.min(w - 4, rng.range(4, 8)), col: rng.pick([0xffc27a, 0xf2e6c8, 0x9fd2ff, 0xffa36b]), b: rng.range(0.35, 0.7) });
      } else {
        // über dem Büro: Obergeschosse
        add(new THREE.BoxGeometry(12, h - 3.4, w - 0.4), std(0x1e2129, 0.95), sx * 15.5, 3.4 + (h - 3.4) / 2, zc);
      }
      z -= w;
    }
  }
  {
    const inst = new THREE.InstancedMesh(winGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), winList.length);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    winList.forEach((wi, i) => {
      o.position.set(wi.x, wi.y, wi.z);
      o.rotation.set(0, wi.sx > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
      if (wi.lit === 1) c.setHex(0xffc98a).multiplyScalar(0.55 * wi.b);
      else if (wi.lit === 2) c.setHex(0xa9d4ff).multiplyScalar(0.45 * wi.b);
      else c.setHex(0x0d1219);
      inst.setColorAt(i, c);
    });
    scene.add(inst);
  }
  // Schaufenster: gedämpftes Innenlicht mit Regalen und Waren-Silhouetten hinter Sprossen
  const mullM = std(0x111318, 0.7);
  const shopTex = new Map();
  const shopMat = (col, b) => {
    const k = col;
    if (!shopTex.has(k)) {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 128;
      const g = cv.getContext('2d');
      const c = new THREE.Color(col);
      const css = (m) => `rgb(${Math.round(c.r * 255 * m)},${Math.round(c.g * 255 * m)},${Math.round(c.b * 255 * m)})`;
      const grd = g.createLinearGradient(0, 0, 0, 128);
      grd.addColorStop(0, css(0.55));
      grd.addColorStop(0.5, css(0.38));
      grd.addColorStop(1, css(0.2));
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 128);
      g.fillStyle = 'rgba(10,8,8,0.75)';
      for (const y of [44, 82, 116]) g.fillRect(0, y, 256, 5);
      for (let i = 0; i < 40; i++) {
        const y = [44, 82, 116][i % 3];
        const h = rng.range(8, 26);
        g.fillStyle = `rgba(${rng.int(10, 60)},${rng.int(10, 50)},${rng.int(10, 50)},0.7)`;
        g.fillRect(rng.range(0, 250), y - h, rng.range(5, 16), h);
      }
      const tx = new THREE.CanvasTexture(cv);
      tx.colorSpace = THREE.SRGBColorSpace;
      shopTex.set(k, tx);
    }
    return new THREE.MeshBasicMaterial({ map: shopTex.get(k), color: new THREE.Color(1, 1, 1).multiplyScalar(0.55 + 0.6 * b) });
  };
  for (const sh of shopList) {
    const g = add(new THREE.PlaneGeometry(sh.w, 2.4), shopMat(sh.col, sh.b), sh.x, 1.55, sh.z);
    g.rotation.y = sh.x > 0 ? -Math.PI / 2 : Math.PI / 2;
    const fx = sh.x - Math.sign(sh.x) * 0.04;
    add(new THREE.BoxGeometry(0.08, 0.12, sh.w + 0.2), mullM, fx, 2.8, sh.z);
    add(new THREE.BoxGeometry(0.08, 0.5, sh.w + 0.2), mullM, fx, 0.4, sh.z);
    for (let k = 1; k < 3; k++) add(new THREE.BoxGeometry(0.08, 2.4, 0.07), mullM, fx, 1.55, sh.z - sh.w / 2 + (k * sh.w) / 3);
  }

  // Laternen + Lichtkegel auf dem Boden (additive Scheiben, kein Echtzeitlicht)
  const poolTex = (() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,190,120,0.55)');
    grd.addColorStop(0.45, 'rgba(255,170,100,0.2)');
    grd.addColorStop(1, 'rgba(255,160,90,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  })();
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const lampHeadMat = basic(0xffd6a0);
  const poleMat = std(0x23262b, 0.6, 0.4);
  const lamps = [];
  for (let z = Z0 - 8; z > Z1; z -= 20) {
    for (const sx of [1, -1]) {
      const zz = z + (sx > 0 ? 0 : 10);
      const x = sx * 5.45;
      add(new THREE.CylinderGeometry(0.07, 0.09, 5.2, 8), poleMat, x, 2.6, zz);
      add(new THREE.BoxGeometry(1.1, 0.07, 0.12), poleMat, x - sx * 0.5, 5.2, zz);
      const hd = add(new THREE.BoxGeometry(0.42, 0.1, 0.24), lampHeadMat, x - sx * 0.95, 5.13, zz);
      const pool = add(new THREE.CircleGeometry(4.2, 32), poolMat, x - sx * 0.9, 0.17, zz);
      pool.rotation.x = -Math.PI / 2;
      lamps.push({ hd, pool, z: zz, x });
    }
  }
  // geparkte Autos
  const carCols = [0x3b4250, 0x5a2f2f, 0x2f4a4a, 0x6b6f75, 0x22252b];
  const carAt = (x, z, rot) => {
    const g = new THREE.Group();
    const c = std(rng.pick(carCols), 0.4, 0.5);
    add(new THREE.BoxGeometry(1.8, 0.62, 4.3), c, 0, 0.55, 0, { cast: true, parent: g });
    add(new THREE.BoxGeometry(1.6, 0.5, 2.2), std(0x0f141b, 0.2, 0.6), 0, 1.1, -0.2, { cast: true, parent: g });
    for (const [wx, wz] of [[0.86, 1.35], [-0.86, 1.35], [0.86, -1.35], [-0.86, -1.35]]) {
      const wh = add(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 14), std(0x0b0c0e, 0.9), wx, 0.33, wz, { parent: g });
      wh.rotation.z = Math.PI / 2;
    }
    add(new THREE.BoxGeometry(1.5, 0.1, 0.05), basic(0x5a0c0c), 0, 0.72, -2.16, { parent: g });
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    scene.add(g);
  };
  for (const [x, z] of [[3.6, -12], [-3.6, -22], [3.6, -44], [-3.6, -71], [3.6, -102], [-3.6, -142], [3.6, -176], [-3.6, -196], [3.6, -232]]) carAt(x, z, 0);

  // ------------------------------------------------ Sets entlang der Straße
  // Bank (Szene 2a)
  const benchM = std(0x3a2b22, 0.8);
  add(new THREE.BoxGeometry(0.45, 0.06, 1.8), benchM, 8.55, 0.62, -30, { cast: true });
  add(new THREE.BoxGeometry(0.06, 0.45, 1.8), benchM, 8.82, 0.9, -30, { cast: true });
  for (const z of [-30.8, -29.2]) add(new THREE.BoxGeometry(0.4, 0.47, 0.06), poleMat, 8.55, 0.38, z, { cast: true });
  // Café-Terrasse (Szene 2b)
  const cafeTable = new THREE.Group();
  add(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 20), std(0x9a9a92, 0.4, 0.3), 0, 0.74, 0, { cast: true, parent: cafeTable });
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 8), poleMat, 0, 0.37, 0, { cast: true, parent: cafeTable });
  add(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 12), std(0xf2efe8, 0.5), 0.12, 0.8, -0.05, { cast: true, parent: cafeTable });
  cafeTable.position.set(7.35, 0.15, -60.3);
  scene.add(cafeTable);
  const chair = (x, z, rot) => {
    const g = new THREE.Group();
    add(new THREE.BoxGeometry(0.42, 0.04, 0.42), std(0x2e2a28, 0.7), 0, 0.46, 0, { cast: true, parent: g });
    add(new THREE.BoxGeometry(0.42, 0.45, 0.04), std(0x2e2a28, 0.7), 0, 0.7, -0.2, { cast: true, parent: g });
    for (const [lx, lz] of [[0.18, 0.18], [-0.18, 0.18], [0.18, -0.18], [-0.18, -0.18]]) add(new THREE.CylinderGeometry(0.015, 0.015, 0.46, 6), poleMat, lx, 0.23, lz, { parent: g });
    g.position.set(x, 0.15, z);
    g.rotation.y = rot;
    scene.add(g);
    return g;
  };
  chair(7.95, -59.6, -2.2);
  chair(6.75, -61.2, 0.8);
  chair(8.4, -63.0, -1.4);
  {
    // Markise
    const aw = add(new THREE.BoxGeometry(2.6, 0.06, 7), std(0x5c1f24, 0.8), 8.3, 3.05, -61);
    aw.rotation.z = 0.22;
  }
  // Galerie-Fenster (Szene 3c) – warmes Licht hinter den Figuren
  add(new THREE.PlaneGeometry(5, 2.6), basic(0x6a5640), -9.46, 1.6, -170).rotation.y = Math.PI / 2;
  for (const z of [-172.5, -170.8, -169.2, -167.5]) add(new THREE.BoxGeometry(0.08, 2.6, 0.08), mullM, -9.42, 1.6, z);

  // Büro (Szene 2c): Raum hinter der linken Fassade, Fenster zur Straße
  {
    const ox = -16;
    const oz = -90;
    const wallM = std(0x8b8f94, 0.9);
    const fl = add(new THREE.PlaneGeometry(12, 16, 2, 2), std(0x3c3f45, 0.8), ox, 0.01, oz, { receive: true });
    fl.rotation.x = -Math.PI / 2;
    const ce = add(new THREE.PlaneGeometry(12, 16), std(0x6c7075, 0.9), ox, 3.2, oz);
    ce.rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(0.2, 3.2, 16), wallM, -22, 1.6, oz); // Rückwand
    add(new THREE.BoxGeometry(12, 3.2, 0.2), wallM, ox, 1.6, oz - 8);
    add(new THREE.BoxGeometry(12, 3.2, 0.2), wallM, ox, 1.6, oz + 8);
    // Frontwand mit Fensteröffnung (z −93 … −87, y 0,8 … 2,7)
    const fM = std(0x1e2129, 0.95);
    add(new THREE.BoxGeometry(0.3, 0.8, 16), fM, -9.6, 0.4, oz);
    add(new THREE.BoxGeometry(0.3, 0.5, 16), fM, -9.6, 2.95, oz);
    add(new THREE.BoxGeometry(0.3, 1.9, 5), fM, -9.6, 1.75, oz - 5.5);
    add(new THREE.BoxGeometry(0.3, 1.9, 5), fM, -9.6, 1.75, oz + 5.5);
    // Deckenleuchte, Schreibtisch, Stühle, Pflanze, Regal
    add(new THREE.BoxGeometry(1.6, 0.04, 0.5), basic(0xe8f0ff), -15.6, 3.17, oz);
    const desk = std(0x4e3b2d, 0.6);
    add(new THREE.BoxGeometry(1.0, 0.05, 1.7), desk, -15.5, 0.76, oz, { cast: true, receive: true });
    add(new THREE.BoxGeometry(0.9, 0.7, 0.04), desk, -15.5, 0.38, oz - 0.8, { cast: true });
    add(new THREE.BoxGeometry(0.9, 0.7, 0.04), desk, -15.5, 0.38, oz + 0.8, { cast: true });
    add(new THREE.BoxGeometry(0.03, 0.22, 0.34), std(0x14161a, 0.3), -15.85, 0.9, oz - 0.45, { cast: true });
    chair(-16.45, oz, Math.PI / 2).position.y = 0;
    chair(-14.55, oz, -Math.PI / 2).position.y = 0;
    add(new THREE.CylinderGeometry(0.18, 0.14, 0.4, 12), std(0x5a4e44, 0.8), -21.4, 0.2, oz + 2.2, { cast: true });
    add(new THREE.IcosahedronGeometry(0.42, 1), std(0x2f5a3a, 0.9), -21.4, 0.85, oz + 2.2, { cast: true });
    add(new THREE.BoxGeometry(0.35, 2.0, 2.4), std(0x3a3430, 0.8), -21.7, 1.0, oz - 2.5, { cast: true });
  }

  // Wohnung (Szene 4) bei x = 200
  const AX = 200;
  {
    const wallM = std(0x5b4d46, 0.95);
    const fl = add(new THREE.PlaneGeometry(7, 7, 2, 2), std(0x3b2a22, 0.7), AX, 0, 0, { receive: true });
    fl.rotation.x = -Math.PI / 2;
    const ce = add(new THREE.PlaneGeometry(7, 7), std(0x3a332f, 0.95), AX, 2.7, 0);
    ce.rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(0.2, 2.7, 7), wallM, AX - 3.5, 1.35, 0);
    add(new THREE.BoxGeometry(0.2, 2.7, 7), wallM, AX + 3.5, 1.35, 0);
    add(new THREE.BoxGeometry(7, 2.7, 0.2), wallM, AX, 1.35, 3.5);
    // Fensterwand mit großem Fenster hinter der Frau
    add(new THREE.BoxGeometry(7, 0.9, 0.2), wallM, AX, 0.45, -3.5);
    add(new THREE.BoxGeometry(7, 0.4, 0.2), wallM, AX, 2.5, -3.5);
    add(new THREE.BoxGeometry(2.2, 1.4, 0.2), wallM, AX - 2.4, 1.6, -3.5);
    add(new THREE.BoxGeometry(2.2, 1.4, 0.2), wallM, AX + 2.4, 1.6, -3.5);
    // Stadt draußen: ferne Fensterpunkte auf dunklen Blöcken
    const n = 260;
    const city = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      o.position.set(AX + rng.range(-14, 14), rng.range(-6, 12), -30 - rng.range(0, 10));
      o.updateMatrix();
      city.setMatrixAt(i, o.matrix);
      c.setHex(rng.next() < 0.7 ? 0xffc98a : 0x9fd0ff).multiplyScalar(rng.range(0.25, 0.6));
      city.setColorAt(i, c);
    }
    scene.add(city);
    for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(rng.range(3, 6), 30, 3), std(0x10141c, 1), AX - 14 + i * 3.4, -3, -41);
    // Tisch, Stühle, Hängelampe, Becher, Regal mit Büchern
    const wood = std(0x6a4a33, 0.55);
    add(new THREE.BoxGeometry(0.85, 0.05, 1.25), wood, AX, 0.75, 0, { cast: true, receive: true });
    for (const [lx, lz] of [[0.36, 0.55], [-0.36, 0.55], [0.36, -0.55], [-0.36, -0.55]]) add(new THREE.BoxGeometry(0.05, 0.73, 0.05), wood, AX + lx, 0.365, lz, { cast: true });
    chair(AX, 0.95, Math.PI).position.y = 0;
    chair(AX, -0.95, 0).position.y = 0;
    add(new THREE.CylinderGeometry(0.004, 0.004, 0.8, 4), poleMat, AX, 2.3, 0);
    add(new THREE.ConeGeometry(0.2, 0.18, 20, 1, true), std(0x1d1b19, 0.6), AX, 1.85, 0);
    add(new THREE.SphereGeometry(0.06, 10, 8), basic(0xffe0b0), AX, 1.8, 0);
    add(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 12), std(0xd9d3c7, 0.5), AX + 0.22, 0.83, -0.32, { cast: true });
    add(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 12), std(0x2f4f6f, 0.5), AX - 0.25, 0.83, 0.3, { cast: true });
    add(new THREE.BoxGeometry(0.35, 1.8, 1.6), std(0x3a2e27, 0.8), AX + 3.2, 0.9, 1.6, { cast: true });
    for (let i = 0; i < 12; i++) add(new THREE.BoxGeometry(0.22, rng.range(0.22, 0.3), 0.06), std(rng.pick([0x7a3b2e, 0x2e4a6a, 0xb59a5a, 0x3f5a3a]), 0.8), AX + 3.05, 1.05 + (i % 3) * 0.42, 1.0 + Math.floor(i / 3) * 0.3);
  }

  // Krankenhausflur (Szene 5) bei x = −200
  const HX = -200;
  {
    const wallM = std(0xa8b4b2, 0.85);
    const fl = add(new THREE.PlaneGeometry(3.2, 34, 1, 4), std(0x6f7b7d, 0.35, 0.05), HX, 0, -8, { receive: true });
    fl.rotation.x = -Math.PI / 2;
    const ce = add(new THREE.PlaneGeometry(3.2, 34), std(0xb9c2c0, 0.9), HX, 2.9, -8);
    ce.rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(0.2, 2.9, 34), wallM, HX - 1.7, 1.45, -8);
    add(new THREE.BoxGeometry(0.2, 2.9, 34), wallM, HX + 1.7, 1.45, -8);
    add(new THREE.BoxGeometry(3.2, 2.9, 0.2), wallM, HX, 1.45, 9);
    add(new THREE.BoxGeometry(3.2, 2.9, 0.2), std(0x7f8a88, 0.9), HX, 1.45, -25);
    // Handlauf, Türen, Deckenleuchten
    for (const sx of [1, -1]) add(new THREE.BoxGeometry(0.05, 0.06, 34), std(0x8a9290, 0.4, 0.3), HX + sx * 1.57, 0.92, -8);
    for (const z of [-4.5, -11, -17.5]) for (const sx of [1, -1]) add(new THREE.BoxGeometry(0.08, 2.1, 1.1), std(0x5e7c86, 0.6), HX + sx * 1.58, 1.05, z + (sx > 0 ? 2 : 0));
    for (let z = 6; z > -25; z -= 3) add(new THREE.BoxGeometry(0.9, 0.03, 0.45), basic(0xe6f4ff), HX, 2.88, z);
    // Bank an der linken Wand (x = HX − 1,3)
    add(new THREE.BoxGeometry(0.45, 0.05, 1.9), std(0x4f6a78, 0.6), HX - 1.3, 0.46, 0, { cast: true });
    add(new THREE.BoxGeometry(0.05, 0.4, 1.9), std(0x4f6a78, 0.6), HX - 1.53, 0.72, 0, { cast: true });
    for (const z of [-0.85, 0.85]) add(new THREE.BoxGeometry(0.4, 0.45, 0.05), poleMat, HX - 1.3, 0.23, z);
  }

  // ------------------------------------------------ Figuren
  const STAGE = timeline.stage;
  const SKIN = [0xc99a7a, 0x8d5a3b, 0xe0b48f, 0x5e3a26, 0xb47d5a, 0xd7a88a];
  const people = [];
  const P = (o) => {
    const p = makePerson(o);
    scene.add(p.root);
    p.cd = makeCountdown(THREE, o.cdSize || 0.82);
    scene.add(p.cd.sprite);
    p.o = o;
    people.push(p);
    return p;
  };
  const hero = P({ skin: 0xc99a7a, hair: 0x1e1612, top: 0x2b3442, coat: 0x34404c, bottom: 0x1c1f24 });
  const sad = P({ skin: 0xe0b48f, hair: 0x5a3a24, hairStyle: 'long', top: 0x5d6f86, bottom: 0x2b2f38, coat: 0x6a7280 });
  const late = P({ skin: 0x8d5a3b, hair: 0x120d0b, top: 0xb5763f, bottom: 0x2c3441 });
  const cand = P({ skin: 0xb47d5a, hair: 0x1a1210, top: 0x2f3c52, collar: 0xe9ecef, bottom: 0x1f232b });
  const boss = P({ skin: 0xd7a88a, hair: 0x2b1d14, hairStyle: 'bun', top: 0x3b3b44, bottom: 0x2a2a31, skirt: true });
  const biz = P({ skin: 0xe0b48f, hair: 0x6b6158, top: 0x1f2633, coat: 0x2b303a, collar: 0xdfe3e8, bottom: 0x1b1e24 });
  const artist = P({ skin: 0x5e3a26, hair: 0x0f0b09, hairStyle: 'bun', top: 0x9b4d3a, bottom: 0x2f2a33 });
  const friend = P({ skin: 0xe0b48f, hair: 0xa4733e, hairStyle: 'bob', top: 0x3f6b62, coat: 0x55606c, bottom: 0x2b2c33 });
  const him = P({ skin: 0xc99a7a, hair: 0x2a1c14, top: 0x4b5a4a, bottom: 0x2a2d33 });
  const her = P({ skin: 0x8d5a3b, hair: 0x140e0b, hairStyle: 'long', top: 0x8a5a6a, bottom: 0x2c2a31 });
  const father = P({ skin: 0xb47d5a, hair: 0x231915, top: 0x3d4d5f, bottom: 0x23262c });
  const girl = P({ skin: 0xb47d5a, hair: 0x231915, hairStyle: 'long', top: 0xd9a63a, bottom: 0x3a4a6a, scale: 0.6, headScale: 1.28, cdSize: 0.66 });
  const doctor = P({ skin: 0xe0b48f, hair: 0x3a2b20, top: 0xe8eef0, coat: 0xe8eef0, bottom: 0x6d7c86 });
  const NAMED = { hero, sad, late, cand, boss, biz, artist, friend, him, her, father, girl };

  // Bild der Künstlerin (abstrakt, geseedet)
  const painting = (() => {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 320;
    const g = cv.getContext('2d');
    g.fillStyle = '#e9e1d2';
    g.fillRect(0, 0, 256, 320);
    const cols = ['#c8553d', '#2d6a8f', '#f2b134', '#6b8f71', '#3b2f4a', '#e07a5f'];
    for (let i = 0; i < 9; i++) {
      g.fillStyle = cols[i % cols.length];
      g.globalAlpha = 0.85;
      g.beginPath();
      g.ellipse(rng.range(30, 226), rng.range(30, 290), rng.range(18, 70), rng.range(14, 60), rng.range(0, 3), 0, Math.PI * 2);
      g.fill();
    }
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace;
    const grp = new THREE.Group();
    add(new THREE.BoxGeometry(0.5, 0.62, 0.03), std(0x3a2a1f, 0.7), 0, 0, -0.016, { cast: true, parent: grp });
    add(new THREE.PlaneGeometry(0.46, 0.58), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 }), 0, 0, 0.001, { parent: grp });
    scene.add(grp);
    return grp;
  })();
  const phoneGeo = new THREE.BoxGeometry(0.075, 0.15, 0.012);
  const phoneM = std(0x0e1013, 0.3, 0.4);
  const phones = [0, 1, 2].map(() => add(phoneGeo, phoneM, 0, -100, 0, { cast: true }));

  // ------------------------------------------------ Statisten
  // Laufweg: z = zc + dir · v · (t − tRef) auf Spur x; sichtbar nur in den angegebenen Einstellungen.
  const extras = [];
  const E = (o) => {
    const p = P({ skin: rng.pick(SKIN), hair: rng.pick([0x120d0b, 0x2a1c14, 0x5a3a24, 0x8a6a4a, 0x3a3a3a]), hairStyle: rng.pick(['short', 'short', 'long', 'bob', 'bun']), top: rng.pick([0x2b3442, 0x4a3b36, 0x3f5a6a, 0x5c4a6a, 0x6a5a3a, 0x2e4a3e, 0x6b2f2f]), coat: rng.next() < 0.5 ? rng.pick([0x2a2e36, 0x3a3029, 0x4a4f58]) : undefined, bottom: rng.pick([0x1c1f24, 0x2b2c33, 0x2a3240]) });
    Object.assign(p, { tRef: 0, ...o });
    p.base = 14000000 + Math.floor(rng.next() * 22000000);
    p.drops = [];
    p.phase = rng.range(0, 10);
    extras.push(p);
    return p;
  };
  const shotsOf = (...ids) => new Set(ids);
  // Hintergrund Szene 1–2: Fußgänger weiter hinten auf beiden Gehwegen
  for (let i = 0; i < 6; i++) E({ x: i % 2 ? -6.4 : 6.0, zc: -16 - i * 7, dir: i % 2 ? 1 : -1, v: rng.range(1.0, 1.4), shots: shotsOf('s01', 's02', 's03') });
  // Menge Szene 2d/3a (Positionen bezogen auf t = 15 s)
  const crowd = [];
  for (let i = 0; i < 44; i++) {
    const lane = rng.pick([-8.3, -6.0, 6.2, 7.9]);
    const standing = rng.next() < 0.25;
    crowd.push(E({ x: lane + rng.range(-0.3, 0.3), zc: -106 - rng.range(0, 56), dir: rng.next() < 0.5 ? 1 : -1, v: standing ? 0 : rng.range(1.0, 1.45), tRef: 15, shots: shotsOf('s05', 's06'), crowd: true, face: rng.range(-1.2, 1.2) }));
  }
  for (let i = 0; i < 8; i++) crowd.push(E({ x: (i % 2 ? -6.0 : -8.3) + rng.range(-0.2, 0.2), zc: -120 - i * 2.6, dir: 1, v: rng.range(1.1, 1.35), tRef: 15, shots: shotsOf('s05', 's06'), crowd: true }));
  // Hintergrund Szene 3b/3c
  for (let i = 0; i < 6; i++) E({ x: i % 2 ? -6.5 : 6.2, zc: -160 - i * 6, dir: i % 2 ? -1 : 1, v: rng.range(0.9, 1.3), tRef: 19, shots: shotsOf('s07') });
  for (let i = 0; i < 5; i++) E({ x: i % 2 ? 6.6 : -6.0, zc: -176 - i * 6, dir: -1, v: rng.range(0.9, 1.3), tRef: 24, shots: shotsOf('s08', 's08b') });
  // Schlussbild: stehende Figuren in der dunklen Straße
  for (let i = 0; i < 14; i++) E({ x: (i % 2 ? -1 : 1) * rng.range(1.0, 6.5), zc: -220 - i * 1.9 - rng.range(0, 1.5), dir: 0, v: 0, shots: shotsOf('s15'), still: true, face: rng.range(-0.6, 0.6) });
  const extraZ = (e, t) => e.zc + e.dir * e.v * (t - e.tRef);
  const usedCrowd = new Set();
  for (const d of timeline.crowd_drops || []) {
    let best = null;
    let bd = 1e9;
    for (const e of crowd) {
      if (usedCrowd.has(e)) continue;
      const dist = Math.hypot(e.x - d.at[0], extraZ(e, d.t) - d.at[1]);
      if (dist < bd) {
        bd = dist;
        best = e;
      }
    }
    usedCrowd.add(best);
    best.drops.push(d.t);
  }

  // ------------------------------------------------ Countdown-Werte: dieselben Keyframes wie der HUD
  const hudSeg = (id) => timeline.hud.find((h) => h.id === id);
  const hudValue = (id, t) => {
    const sg = hudSeg(id);
    return interpolate(sg.value.keys.map(([kt, v]) => ({ t: kt, v })), t, sg.value.ease || 'linear');
  };
  const mainCd = new Map([[hero, 'h_hero'], [sad, 'h_fine'], [late, 'h_late'], [cand, 'h_job'], [biz, 'h_deal'], [artist, 'h_artist'], [friend, 'h_paint'], [him, 'h_honest'], [father, 'h_father']]);
  const plainBase = new Map([[boss, 30411207], [her, 25118940], [girl, 37203558], [doctor, 21877302]]);
  const mainState = (p, t) => {
    const id = mainCd.get(p);
    if (!id) return countdownState(t, plainBase.get(p), []);
    const sg = hudSeg(id);
    const keys = sg.value.keys;
    const drops = [];
    for (let i = 1; i < keys.length; i++) if (keys[i][1] < keys[i - 1][1]) drops.push(keys[i][0]);
    const warns = (sg.flashes || []).filter((f) => f.kind === 'warn').map((f) => f.t);
    const st = countdownState(t, keys[0][1] + drops.length, drops, warns);
    st.value = hudValue(id, t);
    return st;
  };

  // ------------------------------------------------ Licht pro Einstellung
  // key = Spot mit Schatten (Laterne/Lampe), fill = weiches Licht von der Kameraseite, rim = Kante von hinten,
  // glow = Schein des Countdowns (Signalfarbe) am Kopf der Hauptfigur.
  const ENV = {
    street: { hemi: [0x40557c, 0x0d0f15, 1.1], fog: [0x0a1424, 0.016], exposure: 1.3, moon: 0.45 },
    crowd: { hemi: [0x4d6390, 0x10131a, 1.5], fog: [0x0a1424, 0.014], exposure: 1.35, moon: 0.6 },
    office: { hemi: [0x56627a, 0x17191e, 1.0], fog: [0x0a1424, 0.008], exposure: 1.25, moon: 0 },
    flat: { hemi: [0x40395a, 0x140f0d, 0.7], fog: [0x0a0f18, 0.003], exposure: 1.25, moon: 0 },
    hosp: { hemi: [0xa9bac9, 0x2a3036, 0.75], fog: [0x1a2228, 0.004], exposure: 0.95, moon: 0 },
    end: { hemi: [0x2a3a5c, 0x07080b, 0.9], fog: [0x060b14, 0.03], exposure: 1.2, moon: 0.2 },
  };
  const SHOT = {
    s01: { env: 'street', subj: 'hero', key: [[1.4, 3.3, -1.6], 0xffb46b, 70], fill: 3, rim: [0x7fb2ff, 14], glow: 0 },
    s02: { env: 'street', subj: 'sad', key: [[-1.6, 3.6, 1.2], 0xffb46b, 60], fill: 6, rim: [0xffc27a, 10], glow: 1.2 },
    s03: { env: 'street', subj: 'late', key: [[-0.6, 3.0, -0.8], 0xffbe7a, 55], fill: 6, rim: [0xffc27a, 12], glow: 1.2 },
    s04: { env: 'office', subj: 'cand', key: [[-1.4, 1.9, 0.3], 0xeaf2ff, 26], fill: 5, rim: [0xffb070, 10], glow: 1.0 },
    s05: { env: 'crowd', subj: null, key: [[-4.6, 7, -116], 0xffb46b, 260], keyTgt: [-5.5, 0, -122], fill: 0, rim: [0xffffff, 0], glow: 0, crowdPts: [[[-6.5, 4.5, -128], 0xffb46b, 70, 14], [[6.0, 4.5, -120], 0xffa060, 60, 14], [[-6.5, 4.5, -140], 0xffc27a, 60, 14]] },
    s06: { env: 'crowd', subj: null, key: [[-6.8, 6, -120], 0xffb46b, 220], keyTgt: [-7, 0, -126], fill: 0, rim: [0xffffff, 0], glow: 0, crowdPts: [[[-7.0, 3.5, -114], 0xc9d8ff, 18, 9], [[-8.5, 3.0, -128], 0xffc27a, 40, 12], [[6.0, 4.5, -126], 0xffa060, 60, 14]] },
    s07: { env: 'street', subj: 'biz', key: [[-1.2, 3.2, 1.0], 0xffb46b, 65], fill: 7, rim: [0x9fd2ff, 12], glow: 1.2 },
    s08: { env: 'street', subj: 'artist', key: [[1.5, 3.2, 0.6], 0xffb46b, 60], fill: 7, rim: [0xffc890, 12], glow: 1.0 },
    s08b: { env: 'street', subj: 'friend', key: [[1.5, 3.2, 0.4], 0xffb46b, 60], fill: 7, rim: [0xffc890, 12], glow: 1.2 },
    s09: { env: 'flat', subj: 'her', key: [[0, 0.55, 0.9], 0xffc78a, 7], fill: 2.5, rim: [0x6f8fc8, 6], glow: 0.8 },
    s10: { env: 'flat', subj: 'him', key: [[0, 0.55, -0.9], 0xffc78a, 7], fill: 2.5, rim: [0x6f8fc8, 5], glow: 1.0 },
    s11: { env: 'flat', subj: 'her', key: [[0, 0.55, 0.9], 0xffc78a, 7], fill: 2.5, rim: [0x6f8fc8, 6], glow: 0.8 },
    s12: { env: 'hosp', subj: 'father', key: [[0.9, 1.4, 0.9], 0xe6f4ff, 9], fill: 5, rim: [0xdcefff, 8], glow: 0.3 },
    s13: { env: 'hosp', subj: 'father', key: [[0.9, 1.4, 0.9], 0xe6f4ff, 9], fill: 5, rim: [0xdcefff, 8], glow: 0.3 },
    s14: { env: 'hosp', subj: 'father', key: [[0.9, 1.4, 0.9], 0xe6f4ff, 9], fill: 5, rim: [0xdcefff, 8], glow: 0.3 },
    s15: { env: 'end', subj: null, key: [[2.6, 4.5, -218], 0x8fb0e0, 45], keyTgt: [0.75, 0, -221.5], fill: 0, rim: [0x38e1c6, 0], glow: 0, endGlow: true },
  };
  const headOf = (name) => {
    const [x, y, z, rot, seat] = STAGE[name];
    return new THREE.Vector3(x, y + (seat ?? 0.93) + 0.78, z);
  };
  const vC = new THREE.Vector3();
  function applyLights(id, frame, t) {
    const S = SHOT[id];
    const env = ENV[S.env];
    let dim = 1;
    if (id === 's14') dim = 1 - 0.55 * ramp(t, 48.4, 50.0); // Flur wird vor der Schlussfrage dunkler
    hemi.color.setHex(env.hemi[0]);
    hemi.groundColor.setHex(env.hemi[1]);
    hemi.intensity = env.hemi[2] * dim;
    scene.fog.color.setHex(env.fog[0]);
    scene.background.setHex(env.fog[0]);
    scene.fog.density = env.fog[1];
    renderer.toneMappingExposure = env.exposure;
    moon.intensity = env.moon;
    const cam = cameraAt(timeline, frame);
    vC.set(cam.pos[0], cam.pos[1], cam.pos[2]);
    const H = S.subj ? headOf(S.subj) : null;
    if (H) {
      key.position.set(H.x + S.key[0][0], H.y + S.key[0][1], H.z + S.key[0][2]);
      key.target.position.set(H.x, H.y - 0.9, H.z);
    } else {
      key.position.set(...S.key[0]);
      key.target.position.set(...(S.keyTgt || [S.key[0][0], 0, S.key[0][2]]));
    }
    key.color.setHex(S.key[1]);
    key.intensity = S.key[2] * dim;
    key.angle = 0.8;
    key.distance = S.subj ? 14 : 30;
    key.target.updateMatrixWorld();
    // Fülllicht: 0,5 m über der Kamera, leicht zur Figur versetzt
    if (H) {
      pts[0].position.copy(vC).lerp(H, 0.25);
      pts[0].position.y += 0.5;
      // Kante: hinter der Figur (von der Kamera aus), etwas höher
      const away = H.clone().sub(vC).setY(0).normalize();
      pts[1].position.set(H.x + away.x * 1.3 + away.z * 0.6, H.y + 0.6, H.z + away.z * 1.3 - away.x * 0.6);
      pts[2].position.set(H.x, H.y + 0.45, H.z);
    }
    pts[0].color.setHex(S.env === 'street' ? 0xffd9b8 : 0xc9d8ff);
    pts[0].intensity = S.fill * dim * (H ? Math.min(1.4, Math.pow(pts[0].position.distanceTo(H) / 2.6, 2)) : 1);
    pts[0].distance = 8;
    pts[1].color.setHex(S.rim[0]);
    pts[1].intensity = S.rim[1] * dim;
    pts[1].distance = 6;
    pts[2].color.setHex(0x38e1c6);
    pts[2].intensity = S.glow * dim;
    pts[2].distance = 2.5;
    if (S.crowdPts) {
      S.crowdPts.forEach(([pos, col, inten, dist], i) => {
        pts[i].position.set(...pos);
        pts[i].color.setHex(col);
        pts[i].intensity = inten;
        pts[i].distance = dist;
      });
    }
    if (S.endGlow) {
      // Schlussbild: kühles Gegenlicht hinter den Figuren, damit Silhouetten sich vom Nebel abheben
      pts[0].position.set(0, 4, -240);
      pts[0].color.setHex(0x5a7fb8);
      pts[0].intensity = 160;
      pts[0].distance = 32;
      pts[1].position.set(0, 3.5, -226);
      pts[1].color.setHex(0x38e1c6);
      pts[1].intensity = 10;
      pts[1].distance = 14;
    }
    const street = S.env === 'street' || S.env === 'crowd';
    for (const l of lamps) {
      l.pool.visible = street;
      l.hd.material = street ? lampHeadMat : poleMat;
    }
  }

  // ------------------------------------------------ Pro-Frame-Aktualisierung
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const place = (p, name, dRot = 0, dx = 0, dz = 0) => {
    const [x, y, z, rot] = STAGE[name];
    p.root.position.set(x + dx, y, z + dz);
    p.root.rotation.set(0, rot + dRot, 0);
    p.root.visible = true;
    return STAGE[name][4];
  };
  const hide = (p) => {
    p.root.visible = false;
    p.cd.set(0, 0, 0, 0, 0);
  };
  const showCd = (p, st, opacity = 1, lift = 0.16, boost = 1) => {
    const top = p.headTop();
    p.cd.sprite.position.set(top.x, top.y + lift, top.z);
    p.cd.set(st.value, st.alarm, st.delta, st.scale * boost, opacity);
  };
  const phoneTo = (ph, p, side) => {
    const h = p.arms[side].hand;
    ph.position.copy(h.localToWorld(V(0, -0.05, 0.02)));
    ph.quaternion.copy(h.getWorldQuaternion(new THREE.Quaternion()));
  };
  const earTarget = (p, side) => p.headG.localToWorld(V(side === 'r' ? -0.135 : 0.135, 0.1, 0.03));
  const phonePole = (p, side) => p.spine.localToWorld(V(side === 'l' ? 0.4 : -0.4, -0.25, 0.5));
  const elbowPole = (p, side, out = 1, up = 0, fwd = 0) => p.local((side === 'l' ? 1 : -1) * out, 1.0 + up * 0.4, fwd);

  function update({ t, frame, shot }) {
    applyLights(shot, frame, t);
    for (const p of people) hide(p);
    for (const ph of phones) ph.position.y = -100;
    painting.position.y = -100;
    const street = ['s01', 's02', 's03'].includes(shot);

    // ---- Szene 1: Held auf dem Gehweg (auch im Hintergrund von 2a/2b sichtbar)
    if (street) {
      place(hero, 'hero');
      const look = ramp(t, 2.05, 2.5) * (1 - ramp(t, 3.15, 3.6));
      const flinch = ramp(t, 1.8, 1.95) * (1 - ramp(t, 2.0, 2.6));
      hero.pose({
        headYaw: 0.28 * (1 - look) + 0.04 * Math.sin(t * 0.9),
        headPitch: -0.6 * look + 0.08 * flinch,
        lean: -0.04 * flinch,
        brows: 0.3 * look,
        surprise: 0.9 * look + 0.6 * flinch,
        mouth: talk(t, [[0.45, 1.55]], 1) + 0.25 * look,
        smile: 0.6 * (1 - ramp(t, 1.75, 2.0)),
        blink: blinkAt(t, 0.7),
        lArm: [0.04, 0.1, -0.35 - 0.1 * Math.sin(t)],
        rArm: [-0.1, 0.12, -0.5],
      });
      const st = mainState(hero, t);
      const a = ramp(t, 0.2, 0.5);
      showCd(hero, { ...st, scale: st.scale * (0.6 + 0.4 * a) }, a);
      // ---- Szene 2a: Frau auf der Bank, Telefon
      const seatS = place(sad, 'sad');
      const after = ramp(t, 5.5, 6.2);
      sad.pose({
        sit: 1,
        seat: seatS,
        lean: 0.2 + 0.1 * after,
        headPitch: 0.22 + 0.22 * after,
        headYaw: 0.25,
        brows: 0.9,
        mouth: talk(t, [[4.35, 5.25]], 2) * 0.7,
        blink: Math.max(blinkAt(t, 1.3, 4.4), 0.85 * after),
        lArm: [-0.55, 0.15, -1.1],
      });
      sad.reach('r', earTarget(sad, 'r'), phonePole(sad, 'r'));
      phoneTo(phones[0], sad, 'r');
      showCd(sad, mainState(sad, t));
      // ---- Szene 2b: Café, Mann behauptet, unterwegs zu sein
      const seatL = place(late, 'late');
      const caught = ramp(t, 8.05, 8.4);
      late.pose({
        sit: 1,
        seat: seatL,
        lean: -0.1 + 0.12 * caught,
        headYaw: 0.15 * Math.sin(t * 1.3) * (1 - caught),
        headPitch: -0.05 - 0.5 * ramp(t, 8.3, 8.8),
        smile: 0.9 * (1 - caught),
        surprise: 0.8 * caught,
        mouth: talk(t, [[6.85, 7.85]], 3) + 0.25 * caught,
        blink: blinkAt(t, 2.1),
        lLeg: [0.2, -0.2],
        rLeg: [0.05, 0.1],
      });
      late.reach('l', earTarget(late, 'l'), phonePole(late, 'l'));
      late.reach('r', late.local(-0.1, 0.78, 0.42), elbowPole(late, 'r', 0.6, -1, -0.2));
      phoneTo(phones[1], late, 'l');
      cafeTable.position.copy(late.local(0.05, 0, 0.62));
      cafeTable.position.y = 0.15;
      showCd(late, mainState(late, t));
    }
    // ---- Szene 2c: Vorstellungsgespräch
    if (shot === 's04') {
      const sc = place(cand, 'cand');
      const sb = place(boss, 'boss');
      const caught = ramp(t, 10.75, 11.1);
      cand.pose({
        sit: 1,
        seat: sc,
        lean: 0.08 - 0.05 * caught,
        headPitch: -0.03 + 0.06 * Math.sin(t * 4) * (1 - ramp(t, 10.3, 10.6)) - 0.4 * ramp(t, 11.0, 11.4),
        headYaw: -0.12,
        smile: 0.8 * (1 - caught),
        surprise: 0.8 * caught,
        brows: 0.3 * caught,
        mouth: talk(t, [[9.45, 10.5]], 4),
        blink: blinkAt(t, 0.4),
      });
      cand.reach('l', cand.local(0.14, 0.8, 0.4), elbowPole(cand, 'l', 0.6, -1, 0));
      cand.reach('r', cand.local(-0.14, 0.8, 0.4), elbowPole(cand, 'r', 0.6, -1, 0));
      boss.pose({
        sit: 1,
        seat: sb,
        lean: 0.12,
        headPitch: 0.05 - 0.45 * ramp(t, 10.9, 11.35),
        brows: -0.4,
        squint: 0.5,
        blink: blinkAt(t, 1.9),
      });
      boss.reach('l', boss.local(0.15, 0.8, 0.42), elbowPole(boss, 'l', 0.6, -1, 0));
      boss.reach('r', boss.local(-0.15, 0.8, 0.42), elbowPole(boss, 'r', 0.6, -1, 0));
      showCd(cand, mainState(cand, t));
      showCd(boss, mainState(boss, t));
    }
    // ---- Statisten
    for (const e of extras) {
      if (!e.shots.has(shot)) continue;
      e.root.visible = true;
      const z = extraZ(e, t);
      const rot = e.still ? Math.PI + e.face : e.dir >= 0 ? 0 : Math.PI;
      e.root.position.set(e.x, Math.abs(e.x) > 5.1 ? 0.15 : 0, z);
      e.root.rotation.set(0, rot + (e.v === 0 && e.crowd ? e.face : 0), 0);
      const w = e.v > 0 ? walkPose(e.v * t + e.phase) : { lArm: [0.05, 0.1, -0.3], rArm: [0.05, 0.1, -0.3] };
      const gl = e.crowd ? Math.sin(t * 0.9 + e.phase) : 0;
      const dropped = e.drops.some((d) => t >= d && t < d + 1.6);
      e.pose({
        ...w,
        headYaw: e.crowd ? 0.8 * Math.sign(gl) * smooth(Math.abs(gl) * 1.6 - 0.4) : 0,
        headPitch: dropped ? -0.5 : e.still ? -0.05 : 0.02,
        brows: e.crowd ? -0.7 : 0.3,
        squint: e.crowd ? 0.6 : 0,
        surprise: dropped ? 0.8 : 0,
        blink: blinkAt(t, e.phase, 4.3),
      });
      showCd(e, countdownState(t, e.base + e.drops.length, e.drops), 1, 0.16, shot === 's05' ? 2.0 : e.still ? 1.6 : 1);
    }
    // ---- Szene 3b: Geschäftsmann
    if (shot === 's07') {
      place(biz, 'biz', 0.12 * Math.sin(t * 0.6) * (1 - ramp(t, 19.9, 20.3)), 0, 0.2 * Math.sin(t * 0.8) * (1 - ramp(t, 19.9, 20.3)));
      const stop = ramp(t, 20.05, 20.35);
      const up = ramp(t, 20.5, 21.0);
      biz.pose({
        lean: 0.03 * Math.sin(t * 2.1) * (1 - stop),
        headYaw: 0.25 + 0.15 * Math.sin(t * 1.7) * (1 - stop) - 0.25 * stop,
        headPitch: -0.55 * up,
        smile: 0.6 * (1 - stop),
        surprise: 0.7 * stop,
        brows: 0.5 * up,
        mouth: talk(t, [[18.35, 19.85]], 5),
        blink: blinkAt(t, 3.1),
        lArm: [lerp(-0.85 + 0.25 * Math.sin(t * 3.2), 0.05, stop), 0.25, lerp(-1.2, -0.2, stop)],
      });
      const ear = earTarget(biz, 'r');
      const low = biz.local(-0.25, 1.0, 0.22);
      const k = ramp(t, 20.25, 20.9);
      biz.reach('r', ear.lerp(low, k), phonePole(biz, 'r'));
      phoneTo(phones[2], biz, 'r');
      showCd(biz, mainState(biz, t));
    }
    // ---- Szene 3c: Gemälde (Künstlerin fragt, Freundin antwortet)
    if (shot === 's08' || shot === 's08b') {
      place(artist, 'artist');
      place(friend, 'friend');
      const fall = ramp(t, 25.6, 26.1);
      artist.pose({
        headRoll: 0.12 * (1 - fall),
        headYaw: -0.1,
        headPitch: 0.05 + 0.25 * fall,
        smile: 1 - fall,
        brows: 0.2 + 0.6 * fall,
        mouth: talk(t, [[21.75, 23.6]], 6),
        blink: blinkAt(t, 0.2),
        lean: 0.05 * fall,
      });
      painting.position.copy(artist.local(0.02, 1.2, 0.36));
      painting.rotation.set(0.12 + 0.1 * fall, STAGE.artist[3] - 0.15, 0);
      artist.reach('l', painting.localToWorld(V(0.22, -0.08, -0.02)), elbowPole(artist, 'l', 1, -1, -0.3));
      artist.reach('r', painting.localToWorld(V(-0.22, -0.08, -0.02)), elbowPole(artist, 'r', 1, -1, -0.3));
      const almost = ramp(t, 24.35, 24.5) * (1 - ramp(t, 24.75, 24.9));
      const honest = ramp(t, 25.0, 25.3);
      friend.pose({
        headYaw: 0.1 + 0.08 * Math.sin(t * 0.7),
        headPitch: 0.12 * (1 - honest) - 0.02,
        headRoll: -0.1 * honest,
        smile: 0.8 * almost + 0.25 * (1 - honest),
        brows: 0.65 * honest,
        mouth: Math.max(talk(t, [[24.4, 24.75]], 7) * 1.1, talk(t, [[25.15, 26.4]], 8)),
        blink: Math.max(blinkAt(t, 1.4), 0.6 * ramp(t, 24.8, 24.95) * (1 - ramp(t, 25.05, 25.2))),
        lArm: [-0.15, 0.1, -0.6],
        rArm: [-0.35 * honest, 0.12, -0.6 - 0.6 * honest],
      });
      showCd(artist, mainState(artist, t));
      showCd(friend, mainState(friend, t));
    }
    // ---- Szene 4: Wohnung
    if (shot === 's09' || shot === 's10' || shot === 's11') {
      const s1 = place(him, 'him');
      const s2 = place(her, 'her');
      const down = ramp(t, 29.9, 30.5) * (1 - ramp(t, 31.2, 31.7));
      const breathe = 0.012 * Math.sin(t * 1.6);
      him.pose({
        sit: 1,
        seat: s1,
        lean: 0.22 + 0.08 * down + breathe,
        headPitch: 0.45 * down + 0.08 * ramp(t, 32, 33.5),
        headYaw: 0.1 * down,
        brows: 0.5 + 0.4 * ramp(t, 31.5, 32.2),
        mouth: talk(t, [[31.95, 34.6]], 9) * 0.8,
        blink: Math.max(blinkAt(t, 2.6, 4.6), 0.6 * down),
      });
      her.pose({
        sit: 1,
        seat: s2,
        lean: 0.16 + breathe,
        headPitch: 0.04 + 0.12 * ramp(t, 34.0, 35.0) - 0.1 * ramp(t, 37.0, 38.0),
        headRoll: 0.07 * ramp(t, 35.0, 36.2),
        brows: 0.35 + 0.55 * ramp(t, 32.6, 33.6),
        smile: 0.3 * ramp(t, 37.3, 38.3),
        mouth: talk(t, [[27.1, 28.7]], 10) * 0.75,
        blink: blinkAt(t, 0.9, 4.1),
      });
      const clasp = ramp(t, 29.9, 30.6);
      const hand = ramp(t, 36.0, 37.4);
      him.reach('r', V(AX + 0.08 + 0.1 * (1 - clasp), 0.8, 0.42 - 0.05 * clasp), him.local(-1, 0.6, -0.6));
      him.reach('l', V(AX - 0.08, 0.8, 0.42 - 0.07 * clasp), him.local(1, 0.6, -0.6));
      her.reach('l', V(AX + 0.14, 0.8, -0.42).lerp(V(AX + 0.02, 0.83, 0.3), hand), her.local(1, 0.6, -0.6));
      her.reach('r', V(AX - 0.18, 0.8, -0.4), her.local(-1, 0.6, -0.6));
      showCd(him, mainState(him, t), 1, 0.14);
      showCd(her, mainState(her, t), 1, 0.14);
    }
    // ---- Szene 5: Krankenhaus
    if (shot === 's12' || shot === 's13' || shot === 's14') {
      const sf = place(father, 'father');
      const sg = place(girl, 'girl', -0.25 * ramp(t, 39.2, 39.8));
      const glance = ramp(t, 43.15, 43.45) * (1 - ramp(t, 43.8, 44.1));
      const toGirl = ramp(t, 43.95, 44.35);
      const hug = ramp(t, 46.85, 47.9);
      father.pose({
        sit: 1,
        seat: sf,
        lean: 0.28 - 0.1 * toGirl + 0.06 * hug,
        headPitch: 0.3 * (1 - toGirl) * (1 - glance) - 0.8 * glance + 0.12 * toGirl,
        headYaw: -0.55 * toGirl + 0.1 * (1 - toGirl) * Math.sin(t * 0.5),
        headRoll: -0.08 * hug,
        brows: 0.75,
        smile: 0.35 * ramp(t, 44.2, 44.6) * (1 - hug * 0.5),
        mouth: talk(t, [[44.35, 45.2]], 11) * 0.7,
        blink: Math.max(blinkAt(t, 1.7, 4.8), 0.5 * hug),
      });
      girl.pose({
        sit: 1,
        seat: sg,
        lean: 0.05 + 0.25 * hug,
        roll: -0.15 * hug,
        headYaw: 0.75 * ramp(t, 39.2, 39.8) * (1 - 0.6 * hug),
        headPitch: -0.3 * ramp(t, 39.2, 39.8) + 0.25 * hug,
        headRoll: 0.2 * hug,
        brows: 0.7,
        surprise: 0.3,
        mouth: talk(t, [[39.6, 41.35]], 12) * 0.8,
        blink: Math.max(blinkAt(t, 0.3, 3.5), 0.8 * hug),
        lLeg: [0.25, -0.6],
        rLeg: [0.2, -0.55],
      });
      // Vater links (+x lokal) zeigt zur Tochter: linker Arm legt sich um ihre äußere Schulter
      father.reach('l', father.local(0.13, 0.55, 0.42).lerp(girl.local(0.13, 0.86, -0.04), hug), father.local(0.5, 1.3 + 0.2 * hug, -0.5 * hug));
      father.reach('r', father.local(-0.13, 0.55, 0.42), father.local(-1, 0.8, 0));
      girl.reach('r', girl.local(-0.1, 0.52, 0.25).lerp(father.local(0.02, 0.92, 0.16), hug), girl.local(-1, 0.5, 0.2));
      girl.reach('l', girl.local(0.1, 0.5, 0.25), girl.local(1, 0.5, 0.2));
      showCd(father, mainState(father, t), 1, 0.16);
      showCd(girl, mainState(girl, t), 1, 0.12);
      if (shot === 's12') {
        const dz = -1.6 - 1.15 * Math.max(0, t - 39.0);
        doctor.root.visible = true;
        doctor.root.position.set(HX + 0.45, 0, dz);
        doctor.root.rotation.set(0, Math.PI, 0);
        doctor.pose({ ...walkPose(1.15 * Math.max(0, t - 39.0) + 0.4), headPitch: 0.1, brows: 0.5, blink: blinkAt(t, 2.2) });
        showCd(doctor, mainState(doctor, t));
      }
    }
    if (shot === 's15') {
      hero.root.visible = true;
      hero.root.position.set(0.75, 0, -221.5);
      hero.root.rotation.set(0, -0.1, 0);
      hero.pose({ headPitch: -0.05, headYaw: 0.05 * Math.sin(t * 0.4), brows: 0.35, blink: blinkAt(t, 0.7, 4.6), lean: 0.01 * Math.sin(t * 1.4) });
      showCd(hero, countdownState(t, 27409836, []), 1, 0.16, 1.15);
    }
    void NAMED;
  }

  return { update };
}
