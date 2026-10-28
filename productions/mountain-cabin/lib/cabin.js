// Blockhütte mit Veranda und eingerichtetem Innenraum. Alle Maße aus layout.js.
import { FLOOR, CABIN, PORCH, DOOR, FRONT_WIN, SIDE_WIN, HEARTH, TABLE, CHAIR } from './layout.js';

export function createCabin(THREE, tex, rng) {
  const g = new THREE.Group();
  const logTex = tex.logs();
  const plankTex = tex.planks([150, 106, 70], 8);
  const darkPlank = tex.planks([96, 70, 50], 10);
  const shingleTex = tex.planks([70, 62, 58], 16);
  const stoneTex = tex.stone();

  const texRep = (t, rx, ry) => {
    const c = t.clone();
    c.repeat.set(rx, ry);
    c.needsUpdate = true;
    return c;
  };
  const mat = {
    stone: (rx = 1, ry = 1) => new THREE.MeshStandardMaterial({ map: texRep(stoneTex, rx, ry), roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x7a5236, roughness: 0.8 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x4b3222, roughness: 0.85 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.7 }),
    soot: new THREE.MeshStandardMaterial({ color: 0x141110, roughness: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fb4c0, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false, envMapIntensity: 1.4 }),
  };
  const add = (geo, m, x, y, z, parent = g, shadow = true) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (w, h, d, m, x, y, z, parent = g, shadow = true) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent, shadow);
  const logMat = (w, h) => new THREE.MeshStandardMaterial({ map: texRep(logTex, w / 3, h / 1.8), roughness: 0.85 });

  const T = 0.22; // Wandstärke
  const W = CABIN.x1 - CABIN.x0;
  const D = CABIN.z1 - CABIN.z0;
  const top = FLOOR + CABIN.wallH;

  // Fundament
  box(W + 0.3, FLOOR + 0.4, D + 0.3, mat.stone(3, 0.4), 0, (FLOOR - 0.4) / 2, 0);
  // Fußboden innen
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W - T, D - T), new THREE.MeshStandardMaterial({ map: texRep(plankTex, 2, 2.2), roughness: 0.75 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR + 0.005, 0);
  floor.receiveShadow = true;
  g.add(floor);

  // Wand mit Öffnungen: Liste von Rechtecken [u0,u1,v0,v1] (u entlang der Wand, v Höhe ab FLOOR)
  function wall(len, holes, place) {
    const pieces = [];
    const us = [0, len, ...holes.flatMap((h) => [h[0], h[1]])].sort((a, b) => a - b);
    for (let i = 0; i < us.length - 1; i++) {
      const u0 = us[i];
      const u1 = us[i + 1];
      if (u1 - u0 < 1e-3) continue;
      const mid = (u0 + u1) / 2;
      const hole = holes.find((h) => mid > h[0] && mid < h[1]);
      const spans = hole ? [[0, hole[2]], [hole[3], CABIN.wallH]] : [[0, CABIN.wallH]];
      for (const [v0, v1] of spans) if (v1 - v0 > 1e-3) pieces.push([u0, u1, v0, v1]);
    }
    for (const [u0, u1, v0, v1] of pieces) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(u1 - u0, v1 - v0, T), logMat(u1 - u0, v1 - v0));
      m.castShadow = true;
      m.receiveShadow = true;
      place(m, (u0 + u1) / 2, FLOOR + (v0 + v1) / 2);
      g.add(m);
    }
  }
  // Vorderwand (z0), u = x − x0
  wall(W, [[DOOR.x0 - CABIN.x0, DOOR.x1 - CABIN.x0, 0, DOOR.h], [FRONT_WIN.x0 - CABIN.x0, FRONT_WIN.x1 - CABIN.x0, FRONT_WIN.y0, FRONT_WIN.y1]], (m, u, y) => m.position.set(CABIN.x0 + u, y, CABIN.z0 + T / 2));
  // Rückwand
  wall(W, [[4.2, 5.4, 1.0, 2.0]], (m, u, y) => m.position.set(CABIN.x0 + u, y, CABIN.z1 - T / 2));
  // linke Wand (x0), u = z − z0
  wall(D, [[SIDE_WIN.z0 - CABIN.z0, SIDE_WIN.z1 - CABIN.z0, SIDE_WIN.y0, SIDE_WIN.y1]], (m, u, y) => {
    m.rotation.y = Math.PI / 2;
    m.position.set(CABIN.x0 + T / 2, y, CABIN.z0 + u);
  });
  // rechte Wand
  wall(D, [], (m, u, y) => {
    m.rotation.y = Math.PI / 2;
    m.position.set(CABIN.x1 - T / 2, y, CABIN.z0 + u);
  });
  // Eckstämme (überstehende Rundhölzer)
  const stub = new THREE.CylinderGeometry(0.15, 0.15, 0.62, 12);
  stub.rotateZ(Math.PI / 2);
  const stubZ = new THREE.CylinderGeometry(0.15, 0.15, 0.62, 12);
  stubZ.rotateX(Math.PI / 2);
  const stubMat = new THREE.MeshStandardMaterial({ map: texRep(tex.bark(), 1, 1), color: 0xb08a68, roughness: 0.9 });
  for (const cx of [CABIN.x0, CABIN.x1]) {
    for (const cz of [CABIN.z0, CABIN.z1]) {
      for (let k = 0; k < 9; k++) {
        const y = FLOOR + 0.15 + k * 0.3;
        if (k % 2 === 0) add(stub, stubMat, cx, y, cz + Math.sign(cz) * 0.0);
        else add(stubZ, stubMat, cx, y, cz);
      }
    }
  }

  // Giebel vorn/hinten
  const gableShape = new THREE.Shape();
  const ov = 0.65;
  gableShape.moveTo(-W / 2, 0);
  gableShape.lineTo(W / 2, 0);
  gableShape.lineTo(0, CABIN.ridge);
  gableShape.lineTo(-W / 2, 0);
  for (const [z, s] of [[CABIN.z0, 1], [CABIN.z1 - T, 1]]) {
    const geo = new THREE.ExtrudeGeometry(gableShape, { depth: T, bevelEnabled: false });
    const t = logTex.clone();
    t.repeat.set(1 / 3, 1 / 1.8);
    t.needsUpdate = true;
    const m = add(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }), 0, top, z);
    m.scale.z = s;
  }

  // Dach (Satteldach, First entlang z, verlängert über die Veranda)
  const pitch = Math.atan2(CABIN.ridge, W / 2);
  const slab = Math.hypot(W / 2 + ov, CABIN.ridge + ov * Math.tan(pitch)) + 0.05;
  const roofLen = CABIN.z1 + 0.6 - (PORCH.z0 - 0.35);
  const roofZ = (CABIN.z1 + 0.6 + PORCH.z0 - 0.35) / 2;
  const roofMat = new THREE.MeshStandardMaterial({ map: texRep(shingleTex, 3, roofLen / 1.6), roughness: 0.82 });
  roofMat.map.rotation = Math.PI / 2;
  const roofParts = [];
  for (const s of [-1, 1]) {
    const r = box(slab, 0.14, roofLen, roofMat, 0, 0, roofZ);
    r.rotation.z = -s * pitch;
    r.position.x = s * (slab / 2) * Math.cos(pitch) - s * 0.02;
    r.position.y = top + CABIN.ridge + 0.1 - (slab / 2) * Math.sin(pitch);
    roofParts.push(r);
  }
  box(0.22, 0.22, roofLen, mat.darkWood, 0, top + CABIN.ridge + 0.12, roofZ);
  // Dachuntersicht innen (Bretter)
  for (const s of [-1, 1]) {
    const len = Math.hypot(W / 2, CABIN.ridge);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(len, D - T), new THREE.MeshStandardMaterial({ map: texRep(darkPlank, 1.5, 2.5), roughness: 0.9, side: THREE.DoubleSide }));
    p.rotation.order = 'ZYX';
    p.rotation.x = -Math.PI / 2;
    p.rotation.z = -s * pitch;
    p.position.set((s * W) / 4, top + CABIN.ridge / 2 - 0.1, 0);
    p.receiveShadow = true;
    g.add(p);
  }
  // Querbalken innen
  box(W - T, 0.2, 0.2, mat.darkWood, 0, top - 0.1, -0.6, g, true);
  box(W - T, 0.2, 0.2, mat.darkWood, 0, top - 0.1, 1.6, g, true);

  // Veranda
  const deck = new THREE.Mesh(new THREE.BoxGeometry(PORCH.x1 - PORCH.x0, 0.1, CABIN.z0 - PORCH.z0), new THREE.MeshStandardMaterial({ map: texRep(plankTex, 2.5, 1), roughness: 0.8 }));
  deck.position.set(0, FLOOR - 0.05, (CABIN.z0 + PORCH.z0) / 2);
  deck.castShadow = true;
  deck.receiveShadow = true;
  g.add(deck);
  box(PORCH.x1 - PORCH.x0, FLOOR - 0.1, 0.15, mat.darkWood, 0, (FLOOR - 0.1) / 2, PORCH.z0 + 0.08);
  const postGeo = new THREE.CylinderGeometry(0.1, 0.11, top + CABIN.ridge * 0.0 - FLOOR + 0.1, 10);
  for (const x of [PORCH.x0 + 0.15, PORCH.x1 - 0.15]) add(postGeo, stubMat, x, FLOOR + (top - FLOOR) / 2, PORCH.z0 + 0.2);
  box(PORCH.x1 - PORCH.x0, 0.18, 0.18, mat.darkWood, 0, top + 0.05, PORCH.z0 + 0.2);
  // Geländer (mit Lücke für die Treppe vor der Tür)
  const railH = 0.95;
  const gapX = [-2.25, -0.9];
  for (const [x0, x1] of [[PORCH.x0 + 0.15, gapX[0]], [gapX[1], PORCH.x1 - 0.15]]) {
    box(x1 - x0, 0.07, 0.09, mat.wood, (x0 + x1) / 2, FLOOR + railH, PORCH.z0 + 0.2);
    for (let x = x0 + 0.12; x < x1 - 0.05; x += 0.16) box(0.04, railH, 0.04, mat.wood, x, FLOOR + railH / 2, PORCH.z0 + 0.2);
  }
  for (const x of [PORCH.x0 + 0.15, PORCH.x1 - 0.15]) {
    box(0.07, 0.07, CABIN.z0 - PORCH.z0 - 0.25, mat.wood, x, FLOOR + railH, (CABIN.z0 + PORCH.z0 + 0.2) / 2);
  }
  // Stufen
  for (let k = 0; k < 2; k++) box(1.4, 0.2, 0.35, mat.wood, (gapX[0] + gapX[1]) / 2, 0.1 + k * 0.2 - 0.05, PORCH.z0 - 0.15 - (1 - k) * 0.33);

  // Tür (öffnet nach außen, Scharnier bei DOOR.x0)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(DOOR.x0, FLOOR, CABIN.z0 - 0.02);
  g.add(doorPivot);
  const dw = DOOR.x1 - DOOR.x0;
  const doorMat = new THREE.MeshStandardMaterial({ map: texRep(plankTex, 0.5, 1.4), roughness: 0.8 });
  doorMat.map.rotation = Math.PI / 2;
  box(dw - 0.02, DOOR.h - 0.02, 0.06, doorMat, dw / 2, DOOR.h / 2, 0, doorPivot);
  for (const y of [0.35, 1.0, 1.7]) box(dw - 0.1, 0.1, 0.03, mat.darkWood, dw / 2, y, -0.045, doorPivot);
  box(0.03, 0.18, 0.04, mat.iron, dw - 0.12, 1.0, -0.07, doorPivot);
  box(0.03, 0.18, 0.04, mat.iron, dw - 0.12, 1.0, 0.06, doorPivot);
  // Türrahmen
  for (const x of [DOOR.x0 - 0.04, DOOR.x1 + 0.04]) box(0.08, DOOR.h + 0.08, T + 0.04, mat.darkWood, x, FLOOR + DOOR.h / 2, CABIN.z0 + T / 2);
  box(DOOR.x1 - DOOR.x0 + 0.16, 0.1, T + 0.04, mat.darkWood, (DOOR.x0 + DOOR.x1) / 2, FLOOR + DOOR.h + 0.04, CABIN.z0 + T / 2);

  // Fenster: Rahmen + Glas; Vorderfenster als Flügel (öffnet nach außen, Scharnier rechts)
  function frame(w, h, depth, parent, x, y, z) {
    const f = new THREE.Group();
    f.position.set(x, y, z);
    parent.add(f);
    const th = 0.06;
    box(w, th, depth, mat.darkWood, 0, h / 2 - th / 2, 0, f);
    box(w, th, depth, mat.darkWood, 0, -h / 2 + th / 2, 0, f);
    box(th, h, depth, mat.darkWood, -w / 2 + th / 2, 0, 0, f);
    box(th, h, depth, mat.darkWood, w / 2 - th / 2, 0, 0, f);
    box(th * 0.6, h, depth * 0.8, mat.darkWood, 0, 0, 0, f);
    box(w, th * 0.6, depth * 0.8, mat.darkWood, 0, 0, 0, f);
    return f;
  }
  const fw = FRONT_WIN.x1 - FRONT_WIN.x0;
  const fh = FRONT_WIN.y1 - FRONT_WIN.y0;
  const sashPivot = new THREE.Group();
  sashPivot.position.set(FRONT_WIN.x1, FLOOR + (FRONT_WIN.y0 + FRONT_WIN.y1) / 2, CABIN.z0 + 0.02);
  g.add(sashPivot);
  frame(fw, fh, 0.06, sashPivot, -fw / 2, 0, 0);
  const frontGlass = add(new THREE.PlaneGeometry(fw - 0.1, fh - 0.1), mat.glass, -fw / 2, 0, 0, sashPivot, false);
  frontGlass.rotation.y = Math.PI;
  // Fensterbank innen
  box(fw + 0.2, 0.05, 0.3, mat.wood, (FRONT_WIN.x0 + FRONT_WIN.x1) / 2, FLOOR + FRONT_WIN.y0 - 0.02, CABIN.z0 + 0.25);
  // Seitenfenster (fest)
  const sw = SIDE_WIN.z1 - SIDE_WIN.z0;
  const sh = SIDE_WIN.y1 - SIDE_WIN.y0;
  const sideFrame = frame(sw, sh, 0.08, g, CABIN.x0 + 0.11, FLOOR + (SIDE_WIN.y0 + SIDE_WIN.y1) / 2, (SIDE_WIN.z0 + SIDE_WIN.z1) / 2);
  sideFrame.rotation.y = Math.PI / 2;
  const sideGlass = add(new THREE.PlaneGeometry(sw - 0.1, sh - 0.1), mat.glass, CABIN.x0 + 0.11, FLOOR + (SIDE_WIN.y0 + SIDE_WIN.y1) / 2, (SIDE_WIN.z0 + SIDE_WIN.z1) / 2, g, false);
  sideGlass.rotation.y = Math.PI / 2;
  box(0.3, 0.05, sw + 0.2, mat.wood, CABIN.x0 + 0.3, FLOOR + SIDE_WIN.y0 - 0.02, (SIDE_WIN.z0 + SIDE_WIN.z1) / 2);
  // Rückfenster
  const backFrame = frame(1.2, 1.0, 0.08, g, CABIN.x0 + 4.8, FLOOR + 1.5, CABIN.z1 - 0.11);
  const backGlass = add(new THREE.PlaneGeometry(1.1, 0.9), mat.glass, CABIN.x0 + 4.8, FLOOR + 1.5, CABIN.z1 - 0.11, g, false);
  void backFrame;

  // Warmes Fensterleuchten (abends von außen sichtbar): Flächen knapp hinter dem Glas
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const glows = [];
  const gl1 = add(new THREE.PlaneGeometry(fw - 0.1, fh - 0.1), glowMat, (FRONT_WIN.x0 + FRONT_WIN.x1) / 2, FLOOR + (FRONT_WIN.y0 + FRONT_WIN.y1) / 2, CABIN.z0 + 0.12, g, false);
  gl1.rotation.y = Math.PI;
  glows.push(gl1);
  const gl2 = add(new THREE.PlaneGeometry(sw - 0.1, sh - 0.1), glowMat, CABIN.x0 + 0.22, FLOOR + (SIDE_WIN.y0 + SIDE_WIN.y1) / 2, (SIDE_WIN.z0 + SIDE_WIN.z1) / 2, g, false);
  gl2.rotation.y = -Math.PI / 2;
  glows.push(gl2);
  for (const m of glows) m.visible = false;

  // Kamin: Herd innen an der rechten Wand + Schornstein außen
  const hx = HEARTH.x;
  const hz = HEARTH.z;
  const hearth = new THREE.Group();
  g.add(hearth);
  const st = mat.stone(1, 1);
  const depth = 0.8;
  box(0.95, 0.12, 2.2, mat.stone(1, 2), hx - 0.55, FLOOR + 0.06, hz, hearth);
  box(depth, 1.25, 0.45, st, hx - depth / 2 - 0.1, FLOOR + 0.63, hz - 0.78, hearth);
  box(depth, 1.25, 0.45, st, hx - depth / 2 - 0.1, FLOOR + 0.63, hz + 0.78, hearth);
  box(depth, 0.35, 2.0, st, hx - depth / 2 - 0.1, FLOOR + 1.42, hz, hearth);
  box(0.15, 0.9, 1.15, mat.soot, hx - 0.2, FLOOR + 0.55, hz, hearth);
  box(0.6, 0.06, 1.15, mat.soot, hx - 0.45, FLOOR + 0.13, hz, hearth, false);
  box(0.55, CABIN.wallH + 1.0 - 1.6, 1.3, mat.stone(1, 1.5), hx - 0.38, FLOOR + 1.6 + (CABIN.wallH + 1.0 - 1.6) / 2, hz, hearth);
  box(0.12, 0.12, 2.15, mat.darkWood, hx - depth - 0.12, FLOOR + 1.28, hz, hearth); // Kaminsims
  // Schornstein außen
  box(0.9, top + CABIN.ridge + 1.2, 1.2, mat.stone(1, 4), CABIN.x1 + 0.45, (top + CABIN.ridge + 1.2) / 2, hz);
  // Holzscheite im Feuerraum
  const logG = new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8);
  logG.rotateX(Math.PI / 2);
  const charMat = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 1, emissive: 0x000000 });
  const fireLogs = [];
  for (const [dx, dy, ry] of [[-0.42, 0.22, 0.25], [-0.5, 0.22, -0.3], [-0.46, 0.33, 0.05]]) {
    const m = add(logG, charMat, hx + dx, FLOOR + dy, hz, hearth, false);
    m.rotation.y = ry;
    fireLogs.push(m);
  }
  // Topf über dem Feuer (auf Dreibein-Rost)
  const pot = new THREE.Group();
  pot.position.set(hx - 0.48, FLOOR + 0.43, hz);
  hearth.add(pot);
  const potMat = new THREE.MeshStandardMaterial({ color: 0x1f1d1c, roughness: 0.45, metalness: 0.6 });
  const potBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.17, 24, 1, true), potMat);
  potBody.material.side = THREE.DoubleSide;
  potBody.castShadow = true;
  pot.add(potBody);
  add(new THREE.CircleGeometry(0.13, 20).rotateX(-Math.PI / 2), potMat, 0, -0.085, 0, pot);
  const stew = add(new THREE.CircleGeometry(0.145, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7a4a24, roughness: 0.35 }), 0, 0.05, 0, pot, false);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 6, 24, Math.PI), mat.iron);
  handle.position.y = 0.08;
  pot.add(handle);
  pot.visible = false;
  // Löffel
  const spoon = new THREE.Group();
  const spoonMat = new THREE.MeshStandardMaterial({ color: 0xa57a4e, roughness: 0.7 });
  add(new THREE.CylinderGeometry(0.008, 0.01, 0.38, 8), spoonMat, 0, 0.19, 0, spoon);
  add(new THREE.SphereGeometry(0.025, 10, 6).scale(1, 0.4, 1.4), spoonMat, 0, 0, 0, spoon);
  pot.add(spoon);

  // Tisch, Bank, Gegenstände
  const tableG = new THREE.Group();
  tableG.position.set(TABLE.x, FLOOR, TABLE.z);
  g.add(tableG);
  const tableMat = new THREE.MeshStandardMaterial({ map: texRep(plankTex, 0.6, 0.5), roughness: 0.65 });
  box(1.5, 0.06, 0.8, tableMat, 0, TABLE.top - 0.03, 0, tableG);
  for (const [x, z] of [[-0.68, -0.33], [0.68, -0.33], [-0.68, 0.33], [0.68, 0.33]]) box(0.07, TABLE.top - 0.06, 0.07, mat.wood, x, (TABLE.top - 0.06) / 2, z, tableG);
  box(1.3, 0.05, 0.3, mat.wood, 0, 0.45, 0.65, tableG);
  for (const x of [-0.55, 0.55]) box(0.06, 0.43, 0.25, mat.wood, x, 0.215, 0.65, tableG);
  // Schneidebrett, Brot, Messer
  const board = box(0.42, 0.025, 0.28, new THREE.MeshStandardMaterial({ color: 0x9b6a3c, roughness: 0.6 }), -0.25, TABLE.top + 0.0125, 0.02, tableG);
  const crust = new THREE.MeshStandardMaterial({ color: 0x6e3c1a, roughness: 0.8 });
  const crumbMat = new THREE.MeshStandardMaterial({ map: tex.crumb(), roughness: 0.9 });
  // Laib (ovales Bauernbrot), an der Schnittkante per Clipping-Ebene geöffnet
  const LB = { rx: 0.14, ry: 0.065, rz: 0.1, cut: 0.065, cy: 0.045 };
  const loaf = new THREE.Group();
  loaf.position.set(-0.3, TABLE.top + 0.025, 0.02);
  tableG.add(loaf);
  const cutWorldX = TABLE.x - 0.3 + LB.cut;
  const clip = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), cutWorldX)];
  const crustClip = crust.clone();
  crustClip.clippingPlanes = clip;
  crustClip.side = THREE.DoubleSide;
  const loafBody = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), crustClip);
  loafBody.scale.set(LB.rx, LB.ry, LB.rz);
  loafBody.position.set(0, LB.cy, 0);
  loafBody.castShadow = true;
  loaf.add(loafBody);
  // Einschnitte auf der Kruste (helle Rillen, der Wölbung folgend)
  const scoreMat = new THREE.MeshStandardMaterial({ color: 0x9a6638, roughness: 0.95, clippingPlanes: clip });
  for (let i = 0; i < 3; i++) {
    const x = -0.085 + i * 0.05;
    const yTop = LB.cy + LB.ry * Math.sqrt(Math.max(0, 1 - (x / LB.rx) ** 2)) - 0.002;
    const sc = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.1), scoreMat);
    sc.position.set(x, yTop, 0);
    sc.rotation.set(0, 0.55, -x * 3.2);
    loaf.add(sc);
  }
  const k = Math.sqrt(1 - (LB.cut / LB.rx) ** 2);
  const cutFace = new THREE.Mesh(new THREE.CircleGeometry(1, 32), crumbMat);
  cutFace.rotation.y = Math.PI / 2;
  cutFace.scale.set(LB.rz * k * 0.97, LB.ry * k * 0.97, 1);
  cutFace.position.set(LB.cut - 0.001, LB.cy, 0);
  loaf.add(cutFace);
  const slice = new THREE.Group();
  tableG.add(slice);
  const sliceBody = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.014, 32), crumbMat);
  sliceBody.rotation.z = Math.PI / 2;
  sliceBody.scale.set(LB.ry * k * 0.95, 1, LB.rz * k * 0.95);
  sliceBody.castShadow = true;
  slice.add(sliceBody);
  const sliceRim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 6, 32), crust);
  sliceRim.rotation.y = Math.PI / 2;
  sliceRim.scale.set(LB.rz * k * 0.97, LB.ry * k * 0.97, 0.12);
  slice.add(sliceRim);
  const knife = new THREE.Group();
  tableG.add(knife);
  // Brotmesser: Klinge entlang lokaler x-Achse, Griff bei +x
  add(new THREE.BoxGeometry(0.22, 0.032, 0.002), new THREE.MeshStandardMaterial({ color: 0xd0d4d8, roughness: 0.18, metalness: 0.95 }), -0.11, 0, 0, knife);
  add(new THREE.BoxGeometry(0.12, 0.026, 0.02), mat.darkWood, 0.06, 0.004, 0, knife);
  // Becher
  const mugMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: 0.35 });
  const mug = new THREE.Group();
  mug.position.set(0.25, TABLE.top, -0.05);
  tableG.add(mug);
  const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.042, 0.1, 24, 1, true), mugMat);
  mugBody.material.side = THREE.DoubleSide;
  mugBody.position.y = 0.05;
  mugBody.castShadow = true;
  mug.add(mugBody);
  const mugRim = new THREE.Mesh(new THREE.TorusGeometry(0.0445, 0.0035, 8, 32), mugMat);
  mugRim.rotation.x = Math.PI / 2;
  mugRim.position.y = 0.1;
  mug.add(mugRim);
  add(new THREE.CircleGeometry(0.042, 20).rotateX(-Math.PI / 2), mugMat, 0, 0.004, 0, mug);
  const coffee = add(new THREE.CircleGeometry(0.043, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.08, envMapIntensity: 1.5 }), 0, 0.01, 0, mug, false);
  const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), mugMat);
  mugHandle.position.set(0.05, 0.05, 0);
  mug.add(mugHandle);
  // Kaffeekanne (Emaille) – wird beim Eingießen gehalten; Ausguss bei +x, Henkel bei −x
  const kettle = new THREE.Group();
  g.add(kettle);
  const ketMat = new THREE.MeshStandardMaterial({ color: 0x24465c, roughness: 0.25, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x15202a, roughness: 0.3 });
  const kb = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.08, 0.16, 28), ketMat);
  kb.castShadow = true;
  kettle.add(kb);
  const lidK = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.04, 28), ketMat);
  lidK.position.y = 0.1;
  kettle.add(lidK);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), rimMat);
  knob.position.y = 0.125;
  kettle.add(knob);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.005, 6, 28), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.078;
  kettle.add(rim);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.02, 0.13, 12, 1, true), ketMat);
  spout.material.side = THREE.DoubleSide;
  spout.position.set(0.095, 0.02, 0);
  spout.rotation.z = -0.75;
  kettle.add(spout);
  const kh = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 20, Math.PI * 1.1), rimMat);
  kh.position.set(-0.075, 0.01, 0);
  kh.rotation.z = Math.PI / 2 + 0.1;
  kettle.add(kh);
  kettle.visible = false;
  // lokale Punkte für Hand und Strahl
  kettle.userData.tip = new THREE.Vector3(0.143, 0.068, 0);
  kettle.userData.grip = new THREE.Vector3(-0.118, 0.01, 0);
  // Öllampe
  const lamp = new THREE.Group();
  lamp.position.set(TABLE.x - 0.5, FLOOR + TABLE.top, TABLE.z - 0.2);
  g.add(lamp);
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: 0.3, metalness: 0.85 });
  add(new THREE.CylinderGeometry(0.06, 0.075, 0.08, 20), brass, 0, 0.04, 0, lamp);
  add(new THREE.CylinderGeometry(0.02, 0.04, 0.03, 12), brass, 0, 0.095, 0, lamp);
  const chimneyGlass = add(new THREE.CylinderGeometry(0.03, 0.045, 0.18, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }), 0, 0.2, 0, lamp, false);
  void chimneyGlass;
  const lampFlame = add(new THREE.SphereGeometry(0.012, 10, 8).scale(1, 2.2, 1), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, fog: false }), 0, 0.14, 0, lamp, false);

  // Sessel am Kamin
  const chair = new THREE.Group();
  chair.position.set(CHAIR.x, FLOOR, CHAIR.z);
  chair.rotation.y = Math.PI / 2 + 0.35; // blickt zum Kamin (+x)
  g.add(chair);
  const leather = new THREE.MeshStandardMaterial({ color: 0x5a3322, roughness: 0.55 });
  box(0.75, 0.18, 0.7, leather, 0, 0.4, 0, chair);
  box(0.75, 0.75, 0.16, leather, 0, 0.75, -0.3, chair);
  for (const x of [-0.37, 0.37]) box(0.14, 0.32, 0.7, leather, x, 0.55, 0, chair);
  for (const [x, z] of [[-0.32, -0.28], [0.32, -0.28], [-0.32, 0.28], [0.32, 0.28]]) box(0.06, 0.32, 0.06, mat.darkWood, x, 0.16, z, chair);
  // Wolldecke über der Lehne
  box(0.6, 0.5, 0.04, new THREE.MeshStandardMaterial({ map: tex.plaid(), color: 0x8899aa, roughness: 1 }), 0.05, 0.95, -0.4, chair);
  // Teppich
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x6b3b2a, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(2.0, FLOOR + 0.01, 0.6);
  rug.receiveShadow = true;
  g.add(rug);
  // Regal mit Gläsern und Büchern an der Rückwand
  box(1.6, 0.04, 0.25, mat.wood, -1.6, FLOOR + 1.55, CABIN.z1 - 0.35);
  box(1.6, 0.04, 0.25, mat.wood, -1.6, FLOOR + 1.1, CABIN.z1 - 0.35);
  const jarMat = new THREE.MeshStandardMaterial({ color: 0xc9d8cf, roughness: 0.15, transparent: true, opacity: 0.6 });
  for (let i = 0; i < 6; i++) {
    const h = 0.12 + rng.range(0, 0.1);
    add(new THREE.CylinderGeometry(0.045, 0.045, h, 14), jarMat, -2.25 + i * 0.24, FLOOR + 1.57 + h / 2, CABIN.z1 - 0.35, g, false);
  }
  const bookCols = [0x6a2c2c, 0x2c4a6a, 0x4a5a2c, 0x7a6a3a, 0x3a3a3a];
  for (let i = 0; i < 9; i++) {
    const h = 0.2 + rng.range(0, 0.06);
    box(0.05, h, 0.18, new THREE.MeshStandardMaterial({ color: bookCols[i % 5], roughness: 0.8 }), -2.3 + i * 0.065, FLOOR + 1.12 + h / 2, CABIN.z1 - 0.35);
  }
  // Küchenzeile an der Rückwand rechts
  box(1.8, 0.88, 0.6, mat.wood, 1.9, FLOOR + 0.44, CABIN.z1 - 0.45);
  box(1.85, 0.05, 0.65, tableMat, 1.9, FLOOR + 0.9, CABIN.z1 - 0.45);
  // Pfannen an der Wand
  for (let i = 0; i < 3; i++) {
    const r = 0.11 + i * 0.03;
    const p = add(new THREE.CylinderGeometry(r, r * 0.9, 0.05, 20), potMat, 1.3 + i * 0.45, FLOOR + 1.65, CABIN.z1 - 0.2);
    p.rotation.x = Math.PI / 2;
  }

  return {
    group: g,
    doorPivot,
    sashPivot,
    glows,
    glowMat,
    pot,
    stew,
    spoon,
    kettle,
    mug,
    coffee,
    slice,
    knife,
    loaf,
    board,
    lamp,
    lampFlame,
    fireLogs,
    charMat,
    sideGlass,
    frontGlass,
    roofParts,
    backGlass,
  };
}
