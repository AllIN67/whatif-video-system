// Ich-Perspektive mit eigenen Händen/Armen (Version 3.0, Analyse 6 Videos: C1/C2 erzählen Hook und Schlüsselmomente
// aus „deiner“ Sicht – Karte wird dir zugeschoben, Hände am Geländer, Liegen im Krankenbett). Bisher konnte die Vorlage
// `pov` nur einen Augenpunkt setzen.
//
//   export async function build({ THREE, scene, camera, rng }) {
//     const kit = createKit({ THREE, scene, renderer, rng });
//     const me = kit.firstPerson({ camera, scene, sleeve: 0x2f5fb0, skin: kit.SKIN[0] });
//     const card = kit.props.phone(); me.hold(card, 'R');                 // Gegenstand in der rechten Hand
//     return { update({ t }) {
//       me.act([[0, 'rest'], [0.6, 'reach', 0.4], [2.2, 'hold', 0.3]], t); // Gesten mit weichen Übergängen
//     } };
//   }
//
// Technik: Die Arme hängen als Kinder an der Kamera; die Kamera wird dafür in die Szene gehängt (nötig, damit Kinder
// gerendert werden). Weil stage.js die Kamera NACH update() setzt, folgen die Hände der Kamera ohne Verzögerung.
// Keine Zufallszahlen. Gesten-Positionen sind Kamera-Koordinaten (Meter; −z = Blickrichtung) für fov ≈ 50–60°.
//
// Einsatz-Regel (Guide 18.13 B): Ich-Perspektive für Hook und 2–4 Schlüsselmomente, nicht für das ganze Video –
// Gefühle werden dann über andere Figuren, die eigenen Hände und den Ton getragen (Experiment-Befund fold-paper).

// Gesten: Hand-Position [x, y, z] und Drehung [rx, ry, rz] der RECHTEN Hand; links wird gespiegelt.
// both = beide Hände sichtbar; sonst bleibt die andere Hand in 'rest'.
export const FP_POSES = {
  rest: { R: [0.2, -0.5, -0.6, 0.35, 0, 0], both: true },             // Hände unten aus dem Bild
  hold: { R: [0.1, -0.24, -0.6, 0.45, 0.15, 0.05] },                   // Gegenstand vor sich halten
  show: { R: [0.05, -0.13, -0.55, 0.0, 0.25, 0.1] },                   // Gegenstand zeigen/hochhalten (Karte, Handy)
  reach: { R: [0.1, -0.16, -0.78, 0.15, 0, 0], both: true },           // nach vorne greifen
  push: { R: [0.11, -0.1, -0.62, -1.15, 0, 0.1], both: true },         // Handflächen nach vorn (Stoßen, Abwehren)
  grip: { R: [0.16, -0.28, -0.68, 0.75, 0, -0.1], both: true },        // Hände auf Geländer/Tisch/Lenkrad
  table: { R: [0.17, -0.33, -0.75, 1.3, 0, 0], both: true },           // Hände flach auf dem Tisch (C1-Einstieg)
  lie: { R: [0.2, -0.38, -0.85, 1.45, 0, 0.15], both: true },          // Hände auf der Bettdecke (liegend)
  flail: { R: [0.28, 0.02, -0.7, -0.6, 0, 0.7], both: true },          // Arme hochgerissen (Sturz, Schreck)
  point: { R: [0.07, -0.14, -0.75, 0.1, 0.05, 0], finger: true },      // Zeigefinger
};

