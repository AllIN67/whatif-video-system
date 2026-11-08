// Krankenhaus-Teile (ergänzt 2026-11-08 für what-if-koma; additiv, keine bestehende Schnittstelle geändert).
// Referenz-Analyse (Koma-Referenz, Upload 2026-11-08): Intensivzimmer mit Monitor, Infusion, Karten an der Wand, Fenster;
// Flur mit Deckenleuchten. Hier als Kit-Bausteine, damit künftige Krankenhaus-Themen sie wiederverwenden.
//
//   const H = kit.hospital;
//   const room = H.room([200, 0, 0]);  scene.add(room.root);       // Intensivzimmer, offene Seite +z
//   room.monitor.update(t, { bpm: 72 });  room.setCards(12);  room.setWindow(0xbfd8f0, 0.8);  room.clock.set(hours)
//   const bed = H.bed();  bed.userData.blanket  (Bett-Oberkante = H.BED_TOP, Kopf Richtung −z)
//   const ph = H.chatPhone({ size: 'big' });  ph.set({ mode: 'chat', name: 'Lea', messages: [...] })
//
// Keine Zufallszahlen aus dem gemeinsamen rng (feste Anordnungen) → bestehende Szenen bleiben bit-identisch.
// Bildtexte (Handy, Schilder) setzt die Szene in der Videosprache (Guide 18.14 D11); Vorgaben hier sind neutral.

