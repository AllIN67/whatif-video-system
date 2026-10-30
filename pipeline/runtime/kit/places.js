// Fertige Orte („Sets“). Jeder Ort wird an einer eigenen Stelle der Welt aufgebaut (origin),
// damit ein Video zwischen Orten schneiden kann wie die Referenzen (jedes Ereignis = eigener kleiner Ort).
// Rückgabe: { root, origin, spots } – spots sind Weltkoordinaten für Figuren/Kamera.
//
// Innenräume haben keine Decke: Die Sonne fällt von oben-schräg hinein und erzeugt die weichen
// Schatten, die die Referenzen prägen. Kamera bleibt unterhalb der Wandoberkante.

export function createPlaces(THREE, core, props, rng) {
  const { box, group } = core;
  const P = props;
  const at = (o, x, y, z) => [o[0] + x, o[1] + y, o[2] + z];
  const place = (root, o) => {
    root.position.set(o[0], o[1], o[2]);
    return root;
  };

  // Raum: Boden + Rückwand (−z) + Seitenwände. Vorderseite (+z) offen für die Kamera.
  const room = ({ w = 6, d = 6, h = 3, floor = 0xc79a6a, wall = 0xd7dde3, stripes = true } = {}) => {
    const g = group(box(w, 0.1, d, floor, [0, -0.1, 0]));
    g.add(box(w, h, 0.15, wall, [0, 0, -d / 2]));
    g.add(box(0.15, h, d, wall, [-w / 2, 0, 0]));
    g.add(box(0.15, h, d, wall, [w / 2, 0, 0]));
    if (stripes) for (let x = -w / 2 + 0.25; x < w / 2; x += 0.5) g.add(box(0.06, h, 0.02, wall - 0x080808, [x, 0, -d / 2 + 0.085], { cast: false }));
    g.add(box(w, 0.12, 0.04, 0xf2f2f2, [0, 0, -d / 2 + 0.09], { cast: false })); // Fußleiste
    return g;
  };
  const windowPane = (w = 1.4, h = 1.3, light = 0xdfeeff) =>
    group(box(w + 0.12, h + 0.12, 0.06, 0xf4f4f4), box(w, h, 0.02, light, [0, 0.06, 0.03], { cast: false, mat: { emissive: light, emissiveIntensity: 0.5 } }), box(0.05, h, 0.04, 0xf4f4f4, [0, 0.06, 0.05]));

  const bedroom = (o = [0, 0, 0], { sheet = 0x8fb3e0, wall = 0xc9d3dc, clock = '6:59' } = {}) => {
    const g = room({ w: 5.5, d: 5, floor: 0xb98a5c, wall });
    const bed = P.bed({ sheet });
    bed.position.set(0.3, 0, -1.4);
    g.add(bed);
    const ns = P.nightstand();
    ns.position.set(1.55, 0, -2.1);
    g.add(ns);
    const lamp = P.tableLamp(false);
    lamp.position.set(1.65, 0.5, -2.2);
    g.add(lamp);
    const clk = P.alarmClock(clock);
    clk.position.set(1.4, 0.5, -2.0);
    g.add(clk);
    const win = windowPane();
    win.position.set(-1.6, 1.0, -2.42);
    g.add(win);
    g.add(box(0.8, 0.04, 0.25, 0x8a5a36, [-2.2, 1.5, -2.35]));
    [0xd94a3a, 0x3a7ad9, 0xe0b23a, 0x4aa05a].forEach((c, i) => g.add(box(0.06, 0.25, 0.18, c, [-2.5 + i * 0.08, 1.54, -2.35])));
    const rug = box(2.2, 0.02, 1.4, 0x7a8fb0, [0.3, 0, 0.6], { cast: false });
    g.add(rug);
    return { root: place(g, o), origin: o, spots: { bed: at(o, 0.3, 0.55, -1.4), standBed: at(o, -0.7, 0, 0.1), nightstand: at(o, 1.4, 0.5, -2.0), center: at(o, 0, 0, 0) } };
  };

  const kitchen = (o = [0, 0, 0], { cab = 0x5d9a9a, wall = 0xdedad2 } = {}) => {
    const g = room({ w: 6, d: 5, floor: 0xdcd6cc, wall, stripes: false });
    const c = P.counter({ w: 4.5, color: cab });
    c.position.set(0, 0, -2.15);
    g.add(c);
    const up = P.upperCabinets({ w: 4.5, color: cab });
    up.position.set(0, 0, -2.15);
    g.add(up);
    const t = P.toaster();
    t.position.set(0.5, 0.93, -2.1);
    g.add(t);
    const m = P.mug();
    m.position.set(-0.4, 0.93, -2.0);
    g.add(m);
    const pl = P.plant();
    pl.position.set(-1.8, 0.93, -2.15);
    g.add(pl);
    const win = windowPane(1.2, 0.9);
    win.position.set(-0.8, 1.25, -2.42);
    g.add(win);
    const tb = P.table();
    tb.position.set(0.6, 0, 0.6);
    g.add(tb);
    for (const sx of [-1, 1]) {
      const ch = P.chair();
      ch.position.set(0.6 + sx * 0.75, 0, 0.6);
      ch.rotation.y = -sx * Math.PI / 2;
      g.add(ch);
    }
    return { root: place(g, o), origin: o, spots: { counter: at(o, 0.2, 0, -1.4), toaster: at(o, 0.5, 0.93, -2.1), table: at(o, 0.6, 0.75, 0.6), center: at(o, 0, 0, 0) }, toaster: t, mug: m };
  };

  // Straße entlang z: Gehweg links/rechts, Gebäudefronten, Laternen, Bäume, parkende Autos.
  const street = (o = [0, 0, 0], { length = 60, lit = 0, lampsOn = false, palette = [0xb5654a, 0xd6c3a4, 0x9a6d5a, 0xc98e6a, 0x8f9ba8, 0xe0d2b8], cars = true, clear = null } = {}) => {
    const free = (side, z) => clear && clear.side === side && z > clear.from && z < clear.to; // Bereich ohne Bäume/Laternen/Autos (Kamera-Gasse)
    const g = group();
    const L = length;
    const buildings = []; // { b, side, z } – z = Mitte der Fassade (lokal); b.userData.setLit(k) für Licht an/aus
    g.add(box(8, 0.1, L, 0x3a3b40, [0, -0.1, 0])); // Fahrbahn
    for (let z = -L / 2 + 2; z < L / 2; z += 4) g.add(box(0.15, 0.012, 2, 0xf2f2f2, [0, 0, z], { cast: false }));
    for (const sx of [-1, 1]) {
      g.add(box(4, 0.18, L, 0xc7c7c2, [sx * 6, -0.06, 0])); // Gehweg
      g.add(box(0.2, 0.2, L, 0xa9a9a4, [sx * 4.05, -0.06, 0]));
      let z = -L / 2;
      while (z < L / 2) {
        const w = rng.range(7, 11);
        const b = P.building({ w, floors: rng.int(3, 7), color: rng.pick(palette), lit, storefront: rng.next() < 0.5 ? rng.pick([0xb03a3a, 0x2f6a4a, 0x3a5a9a]) : null });
        b.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
        b.position.set(sx * 11, 0, z + w / 2);
        g.add(b);
        buildings.push({ b, side: sx, z: z + w / 2 });
        z += w + 0.2;
      }
      for (let z2 = -L / 2 + 5; z2 < L / 2; z2 += 10) {
        if (free(sx, z2) || free(sx, z2 + 5)) continue;
        const l = P.streetLamp(lampsOn);
        l.position.set(sx * 4.5, 0.12, z2);
        l.rotation.y = sx > 0 ? Math.PI : 0;
        g.add(l);
        const t = P.tree({ h: 3.6 });
        t.position.set(sx * 5.2, 0.12, z2 + 5);
        g.add(t);
      }
    }
    if (cars) {
      for (let z = -L / 2 + 6; z < L / 2 - 4; z += rng.range(7, 12)) {
        if (clear && z > clear.from - 6 && z < clear.to + 6) continue;
        const c = P.car({ color: rng.pick([0xe5b52b, 0xd9d9d9, 0x2b4f8a, 0xb02a2a, 0x2a2a2e, 0xe5b52b]), kind: rng.pick(['sedan', 'sedan', 'taxi', 'van']) });
        c.position.set(rng.pick([-2.6, 2.6]), 0, z);
        g.add(c);
      }
    }
    return { root: place(g, o), origin: o, spots: { sidewalkL: at(o, -5.5, 0.12, 0), sidewalkR: at(o, 5.5, 0.12, 0), road: at(o, 0, 0, 0), center: at(o, 0, 0, 0) }, buildings };
  };

  const park = (o = [0, 0, 0], { size = 40, grass = 0x6aa84f, skyline = true, palette = [0x8f9ba8, 0xa9b4bf, 0x7f8a96, 0xb8c2cc] } = {}) => {
    const g = group(box(size, 0.1, size, grass, [0, -0.1, 0]));
    g.add(box(2.4, 0.012, size, 0xd9cfbf, [0, 0, 0], { cast: false })); // Weg
    for (let i = 0; i < 26; i++) {
      const x = rng.range(-size / 2 + 2, size / 2 - 2);
      const z = rng.range(-size / 2 + 2, size / 2 - 2);
      if (Math.abs(x) < 3.5 && z > -14) continue; // Weg und Vordergrund frei
      const t = P.tree({ h: rng.range(3, 5), color: rng.pick([0x4f8f3e, 0x5c9a46, 0x427f37]) });
      t.position.set(x, 0, z);
      g.add(t);
    }
    for (let i = 0; i < 10; i++) {
      const b = P.bush();
      b.position.set(rng.pick([-1, 1]) * rng.range(2.2, 8), 0, rng.range(-15, 8));
      g.add(b);
    }
    const bn = P.bench();
    bn.position.set(-2.4, 0, -1);
    bn.rotation.y = Math.PI / 2;
    g.add(bn);
    if (skyline) {
      for (let i = 0; i < 16; i++) {
        const w = rng.range(6, 12);
        const b = P.building({ w, d: 8, floors: rng.int(8, 20), color: rng.pick(palette) });
        b.position.set(-size / 2 + i * (size / 15), 0, -size / 2 - 10);
        g.add(b);
      }
    }
    return { root: place(g, o), origin: o, spots: { bench: at(o, -2.4, 0.45, -1), path: at(o, 0, 0, 0), center: at(o, 0, 0, 0) } };
  };

  // Großraumbüro: cols × rows Schreibtische (Standard 3 × 2). spots.desks[i] = Sitzplatz am Stuhl (Blick −z).
  const office = (o = [0, 0, 0], { carpet = 0x5a6f8f, wall = 0xd9dde2, cols = 3, rows = 2 } = {}) => {
    const w = Math.max(9, cols * 2.8 + 0.6);
    const d = Math.max(7, rows * 2.4 + 2.2);
    const g = room({ w, d, floor: carpet, wall, stripes: false });
    const desks = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * 2.8;
        const z = -d / 2 + 1.5 + j * 2.4;
        const dk = P.desk();
        dk.position.set(x, 0, z);
        g.add(dk);
        const ch = P.officeChair();
        ch.position.set(x, 0, z + 0.6);
        g.add(ch);
        desks.push(at(o, x, 0, z + 0.55));
      }
    }
    const nw = Math.max(3, Math.round(w / 3));
    for (let i = 0; i < nw; i++) {
      const wp = windowPane(1.8, 1.3);
      wp.position.set((i - (nw - 1) / 2) * 3, 1.0, -d / 2 + 0.08);
      g.add(wp);
    }
    const pl = P.plant();
    pl.position.set(w / 2 - 0.6, 0, -d / 2 + 0.5);
    g.add(pl);
    return { root: place(g, o), origin: o, spots: { front: at(o, 0, 0, 1.8), center: at(o, 0, 0, 0), desks } };
  };

  // Klassenzimmer: Tafel an der Rückwand (−z), Lehrerpult davor, cols × rows Schülertische mit Blick zur Tafel.
  // spots.seats[r][c] = Sitzplatz (Figur mit Blick −z, Pose 'sit'), spots.teacher = Platz vor der Tafel.
  const classroom = (o = [0, 0, 0], { wall = 0xe8dcc0, floor = 0xb98a5c, cols = 3, rows = 3 } = {}) => {
    const W = 9;
    const D = 9;
    const g = room({ w: W, d: D, floor, wall, stripes: false });
    g.add(box(4.2, 1.5, 0.06, 0x2f4a3a, [0, 0.9, -D / 2 + 0.1]), box(4.4, 0.08, 0.14, 0xb08a5a, [0, 0.86, -D / 2 + 0.14]));
    // Kreidestriche auf der Tafel (keine Schrift)
    const chalk = core.mat(0xe8e8e0);
    [[-1.3, 2.05, 1.2], [-1.0, 1.8, 0.8], [0.8, 1.95, 1.4], [0.9, 1.55, 0.9], [-1.2, 1.4, 1.0]].forEach(([x, y, l]) => g.add(box(l, 0.035, 0.01, chalk, [x, y, -D / 2 + 0.135], { cast: false })));
    for (const sx of [-1, 1]) {
      const wp = windowPane(1.3, 1.4);
      wp.rotation.y = -sx * Math.PI / 2;
      wp.position.set(sx * (W / 2 - 0.08), 0.95, 0.4);
      g.add(wp);
    }
    const pult = P.table({ w: 1.4, d: 0.7, color: 0x7a4f2e });
    pult.position.set(1.6, 0, -D / 2 + 1.7);
    g.add(pult);
    const pl = P.plant();
    pl.position.set(-W / 2 + 0.5, 0, -D / 2 + 0.5);
    g.add(pl);
    const seats = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * 1.9;
        const z = -D / 2 + 3.4 + r * 1.6;
        const t = P.table({ w: 0.9, d: 0.55, h: 0.72, color: 0xc9b08a });
        t.position.set(x, 0, z);
        g.add(t);
        const ch = P.chair(0x3a6ea5);
        ch.position.set(x, 0, z + 0.55);
        ch.rotation.y = Math.PI;
        g.add(ch);
        row.push(at(o, x, 0, z + 0.5));
      }
      seats.push(row);
    }
    return { root: place(g, o), origin: o, spots: { seats, teacher: at(o, 0, 0, -D / 2 + 1.1), board: at(o, 0, 1.6, -D / 2 + 0.1), center: at(o, 0, 0, 0) } };
  };

  // Café: Zweiertisch am Fenster, Theke im Hintergrund, Hängelampen. spots.seatL/seatR = Plätze am Tisch (Blick zum Tisch).
  const cafe = (o = [0, 0, 0], { wall = 0x9a5a48, floor = 0x6b4a36 } = {}) => {
    const g = room({ w: 7, d: 6, floor, wall, stripes: true });
    for (const x of [-1.8, 1.8]) {
      const wp = windowPane(1.6, 1.3, 0xffe6c4);
      wp.position.set(x, 1.0, -2.92);
      g.add(wp);
    }
    const bar = P.counter({ w: 2.6, color: 0x3a2a22, top: 0xd9c8a8 });
    bar.position.set(2.0, 0, 0.2);
    bar.rotation.y = -Math.PI / 2;
    g.add(bar);
    const t = P.table({ w: 0.8, d: 0.8, color: 0xe8e0d0 });
    t.position.set(-0.6, 0, -0.8);
    g.add(t);
    g.add(box(0.06, 0.12, 0.06, 0xf4f0e0, [-0.6, 0.75, -0.8], { mat: { emissive: 0xffd080, emissiveIntensity: 0.5 } }));
    for (const sx of [-1, 1]) {
      const ch = P.chair(0x2a2a2e);
      ch.position.set(-0.6 + sx * 0.7, 0, -0.8);
      ch.rotation.y = -sx * Math.PI / 2;
      g.add(ch);
      const cup = P.mug(0xf4f4f4);
      cup.position.set(-0.6 + sx * 0.22, 0.75, -0.8);
      g.add(cup);
    }
    for (const x of [-1.8, 1.9]) g.add(box(0.02, 0.9, 0.02, 0x222222, [x, 2.1, -2.0]), box(0.36, 0.22, 0.36, 0xe0a030, [x, 1.9, -2.0], { mat: { emissive: 0xffc070, emissiveIntensity: 0.6 } }));
    const pl = P.plant();
    pl.position.set(-3.0, 0, -2.4);
    pl.scale.setScalar(1.8);
    g.add(pl);
    return { root: place(g, o), origin: o, spots: { seatL: at(o, -1.25, 0, -0.8), seatR: at(o, 0.05, 0, -0.8), table: at(o, -0.6, 0.75, -0.8), center: at(o, 0, 0, 0) } };
  };

  return { room, windowPane, bedroom, kitchen, street, park, office, classroom, cafe };
}