export function createFirstPersonFactory(THREE, core) {
  const { cbox, mat } = core;

  return function firstPerson({ camera, scene, sleeve = 0x2f5fb0, skin = 0xe8c4a0, cuff = null, scale = 1 } = {}) {
    if (!camera || !scene) throw new Error('firstPerson: camera und scene aus build() übergeben');
    if (!camera.parent) scene.add(camera);
    const rig = new THREE.Group();
    rig.name = 'firstPerson';
    camera.add(rig);

    const makeArm = (side) => {
      const g = new THREE.Group(); // Ursprung = Handgelenk
      const s = scale;
      // Unterarm zeigt vom Handgelenk zurück zur Kamera und nach unten (verlässt das Bild unten)
      const fore = cbox(0.085 * s, 0.085 * s, 0.46 * s, sleeve, [0, -0.02 * s, 0.25 * s], { cast: false });
      g.add(fore);
      if (cuff) g.add(cbox(0.09 * s, 0.09 * s, 0.03 * s, cuff, [0, -0.02 * s, 0.03 * s], { cast: false }));
      // Hand: Handfläche + Finger-Block + Daumen (Würfel-Stil wie kit.human)
      const hand = new THREE.Group();
      hand.add(cbox(0.085 * s, 0.035 * s, 0.075 * s, skin, [0, 0, -0.035 * s], { cast: false }));
      const fingers = cbox(0.08 * s, 0.03 * s, 0.06 * s, skin, [0, -0.004 * s, -0.1 * s], { cast: false });
      hand.add(fingers);
      hand.add(cbox(0.03 * s, 0.03 * s, 0.05 * s, skin, [side * -0.05 * s, 0.002 * s, -0.04 * s], { cast: false }));
      const indexF = cbox(0.022 * s, 0.022 * s, 0.07 * s, skin, [side * -0.025 * s, 0, -0.14 * s], { cast: false });
      indexF.visible = false;
      hand.add(indexF);
      g.add(hand);
      const slot = new THREE.Group(); // Ankerpunkt für gehaltene Gegenstände (über der Handfläche)
      slot.position.set(0, 0.03 * s, -0.07 * s);
      hand.add(slot);
      rig.add(g);
      return { g, hand, fingers, indexF, slot, side };
    };
    const R = makeArm(1);
    const L = makeArm(-1);

    const vec = (name, side) => {
      const P = FP_POSES[name];
      if (!P) throw new Error(`firstPerson: Geste „${name}“ unbekannt (${Object.keys(FP_POSES).join(', ')})`);
      const src = side === 1 || P.both ? P.R : FP_POSES.rest.R;
      return side === 1 ? src : [-src[0], src[1], src[2], src[3], -src[4], -src[5]];
    };
    const applyArm = (A, v, t, finger) => {
      // leichtes Atmen/Wackeln aus t (deterministisch), damit die Hände nicht eingefroren wirken
      const br = 0.004 * Math.sin(t * 1.9 + A.side);
      A.g.position.set(v[0], v[1] + br, v[2]);
      A.g.rotation.set(v[3], v[4], v[5]);
      A.indexF.visible = !!finger;
      A.fingers.scale.z = finger ? 0.5 : 1;
    };
    const lerpV = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
    const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

    let current = 'rest';
    const api = {
      root: rig,
      right: R,
      left: L,
      // Einzelne Geste (k = Überblendung von 'from' zu name)
      pose(name, t = 0, { from = null, k = 1 } = {}) {
        current = name;
        for (const A of [R, L]) {
          const v = from ? lerpV(vec(from, A.side), vec(name, A.side), ease(k)) : vec(name, A.side);
          applyArm(A, v, t, A.side === 1 && FP_POSES[name].finger && k > 0.5);
        }
        return api;
      },
      // Spur [[zeit, geste, überblendung_s], …] wie human.act(): weiche Übergänge, letzte erreichte Geste bleibt
      // Auch im Format von human.act(): [{ t, gesture, blend }, …]
      act(track, t) {
        if (!track.length) throw new Error('firstPerson.act: leere Spur');
        const K = track.map((k) => (Array.isArray(k) ? k : [k.t, k.gesture, k.blend]));
        let i = 0;
        while (i + 1 < K.length && t >= K[i + 1][0]) i++;
        const [t0, name, blend = 0.3] = K[i];
        const prev = i > 0 ? K[i - 1][1] : null;
        const k = prev && blend > 0 ? (t - t0) / blend : 1;
        return api.pose(name, t, { from: k < 1 ? prev : null, k });
      },
      // Gegenstand in die Hand legen ('R' | 'L'); Gegenstand wird an die Hand gehängt (Position relativ zur Hand)
      hold(obj, hand = 'R', { pos = [0, 0, 0], rot = [0, 0, 0], scale: sc = 1 } = {}) {
        const A = hand === 'L' ? L : R;
        const o = obj.root || obj;
        A.slot.add(o);
        o.position.set(...pos);
        o.rotation.set(...rot);
        o.scale.setScalar(sc);
        return o;
      },
      release(obj) {
        const o = obj.root || obj;
        if (o.parent) o.parent.remove(o);
      },
      setVisible(v) {
        rig.visible = v;
        return api;
      },
      get gesture() {
        return current;
      },
    };
    api.pose('rest');
    return api;
  };
}
