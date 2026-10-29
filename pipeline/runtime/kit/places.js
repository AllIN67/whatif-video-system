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
    return { root: place(g, o), origin: o, spots: { sidewalkL: at(o, -5.5, 0.12, 0), sidewalkR: at(o, 5.5, 0.12, 0), road: at(o, 0, 0, 0), center: at(o, 0, 0, 0) } };
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

  const office = (o = [0, 0, 0], { carpet = 0x5a6f8f, wall = 0xd9dde2 } = {}) => {
    const g = room({ w: 9, d: 7, floor: carpet, wall, stripes: false });
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const d = P.desk();
        d.position.set(-2.8 + i * 2.8, 0, -2 + j * 2.4);
        g.add(d);
        const ch = P.officeChair();
        ch.position.set(-2.8 + i * 2.8, 0, -1.4 + j * 2.4);
        g.add(ch);
      }
    }
    for (let i = 0; i < 3; i++) {
      const w = windowPane(1.8, 1.3);
      w.position.set(-3 + i * 3, 1.0, -3.42);
      g.add(w);
    }
    const pl = P.plant();
    pl.position.set(3.9, 0, -3);
    g.add(pl);
    return { root: place(g, o), origin: o, spots: { front: at(o, 0, 0, 1.8), center: at(o, 0, 0, 0) } };
  };

  return { room, windowPane, bedroom, kitchen, street, park, office };
}
