// Einstieg in den Baukasten. In productions/<slug>/scene.js:
//
//   import { createKit } from '/pipeline/runtime/kit/index.js';
//   export async function build({ THREE, scene, renderer, rng }) {
//     const kit = createKit({ THREE, scene, renderer, rng });
//     const { sun } = kit.setupLook({ scene, renderer }, 'day');
//     const room = kit.places.bedroom([0, 0, 0]);
//     scene.add(room.root);
//     const me = kit.human({ shirt: 0xe0b23a });
//     scene.add(me.root);
//     return { update({ t }) { kit.sunAt(sun, room.origin); me.pose('stand', t).mood('tired'); } };
//   }
//
// Inhalt: core (mat, box, cbox, group, setupLook, applyLook), human() mit act(), props.*, places.*, space.* (Erdkugel, Sterne),
// fx.* (Regen, Funken), shotKeys (Kamera-Vorlagen), beatClock (Beats/Ereignisse aus timeline.json), Hilfen (ramp, smooth, lerp).
import { createCore, clamp01, smooth, lerp, ramp } from './core.js';
import { createHumanFactory, SKIN, HAIR } from './human.js';
import { createProps } from './props.js';
import { createPlaces } from './places.js';
import { createSpace } from './space.js';
import { shotKeys } from './camera.js';
import { beatClock } from './beats.js';
import { createFx } from './fx.js';

export function createKit({ THREE, scene, renderer, rng }) {
  if (!rng) throw new Error('createKit: rng fehlt (geseedeter Zufall aus build())');
  const core = createCore(THREE);
  const human = createHumanFactory(THREE, core);
  const props = createProps(THREE, core, rng);
  const places = createPlaces(THREE, core, props, rng);
  const space = createSpace(THREE, core, rng);
  const fx = createFx(THREE, rng);

  // Sonne mit dem aktiven Ort mitführen: ein Schattenlicht für alle Orte, scharfe Schatten dort, wo die Kamera ist.
  const sunAt = (sun, origin, offset = [18, 30, 14]) => {
    sun.target.position.set(origin[0], origin[1], origin[2]);
    sun.position.set(origin[0] + offset[0], origin[1] + offset[1], origin[2] + offset[2]);
    sun.target.updateMatrixWorld();
  };

  // Welcher Ort ist bei Zeit t aktiv? sets = [{ from, origin }, …] (aufsteigend)
  const activeSet = (sets, t) => {
    let cur = sets[0];
    for (const s of sets) if (t >= s.from) cur = s;
    return cur;
  };

  // Menge von Statisten (Gesellschaft, Pendler). Liefert Liste von Figuren.
  const crowd = (n, area, { y = 0, palette = [0xe0b23a, 0x3a7ad9, 0xd94a3a, 0x4aa05a, 0x8a5ac9, 0xe08a3a, 0xeeeeee, 0x333333] } = {}) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const h = human({
        skin: rng.pick(SKIN),
        hairColor: rng.pick(HAIR),
        hair: rng.pick(['short', 'short', 'long', 'bun', 'bald', 'spiky']),
        shirt: rng.pick(palette),
        pants: rng.pick([0x2d3e66, 0x3a3a3a, 0x6b5a45, 0x24304a]),
        scale: rng.range(0.94, 1.04),
      });
      h.setPosition(rng.range(area[0], area[1]), y, rng.range(area[2], area[3]), rng.range(-Math.PI, Math.PI));
      h.phase = rng.next();
      scene.add(h.root);
      out.push(h);
    }
    return out;
  };

  return { THREE, core, ...core, human, props, places, space, fx, sunAt, activeSet, crowd, SKIN, HAIR, clamp01, smooth, lerp, ramp, shotKeys, beatClock };
}
