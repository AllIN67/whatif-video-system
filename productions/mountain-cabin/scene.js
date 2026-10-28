// What if you lived alone in the mountains? – 3D-Welt und Handlung.
// Regel: jeder sichtbare Zustand ist eine reine Funktion von state.t bzw. state.frame (kein Zustand zwischen Frames).
// Zeiten der Handlung stehen als events in timeline.json (eine Quelle für Bild und Ton).
import { createRng } from '/pipeline/runtime/rng.js';
import { cameraAt } from '/pipeline/runtime/timeline.js';
import { smooth, ramp, lerp, clamp01 } from './lib/noise.js';
import { createTextures } from './lib/tex.js';
import { createTerrain } from './lib/terrain.js';
import { createCabin } from './lib/cabin.js';
import { createNature } from './lib/nature.js';
import { createPerson, createFPArm } from './lib/person.js';
import { createAtmosphere, createVignette } from './lib/atmos.js';
import { createSky, createClouds, createPrecip, createPuffs, createFire, createWaterfall } from './lib/fx.js';
import { SEEDS, SHOTS, ENV_KEYS, personAt } from './lib/story.js';
import { FLOOR, CABIN, HEARTH, TABLE, POOL, CLIFF_DIR, WOODPILE, COOP, DOOR, FRONT_WIN, SIDE_WIN } from './lib/layout.js';

const v3 = (THREE, a) => new THREE.Vector3(a[0], a[1], a[2]);