export function createHospital(THREE, core, atmo) {
  const { box, cbox, group, mat } = core;
  const BED_TOP = 0.62;

  const canvasTex = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { c, g: c.getContext('2d'), tex };
  };
  const screen = (tex, w, h, glow = 1.0) =>
    new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow, roughness: 0.4 }));
  const rr = (g, x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };

  // ------------------------------------------------------------ Bett (Kopf −z, Fußende +z)
  const bed = ({ sheet = 0xe9eef2, frame = 0xc9d0d6, blanket = 0xa9bccb, rails = true } = {}) => {
    const g = group();
    g.add(box(0.96, 0.1, 2.1, frame, [0, 0.36, 0]));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      g.add(box(0.06, 0.32, 0.06, 0x9aa3ab, [sx * 0.4, 0.06, sz * 0.92]));
      g.add(cbox(0.06, 0.1, 0.1, 0x2a2c30, [sx * 0.4, 0.05, sz * 0.92]));
    }
    g.add(box(0.92, 0.16, 2.02, sheet, [0, 0.46, 0]));
    const pillow = box(0.62, 0.1, 0.36, 0xf6f8fa, [0, BED_TOP - 0.02, -0.8]);
    g.add(pillow);
    g.add(box(0.98, 0.62, 0.06, 0xb8c4cc, [0, 0.4, -1.05])); // Kopfteil
    g.add(box(0.98, 0.42, 0.06, 0xb8c4cc, [0, 0.4, 1.05])); // Fußteil
    g.add(box(0.98, 0.04, 0.08, 0x8e9aa4, [0, 1.02, -1.05]));
    g.add(box(0.98, 0.04, 0.08, 0x8e9aa4, [0, 0.82, 1.05]));
    if (rails) for (const sx of [-1, 1]) {
      g.add(box(0.035, 0.035, 0.95, 0xdfe4e8, [sx * 0.5, 0.78, -0.32]));
      g.add(box(0.035, 0.035, 0.95, 0xdfe4e8, [sx * 0.5, 0.64, -0.32]));
      for (const z of [-0.75, 0.1]) g.add(box(0.035, 0.28, 0.035, 0xdfe4e8, [sx * 0.5, 0.5, z]));
    }
    // Bettdecke (eigenes Objekt; Szene kann Farbe/Länge ändern). Deckt Brust bis Füße.
    const bl = group(box(0.94, 0.27, 1.42, blanket, [0, 0, 0]), box(0.95, 0.05, 0.22, 0xf2f5f7, [0, 0.25, -0.64]));
    bl.position.set(0, BED_TOP, 0.36);
    g.add(bl);
    g.userData.blanket = bl;
    g.userData.pillow = pillow;
    g.userData.top = BED_TOP;
    return g;
  };

  // ------------------------------------------------------------ EKG-Monitor (Bildschirm animiert aus t, deterministisch)
  const ecgShape = (p) => {
    // p = Phase eines Herzschlags 0…1 → Ausschlag −0.3…1
    const bump = (c, w, a) => a * Math.exp(-((p - c) * (p - c)) / (2 * w * w));
    return bump(0.12, 0.025, 0.12) - bump(0.24, 0.008, 0.18) + bump(0.27, 0.01, 1.0) - bump(0.30, 0.01, 0.3) + bump(0.5, 0.045, 0.22);
  };
  const monitor = ({ w = 0.52, h = 0.36 } = {}) => {
    const { c, g, tex } = canvasTex(384, 266);
    const root = group(box(w + 0.05, h + 0.05, 0.07, 0x2c3136, [0, -(h + 0.05) / 2, 0]));
    const scr = screen(tex, w, h, 1.15);
    scr.position.z = 0.036;
    root.add(scr);
    const W = c.width;
    const H = c.height;
    let last = '';
    const api = {
      root,
      // bpm: Herzfrequenz · flat: 0…1 Nulllinie · spo2 · alarm (rote Zahl blinkt) · strong: Ausschlag (z. B. Aufwachen)
      update(t, { bpm = 72, flat = 0, spo2 = 97, alarm = 0, strong = 1 } = {}) {
        const key = `${Math.round(t * 30)}|${bpm}|${flat}|${alarm}|${strong}`;
        if (key === last) return;
        last = key;
        g.fillStyle = '#05090b';
        g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(80,140,120,0.18)';
        g.lineWidth = 1;
        for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
        for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        // Spur: letzte 3 s, rechter Rand = jetzt
        const span = 3.0;
        const plotW = W * 0.68;
        g.strokeStyle = '#4dff9a';
        g.lineWidth = 3;
        g.beginPath();
        for (let i = 0; i <= 200; i++) {
          const tt = t - span + (span * i) / 200;
          const ph = ((tt * bpm) / 60) % 1;
          const v = ecgShape(ph < 0 ? ph + 1 : ph) * (1 - flat) * strong;
          const x = 10 + (plotW * i) / 200;
          const y = H * 0.38 - v * H * 0.26;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        // zweite Spur (Atmung, cyan)
        g.strokeStyle = '#3fd6ff';
        g.lineWidth = 2;
        g.beginPath();
        for (let i = 0; i <= 120; i++) {
          const tt = t - span + (span * i) / 120;
          const x = 10 + (plotW * i) / 120;
          const y = H * 0.78 - Math.sin((tt * Math.PI * 2) / 4) * H * 0.06 * (1 - flat);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        // Zahlen (sprachneutral)
        const blink = alarm > 0 && Math.floor(t * 4) % 2 === 0;
        g.textAlign = 'right';
        g.fillStyle = blink ? '#ff4d4d' : '#4dff9a';
        g.font = 'bold 74px sans-serif';
        g.fillText(String(Math.round(bpm * (1 - flat))), W - 12, 92);
        g.font = 'bold 22px sans-serif';
        g.fillText('HF', W - 12, 28);
        g.fillStyle = '#3fd6ff';
        g.font = 'bold 54px sans-serif';
        g.fillText(String(spo2), W - 12, 196);
        g.font = 'bold 20px sans-serif';
        g.fillText('SpO2', W - 12, 138);
        tex.needsUpdate = true;
      },
    };
    api.update(0);
    return api;
  };

  // ------------------------------------------------------------ Infusionsständer mit Beutel und Schlauch
  const ivStand = ({ tube = true } = {}) => {
    const g = group();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leg = box(0.32, 0.03, 0.04, 0x9aa3ab, [Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15]);
      leg.rotation.y = -a;
      g.add(leg);
    }
    g.add(box(0.03, 1.95, 0.03, 0xc9d0d6, [0, 0.05, 0]));
    g.add(box(0.36, 0.025, 0.025, 0xc9d0d6, [0, 1.98, 0]));
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.05), new THREE.MeshStandardMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.75, roughness: 0.2 }));
    bag.position.set(0.14, 1.82, 0);
    g.add(bag);
    g.add(box(0.12, 0.1, 0.04, 0xbfe2ff, [0.14, 1.66, 0], { mat: { transparent: true, opacity: 0.6 } }));
    if (tube) {
      const t = box(0.012, 1.1, 0.012, 0xe6eef4, [0.14, 0.62, 0], { cast: false });
      t.rotation.z = 0.25;
      g.add(t);
    }
    return g;
  };

  // ------------------------------------------------------------ Wanduhr (Zeiger aus Stunden; Zeitraffer)
  const clock = () => {
    const g = group(cbox(0.36, 0.36, 0.04, 0xf4f6f8, [0, 0, 0]), cbox(0.38, 0.38, 0.03, 0x3a4048, [0, 0, -0.01]));
    const hand = (l, w, c) => {
      const p = new THREE.Group();
      p.add(cbox(w, l, 0.01, c, [0, l / 2 - 0.02, 0.03], { cast: false }));
      g.add(p);
      return p;
    };
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.add(cbox(0.015, 0.035, 0.01, 0x3a4048, [Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0.025], { cast: false }));
    }
    const hh = hand(0.1, 0.022, 0x22262b);
    const mh = hand(0.14, 0.014, 0x22262b);
    return {
      root: g,
      set(hours) {
        hh.rotation.z = -((hours % 12) / 12) * Math.PI * 2;
        mh.rotation.z = -(hours % 1) * Math.PI * 2;
      },
    };
  };

  // ------------------------------------------------------------ Karten/Zeichnungen an der Wand (gedämpfte Farben)
  const CARD_COLS = [0xf3e6c8, 0xe9d3d6, 0xd7e3ea, 0xe4e9d2, 0xf1ddc4, 0xdcd6ea];
  const cardWall = ({ cols = 8, rows = 3, gap = 0.3 } = {}) => {
    const g = group();
    const cards = [];
    // feste, leicht unregelmäßige Anordnung (kein Zufall)
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const w = 0.16 + ((i * 7) % 5) * 0.012;
      const h = 0.2 + ((i * 3) % 4) * 0.015;
      const m = group(box(w, h, 0.01, CARD_COLS[i % CARD_COLS.length], [0, -h / 2, 0], { cast: false }));
      m.add(box(w * 0.6, 0.02, 0.012, [0xc0806a, 0x7a9ab0, 0x9ab07a, 0xc0a060][i % 4], [0, -h * 0.35, 0], { cast: false }));
      m.add(box(w * 0.4, 0.05, 0.012, [0xd98a8a, 0x8ab0d9, 0xa0c880, 0xe0c070][(i + 1) % 4], [0, -h * 0.75, 0], { cast: false }));
      m.position.set((c - (cols - 1) / 2) * gap + ((r % 2) * 0.08), -r * 0.28, 0);
      m.rotation.z = (((i * 5) % 7) - 3) * 0.03;
      m.visible = false;
      g.add(m);
      cards.push(m);
    }
    // Reihenfolge des Erscheinens: von der Mitte nach außen
    const order = cards.map((_, i) => i).sort((a, b) => Math.abs((a % cols) - (cols - 1) / 2) + Math.floor(a / cols) * 0.7 - (Math.abs((b % cols) - (cols - 1) / 2) + Math.floor(b / cols) * 0.7));
    return {
      root: g,
      count: cards.length,
      set(n) {
        order.forEach((idx, k) => { cards[idx].visible = k < n; });
      },
    };
  };

  // ------------------------------------------------------------ Intensivzimmer (offene Seite +z)
  // Bett mittig an der Rückwand (Kopf −z), Monitor links oben am Wandarm, Infusion rechts, Fenster links, Tür rechts.
  const room = (o = [0, 0, 0], { w = 6.4, d = 6, h = 3.1, wall = 0xdfe6ea, floor = 0xc9d0d4, accentWall = 0xb9cbd4 } = {}) => {
    const g = group();
    const fl = atmo.ground('tiles', w, d + 2, { color: floor, perMeter: 0.9 });
    fl.position.set(0, 0, 1);
    g.add(fl);
    g.add(box(w, h, 0.15, accentWall, [0, 0, -d / 2]));
    g.add(box(0.15, h, d + 2, wall, [-w / 2, 0, 1]));
    g.add(box(0.15, h, d + 2, wall, [w / 2, 0, 1]));
    g.add(box(w, 0.12, 0.04, 0xeef1f3, [0, 0, -d / 2 + 0.09], { cast: false }));
    g.add(box(w, 0.08, 0.04, 0x9fb0ba, [0, 1.0, -d / 2 + 0.09], { cast: false })); // Wandschutz-Leiste
    // Versorgungsleiste über dem Bett
    g.add(box(2.4, 0.22, 0.12, 0xeef2f5, [0, 1.42, -d / 2 + 0.12]));
    for (let i = 0; i < 6; i++) g.add(cbox(0.06, 0.06, 0.03, [0x4dbb6a, 0xe0c040, 0x5a8fd0, 0xd06a5a][i % 4], [-0.9 + i * 0.36, 1.53, -d / 2 + 0.19], { cast: false }));
    // Decke mit Lichtfeldern
    g.add(box(w, 0.1, d + 2, 0xf1f3f5, [0, h, 1], { cast: false }));
    const panels = [];
    for (const [x, z] of [[0, -1.6], [0, 1.0], [-1.9, -0.3], [1.9, -0.3]]) {
      const p = box(1.0, 0.03, 0.55, 0xffffff, [x, h - 0.03, z], { cast: false, mat: { emissive: 0xf4f8ff, emissiveIntensity: 1.1 } });
      g.add(p);
      panels.push(p);
    }
    const ceilLights = [atmo.lampPool({ pos: [0, h - 0.25, -1.6], color: 0xf2f6ff, intensity: 22, dist: 7, bulb: 0 }), atmo.lampPool({ pos: [0, h - 0.25, 1.0], color: 0xf2f6ff, intensity: 14, dist: 7, bulb: 0 })];
    for (const l of ceilLights) g.add(l.root);
    // Bett + Patientenplatz
    const b = bed();
    b.position.set(0, 0, -d / 2 + 1.25);
    g.add(b);
    // Monitor am Wandarm links vom Kopfteil
    const mon = monitor();
    mon.root.position.set(-1.05, 2.05, -d / 2 + 0.35);
    mon.root.rotation.y = 0.35;
    g.add(mon.root, box(0.06, 0.06, 0.3, 0x8e9aa4, [-1.05, 1.7, -d / 2 + 0.15]));
    const monGlow = atmo.lampPool({ pos: [-1.0, 1.85, -d / 2 + 0.6], color: 0x7dffc0, intensity: 1.2, dist: 2.2, bulb: 0 });
    g.add(monGlow.root);
    // Infusion rechts
    const iv = ivStand();
    iv.position.set(-0.78, 0, -d / 2 + 0.75);
    g.add(iv);
    // Nachttisch rechts mit Blumen-Vase
    const ns = group(box(0.5, 0.7, 0.45, 0xdfe5e9), box(0.46, 0.02, 0.41, 0xc9d0d6, [0, 0.36, 0.02]));
    ns.position.set(1.45, 0, -d / 2 + 0.6);
    g.add(ns);
    // Stuhl für Besucher (links vom Bett)
    const chair = group(box(0.48, 0.06, 0.46, 0x6f8a96, [0, 0.45, 0]), box(0.48, 0.5, 0.06, 0x6f8a96, [0, 0.48, -0.22]));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) chair.add(box(0.04, 0.45, 0.04, 0x4a5258, [sx * 0.2, 0, sz * 0.19]));
    chair.position.set(-1.05, 0, -d / 2 + 2.0);
    chair.rotation.y = Math.PI / 2;
    g.add(chair);
    // Fenster in der linken Wand (Licht von außen, Farbe = Tageszeit/Jahreszeit)
    const winMat = new THREE.MeshStandardMaterial({ color: 0xcfe2f2, emissive: 0xcfe2f2, emissiveIntensity: 0.9, roughness: 0.3 });
    const win = group(box(0.08, 1.6, 2.0, 0xf4f6f8, [0, -0.06, 0]), new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.48, 1.88), winMat), box(0.1, 1.5, 0.05, 0xf4f6f8, [0, 0, 0]));
    win.children[1].position.set(0.02, 0.74, 0);
    win.position.set(-w / 2 + 0.06, 0.95, -0.6);
    g.add(win);
    const sunPatch = atmo.spotCone({ pos: [-w / 2 - 1.5, 3.2, -0.6], target: [-0.6, 0, -0.2], color: 0xfff2dc, intensity: 0, angle: 0.5, penumbra: 0.6, cone: false, housing: false, shadow: false });
    g.add(sunPatch.root);
    // Vorhang an der Deckenschiene (rechts)
    g.add(box(0.04, 0.04, 3.4, 0xb8c2c8, [1.9, h - 0.12, -0.6], { cast: false }));
    for (let i = 0; i < 8; i++) g.add(box(0.06, 2.2, 0.16, i % 2 ? 0x9fb7c4 : 0xa9c0cc, [2.15 + (i % 2) * 0.04, 0.7, -1.9 + i * 0.13]));
    // Tür rechts (Flur), Desinfektionsspender, Waschbecken
    g.add(box(0.06, 2.15, 1.05, 0xb7a58e, [w / 2 - 0.1, 0, 1.6]), box(0.03, 0.06, 0.18, 0x8e9aa4, [w / 2 - 0.15, 1.05, 1.25]));
    g.add(box(0.08, 0.22, 0.12, 0xf4f6f8, [w / 2 - 0.12, 1.25, 0.6]));
    const sink = group(box(0.5, 0.18, 0.4, 0xf4f6f8, [0, 0.8, 0]), box(0.03, 0.8, 0.03, 0xc9d0d6, [0, 0, -0.1]), box(0.45, 0.6, 0.02, 0xd9e6ee, [0, 1.15, -0.18], { mat: { metalness: 0.4, roughness: 0.15 } }));
    sink.position.set(w / 2 - 0.35, 0, -0.6);
    sink.rotation.y = -Math.PI / 2;
    g.add(sink);
    // Karten und Uhr an der Rückwand
    const cw = cardWall({ cols: 9, rows: 3 });
    cw.root.position.set(0, 2.55, -d / 2 + 0.085);
    g.add(cw.root);
    const ck = clock();
    ck.root.position.set(1.95, 2.35, -d / 2 + 0.1);
    g.add(ck.root);
    g.position.set(o[0], o[1], o[2]);
    const at = (x, y, z) => [o[0] + x, o[1] + y, o[2] + z];
    return {
      root: g,
      origin: o,
      bed: b,
      monitor: mon,
      iv,
      chair,
      monGlow,
      nightstand: ns,
      clock: ck,
      cards: cw,
      panels,
      ceilLights,
      sunPatch,
      setCards: (n) => cw.set(n),
      // Fensterlicht: Farbe + Helligkeit 0…1, Sonnenfleck auf dem Boden (Zeitraffer, Jahreszeiten)
      setWindow(color, k = 1, sun = 0) {
        winMat.color.setHex(color);
        winMat.emissive.setHex(color);
        winMat.emissiveIntensity = 0.15 + 0.85 * k;
        sunPatch.light.intensity = 160 * sun;
      },
      setCeiling(k = 1) {
        for (const p of panels) p.material.emissiveIntensity = 1.1 * k;
        ceilLights[0].light.intensity = 22 * k;
        ceilLights[1].light.intensity = 14 * k;
      },
      spots: { bedTop: at(0, BED_TOP, -d / 2 + 1.25), chair: at(-1.05, 0, -d / 2 + 2.0), door: at(w / 2 - 0.6, 0, 1.6) },
    };
  };

  // ------------------------------------------------------------ Klinikflur (entlang x, Rückwand −z, offene Seite +z)
  const corridor = (o = [0, 0, 0], { length = 22, depth = 3.2, h = 2.9, wall = 0xdfe5e8, sign = null } = {}) => {
    const g = group();
    const fl = atmo.ground('tiles', length, depth + 4, { color: 0xc4cdd2, perMeter: 0.8 });
    fl.position.set(0, 0, 1);
    g.add(fl);
    g.add(box(length, h, 0.15, wall, [0, 0, -depth / 2]));
    g.add(box(length, 0.1, depth + 4, 0xeef1f3, [0, h, 1], { cast: false }));
    g.add(box(length, 0.1, 0.05, 0x8fb3a8, [0, 0.9, -depth / 2 + 0.1], { cast: false })); // Handlauf
    g.add(box(length, 0.12, 0.04, 0x9aa8b0, [0, 0, -depth / 2 + 0.09], { cast: false }));
    const lights = [];
    for (let x = -length / 2 + 1.5; x < length / 2; x += 3) {
      g.add(box(1.2, 0.03, 0.4, 0xffffff, [x, h - 0.03, 0], { cast: false, mat: { emissive: 0xf4f8ff, emissiveIntensity: 1.15 } }));
    }
    for (const x of [-6, 0, 6]) {
      const l = atmo.lampPool({ pos: [x, h - 0.3, 0.2], color: 0xf2f6ff, intensity: 16, dist: 8, bulb: 0 });
      g.add(l.root);
      lights.push(l);
    }
    // Türen (Zimmer) mit Fenster-Streifen
    for (const x of [-7.5, -2.2, 3.4, 8.6]) {
      g.add(box(1.1, 2.15, 0.06, 0xb7a58e, [x, 0, -depth / 2 + 0.1]));
      g.add(box(0.12, 0.7, 0.07, 0xcfe2f2, [x + 0.3, 1.2, -depth / 2 + 0.11], { cast: false, mat: { emissive: 0xcfe2f2, emissiveIntensity: 0.5 } }));
      g.add(box(0.2, 0.03, 0.06, 0x8e9aa4, [x - 0.35, 1.05, -depth / 2 + 0.15]));
    }
    // Wartebank (Sitzhöhe 0,45)
    const bench = group(box(1.8, 0.07, 0.45, 0x5d7f8a, [0, 0.42, 0]), box(1.8, 0.4, 0.06, 0x5d7f8a, [0, 0.5, -0.2]));
    for (const sx of [-1, 1]) bench.add(box(0.05, 0.42, 0.4, 0x3d4448, [sx * 0.8, 0, 0]));
    bench.position.set(0.6, 0, -depth / 2 + 0.4);
    g.add(bench);
    const plantG = group(box(0.32, 0.4, 0.32, 0x8a7a6a), box(0.5, 0.8, 0.5, 0x5f7f55, [0, 0.4, 0]));
    plantG.position.set(-0.9, 0, -depth / 2 + 0.35);
    g.add(plantG);
    if (sign) {
      const s = atmo.glowSign({ text: sign, w: 1.9, h: 0.3, color: '#f4f8ff', bg: '#2f6f8f', intensity: 1.2 });
      s.root.position.set(-4.6, 2.35, -depth / 2 + 0.1);
      g.add(s.root);
    }
    g.position.set(o[0], o[1], o[2]);
    return { root: g, origin: o, bench, lights, spots: { bench: [o[0] + 0.6, o[1] + 0.45, o[2] - depth / 2 + 0.45] } };
  };

  // ------------------------------------------------------------ Handy mit Chat/Sperrbildschirm (große Schrift für 9:16)
  // set({ mode: 'chat', name, messages: [{ from: 'me'|'them', text, status }], cracked, unread })
  // set({ mode: 'lock', time, date, banner: { name, text }, cracked })
  const chatPhone = ({ size = 'normal' } = {}) => {
    const big = size === 'big';
    const pw = big ? 0.3 : 0.085;
    const ph = big ? 0.6 : 0.17;
    const p = group(cbox(pw, ph, big ? 0.03 : 0.012, 0x15151a));
    const { c, g, tex } = canvasTex(400, 800);
    const scr = screen(tex, pw * 0.9, ph * 0.92, 1.0);
    scr.position.z = big ? 0.016 : 0.0065;
    p.add(scr);
    const W = c.width;
    const H = c.height;
    let last = '';
    const crack = () => {
      g.strokeStyle = 'rgba(255,255,255,0.75)';
      g.lineWidth = 2;
      const lines = [[[300, 120], [250, 260], [280, 360], [190, 520]], [[250, 260], [120, 300], [40, 280]], [[280, 360], [380, 430]], [[190, 520], [90, 700]], [[190, 520], [300, 640], [330, 790]]];
      for (const L of lines) {
        g.beginPath();
        L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
      }
    };
    const wrap = (text, maxW) => {
      const words = text.split(' ');
      const out = [];
      let cur = '';
      for (const w of words) {
        const tst = cur ? `${cur} ${w}` : w;
        if (g.measureText(tst).width > maxW && cur) {
          out.push(cur);
          cur = w;
        } else cur = tst;
      }
      if (cur) out.push(cur);
      return out;
    };
    const api = {
      root: p,
      screen: scr,
      set(o = {}) {
        const key = JSON.stringify(o);
        if (key === last) return;
        last = key;
        const bg = g.createLinearGradient(0, 0, 0, H);
        if (o.mode === 'lock') {
          bg.addColorStop(0, '#1b2433');
          bg.addColorStop(1, '#3a3346');
        } else {
          bg.addColorStop(0, '#f4f4f6');
          bg.addColorStop(1, '#ececf0');
        }
        g.fillStyle = bg;
        g.fillRect(0, 0, W, H);
        g.textAlign = 'center';
        if (o.mode === 'lock') {
          g.fillStyle = '#fff';
          g.font = 'bold 118px sans-serif';
          g.fillText(o.time || '9:41', W / 2, 220);
          g.font = '32px sans-serif';
          g.fillStyle = 'rgba(255,255,255,0.85)';
          g.fillText(o.date || '', W / 2, 274);
          if (o.banner) {
            g.fillStyle = 'rgba(250,250,252,0.96)';
            rr(g, 16, 320, W - 32, 210, 30);
            g.fill();
            g.fillStyle = '#e8506a';
            g.beginPath();
            g.arc(76, 380, 36, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#fff';
            g.font = 'bold 36px sans-serif';
            g.fillText((o.banner.name || '?')[0], 76, 393);
            g.textAlign = 'left';
            g.fillStyle = '#1b1b1f';
            g.font = 'bold 40px sans-serif';
            g.fillText(o.banner.name || '', 128, 394);
            g.font = 'bold 50px sans-serif';
            g.fillText(o.banner.text || '', 36, 490);
          }
        } else if (o.mode === 'chat') {
          g.fillStyle = '#ffffff';
          g.fillRect(0, 0, W, 150);
          g.fillStyle = '#e8506a';
          g.beginPath();
          g.arc(W / 2, 62, 36, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#fff';
          g.font = 'bold 36px sans-serif';
          g.fillText((o.name || '?')[0], W / 2, 75);
          g.fillStyle = '#1b1b1f';
          g.font = 'bold 30px sans-serif';
          g.fillText(o.name || '', W / 2, 132);
          if (o.unread) {
            g.fillStyle = '#ff3b30';
            rr(g, W - 150, 40, 130, 48, 24);
            g.fill();
            g.fillStyle = '#fff';
            g.font = 'bold 30px sans-serif';
            g.fillText(o.unread, W - 85, 74);
          }
          g.textAlign = 'left';
          let y = o.top ?? 190;
          for (const m of o.messages || []) {
            g.font = `${m.size || 34}px sans-serif`;
            const lines = wrap(m.text, 270);
            const tw = Math.min(310, Math.max(...lines.map((l) => g.measureText(l).width)) + 40);
            const bh = 22 + lines.length * 42;
            const me = m.from === 'me';
            const x = me ? W - 24 - tw : 24;
            g.fillStyle = me ? '#2f7bf6' : '#cfd0da';
            rr(g, x, y, tw, bh, 26);
            g.fill();
            g.fillStyle = me ? '#fff' : '#1b1b1f';
            lines.forEach((l, i) => g.fillText(l, x + 20, y + 46 + i * 42));
            y += bh + 10;
            if (m.status) {
              g.font = 'bold 24px sans-serif';
              g.textAlign = 'right';
              g.fillStyle = m.statusColor || '#8a8a92';
              g.fillText(m.status, W - 28, y + 20);
              g.textAlign = 'left';
              y += 36;
            }
            y += 14;
          }
          if (o.input !== undefined) {
            g.fillStyle = '#ffffff';
            g.fillRect(0, H - 110, W, 110);
            g.fillStyle = '#ececf0';
            rr(g, 20, H - 88, W - 120, 64, 32);
            g.fill();
            g.fillStyle = '#1b1b1f';
            g.font = '30px sans-serif';
            g.fillText(o.input, 44, H - 46);
            g.fillStyle = '#2f7bf6';
            g.beginPath();
            g.arc(W - 52, H - 56, 30, 0, Math.PI * 2);
            g.fill();
          }
        }
        if (o.cracked) crack();
        tex.needsUpdate = true;
      },
    };
    api.set({ mode: 'lock' });
    return api;
  };

  return { BED_TOP, bed, monitor, ivStand, clock, cardWall, room, corridor, chatPhone, ecgShape };
}
