// Requisiten aus Kisten. Jede Funktion liefert eine THREE.Group mit Füßen auf y = 0, Vorderseite +z.
// Bildschirm-/Schild-Texte über Canvas-Texturen (Schrift: Systemschrift sans-serif, deterministisch je Umgebung).

export function createProps(THREE, core, rng) {
  const { box, cbox, mat, group } = core;

  // ---------- Canvas-Texturen ----------
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const screenMat = (tex, glow = 0.9) => new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow, roughness: 0.6 });

  const roundRect = (g, x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };

  // Handy-Bildschirm. lock: Sperrbildschirm mit Uhrzeit; chat: Nachrichtenverlauf; notify: Mitteilung.
  const phoneTexture = ({ mode = 'lock', time = '6:59', date = 'Monday', name = 'Sarah', messages = [], notify = null, bg = '#1c1830' } = {}) =>
    canvasTex(360, 720, (g, W, H) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bg);
      grad.addColorStop(1, '#3a2d5c');
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff';
      g.textAlign = 'center';
      if (mode === 'lock') {
        g.font = 'bold 110px sans-serif';
        g.fillText(time, W / 2, 210);
        g.font = '30px sans-serif';
        g.fillStyle = 'rgba(255,255,255,0.8)';
        g.fillText(date, W / 2, 260);
      }
      if (mode === 'chat') {
        g.fillStyle = '#e8506a';
        g.beginPath();
        g.arc(W / 2, 70, 34, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#fff';
        g.font = 'bold 34px sans-serif';
        g.fillText(name[0], W / 2, 82);
        g.font = '26px sans-serif';
        g.fillText(name, W / 2, 138);
        let y = 190;
        g.textAlign = 'left';
        for (const m of messages) {
          g.font = '28px sans-serif';
          const tw = Math.min(260, g.measureText(m.text).width + 36);
          const me = m.from === 'me';
          const x = me ? W - 24 - tw : 24;
          g.fillStyle = me ? '#2f7bf6' : '#3b3b45';
          roundRect(g, x, y, tw, 56, 26);
          g.fill();
          g.fillStyle = '#fff';
          g.fillText(m.text, x + 18, y + 38);
          y += 76;
        }
      }
      if (notify) {
        g.textAlign = 'left';
        g.fillStyle = 'rgba(255,255,255,0.88)';
        roundRect(g, 18, 300, W - 36, 120, 22);
        g.fill();
        g.fillStyle = '#222';
        g.font = 'bold 26px sans-serif';
        g.fillText(notify.title, 36, 345);
        g.font = '24px sans-serif';
        g.fillText(notify.text, 36, 385);
      }
    });

  const phone = (opts = {}) => {
    const p = group(cbox(0.085, 0.17, 0.012, 0x15151a));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.155), screenMat(phoneTexture(opts), opts.glow ?? 0.9));
    scr.position.z = 0.0065;
    p.add(scr);
    p.userData.setScreen = (o) => {
      scr.material.map.dispose();
      const t = phoneTexture(o);
      scr.material.map = t;
      scr.material.emissiveMap = t;
      scr.material.needsUpdate = true;
    };
    return p;
  };

  // Großes Handy für Nahaufnahme „POV Handy in der Hand“ (Bildschirm ≈ 0,5 m hoch, vor der Kamera platzieren)
  const bigPhone = (opts = {}) => {
    const p = group(cbox(0.3, 0.6, 0.03, 0x111116));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.55), screenMat(phoneTexture(opts), 1.0));
    scr.position.z = 0.016;
    p.add(scr);
    return p;
  };

  // Schild mit Text (z. B. WET PAINT, CLOSED, SOLD OUT)
  const sign = (text, { w = 0.9, h = 0.6, color = '#c8202a', bg = '#ffffff', post = true } = {}) => {
    const tex = canvasTex(512, Math.round((512 * h) / w), (g, W, H) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = color;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const lines = text.split('\n');
      const fs = Math.min(H / (lines.length * 1.15), 160);
      g.font = `bold ${fs}px sans-serif`;
      lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.1));
    });
    const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), [mat(0xeeeeee), mat(0xeeeeee), mat(0xeeeeee), mat(0xeeeeee), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), mat(0xeeeeee)]);
    board.castShadow = true;
    const g = group(board);
    if (post) {
      board.position.y = 1.2 + h / 2;
      g.add(box(0.06, 1.2 + h / 2, 0.06, 0x6b4a2e, [0, 0, -0.04]));
    }
    return g;
  };

  // ---------- Möbel ----------
  const bed = ({ sheet = 0x8fb3e0, frame = 0x7a4f2e, w = 1.5, l = 2.1 } = {}) =>
    group(
      box(w, 0.35, l, frame, [0, 0, 0]),
      box(w - 0.06, 0.2, l - 0.08, 0xf2f2f2, [0, 0.35, 0]),
      box(w + 0.02, 0.06, l * 0.62, sheet, [0, 0.55, l * 0.18]),
      box(w * 0.7, 0.13, 0.4, 0xffffff, [0, 0.55, -l / 2 + 0.3]),
      box(w + 0.1, 1.0, 0.08, frame, [0, 0, -l / 2 - 0.04]),
    );
  const nightstand = () => group(box(0.45, 0.5, 0.4, 0x8a5a36), box(0.38, 0.03, 0.02, 0x5a3a22, [0, 0.3, 0.205]));
  const tableLamp = (on = true) => {
    const g = group(box(0.14, 0.04, 0.14, 0xdddddd), box(0.03, 0.3, 0.03, 0xdddddd), box(0.26, 0.2, 0.26, 0xf5e9cf, [0, 0.3, 0], { mat: on ? { emissive: 0xffd9a0, emissiveIntensity: 0.6 } : {} }));
    return g;
  };
  const alarmClock = (time = '6:59') => {
    const tex = canvasTex(256, 128, (g, W, H) => {
      g.fillStyle = '#101010';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#ff4030';
      g.font = 'bold 84px monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(time, W / 2, H / 2 + 4);
    });
    const g = group(box(0.22, 0.12, 0.1, 0x222222));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.09), screenMat(tex, 1.2));
    s.position.set(0, 0.06, 0.051);
    g.add(s);
    return g;
  };
  const table = ({ w = 1.2, d = 0.8, h = 0.75, color = 0x9a6a42 } = {}) => {
    const g = group(box(w, 0.05, d, color, [0, h - 0.05, 0]));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.06, h - 0.05, 0.06, color, [sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06)]));
    return g;
  };
  const chair = (color = 0x6b4a2e) => {
    const g = group(box(0.45, 0.05, 0.45, color, [0, 0.45, 0]), box(0.45, 0.5, 0.05, color, [0, 0.5, -0.2]));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.05, 0.45, 0.05, color, [sx * 0.19, 0, sz * 0.19]));
    return g;
  };
  const counter = ({ w = 3, color = 0x5d9a9a, top = 0xe8e4dc } = {}) => {
    const g = group(box(w, 0.88, 0.62, color), box(w + 0.04, 0.05, 0.66, top, [0, 0.88, 0]));
    const n = Math.max(1, Math.round(w / 0.6));
    for (let i = 0; i < n; i++) g.add(box(0.2, 0.025, 0.02, 0xbfbfbf, [-w / 2 + (i + 0.5) * (w / n), 0.7, 0.32]));
    return g;
  };
  const upperCabinets = ({ w = 3, color = 0x5d9a9a } = {}) => group(box(w, 0.7, 0.35, color, [0, 1.55, -0.13]));
  const toaster = (color = 0xc8202a) => group(box(0.3, 0.2, 0.18, color), box(0.2, 0.01, 0.04, 0x222222, [0, 0.2, 0.03]), box(0.2, 0.01, 0.04, 0x222222, [0, 0.2, -0.03]));
  const mug = (color = 0xffffff) => group(box(0.09, 0.1, 0.09, color), box(0.02, 0.06, 0.04, color, [0.055, 0.02, 0]));
  const toast = (burnt = false) => box(0.12, 0.13, 0.02, burnt ? 0x2a1d14 : 0xd9a45a);
  const plant = (pot = 0xc9784e) => {
    const g = group(box(0.25, 0.25, 0.25, pot));
    for (let i = 0; i < 5; i++) {
      const leaf = cbox(0.08, 0.35, 0.03, 0x4f9a4a, [0, 0.4, 0]);
      leaf.rotation.set(0.4 * Math.cos((i * 2 * Math.PI) / 5), (i * 2 * Math.PI) / 5, 0.4 * Math.sin((i * 2 * Math.PI) / 5));
      g.add(leaf);
    }
    return g;
  };
  const cardboardBox = () => group(box(0.5, 0.35, 0.4, 0xc49a62), box(0.52, 0.02, 0.06, 0xa77f4c, [0, 0.35, 0]));
  const desk = () => {
    const g = table({ w: 1.4, d: 0.7, color: 0xd9d4ca });
    g.add(box(0.5, 0.32, 0.04, 0x1a1a1f, [0, 0.82, -0.15]), box(0.04, 0.12, 0.04, 0x1a1a1f, [0, 0.72, -0.15]));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.28), mat(0x7fb6e8, { emissive: 0x7fb6e8, emissiveIntensity: 0.6 }));
    s.position.set(0, 0.98, -0.128);
    g.add(s);
    return g;
  };
  const officeChair = () => group(box(0.5, 0.08, 0.5, 0x2a2a30, [0, 0.45, 0]), box(0.5, 0.55, 0.08, 0x2a2a30, [0, 0.53, -0.22]), box(0.06, 0.42, 0.06, 0x555555));
  const umbrella = ({ color = 0x1d2440, broken = 0 } = {}) => {
    const g = group(cbox(0.03, 0.9, 0.03, 0x222222, [0, 0.45, 0]));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = cbox(0.5, 0.02, 0.4, color, [Math.cos(a) * 0.28, 0.85 + 0.25 * broken * (i % 2), Math.sin(a) * 0.28]);
      r.rotation.y = -a;
      r.rotation.z = 0.35 - broken * 1.1 * (i % 2);
      g.add(r);
    }
    return g;
  };
  const puddle = (r = 1.2) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat(0x9fb3c7, { roughness: 0.15, metalness: 0.2 }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.012;
    m.receiveShadow = true;
    return m;
  };

  // ---------- Draußen ----------
  const tree = ({ h = 3.2, color = 0x4f8f3e } = {}) => {
    const g = group(box(0.22, h * 0.5, 0.22, 0x6b4a2e));
    const crowns = [[0, h * 0.62, 0, 1.1], [0.45, h * 0.55, 0.2, 0.75], [-0.4, h * 0.58, -0.15, 0.8], [0.1, h * 0.85, 0, 0.75]];
    for (const [x, y, z, r] of crowns) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * (h / 3.2), 0), mat(color));
      c.position.set(x, y, z);
      c.rotation.set(rng.range(0, 3), rng.range(0, 3), 0);
      c.castShadow = c.receiveShadow = true;
      g.add(c);
    }
    return g;
  };
  const bush = (color = 0x5a9a48) => {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), mat(color));
    c.position.y = 0.35;
    c.scale.set(1.2, 0.8, 1);
    c.castShadow = c.receiveShadow = true;
    return group(c);
  };
  const streetLamp = (on = false) => {
    const g = group(box(0.12, 4, 0.12, 0x1f1f22), box(0.5, 0.1, 0.18, 0x1f1f22, [0.2, 4, 0]));
    const bulb = cbox(0.26, 0.26, 0.26, 0xfff2cc, [0.38, 3.9, 0], { mat: on ? { emissive: 0xffe2a0, emissiveIntensity: 2.0 } : {} });
    g.add(bulb);
    return g;
  };
  const bench = (color = 0x2f8a5a) => {
    const g = group();
    for (let i = 0; i < 3; i++) g.add(box(1.8, 0.05, 0.12, color, [0, 0.45, -0.16 + i * 0.15]));
    for (let i = 0; i < 2; i++) g.add(box(1.8, 0.1, 0.04, color, [0, 0.62 + i * 0.16, -0.26]));
    for (const sx of [-1, 1]) g.add(box(0.06, 0.45, 0.45, 0x2a2a2e, [sx * 0.8, 0, -0.02]), box(0.06, 0.4, 0.06, 0x2a2a2e, [sx * 0.8, 0.5, -0.26]));
    return g;
  };
  const hydrant = () => group(box(0.25, 0.6, 0.25, 0xc8202a), box(0.36, 0.1, 0.12, 0xc8202a, [0, 0.35, 0]));
  const trashCan = () => group(box(0.5, 0.85, 0.5, 0x3b4a3b), box(0.55, 0.06, 0.55, 0x2c382c, [0, 0.85, 0]));

  const car = ({ color = 0xe5b52b, kind = 'sedan', lights = false } = {}) => {
    // Länge entlang z (Front +z)
    const g = group(box(1.75, 0.6, 4.2, color, [0, 0.3, 0]));
    if (kind === 'taxi' || kind === 'sedan') g.add(box(1.55, 0.55, 2.1, color, [0, 0.9, -0.25]));
    if (kind === 'van') g.add(box(1.75, 0.9, 3.2, color, [0, 0.9, -0.45]));
    const glass = mat(0x34414f, { roughness: 0.3 });
    const cabinL = kind === 'van' ? 3.2 : 2.1;
    const cabinZ = kind === 'van' ? -0.45 : -0.25;
    const cabinH = kind === 'van' ? 0.9 : 0.55;
    g.add(box(1.57, cabinH * 0.7, 0.04, glass, [0, 0.95, cabinZ + cabinL / 2 + 0.01], { cast: false }));
    for (const sx of [-1, 1]) g.add(box(0.03, cabinH * 0.62, cabinL * 0.8, glass, [sx * ((kind === 'van' ? 1.75 : 1.55) / 2 + 0.01), 0.97, cabinZ], { cast: false }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cbox(0.24, 0.6, 0.6, 0x1a1a1a, [sx * 0.85, 0.3, sz * 1.35]));
    for (const sx of [-1, 1]) {
      g.add(cbox(0.3, 0.14, 0.04, 0xfff3cf, [sx * 0.6, 0.65, 2.11], { mat: lights ? { emissive: 0xfff0c0, emissiveIntensity: 1.6 } : {} }));
      g.add(cbox(0.3, 0.12, 0.04, 0xb01818, [sx * 0.6, 0.65, -2.11], { mat: lights ? { emissive: 0xff2020, emissiveIntensity: 1.4 } : {} }));
    }
    if (kind === 'taxi') g.add(box(0.5, 0.15, 0.25, 0xfff2b0, [0, 1.45, -0.2]));
    return g;
  };
  const bus = ({ color = 0xf2c418, stripe = 0x2a6fb0 } = {}) => {
    const g = group(box(2.5, 2.9, 11, color, [0, 0.35, 0]), box(2.52, 0.18, 11.02, stripe, [0, 1.25, 0], { cast: false }));
    const glass = mat(0x2f3d4c, { roughness: 0.3 });
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) g.add(box(0.03, 0.9, 1.4, glass, [sx * 1.26, 1.65, -4.4 + i * 1.6], { cast: false }));
    g.add(box(2.2, 1.2, 0.04, glass, [0, 1.6, 5.51], { cast: false }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cbox(0.3, 1, 1, 0x1a1a1a, [sx * 1.15, 0.5, sz * 3.6]));
    return g;
  };

  // Gebäudefront mit Fensterraster. facade-Farbe, Stockwerke, Breite; Fenster leuchten optional.
  const building = ({ w = 8, floors = 5, d = 6, color = 0xb5654a, win = 0x9fb4c8, lit = 0, storefront = null } = {}) => {
    const fh = 3.2;
    const g = group(box(w, floors * fh, d, color, [0, 0, 0]));
    const cols = Math.max(2, Math.floor(w / 1.6));
    for (let f = storefront ? 1 : 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const on = rng.next() < lit;
        const x = -w / 2 + (c + 0.5) * (w / cols);
        g.add(box(0.95, 1.5, 0.06, on ? 0xffe4a8 : win, [x, f * fh + 0.9, d / 2 + 0.02], { cast: false, mat: on ? { emissive: 0xffd890, emissiveIntensity: 0.9 } : { roughness: 0.4 } }));
        g.add(box(1.1, 0.1, 0.16, 0xe8e2d6, [x, f * fh + 0.82, d / 2 + 0.05], { cast: false }));
      }
    }
    if (storefront) {
      g.add(box(w * 0.86, 2.3, 0.08, 0x3a4b5a, [0, 0.2, d / 2 + 0.03], { mat: { roughness: 0.3 } }));
      g.add(box(w * 0.9, 0.5, 1.2, storefront, [0, 2.6, d / 2 + 0.5]));
    }
    g.add(box(w + 0.2, 0.3, d + 0.2, 0x8a8178, [0, floors * fh, 0]));
    return g;
  };

  // Leichtes Gebäude aus EINEM Netz (Fenster als Textur) – für große Städte, Luftbilder und schnelle Fahrten,
  // wo hunderte Gebäude nötig sind (building() erzeugt je Fenster eigene Netze und ist dafür zu teuer).
  const towerTiles = new Map();
  const towerTile = (color, win, lit) => {
    const key = `${color}|${win}|${lit}`;
    if (!towerTiles.has(key)) {
      // 4 Spalten × 4 Stockwerke pro Kachel; Fenster zufällig beleuchtet (geseedet)
      const tex = canvasTex(256, 256, (g, W, H) => {
        g.fillStyle = `#${new THREE.Color(color).getHexString()}`;
        g.fillRect(0, 0, W, H);
        for (let f = 0; f < 4; f++) {
          for (let c = 0; c < 4; c++) {
            const on = rng.next() < lit;
            g.fillStyle = on ? '#ffe2a0' : `#${new THREE.Color(win).getHexString()}`;
            g.fillRect(c * 64 + 14, f * 64 + 12, 36, 34);
            g.fillStyle = 'rgba(255,255,255,0.35)';
            g.fillRect(c * 64 + 10, f * 64 + 48, 44, 5);
          }
        }
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      towerTiles.set(key, tex);
    }
    return towerTiles.get(key);
  };
  const tower = ({ w = 10, h = 24, d = 10, color = 0xb5654a, win = 0x8fa6bc, lit = 0, roof = 0x8a8178 } = {}) => {
    const side = (len) => {
      const t = towerTile(color, win, lit).clone();
      t.needsUpdate = true;
      t.repeat.set(len / 6.4, h / 12.8); // Kachel = 4 Spalten à 1,6 m × 4 Stockwerke à 3,2 m
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, flatShading: true });
    };
    const top = mat(roof);
    const sx = side(d);
    const sz = side(w);
    const geo = new THREE.BoxGeometry(w, h, d, Math.max(1, Math.ceil(w / 8)), Math.max(1, Math.ceil(h / 8)), Math.max(1, Math.ceil(d / 8)));
    geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, [sx, sx, top, top, sz, sz]);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  // ---------- Gedankenblase ----------
  // Wolke aus weißen Low-Poly-Kugeln mit Piktogramm (keine Schrift – Texte gehören in text.<lang>.json, Guide 1.3)
  // und Pünktchenspur zum Kopf. Mittelpunkt der Wolke = Ursprung der Gruppe; tail = Versatz zum Kopf (lokal).
  //   const b = props.thoughtBubble({ icon: 'pizza', tail: [-0.3, -0.7, 0] });
  //   b.position.set(...); b.lookAt(kameraPosition);   // Piktogramm zeigt zur Kamera
  //   in update(): b.userData.pop(t - tAuf, t - tZu)   // Aufploppen mit Überschwingen, Zuploppen; < 0 = noch nicht
  // Piktogramme: question, pizza, heart, tie, mail, door, stars1, stars2, cake, zzz, ear, empty
  const ICONS = {
    question(g, W, H) {
      g.fillStyle = '#3a3a48';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      [[0.3, 0.55, 150, -0.25], [0.52, 0.45, 200, 0.05], [0.74, 0.58, 140, 0.3]].forEach(([x, y, s, r]) => {
        g.save();
        g.translate(x * W, y * H);
        g.rotate(r);
        g.font = `900 ${s}px sans-serif`;
        g.fillText('?', 0, 0);
        g.restore();
      });
    },
    pizza(g, W, H) {
      g.translate(W / 2, H / 2 + 6);
      g.fillStyle = '#c98a3a';
      g.beginPath();
      g.moveTo(-110, -70);
      g.quadraticCurveTo(0, -105, 110, -70);
      g.lineTo(0, 100);
      g.closePath();
      g.fill();
      g.fillStyle = '#f2c94c';
      g.beginPath();
      g.moveTo(-92, -58);
      g.quadraticCurveTo(0, -86, 92, -58);
      g.lineTo(0, 86);
      g.closePath();
      g.fill();
      g.fillStyle = '#c8302a';
      for (const [x, y] of [[-35, -35], [30, -30], [0, 15], [-10, 55]]) {
        g.beginPath();
        g.arc(x, y, 16, 0, Math.PI * 2);
        g.fill();
      }
    },
    heart(g, W, H) {
      g.translate(W / 2, H / 2 + 10);
      g.fillStyle = '#e8365a';
      g.beginPath();
      g.moveTo(0, 85);
      g.bezierCurveTo(-150, -10, -80, -120, 0, -50);
      g.bezierCurveTo(80, -120, 150, -10, 0, 85);
      g.fill();
    },
    tie(g, W, H) {
      g.translate(W / 2, H / 2);
      g.fillStyle = '#e83fb4';
      g.fillRect(-26, -95, 52, 34);
      g.beginPath();
      g.moveTo(-22, -61);
      g.lineTo(22, -61);
      g.lineTo(42, 70);
      g.lineTo(0, 100);
      g.lineTo(-42, 70);
      g.closePath();
      g.fill();
      g.strokeStyle = '#d0202a';
      g.lineWidth = 22;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(-95, -90);
      g.lineTo(95, 90);
      g.moveTo(95, -90);
      g.lineTo(-95, 90);
      g.stroke();
    },
    mail(g, W, H) {
      g.translate(W / 2, H / 2);
      g.fillStyle = '#f4f1ea';
      g.strokeStyle = '#3a3a48';
      g.lineWidth = 12;
      g.lineJoin = 'round';
      g.fillRect(-120, -78, 240, 156);
      g.strokeRect(-120, -78, 240, 156);
      g.beginPath();
      g.moveTo(-120, -78);
      g.lineTo(0, 20);
      g.lineTo(120, -78);
      g.stroke();
    },
    door(g, W, H) {
      g.translate(W / 2, H / 2);
      g.fillStyle = '#8a5a36';
      g.fillRect(-95, -105, 120, 210);
      g.fillStyle = '#f2c94c';
      g.beginPath();
      g.arc(5, 5, 10, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#2f9a5a';
      g.fillStyle = '#2f9a5a';
      g.lineWidth = 20;
      g.beginPath();
      g.moveTo(45, 0);
      g.lineTo(100, 0);
      g.stroke();
      g.beginPath();
      g.moveTo(130, 0);
      g.lineTo(92, -32);
      g.lineTo(92, 32);
      g.closePath();
      g.fill();
    },
    cake(g, W, H) {
      g.translate(W / 2, H / 2 + 20);
      g.fillStyle = '#f2a0b8';
      g.fillRect(-105, -10, 210, 80);
      g.fillStyle = '#fff4f0';
      g.fillRect(-105, -30, 210, 30);
      g.fillStyle = '#7a4a2e';
      g.fillRect(-105, 30, 210, 14);
      g.fillStyle = '#5aa0e8';
      g.fillRect(-8, -95, 16, 65);
      g.fillStyle = '#ffb020';
      g.beginPath();
      g.ellipse(0, -112, 13, 22, 0, 0, Math.PI * 2);
      g.fill();
    },
    zzz(g, W, H) {
      g.fillStyle = '#3a4a8a';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      [[0.3, 0.68, 110], [0.52, 0.48, 140], [0.75, 0.3, 170]].forEach(([x, y, s]) => {
        g.font = `900 ${s}px sans-serif`;
        g.fillText('Z', x * W, y * H);
      });
    },
    ear(g, W, H) {
      g.translate(W / 2 - 20, H / 2);
      g.fillStyle = '#e8b48a';
      g.strokeStyle = '#a8704a';
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(-40, 90);
      g.bezierCurveTo(-90, 40, -100, -100, 10, -105);
      g.bezierCurveTo(90, -105, 95, -20, 40, 20);
      g.bezierCurveTo(10, 45, 20, 95, -40, 90);
      g.fill();
      g.stroke();
      g.beginPath();
      g.moveTo(-25, 40);
      g.bezierCurveTo(-50, -30, -10, -60, 25, -45);
      g.stroke();
      g.strokeStyle = '#3a3a48';
      g.lineWidth = 10;
      g.lineCap = 'round';
      for (const r of [40, 75]) {
        g.beginPath();
        g.arc(80, -10, r, -0.7, 0.7);
        g.stroke();
      }
    },
    empty() {},
  };
  const starIcon = (n) => (g, W, H) => {
    const star = (cx, cy, r, fill) => {
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        g.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      }
      g.closePath();
      g.fillStyle = fill ? '#f2b822' : '#d4d4dc';
      g.fill();
    };
    for (let i = 0; i < 5; i++) star(W / 2 + (i - 2) * 72, H / 2, 40, i < n);
  };
  ICONS.stars1 = starIcon(1);
  ICONS.stars2 = starIcon(2);
  const iconTextures = new Map();
  const iconTex = (name) => {
    if (!ICONS[name]) throw new Error(`thoughtBubble: unbekanntes Piktogramm "${name}"`);
    if (!iconTextures.has(name)) iconTextures.set(name, canvasTex(384, 288, (g, W, H) => ICONS[name](g, W, H)));
    return iconTextures.get(name);
  };
  const puffGeo = new THREE.IcosahedronGeometry(1, 1);
  const thoughtBubble = ({ icon = 'question', tail = [-0.35, -0.75, 0], size = 1, color = 0xffffff } = {}) => {
    const g = new THREE.Group();
    const cloud = new THREE.Group();
    g.add(cloud);
    const white = mat(color, { emissive: color, emissiveIntensity: 0.35 });
    const puff = (x, y, z, r, sx = 1) => {
      const m = new THREE.Mesh(puffGeo, white);
      m.position.set(x, y, z);
      m.scale.set(r * sx, r, r * 0.55);
      cloud.add(m);
    };
    // Wolkenkörper: Mitte + Ring kleinerer Kugeln (flach, damit das Piktogramm davor liegen kann)
    puff(0, 0, 0, 0.3, 1.45);
    [[-0.36, 0.06, 0.2], [-0.2, 0.2, 0.22], [0.05, 0.24, 0.22], [0.3, 0.18, 0.21], [0.42, -0.02, 0.19], [0.24, -0.2, 0.19], [-0.05, -0.22, 0.2], [-0.32, -0.15, 0.18]].forEach(([x, y, r]) => puff(x, y, -0.02, r));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.465), new THREE.MeshBasicMaterial({ map: iconTex(icon), transparent: true, toneMapped: false }));
    face.position.z = 0.19;
    cloud.add(face);
    // Pünktchenspur zum Kopf (2 Kugeln, kleiner werdend)
    const dots = [0.42, 0.72].map((k, i) => {
      const m = new THREE.Mesh(puffGeo, white);
      m.position.set(tail[0] * k, -0.18 + (tail[1] + 0.18) * k, tail[2] * k);
      m.scale.setScalar(i ? 0.045 : 0.075);
      g.add(m);
      return m;
    });
    for (const m of [...cloud.children, ...dots]) m.castShadow = false;
    g.scale.setScalar(size);
    g.userData.pop = (since, sinceClose = -1) => {
      // 0 → 1 mit Überschwingen in 0,25 s; Zuploppen 0,15 s; Pünktchen erscheinen zuerst
      let k = since < 0 ? 0 : since >= 0.25 ? 1 : 1 + 0.25 * Math.sin(Math.PI * (since / 0.25)) - (1 - since / 0.25) ** 2;
      if (sinceClose >= 0) k *= Math.max(0, 1 - sinceClose / 0.15);
      g.visible = k > 0.001;
      cloud.scale.setScalar(Math.max(0.001, k));
      dots.forEach((d, i) => (d.visible = since >= 0.04 * (1 - i) && k > 0.05));
      return k;
    };
    g.userData.pop(-1);
    return g;
  };

  // Boden-/Wandplatte (unterteilt für saubere Schatten)
  const slab = (w, d, color, pos = [0, 0, 0], h = 0.1) => box(w, h, d, color, [pos[0], pos[1] - h, pos[2]]);

  return {
    canvasTex, phoneTexture, phone, bigPhone, sign, bed, nightstand, tableLamp, alarmClock, table, chair, counter, upperCabinets, toaster, mug, toast, plant, cardboardBox,
    desk, officeChair, umbrella, puddle, tree, bush, streetLamp, bench, hydrant, trashCan, car, bus, building, tower, slab,
    thoughtBubble,
  };
}
