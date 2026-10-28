// Protagonist (eine Figur für alle Einstellungen) und Hände für Ego-Einstellungen.
// Kleidung fest: rot-schwarzes Flanellhemd/Jacke, dunkle Hose, braune Stiefel, olivgraue Strickmütze, Bart.
export const SKIN = 0xc28a6c;

export function createPerson(THREE, tex) {
  const plaid = tex.plaid();
  const knit = tex.knit();
  const M = {
    jacket: new THREE.MeshStandardMaterial({ map: plaid, roughness: 0.92 }),
    pants: new THREE.MeshStandardMaterial({ color: 0x2d2a26, roughness: 0.95 }),
    boots: new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.7 }),
    skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.65 }),
    beard: new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 1 }),
    hat: new THREE.MeshStandardMaterial({ map: knit, roughness: 1 }),
    collar: new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 1 }),
  };
  const cap = (r, len, mat, seg = 10) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, seg), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };
  const joint = (parent, x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  const root = new THREE.Group();
  const hips = joint(root, 0, 0.93, 0);
  const pelvis = cap(0.15, 0.12, M.pants);
  pelvis.rotation.z = Math.PI / 2;
  pelvis.scale.set(1, 1, 0.8);
  hips.add(pelvis);
  const spine = joint(hips, 0, 0.04, 0);
  const torso = cap(0.17, 0.36, M.jacket, 14);
  torso.position.y = 0.3;
  torso.scale.set(1.22, 1, 0.82);
  spine.add(torso);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.03, 8, 16), M.collar);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.6;
  spine.add(collar);
  const neck = joint(spine, 0, 0.62, 0);
  const head = joint(neck, 0, 0.12, 0);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), M.skin);
  skull.scale.set(0.95, 1.12, 1);
  skull.castShadow = true;
  head.add(skull);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.098, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), M.beard);
  beard.position.set(0, -0.015, 0.018);
  beard.scale.set(1, 1.15, 1.02);
  head.add(beard);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.113, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hat);
  hat.position.y = 0.03;
  hat.scale.set(1, 1.05, 1.03);
  hat.castShadow = true;
  head.add(hat);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.107, 0.02, 8, 24), M.hat);
  brim.rotation.x = Math.PI / 2;
  brim.position.y = 0.03;
  head.add(brim);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), M.skin);
  nose.position.set(0, 0.005, 0.105);
  head.add(nose);

  function arm(side) {
    const sh = joint(spine, side * 0.22, 0.52, 0);
    const up = cap(0.055, 0.22, M.jacket);
    up.position.y = -0.15;
    sh.add(up);
    const el = joint(sh, 0, -0.3, 0);
    const fo = cap(0.05, 0.2, M.jacket);
    fo.position.y = -0.13;
    el.add(fo);
    const wr = joint(el, 0, -0.27, 0);
    const hand = cap(0.042, 0.05, M.skin);
    hand.position.y = -0.05;
    hand.scale.set(1, 1, 0.65);
    wr.add(hand);
    return { sh, el, wr };
  }
  function leg(side) {
    const hp = joint(hips, side * 0.1, -0.02, 0);
    const th = cap(0.075, 0.32, M.pants);
    th.position.y = -0.22;
    hp.add(th);
    const kn = joint(hp, 0, -0.45, 0);
    const sn = cap(0.062, 0.32, M.pants);
    sn.position.y = -0.21;
    kn.add(sn);
    const an = joint(kn, 0, -0.43, 0);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 0.27), M.boots);
    boot.position.set(0, -0.02, 0.05);
    boot.castShadow = true;
    an.add(boot);
    return { hp, kn, an };
  }
  const L = { arm: arm(1), leg: leg(1) };
  const R = { arm: arm(-1), leg: leg(-1) };

  // Haltung setzen. Alle Werte aus der Szenenzeit abgeleitet (kein Zustand zwischen Frames).
  // walk: Schrittphase (rad) oder null · amp: Schrittweite 0..1 · crouch/sit 0..1 · carry 0..1 (Arme vor der Brust)
  // reach: rechter Arm nach vorn 0..1 · look: [Nicken, Drehen] · lean: Vorneigung
  function pose({ walk = null, amp = 1, crouch = 0, sit = 0, carry = 0, reach = 0, look = [0, 0], lean = 0, mug = 0 } = {}) {
    let bob = 0;
    const sw = walk == null ? 0 : Math.sin(walk) * amp;
    for (const [S, sgn] of [[L, 1], [R, -1]]) {
      const ph = walk == null ? 0 : Math.sin(walk + (sgn > 0 ? 0 : Math.PI));
      const knee = walk == null ? 0 : Math.max(0, Math.sin(walk + (sgn > 0 ? 0 : Math.PI) - 1.2)) * 0.9 * amp;
      S.leg.hp.rotation.x = -0.5 * ph * amp - crouch * 1.9 - sit * 1.5;
      S.leg.kn.rotation.x = knee + crouch * 2.3 + sit * 1.45;
      S.leg.an.rotation.x = -crouch * 0.4 - sit * 0.05;
      S.leg.hp.rotation.z = sgn * (0.03 + crouch * 0.18);
      // Arme: Pendeln, Tragen, Greifen
      const armSwing = walk == null ? 0 : -0.38 * ph * amp;
      S.arm.sh.rotation.set(armSwing * (1 - carry) - carry * 1.15 - (sgn < 0 ? reach * 1.25 : 0) - sit * 0.5 - mug * (sgn < 0 ? 0.9 : 0.2), 0, sgn * (0.12 + carry * 0.05));
      S.arm.el.rotation.set(-0.25 - carry * 1.15 - (sgn < 0 ? reach * 0.15 : 0) - sit * 0.6 - mug * (sgn < 0 ? 1.5 : 0.7), 0, 0);
    }
    bob = walk == null ? 0 : Math.abs(Math.cos(walk)) * 0.025 * amp;
    hips.position.y = 0.93 + bob - crouch * 0.45 - sit * 0.42;
    hips.position.z = -sit * 0.05;
    spine.rotation.x = lean + crouch * 0.55 + sw * 0.0 + carry * -0.08 - sit * 0.1;
    neck.rotation.x = -look[0] - crouch * 0.3;
    neck.rotation.y = look[1];
  }
  pose();
  root.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return { root, pose, M, rightHand: R.arm.wr, leftHand: L.arm.wr };
}