export async function build({ THREE, scene, camera, renderer, timeline }) {
  const E = Object.fromEntries(timeline.events.map((e) => [e.id, e.t]));
  const tex = createTextures(THREE, createRng(SEEDS.tex));
  const terrain = createTerrain(THREE, createRng(SEEDS.terrain));
  const H = terrain.height;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  camera.near = 0.03;
  camera.far = 40000;
  camera.updateProjectionMatrix();
  scene.add(camera);

  // Himmel + Umgebungslicht (PMREM aus dem Himmel, einmal beim Aufbau)
  const sky = createSky(THREE);
  scene.add(sky.mesh);
  {
    const envScene = new THREE.Scene();
    const s2 = createSky(THREE);
    s2.uniforms.sunDisc.value = 0;
    s2.uniforms.glow.value = 0.3;
    envScene.add(s2.mesh);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(envScene, 0, 1, 40000).texture;
    pm.dispose();
  }
  scene.fog = new THREE.FogExp2(0xc8d0d8, 0.00016);

  // Licht
  const hemi = new THREE.HemisphereLight(0xbcd0e8, 0x4a4436, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dc, 3.0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const fireLight = new THREE.PointLight(0xff8a3a, 0, 9, 1.6);
  fireLight.position.set(HEARTH.x - 1.05, FLOOR + 0.55, HEARTH.z);
  const lampLight = new THREE.PointLight(0xffb468, 0, 7, 1.7);
  const fillLight = new THREE.PointLight(0xcfe0ff, 0, 8, 1.5); // Tageslicht, das durchs Fenster in den Raum fällt
  scene.add(fireLight, lampLight, fillLight);

  // Welt
  const tm = terrain.build();
  scene.add(tm.nearMesh, tm.midMesh, tm.farMesh, tm.lake);
  const cabin = createCabin(THREE, tex, createRng(SEEDS.cabin));
  scene.add(cabin.group);
  lampLight.position.set(cabin.lamp.position.x + 0.1, cabin.lamp.position.y + 0.55, cabin.lamp.position.z + 0.2);
  const nature = createNature(THREE, tex, createRng(SEEDS.nature), terrain);
  scene.add(nature.group);
  const clouds = createClouds(THREE, tex, createRng(SEEDS.clouds));
  scene.add(clouds.group);
  const rain = createPrecip(THREE, createRng(SEEDS.rain), 'rain', 9000, tex);
  const snow = createPrecip(THREE, createRng(SEEDS.snow), 'snow', 7000, tex);
  snow.uniforms.uColor.value.setRGB(0.95, 0.97, 1.0);
  snow.uniforms.uOpacity.value = 0.9;
  snow.uniforms.uBox.value.set(26, 14, 26);
  scene.add(rain.mesh, snow.mesh);

  // Wasserfall
  const poolLevel = H(POOL.x, POOL.z) + 1.0;
  const topAlong = 9.6;
  const topX = POOL.x + CLIFF_DIR[0] * topAlong;
  const topZ = POOL.z + CLIFF_DIR[1] * topAlong;
  const topY = H(POOL.x + CLIFF_DIR[0] * 11.5, POOL.z + CLIFF_DIR[1] * 11.5) + 0.3;
  const fall = createWaterfall(THREE, tex, createRng(SEEDS.fall), {
    top: [topX, topY, topZ],
    bottom: [POOL.x + CLIFF_DIR[0] * 7.2, poolLevel, POOL.z + CLIFF_DIR[1] * 7.2],
    width: 3.2,
    normal: [-CLIFF_DIR[0], -CLIFF_DIR[1]],
  });
  scene.add(fall.group, fall.spray);
  const poolMat = new THREE.MeshStandardMaterial({ color: 0x0f2a2c, roughness: 0.14, metalness: 0.05, transparent: true, opacity: 0.94, envMapIntensity: 0.25 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(POOL.r + 0.6, 48).rotateX(-Math.PI / 2), poolMat);
  pool.position.set(POOL.x, poolLevel, POOL.z);
  pool.receiveShadow = true;
  scene.add(pool);
  const foam = createPuffs(THREE, tex, createRng(SEEDS.foam), 18, { color: 0xffffff, size: 1.2, grow: 1.5, rise: 0.4, drift: [0, 0], sway: 1.2, opacity: 0.35 });
  foam.group.position.set(POOL.x + CLIFF_DIR[0] * 6.5, poolLevel + 0.2, POOL.z + CLIFF_DIR[1] * 6.5);
  scene.add(foam.group);

  // Feuer, Dampf, Rauch
  const fire = createFire(THREE, tex, createRng(SEEDS.fire), 11);
  fire.group.position.set(HEARTH.x - 0.48, FLOOR + 0.18, HEARTH.z);
  scene.add(fire.group);
  const embers = createPuffs(THREE, tex, createRng(SEEDS.embers), 10, { color: 0xff7a2a, size: 0.015, grow: 0, rise: 0.6, sway: 0.05, opacity: 1, additive: true });
  embers.group.position.copy(fire.group.position);
  scene.add(embers.group);
  const mugSteam = createPuffs(THREE, tex, createRng(SEEDS.steam1), 14, { color: 0xffffff, size: 0.035, grow: 3.5, rise: 0.28, sway: 0.02, opacity: 0.28 });
  scene.add(mugSteam.group);
  const potSteam = createPuffs(THREE, tex, createRng(SEEDS.steam2), 16, { color: 0xffffff, size: 0.07, grow: 3, rise: 0.5, sway: 0.04, opacity: 0.3 });
  potSteam.group.position.set(HEARTH.x - 0.48, FLOOR + 0.5, HEARTH.z);
  scene.add(potSteam.group);
  const chimneySmoke = createPuffs(THREE, tex, createRng(SEEDS.smoke), 18, { color: 0xb0b4bc, size: 0.5, grow: 4, rise: 6, drift: [2.5, 1], sway: 0.4, opacity: 0.4 });
  chimneySmoke.group.position.set(CABIN.x1 + 0.45, FLOOR + CABIN.wallH + CABIN.ridge + 1.3, HEARTH.z);
  scene.add(chimneySmoke.group);
  const matchFlame = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.flame(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
  matchFlame.center.set(0.5, 0.1);
  scene.add(matchFlame);
  const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.puff(), color: 0xffa040, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
  lampGlow.position.set(cabin.lamp.position.x, cabin.lamp.position.y + 0.15, cabin.lamp.position.z);
  lampGlow.scale.set(0.35, 0.35, 1);
  scene.add(lampGlow);
  // Kaffeestrahl
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0028, 1, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0x6b3a18, emissive: 0x2a1004, roughness: 0.05, envMapIntensity: 2 }));
  scene.add(stream);
  // Regen auf dem Seitenfenster (innen sichtbar): Tropfenebene mit wanderndem Rinnsal
  const dropsTex = tex.drops();
  const dropsMat = new THREE.MeshStandardMaterial({ map: dropsTex, transparent: true, opacity: 0, depthWrite: false, roughness: 0.05, envMapIntensity: 2 });
  const sideDrops = new THREE.Mesh(new THREE.PlaneGeometry(SIDE_WIN.z1 - SIDE_WIN.z0 - 0.1, SIDE_WIN.y1 - SIDE_WIN.y0 - 0.1), dropsMat);
  sideDrops.position.set(CABIN.x0 + 0.095, FLOOR + (SIDE_WIN.y0 + SIDE_WIN.y1) / 2, (SIDE_WIN.z0 + SIDE_WIN.z1) / 2);
  sideDrops.rotation.y = Math.PI / 2;
  scene.add(sideDrops);
  const frontDrops = new THREE.Mesh(new THREE.PlaneGeometry(FRONT_WIN.x1 - FRONT_WIN.x0 - 0.1, FRONT_WIN.y1 - FRONT_WIN.y0 - 0.1), dropsMat);
  frontDrops.position.set((FRONT_WIN.x0 + FRONT_WIN.x1) / 2, FLOOR + (FRONT_WIN.y0 + FRONT_WIN.y1) / 2, CABIN.z0 + 0.005);
  scene.add(frontDrops);

  // Sonnenstrahl durchs Vorderfenster (Andeutung von Volumenlicht) + schwebender Staub
  const beamCanvas = document.createElement('canvas');
  beamCanvas.width = 64;
  beamCanvas.height = 64;
  {
    const ctx = beamCanvas.getContext('2d');
    const img = ctx.createImageData(64, 64);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const ex = Math.min(x, 63 - x) / 18;
        const ey = Math.min(y, 63 - y) / 18;
        const a = smooth(Math.min(1, ex)) * smooth(Math.min(1, ey));
        img.data.set([255, 255, 255, 255 * a], 4 * (y * 64 + x));
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const beamMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(beamCanvas), color: 0xffe0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), beamMat);
  beam.renderOrder = 6;
  scene.add(beam);
  const winC = new THREE.Vector3((FRONT_WIN.x0 + FRONT_WIN.x1) / 2, FLOOR + (FRONT_WIN.y0 + FRONT_WIN.y1) / 2, CABIN.z0);
  const dustN = 90;
  const dustGeo = new THREE.BufferGeometry();
  const dustBase = [];
  {
    const r = createRng(SEEDS.fire + 1000);
    for (let i = 0; i < dustN; i++) dustBase.push([r.range(-0.5, 0.5), r.range(-0.5, 0.5), r.range(0.05, 1), r.range(0, 6.28)]);
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dustN * 3), 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: tex.puff(), size: 0.008, color: 0xfff0d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  dust.frustumCulled = false;
  scene.add(dust);

  // Figur + Ego-Arme
  const person = createPerson(THREE, tex);
  scene.add(person.root);
  const armR = createFPArm(THREE, tex, -1);
  const armL = createFPArm(THREE, tex, 1);
  scene.add(armR.group, armL.group);
  const carried = nature.loose.map((m) => ({ m, p0: m.position.clone(), r0: m.rotation.clone() }));
  const carriedPerson = [];
  for (let i = 0; i < 3; i++) {
    const m = nature.loose[0].clone();
    person.root.add(m);
    carriedPerson.push(m);
  }
  const heldEgg = nature.eggs[1];
  const heldEggHome = heldEgg.position.clone();
  const carrotHome = nature.carrots[0].position.clone();

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const sunDir = new THREE.Vector3();
  const col = new THREE.Color();
  const shotCfg = (id) => SHOTS[id] || {};

  // Zustand der Umgebung (Licht, Himmel, Wetter) aus Schlüsselwerten
  function envAt(t) {
    let i = 0;
    while (i < ENV_KEYS.length - 2 && t >= ENV_KEYS[i + 1].t) i++;
    const a = ENV_KEYS[i];
    const b = ENV_KEYS[i + 1];
    const x = b.t > a.t ? smooth((t - a.t) / (b.t - a.t)) : 1;
    const out = {};
    for (const k of Object.keys(a)) {
      if (k === 't') continue;
      const va = a[k];
      const vb = b[k] ?? va;
      out[k] = Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], x)) : lerp(va, vb, x);
    }
    return out;
  }

  const atmos = createAtmosphere(THREE);
  atmos.apply(scene);
  const vignette = createVignette(THREE, camera);
  scene.updateMatrixWorld(true);

  return {
    update(state) {
      const { t, frame, shot } = state;
      const cfg = shotCfg(shot);
      const cam = cameraAt(timeline, frame);
      const env = envAt(t);

      // --- Licht & Himmel ---
      sunDir.set(...env.sunDir).normalize();
      const focus = cfg.focus || [cam.pos[0], H(cam.pos[0], cam.pos[2]), cam.pos[2]];
      const ext = cfg.extent || 18;
      sun.target.position.set(focus[0], focus[1], focus[2]);
      sun.position.set(focus[0] + sunDir.x * 300, focus[1] + sunDir.y * 300, focus[2] + sunDir.z * 300);
      const sc = sun.shadow.camera;
      if (sc.right !== ext) {
        sc.left = -ext;
        sc.right = ext;
        sc.top = ext;
        sc.bottom = -ext;
        sc.near = 150;
        sc.far = 460;
        sc.updateProjectionMatrix();
      }
      sun.color.setRGB(...env.sunCol);
      // Blitz (ein einzelner, weicher Lichtstoß – Blitzregel)
      const lightning = Math.exp(-Math.pow((t - E.lightning) / 0.05, 2)) + 0.5 * Math.exp(-Math.pow((t - E.lightning - 0.17) / 0.04, 2));
      const inside = cfg.interior ? (cfg.insideUntil != null ? 1 - ramp(t, cfg.insideUntil[0], cfg.insideUntil[1]) : 1) : 0;
      sun.intensity = env.sunI;
      hemi.intensity = env.hemiI * (1 - 0.82 * inside) + lightning * 2.5;
      hemi.color.setRGB(...env.hemiSky);
      scene.environmentIntensity = env.envI * (1 - 0.8 * inside);
      sky.uniforms.top.value.setRGB(...env.skyTop).multiplyScalar(1 + lightning * 1.5);
      sky.uniforms.horizon.value.setRGB(...env.skyHor).multiplyScalar(1 + lightning * 1.5);
      sky.uniforms.ground.value.setRGB(...env.skyHor).multiplyScalar(0.5);
      sky.uniforms.sunDir.value.copy(sunDir);
      sky.uniforms.sunCol.value.setRGB(...env.sunCol).multiplyScalar(env.sunGlow);
      sky.uniforms.sunDisc.value = env.sunDisc;
      scene.fog.color.setRGB(...env.skyHor).multiplyScalar(0.92);
      scene.fog.density = env.fog;
      renderer.toneMappingExposure = env.exposure * (cfg.exposure || 1);

      // Wolken: helle Haufenwolken ziehen; Sturmfront rollt heran und zieht ab
      for (const c of clouds.fair) {
        c.s.position.set(c.base.x + t * c.sp, c.base.y, c.base.z);
        c.s.material.opacity = 0.75 * env.fair;
        c.s.material.color.setRGB(...env.cloudCol);
      }
      const stormK = env.storm;
      for (const c of clouds.storm) {
        const k = clamp01(stormK * 1.15 - c.ph * 0.15);
        c.s.position.set(c.x + t * 6, c.y - k * 700, lerp(c.z0, c.z1, smooth(k)));
        c.s.material.opacity = 0.97 * smooth(k * 2.5) * (1 - env.clearing);
        c.s.material.color.setRGB(...env.stormCol).multiplyScalar(1 + lightning * 2);
      }
      atmos.U.uHaze.value.x = env.fog;
      atmos.U.uHaze.value.y = t;
      atmos.U.uHazeColor.value.setRGB(...env.skyHor).multiplyScalar(0.95);
      atmos.U.uMist.value.set(env.mist, env.mistTop ?? -190, 35, 0.0011);
      atmos.U.uMistColor.value.setRGB(...env.mistCol);
      vignette.update(cam.fov, cfg.vignette ?? 1);

      // Wind, Regen, Schnee
      nature.uniforms.uTime.value = t;
      nature.uniforms.uWind.value = env.wind;
      rain.uniforms.uTime.value = t;
      rain.uniforms.uAmount.value = env.rain * (cfg.noRain ? 0 : 1);
      rain.uniforms.uWind.value.set(3 + 6 * env.wind, 1.2);
      rain.uniforms.uCenter.value.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      rain.uniforms.uColor.value.setRGB(0.62, 0.66, 0.72).multiplyScalar(1 + lightning);
      rain.mesh.visible = env.rain > 0.001 && !cfg.noRain;
      snow.uniforms.uTime.value = t;
      snow.uniforms.uAmount.value = env.snow;
      snow.uniforms.uCenter.value.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      snow.mesh.visible = env.snow > 0.001;

      // nasse Oberflächen nach dem Sturm
      const wet = env.wet;
      terrain.nearMat.roughness = 0.95 - 0.35 * wet;
      nature.rockMat.roughness = 0.85 - 0.6 * wet;
      nature.mudMat.roughness = 0.45 - 0.3 * wet;

      // --- Hütte ---
      // Tür: öffnet am Anfang, steht offen, wird bei 36,0–36,3 s zugeschlagen
      let door = 0;
      if (t < E.door_close) door = 0.3 + 1.6 * (1 - Math.pow(1 - clamp01((t - E.door_open) / 1.15), 3));
      else door = 1.8 * (1 - Math.pow(clamp01((t - E.door_close) / (E.door_slam - E.door_close)), 2));
      if (t >= E.door_slam) door = 0;
      if (t >= E.evening) door = 0;
      cabin.doorPivot.rotation.y = door;
      cabin.sashPivot.rotation.y = -1.25 * smooth((t - E.window_open) / 0.75) * (t < E.storm_turn ? 1 : 0);
      // Fensterglühen am Abend
      const glow = ramp(t, E.evening, E.evening + 0.5);
      cabin.glowMat.opacity = 0.85 * glow;
      for (const g of cabin.glows) g.visible = glow > 0 && !cfg.interior;
      // Feuer
      const fireK = t < E.fire_catch ? 0 : t < E.clear ? ramp(t, E.fire_catch, E.fire_catch + 1.6) : t >= E.evening ? 0.85 : 0;
      fire.update(t, fireK);
      embers.update(t, fireK, 0.8);
      cabin.charMat.emissive.setRGB(0.22 * fireK, 0.05 * fireK, 0.01 * fireK);
      const flick = 0.82 + 0.1 * Math.sin(t * 11.3) + 0.06 * Math.sin(t * 23.7 + 1.3) + 0.04 * Math.sin(t * 5.1);
      fireLight.intensity = 2.6 * fireK * flick;
      fireLight.visible = fireK > 0;
      // Lampe
      const lampK = t >= E.lamp_lit && t < E.clear ? ramp(t, E.lamp_lit, E.lamp_lit + 0.5) : t >= E.evening ? 1 : 0;
      lampLight.intensity = 1.3 * lampK * (0.96 + 0.04 * Math.sin(t * 7.1));
      lampLight.visible = lampK > 0;
      cabin.lampFlame.material.opacity = lampK;
      lampGlow.material.opacity = 0.55 * lampK;
      // Tageslicht-Aufhellung innen
      fillLight.position.set(0.5, FLOOR + 1.8, -1.8);
      fillLight.intensity = inside * env.fillI;
      fillLight.visible = fillLight.intensity > 0.001;
      // Topf + Rühren + Dampf
      const potOn = t >= E.pot_on && t < E.clear;
      cabin.pot.visible = potOn;
      const stirA = (t - E.pot_on) * 2.4;
      cabin.spoon.position.set(Math.cos(stirA) * 0.06, 0.02, Math.sin(stirA) * 0.06);
      cabin.spoon.rotation.set(Math.sin(stirA) * 0.35, 0, -Math.cos(stirA) * 0.35 - 0.25);
      potSteam.update(t, potOn ? ramp(t, E.pot_on, E.pot_on + 1) : 0, 0.45);
      chimneySmoke.update(t, t >= E.evening ? 1 : 0, 0.12);
      // Regentropfen an den Scheiben
      dropsMat.opacity = env.rain > 0 ? 0.85 * clamp01(env.rain * 1.5) : 0;
      dropsTex.offset.y = (t * 0.06) % 1;

      // Sonnenstrahl + Staub (nur morgens in Innenaufnahmen)
      const beamK = (cfg.beam || 0) * (t < E.storm_turn ? 1 : 0);
      beam.visible = beamK > 0;
      dust.visible = beamK > 0;
      if (beamK > 0) {
        const dir = tmp.copy(sunDir).multiplyScalar(-1);
        const len = 3.2;
        beam.position.copy(winC).addScaledVector(dir, len / 2);
        beam.lookAt(tmp2.copy(winC).addScaledVector(dir, len));
        beam.scale.set(FRONT_WIN.x1 - FRONT_WIN.x0, FRONT_WIN.y1 - FRONT_WIN.y0, len);
        beamMat.opacity = 0.075 * beamK * (env.sunI / 3.2);
        const pa = dustGeo.attributes.position;
        for (let i = 0; i < dustN; i++) {
          const [u, v, w, ph] = dustBase[i];
          const along = (w * len * 0.8 + t * 0.02 * Math.sin(ph)) % (len * 0.8);
          pa.setXYZ(i,
            winC.x + dir.x * along + u * 1.2 + 0.05 * Math.sin(t * 0.3 + ph),
            winC.y + dir.y * along + v * 0.9 + 0.04 * Math.sin(t * 0.23 + ph * 2),
            winC.z + dir.z * along + 0.03 * Math.cos(t * 0.27 + ph));
        }
        pa.needsUpdate = true;
        dust.material.opacity = 0.9 * beamK;
      }

      // --- Frühstück ---
      const mugW = cabin.mug.getWorldPosition(tmp);
      const pourK = clamp01((t - E.pour_start) / (E.pour_end - E.pour_start));
      cabin.coffee.position.y = 0.012 + 0.075 * (t < E.pour_start ? 0 : t < E.evening ? smooth(pourK) : 1);
      cabin.coffee.visible = t >= E.pour_start;
      const kettleOn = shot === 's03_pour';
      cabin.kettle.visible = kettleOn;
      const tilt = 0.25 + 0.55 * smooth((t - E.pour_start + 0.25) / 0.35) - 0.55 * smooth((t - E.pour_end) / 0.3);
      cabin.kettle.position.set(mugW.x - 0.16, mugW.y + 0.2 - 0.04 * tilt, mugW.z);
      cabin.kettle.rotation.set(0, 0, -tilt);
      const pouring = kettleOn && t > E.pour_start && t < E.pour_end;
      stream.visible = pouring;
      if (pouring) {
        cabin.kettle.updateMatrixWorld(true);
        const tip = tmp2.copy(cabin.kettle.userData.tip).applyMatrix4(cabin.kettle.matrixWorld);
        const end = new THREE.Vector3(mugW.x - 0.012, mugW.y + cabin.coffee.position.y, mugW.z);
        const len = tip.distanceTo(end);
        stream.position.copy(tip).add(end).multiplyScalar(0.5);
        stream.position.x += Math.sin(t * 31) * 0.001;
        stream.scale.set(1, len, 1);
        stream.lookAt(end);
        stream.rotateX(Math.PI / 2);
      }
      mugSteam.group.position.set(mugW.x, mugW.y + 0.1, mugW.z);
      mugSteam.update(t, t >= E.pour_start + 0.3 && t < E.window_open + 2 ? 1 : 0, 0.55);
      // Brot schneiden
      const cuts = [E.cut1, E.cut2, E.cut3];
      let saw = 0;
      for (const c of cuts) saw += Math.exp(-Math.pow((t - c) / 0.12, 2));
      const sawX = Math.sin((t - E.cut1) * 2 * Math.PI * 3.3) * 0.05 * clamp01(saw * 2);
      const cutDepth = clamp01((t - E.cut1 + 0.2) / (E.slice_fall - E.cut1 + 0.2));
      const loafX = -0.3;
      const cutX = loafX + 0.079;
      if (shot === 's04_bread') {
        cabin.knife.position.set(cutX + 0.001, TABLE.top + 0.025 + 0.15 - 0.115 * smooth(cutDepth), 0.03 + sawX);
        cabin.knife.rotation.set(0, -Math.PI / 2, 0.12 - 0.1 * cutDepth);
      } else {
        cabin.knife.position.set(-0.05, TABLE.top + 0.012, 0.22);
        cabin.knife.rotation.set(Math.PI / 2, 0, 0.5);
      }
      const fallK = smooth((t - E.slice_fall) / 0.35);
      cabin.slice.position.set(cutX - 0.007 + 0.06 * fallK, TABLE.top + 0.025 + 0.045 * (1 - fallK) + 0.008 * fallK, 0.02);
      cabin.slice.rotation.set(0, 0, -fallK * Math.PI / 2);
      // Ego-Arme: zunächst ausblenden, je Einstellung setzen
      armR.group.visible = false;
      armL.group.visible = false;
      if (shot === 's01_door') {
        // rechte Hand drückt die Tür auf
        const k = 1 - smooth((t - 0.55) / 0.5);
        if (k > 0.01) {
          const hinge = cabin.doorPivot.position;
          const a = cabin.doorPivot.rotation.y;
          const hx = hinge.x + Math.cos(a) * 0.88;
          const hz = hinge.z - Math.sin(a) * 0.88;
          armR.place([lerp(cam.pos[0] + 0.25, hx, k), lerp(cam.pos[1] - 0.5, FLOOR + 1.02, k), lerp(cam.pos[2] - 0.3, hz + 0.05, k)], [-Math.sin(a) * 0.3, 0.1, -1], [0.95, 0.2, 0.2], 0.15, 0.2);
        }
      } else if (shot === 's03_pour') {
        cabin.kettle.updateMatrixWorld(true);
        const hp = tmp2.copy(cabin.kettle.userData.grip).applyMatrix4(cabin.kettle.matrixWorld);
        armR.place([hp.x - 0.03, hp.y + 0.02, hp.z + 0.02], [0.35, -0.1, -0.93], [0, 1, 0], 0.9, 0.7);
      } else if (shot === 's04_bread') {
        cabin.knife.updateMatrixWorld(true);
        const hg = tmp2.set(0.07, 0.01, 0).applyMatrix4(cabin.knife.matrixWorld);
        armR.place([hg.x + 0.01, hg.y + 0.025, hg.z + 0.075], [0, -0.15, -1], [0.2, 1, 0], 0.85, 0.75);
        const lw = cabin.loaf.getWorldPosition(tmp);
        armL.place([lw.x - 0.17, lw.y + 0.15, lw.z + 0.03], [1, -0.55, -0.05], [0.3, 1, 0], 0.4, 0.35);
      } else if (shot === 's05_window') {
        const a = -cabin.sashPivot.rotation.y;
        const px = FRONT_WIN.x1 - Math.cos(a) * (FRONT_WIN.x1 - FRONT_WIN.x0 - 0.12);
        const pz = CABIN.z0 - Math.sin(a) * (FRONT_WIN.x1 - FRONT_WIN.x0 - 0.12);
        const k = 1 - smooth((t - E.window_open - 0.85) / 0.4);
        armR.place([lerp(cam.pos[0] + 0.3, px, k), lerp(cam.pos[1] - 0.45, FLOOR + 1.45, k), lerp(cam.pos[2] - 0.2, pz + 0.12, k)], [-0.3, 0.15, -1], [0.1, 0.2, 1], 0.1, 0.1);
      } else if (shot === 's07_eggs') {
        const lidK = smooth((t - E.lid_open) / 0.45);
        const coopW = nature.coop.position;
        if (t < E.egg_take - 0.45) {
          // Deckel öffnet sich (Hand außerhalb des Bildes)
        } else {
          const k = smooth((t - E.egg_take) / 0.35);
          const e = new THREE.Vector3().copy(heldEggHome).add(coopW);
          const lift = smooth((t - E.egg_take - 0.3) / 0.5);
          armR.place([e.x + 0.03, e.y + 0.07 + lift * 0.25, e.z - 0.12 - lift * 0.15], [0, -0.5, 1], [0, 0.85, -0.4], 0.3 + 0.5 * k, 0.6 * k);
        }
      } else if (shot === 's14_gather') {
        for (const [arm, s] of [[armR, 1], [armL, -1]]) {
          const reach = 1 - smooth((t - E.logs_grab - 0.25) / 0.5);
          const lx = WOODPILE.x + 0.55 + s * 0.22;
          const lz = WOODPILE.z - 1.2;
          const cx = cam.pos[0] + s * 0.22;
          arm.place([lerp(cx, lx, reach), lerp(cam.pos[1] - 0.55, 0.22, reach), lerp(cam.pos[2] + 0.3, lz, reach)], [-s * 0.4, -0.3 * reach, 1], [0, 1, 0], 0.6, 0.5);
        }
      } else if (shot === 's18_lamp') {
        const strikeK = smooth((t - E.match_strike + 0.4) / 0.4);
        const toLamp = smooth((t - E.match_strike - 0.2) / 0.4);
        const lp = cabin.lamp.position;
        const hx = lerp(lerp(cam.pos[0] + 0.25, lp.x + 0.18, strikeK), lp.x + 0.05, toLamp);
        const hy = lerp(lerp(cam.pos[1] - 0.4, lp.y + 0.2, strikeK), lp.y + 0.17, toLamp);
        const hz = lerp(lerp(cam.pos[2] - 0.1, lp.z + 0.1, strikeK), lp.z + 0.08, toLamp);
        const away = smooth((t - E.lamp_lit - 0.3) / 0.5);
        armR.place([hx + away * 0.2, hy - away * 0.2, hz + away * 0.25], [-0.6, 0.1, -0.8], [0, 1, 0], 0.7, 0.8);
        matchFlame.position.set(hx - 0.05, hy + 0.02, hz - 0.06);
        const mf = t >= E.match_strike && t < E.lamp_lit + 0.6 ? clamp01((t - E.match_strike) / 0.08) * (1 - smooth((t - E.lamp_lit - 0.3) / 0.3)) : 0;
        matchFlame.material.opacity = mf;
        const ms = 0.045 * (1 + 0.15 * Math.sin(t * 40));
        matchFlame.scale.set(ms * 0.5, ms, 1);
      }
      if (shot !== 's18_lamp') matchFlame.material.opacity = 0;
      for (const a of [armR, armL]) if (cfg.noArms) a.group.visible = false;

      // Holz aufheben (s14) – lose Scheite wandern in die Arme
      for (let i = 0; i < carried.length; i++) {
        const c = carried[i];
        const k = shot === 's14_gather' ? smooth((t - E.logs_grab - i * 0.12) / 0.45) : t >= E.logs_grab && t < E.clear ? 1 : 0;
        const inArms = t > E.logs_grab + 1.2;
        c.m.visible = !(inArms && shot !== 's14_gather') || t >= E.clear;
        const tx = cam.pos[0] + (i - 1.5) * 0.06;
        const ty = cam.pos[1] - 0.6 + i * 0.08;
        const tz = cam.pos[2] + 0.35;
        const kk = t >= E.clear ? 0 : k;
        c.m.position.set(lerp(c.p0.x, tx, kk), lerp(c.p0.y, ty, kk), lerp(c.p0.z, tz, kk));
        c.m.rotation.set(c.r0.x, lerp(c.r0.y, Math.PI / 2, kk), c.r0.z);
      }

      // --- Garten, Hühner ---
      for (const p of nature.plants) p.p.rotation.z = Math.sin(t * 2.1 + p.ph) * 0.05 * (0.4 + env.wind);
      const pull = smooth((t - E.carrot_pull) / 0.5);
      nature.carrots[0].position.set(carrotHome.x - 0.1 * pull, carrotHome.y + 0.32 * pull, carrotHome.z - 0.25 * pull);
      for (const [i, c] of nature.chickens.entries()) {
        const a = t * c.sp + c.ph;
        c.c.position.set(c.cx + Math.sin(a) * 0.35, 0, c.cz + Math.cos(a * 0.8) * 0.3);
        c.c.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a) * 0.8) + 0.3 * Math.sin(t * 3 + i);
        const peck = Math.max(0, Math.sin(t * 2.6 + c.ph * 3));
        c.neck.rotation.x = Math.pow(peck, 6) * 1.1;
      }
      nature.lidPivot.rotation.x = 1.3 * smooth((t - E.lid_open) / 0.45) * (t < E.storm_turn ? 1 : 0);
      if (t >= E.egg_take && t < E.storm_turn) {
        const k = smooth((t - E.egg_take - 0.25) / 0.6);
        heldEgg.position.set(heldEggHome.x, heldEggHome.y + 0.3 * k, heldEggHome.z - 0.25 * k);
        heldEgg.visible = t < E.egg_take + 1.2 || shot === 's07_eggs';
      } else {
        heldEgg.position.copy(heldEggHome);
        heldEgg.visible = t < E.egg_take;
      }

      // --- Wasserfall ---
      fall.update(t);
      fall.group.visible = !cfg.hideFall;
      fall.spray.visible = !cfg.hideFall;
      foam.update(t, 1, 0.3);

      // --- Figur ---
      const pp = personAt(t, shot, H, E);
      person.root.visible = !!pp && !cfg.pov;
      if (pp) {
        person.root.position.set(pp.pos[0], pp.pos[1], pp.pos[2]);
        person.root.rotation.y = pp.yaw;
        person.pose(pp.pose);
        for (const [i, m] of carriedPerson.entries()) {
          m.visible = !!pp.pose.carry;
          m.position.set((i - 1) * 0.12, 1.1 + (i % 2) * 0.1, 0.32);
          m.rotation.set(0, Math.PI / 2, 0);
        }
      }
    },
  };
}
