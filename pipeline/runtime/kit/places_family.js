// Orte für Familien-/Drama-Themen (ergänzt 2026-11-01 für productions/what-if-one-argument-last-goodbye).
// Gleiche Rückgabe wie places.js: { root, origin, spots, … } – spots in Weltkoordinaten.
// Friedhof bewusst ohne religiöse Symbole (Guide 1.4): schlichte, gerundete Steine.

export function createFamilyPlaces(THREE, core, props, rng, base) {
  const { box, group, mat } = core;
  const P = props;
  const { room, windowPane, at, place } = base;

  // Friedhof: Wiese, Kiesweg, Reihen schlichter Steine, Bäume, Hecke. Hauptgrab bei o (Stein Blick +z).
  //   stoneText = Inschrift des Hauptgrabs (aus text.<lang>.json)
  const cemetery = (o = [0, 0, 0], { stoneText = '', size = 44 } = {}) => {
    const g = group(box(size, 0.1, size, 0x6f9a52, [0, -0.1, 0]));
    g.add(box(2.2, 0.02, size, 0xbdb4a2, [3.2, 0, 0], { cast: false })); // Kiesweg seitlich entlang z
    // Reihen anderer Gräber (ohne Inschrift)
    const stones = [];
    for (let r = -3; r <= 3; r++) {
      for (let c = -5; c <= 5; c++) {
        if (r === 0 && Math.abs(c) <= 0) continue;
        const x = c * 2.1 + (r % 2) * 0.3;
        const z = r * 3.4 - 0.2;
        if (Math.abs(x - 3.2) < 1.3) continue; // Weg frei
        const s = P.gravestone({ w: rng.range(0.55, 0.85), h: rng.range(0.7, 1.15), color: rng.pick([0x8c9096, 0x7a7e84, 0x9a948a, 0x6a6e74, 0xa8a49a]) });
        s.position.set(x, 0, z);
        s.rotation.y = rng.range(-0.05, 0.05);
        g.add(s);
        const pl = P.gravePlot({ l: 1.5, soil: rng.pick([0x5a4232, 0x4f6a3a, 0x5a4a3a]) });
        pl.position.set(x, 0, z);
        g.add(pl);
        if (rng.next() < 0.35) {
          const f = P.flowers({ colors: [rng.pick([0xe0303a, 0xf2c418, 0xffffff, 0xc06ad0])] });
          f.rotation.x = -Math.PI / 2 + 0.15;
          f.position.set(x + 0.15, 0.1, z + 0.6);
          f.scale.setScalar(0.8);
          g.add(f);
        }
        stones.push(s);
      }
    }
    // Hauptgrab
    const main = P.gravestone({ text: stoneText, w: 0.9, h: 1.1, color: 0x7f848c, letter: '#25272b', heart: true });
    g.add(main);
    const plot = P.gravePlot({ l: 1.7, w: 1.0, soil: 0x5a4232 });
    g.add(plot);
    // Bäume, Hecke, Mauer
    for (let i = 0; i < 16; i++) {
      const t = P.tree({ h: rng.range(4.5, 7), color: rng.pick([0x5a7f3e, 0x6a8a3a, 0x8a7a3a, 0x9a6a2e]) });
      const a = (i / 16) * Math.PI * 2;
      t.position.set(Math.cos(a) * rng.range(12, 18), 0, Math.sin(a) * rng.range(12, 18) - 4);
      g.add(t);
    }
    for (let x = -20; x <= 20; x += 1.2) g.add(box(1.25, 1.1, 0.9, 0x4f7a3a, [x, 0, -14]));
    g.add(box(size, 0.9, 0.4, 0x9a948a, [0, 0, -size / 2 + 0.3]));
    const bn = P.bench(0x6a4a2e);
    bn.position.set(5.2, 0, 2.5);
    bn.rotation.y = -Math.PI / 2;
    g.add(bn);
    return {
      root: place(g, o),
      origin: o,
      main,
      spots: {
        stone: at(o, 0, 0, 0),
        plotFront: at(o, 0, 0, 2.3), // vor dem Grabfeld (Familie steht hier, Blick −z)
        drawing: at(o, 0.12, 0.09, 1.25),
        flowers: at(o, -0.25, 0.09, 0.9),
        center: at(o, 0, 0, 0),
      },
    };
  };

  // Wohnzimmer (Abend): Sofa an der Rückwand, Couchtisch, Teppich, Fernseher an der linken Wand, Haustür rechts,
  // Kommode mit Schlüsselschale neben der Tür, Familienfoto über dem Sofa. Offene Seite +z.
  const livingRoom = (o = [0, 0, 0], { wall = 0xe6d6bc, floor = 0x9a6a42 } = {}) => {
    const W = 7;
    const D = 6;
    const g = room({ w: W, d: D, floor, wall, stripes: false });
    const rug = box(3.0, 0.02, 2.0, 0xb85a4a, [-0.4, 0, 0.1], { cast: false });
    g.add(rug);
    g.add(box(2.6, 0.022, 1.6, 0xd9a07a, [-0.4, 0, 0.1], { cast: false }));
    const so = P.sofa(0x5a7290);
    so.position.set(-0.6, 0, -2.3);
    g.add(so);
    const ct = P.coffeeTable();
    ct.position.set(-0.6, 0, -0.9);
    g.add(ct);
    const tvs = P.tv();
    tvs.position.set(-W / 2 + 0.3, 0, -0.6);
    tvs.rotation.y = Math.PI / 2;
    g.add(tvs);
    const fl = P.floorLamp(true);
    fl.position.set(1.0, 0, -2.5);
    g.add(fl);
    const ph = P.familyPhoto();
    ph.position.set(-0.6, 1.55, -D / 2 + 0.1);
    g.add(ph);
    const wp = windowPane(1.4, 1.2, 0x2a3a6a);
    wp.position.set(-2.6, 1.0, -D / 2 + 0.06);
    g.add(wp);
    const shelf = group(box(0.9, 1.8, 0.35, 0x7a4f2e));
    for (let i = 0; i < 4; i++) shelf.add(box(0.8, 0.03, 0.3, 0x5a3a22, [0, 0.35 + i * 0.42, 0.02]));
    for (let i = 0; i < 9; i++) shelf.add(box(0.06, 0.26, 0.2, [0xc8452f, 0x2f62c0, 0xe0b23a, 0x3aa04a][i % 4], [-0.3 + (i % 5) * 0.14, 0.38 + Math.floor(i / 5) * 0.42, 0.02]));
    shelf.position.set(2.0, 0, -D / 2 + 0.3);
    g.add(shelf);
    const pl = P.plant();
    pl.position.set(-W / 2 + 0.5, 0, -D / 2 + 0.5);
    pl.scale.setScalar(1.6);
    g.add(pl);
    // Haustür in der rechten Wand (Blick −x in den Raum)
    const dr = P.door({ color: 0x3a4a6a });
    dr.rotation.y = -Math.PI / 2;
    dr.position.set(W / 2 - 0.08, 0, 1.2);
    g.add(dr);
    const sb = P.sideboard();
    sb.rotation.y = -Math.PI / 2;
    sb.position.set(W / 2 - 0.3, 0, -0.6);
    g.add(sb);
    const blocks = P.toyBlocks();
    blocks.position.set(-1.6, 0.02, 0.6);
    g.add(blocks);
    // Malpapier + Stifte auf dem Couchtisch
    for (let i = 0; i < 4; i++) g.add(box(0.012, 0.012, 0.1, [0xe0303a, 0x2f62c0, 0xf2c418, 0x3aa04a][i], [-0.2 + i * 0.04, 0.43, -0.75], { cast: false }));
    return {
      root: place(g, o),
      origin: o,
      door: dr,
      spots: {
        sofa: at(o, -0.6, 0, -2.0),
        table: at(o, -0.6, 0.43, -0.9),
        keys: at(o, W / 2 - 0.3, 0.88, -0.45),
        door: at(o, W / 2 - 0.08, 0, 1.2),
        rug: at(o, -0.4, 0, 0.1),
        center: at(o, 0, 0, 0),
      },
    };
  };

  // Haus von außen mit Einfahrt (Nacht): Fassade Blick +z, Einfahrt rechts, Rasen, Zaun, Briefkasten, Straße vorn.
  const houseFront = (o = [0, 0, 0]) => {
    const g = group(box(40, 0.1, 30, 0x4a6a3a, [0, -0.1, 0]));
    const h = P.house({});
    h.position.set(-2.5, 0, -2);
    g.add(h);
    g.add(box(3.4, 0.03, 14, 0x9a9890, [3.6, 0, 5], { cast: false })); // Einfahrt
    g.add(box(40, 0.03, 8, 0x3a3c42, [0, 0, 15], { cast: false })); // Straße
    for (let x = -18; x <= 18; x += 4) g.add(box(2, 0.035, 0.18, 0xf0f0e8, [x, 0, 15], { cast: false }));
    for (let x = -14; x <= 1.5; x += 0.5) g.add(box(0.08, 0.9, 0.08, 0xf2f2f2, [x, 0, 10.5]));
    g.add(box(15.5, 0.08, 0.06, 0xf2f2f2, [-6.25, 0.75, 10.5]), box(15.5, 0.08, 0.06, 0xf2f2f2, [-6.25, 0.4, 10.5]));
    const mb = group(box(0.08, 1.1, 0.08, 0x333333), box(0.3, 0.25, 0.45, 0x2f62c0, [0, 1.1, 0]));
    mb.position.set(2.0, 0, 10.6);
    g.add(mb);
    for (const [x, z, hh] of [[-9, 4, 6], [9.5, -3, 7], [-14, -4, 5.5]]) {
      const t = P.tree({ h: hh, color: 0x3f6a32 });
      t.position.set(x, 0, z);
      g.add(t);
    }
    for (const x of [-6.5, -4.5, 0.6]) {
      const b = P.bush(0x3f7a3a);
      b.position.set(x, 0, 0.6);
      g.add(b);
    }
    const lamp = P.streetLamp(true);
    lamp.position.set(7.5, 0, 12);
    lamp.rotation.y = Math.PI;
    g.add(lamp);
    for (const [x, z] of [[-24, -10], [20, -12], [-30, 4]]) {
      const n = P.house({ color: rng.pick([0xc8b8a0, 0xd9cdb8, 0xb8a890]), lit: 0.6 });
      n.position.set(x, 0, z);
      g.add(n);
    }
    return {
      root: place(g, o),
      origin: o,
      house: h,
      spots: {
        car: at(o, 3.6, 0, 3.6), // geparkt, Front +z Richtung Straße
        door: at(o, -3.1, 0, -1.4),
        street: at(o, 0, 0, 15),
        center: at(o, 0, 0, 0),
      },
    };
  };

  // Landstraße bei Nacht entlang +z (Länge L): zwei Spuren, Mittel-/Randlinien, Leitplanke rechts der Fahrtrichtung… hier
  // an der +x-Seite (Gegenrichtung links), Laternen auf der −x-Seite, Bäume beidseitig, Warnschild Kurve.
  //   rails: Liste der Leitplanken-Abschnitte (userData.setDent) · lamps: Laternen mit bulb (Licht an/aus)
  const nightRoad = (o = [0, 0, 0], { length = 600, lampEvery = 28, signAt = 80, railFrom = -40, railTo = 300, wet = false } = {}) => {
    const L = length;
    const g = group(box(60, 0.1, L, 0x2f3a2a, [0, -0.11, 0]));
    g.add(box(8, 0.03, L, wet ? 0x2a2d33 : 0x34363c, [0, -0.01, 0], { cast: false, mat: wet ? { roughness: 0.25, metalness: 0.3 } : {} }));
    const line = mat(0xf2f2ea, { emissive: 0x555550, emissiveIntensity: 0.4 });
    for (let z = -L / 2; z < L / 2; z += 6) g.add(box(0.15, 0.035, 3, line, [0, 0, z], { cast: false }));
    for (const sx of [-1, 1]) {
      for (let z = -L / 2; z < L / 2; z += 40) g.add(box(0.14, 0.035, 40, line, [sx * 3.6, 0, z + 20], { cast: false }));
    }
    const rails = [];
    const segLen = 40;
    for (let z = railFrom; z < railTo; z += segLen) {
      const r = P.guardrail({ length: segLen });
      r.position.set(4.6, 0, z + segLen / 2);
      g.add(r);
      rails.push({ r, z0: z, z1: z + segLen });
    }
    const lamps = [];
    for (let z = -L / 2 + 10; z < L / 2; z += lampEvery) {
      const l = P.streetLamp(true);
      l.position.set(-5.0, 0, z);
      g.add(l);
      lamps.push(l);
    }
    for (let z = -L / 2; z < L / 2; z += 9) {
      for (const sx of [-1, 1]) {
        if (rng.next() < 0.35) continue;
        const t = P.tree({ h: rng.range(4, 7), color: rng.pick([0x2f5a2a, 0x3a6a32, 0x2a4a26]) });
        t.position.set(sx * rng.range(8, 16), 0, z + rng.range(-3, 3));
        g.add(t);
      }
    }
    const sign = P.curveSign();
    sign.position.set(5.6, 0, signAt);
    sign.rotation.y = Math.PI;
    g.add(sign);
    return { root: place(g, o), origin: o, rails, lamps, spots: { center: at(o, 0, 0, 0), laneR: at(o, -1.8, 0, 0), laneL: at(o, 1.8, 0, 0) } };
  };

  return { cemetery, livingRoom, houseFront, nightRoad };
}