// Unterarm + Hand für Nahaufnahmen (Weltkoordinaten). place(wrist, dir, up, curl)
export function createFPArm(THREE, tex, side = -1) {
  const plaid = tex.plaid();
  const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 });
  const sleeve = new THREE.MeshStandardMaterial({ map: plaid, roughness: 0.92 });
  const g = new THREE.Group();
  const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.5, 6, 14), sleeve);
  fore.rotation.x = Math.PI / 2;
  fore.position.z = 0.33;
  g.add(fore);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.054, 0.05, 16), sleeve);
  cuff.rotation.x = Math.PI / 2;
  cuff.position.z = 0.07;
  g.add(cuff);
  const wrist = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.05, 6, 12), skin);
  wrist.rotation.x = Math.PI / 2;
  wrist.position.z = 0.03;
  wrist.scale.set(1.15, 0.8, 1);
  g.add(wrist);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), skin);
  palm.scale.set(0.046, 0.017, 0.052);
  palm.position.z = -0.045;
  g.add(palm);
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const base = new THREE.Group();
    base.position.set((i - 1.5) * 0.021, 0, -0.085);
    const len = [0.042, 0.048, 0.046, 0.036][i];
    const p1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, len, 4, 8), skin);
    p1.rotation.x = Math.PI / 2;
    p1.position.z = -len / 2;
    base.add(p1);
    const mid = new THREE.Group();
    mid.position.z = -len;
    const p2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0088, len * 0.75, 4, 8), skin);
    p2.rotation.x = Math.PI / 2;
    p2.position.z = -len * 0.37;
    mid.add(p2);
    base.add(mid);
    g.add(base);
    fingers.push({ base, mid });
  }
  const thumb = new THREE.Group();
  thumb.position.set(-side * 0.048, -0.005, -0.03);
  const tm = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.05, 4, 8), skin);
  tm.rotation.x = Math.PI / 2;
  tm.position.z = -0.03;
  thumb.add(tm);
  thumb.rotation.y = side * 0.6;
  g.add(thumb);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  const m = new THREE.Matrix4();
  const zAxis = new THREE.Vector3();
  const xAxis = new THREE.Vector3();
  const yAxis = new THREE.Vector3();
  // wrist: Weltposition des Handgelenks; dir: Richtung der Finger; up: Handrücken-Normale; curl 0..1
  function place(wristPos, dir, up, curl = 0.2, thumbIn = 0.3) {
    zAxis.set(-dir[0], -dir[1], -dir[2]).normalize();
    yAxis.set(up[0], up[1], up[2]);
    xAxis.crossVectors(yAxis, zAxis).normalize();
    yAxis.crossVectors(zAxis, xAxis).normalize();
    m.makeBasis(xAxis, yAxis, zAxis);
    g.quaternion.setFromRotationMatrix(m);
    g.position.set(wristPos[0], wristPos[1], wristPos[2]);
    fingers.forEach((f, i) => {
      f.base.rotation.x = -curl * (1.1 + i * 0.08);
      f.mid.rotation.x = -curl * 1.3;
    });
    thumb.rotation.x = -thumbIn * 0.8;
    g.visible = true;
  }
  return { group: g, place };
}
