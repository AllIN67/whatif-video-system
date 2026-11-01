// Requisiten für Familien-/Drama-Themen (ergänzt 2026-11-01 für productions/what-if-one-argument-last-goodbye).
// Gleiche Konventionen wie props.js: Füße auf y = 0, Vorderseite +z, Zufall nur über rng, keine Uhr.
// Texte (Grabinschrift) kommen von der Szene aus text.<lang>.json – hier keine festen Wörter (Guide 1.3).

export function createFamilyProps(THREE, core, rng, base) {
  const { box, cbox, mat, group } = core;
  const { canvasTex } = base;

  // ---------- Sportwagen mit 911-Silhouette (ohne Logo/Schriftzug) ----------
  // Erkennungsmerkmale: flach abfallendes Fließheck, runde, aufrechte Scheinwerfer auf den vorderen Kotflügeln,
  // breite hintere Radhäuser, durchgehendes Rücklichtband, kleiner Entenbürzel. Länge 4,5 m entlang z (Front +z).
  // userData: setSpin(a) Räder drehen, setSteer(a) Vorderräder einschlagen, setLights({ head, brake, hazard }),
  //   setCrash(k) Front eindrücken + Scheibe zersplittert (0…1), seat = Fahrerplatz lokal (Linkslenker: +x), cabin = Innenraum
  const sportsCar = ({ color = 0xb9bec6, glassOpacity = 0.38 } = {}) => {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.35, flatShading: true });
    const W = 1.84;
    // Seitenprofil (z, y) mit Radausschnitten
    const wr = 0.37; // Radhaus-Radius
    const zr = -1.2; // Hinterachse
    const zf = 1.25; // Vorderachse
    const prof = new THREE.Shape();
    prof.moveTo(-2.18, 0.3);
    prof.lineTo(zr - wr, 0.3);
    prof.absarc(zr, 0.33, wr, Math.PI, 0, true);
    prof.lineTo(zf - wr, 0.3);
    prof.absarc(zf, 0.33, wr, Math.PI, 0, true);
    prof.lineTo(2.2, 0.3);
    prof.lineTo(2.27, 0.42);
    prof.lineTo(2.24, 0.58);
    prof.lineTo(2.08, 0.68);
    prof.lineTo(1.55, 0.79);
    prof.lineTo(0.8, 0.86);
    prof.lineTo(-1.1, 0.9);
    prof.lineTo(-1.75, 0.86);
    prof.lineTo(-2.16, 0.8);
    prof.lineTo(-2.28, 0.82); // Bürzel
    prof.lineTo(-2.3, 0.62);
    prof.lineTo(-2.24, 0.42);
    prof.closePath();
    const extrude = (shape, width, m) => {
      const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 10 });
      geo.translate(0, 0, -width / 2);
      geo.rotateY(-Math.PI / 2); // Profil-x → Welt-z (Front +z)
      const mesh = new THREE.Mesh(geo, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };
    // vordere Partie getrennt (Unfall: wird gestaucht)
    const body = extrude(prof, W - 0.08, bodyMat);
    g.add(body);
    // Kabine: Glas-Fließheck + Dachspange in Wagenfarbe
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x6a8098, roughness: 0.12, metalness: 0.2, transparent: true, opacity: glassOpacity, flatShading: true, depthWrite: false });
    const gh = new THREE.Shape();
    gh.moveTo(0.82, 0.86);
    gh.lineTo(0.05, 1.27);
    gh.lineTo(-0.55, 1.3);
    gh.lineTo(-1.15, 1.14);
    gh.lineTo(-1.95, 0.87);
    gh.closePath();
    const cabinGlass = extrude(gh, 1.32, glassMat);
    cabinGlass.castShadow = false;
    g.add(cabinGlass);
    const roof = new THREE.Shape();
    roof.moveTo(0.02, 1.27);
    roof.lineTo(-0.55, 1.31);
    roof.lineTo(-1.1, 1.16);
    roof.lineTo(-1.08, 1.12);
    roof.lineTo(-0.55, 1.26);
    roof.lineTo(0.04, 1.22);
    roof.closePath();
    g.add(extrude(roof, 1.3, bodyMat));
    // A-, B-Säulen und Heckscheiben-Rahmen
    for (const sx of [-1, 1]) {
      const a = cbox(0.05, 0.88, 0.05, bodyMat, [sx * 0.67, 1.07, 0.44]);
      a.rotation.x = -1.08;
      g.add(a);
      const bp = cbox(0.06, 0.42, 0.09, bodyMat, [sx * 0.67, 1.07, -0.62]);
      bp.rotation.x = 0.2;
      g.add(bp);
      g.add(cbox(0.04, 0.04, 2.3, bodyMat, [sx * 0.67, 0.89, -0.55])); // Fensterlinie
      const c = cbox(0.05, 0.84, 0.07, bodyMat, [sx * 0.67, 1.0, -1.55]);
      c.rotation.x = 1.24;
      g.add(c);
      // Außenspiegel
      g.add(cbox(0.16, 0.08, 0.12, bodyMat, [sx * 0.98, 0.95, 0.62]));
      // Türfuge
      g.add(cbox(0.012, 0.5, 0.012, 0x1a1a1e, [sx * (W / 2 + 0.002), 0.6, 0.72], { cast: false }));
      g.add(cbox(0.012, 0.42, 0.012, 0x1a1a1e, [sx * (W / 2 + 0.002), 0.58, -0.55], { cast: false }));
      g.add(cbox(0.012, 0.03, 0.14, 0x2a2a2e, [sx * (W / 2 + 0.006), 0.78, -0.3], { cast: false })); // Türgriff
      // Seitenschweller dunkel
      g.add(cbox(0.03, 0.08, 2.0, 0x1d1f24, [sx * (W / 2 - 0.01), 0.33, 0.02], { cast: false }));
    }
    // breite hintere Kotflügel (Hüften)
    for (const sx of [-1, 1]) {
      const hip = cbox(0.1, 0.18, 1.25, bodyMat, [sx * (W / 2 + 0.01), 0.8, -1.2]);
      g.add(hip);
      const ff = cbox(0.38, 0.12, 0.9, bodyMat, [sx * 0.6, 0.73, 1.72]); // vordere Kotflügel-Kuppe
      ff.rotation.x = 0.16;
      g.add(ff);
    }
    // Scheinwerfer: rund, aufrecht (Frosch-Augen)
    const headOn = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xfff0c8, emissiveIntensity: 2.2, roughness: 0.3 });
    const headOff = mat(0xc9ccd2, { roughness: 0.25 });
    const lamps = [];
    for (const sx of [-1, 1]) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 18), bodyMat);
      ring.rotation.x = Math.PI / 2 - 0.35;
      ring.position.set(sx * 0.6, 0.76, 2.12);
      g.add(ring);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 18), headOff);
      lens.rotation.x = Math.PI / 2 - 0.35;
      lens.position.set(sx * 0.6, 0.765, 2.145);
      g.add(lens);
      lamps.push(lens);
      // Blinker/Tagfahrlicht unten in der Schürze
      g.add(cbox(0.22, 0.05, 0.03, 0xf0a030, [sx * 0.62, 0.43, 2.26], { cast: false, mat: { emissive: 0x6a3a00, emissiveIntensity: 0.4 } }));
    }
    // Lufteinlässe Front
    g.add(cbox(0.7, 0.1, 0.03, 0x15161a, [0, 0.4, 2.27], { cast: false }));
    // Rücklichtband
    const tailOn = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff1010, emissiveIntensity: 1.6, roughness: 0.3 });
    const tailOff = mat(0x7a1414, { roughness: 0.3 });
    const tail = cbox(1.62, 0.07, 0.04, tailOff, [0, 0.72, -2.37], { cast: false });
    g.add(tail);
    // Warnblinker (vorn/hinten an den Ecken)
    const hazOn = new THREE.MeshStandardMaterial({ color: 0xffa424, emissive: 0xff8a00, emissiveIntensity: 2.0 });
    const hazOff = mat(0x8a5a20);
    const hazards = [];
    for (const sx of [-1, 1]) {
      for (const [z, y] of [[2.32, 0.52], [-2.37, 0.6]]) {
        const h = cbox(0.14, 0.05, 0.04, hazOff, [sx * 0.78, y, z], { cast: false });
        g.add(h);
        hazards.push(h);
      }
    }
    // Lüftungsgitter am Heck (Heckmotor)
    for (let i = 0; i < 5; i++) g.add(cbox(0.6, 0.012, 0.012, 0x15161a, [0, 0.86 - i * 0.035, -1.98 - i * 0.04], { cast: false }));
    g.add(cbox(0.5, 0.06, 0.06, 0x2a2a2e, [0, 0.3, -2.28], { cast: false })); // Endrohr-Blende
    // Räder
    const tyre = mat(0x16161a);
    const rim = mat(0xd5d8de, { roughness: 0.35, metalness: 0.4 });
    const wheels = [];
    for (const [z, wR] of [[zf, 0.32], [zr, 0.335]]) {
      for (const sx of [-1, 1]) {
        const steer = new THREE.Group();
        steer.position.set(sx * 0.8, wR, z);
        const spin = new THREE.Group();
        steer.add(spin);
        const t = new THREE.Mesh(new THREE.CylinderGeometry(wR, wR, 0.27, 18), tyre);
        t.rotation.z = Math.PI / 2;
        t.castShadow = true;
        spin.add(t);
        const r = new THREE.Mesh(new THREE.CylinderGeometry(wR * 0.62, wR * 0.62, 0.28, 10), rim);
        r.rotation.z = Math.PI / 2;
        spin.add(r);
        for (let k = 0; k < 5; k++) {
          const sp = cbox(0.29, 0.05, wR * 1.1, 0x9aa0a8, [0, 0, 0], { cast: false });
          sp.rotation.x = (k * Math.PI) / 5;
          spin.add(sp);
        }
        g.add(steer);
        wheels.push({ steer, spin, front: z > 0 });
      }
    }
    // Innenraum: Sitze, Armaturenbrett mit Leuchtanzeigen, Lenkrad (Linkslenker: Fahrer bei +x)
    const cabin = new THREE.Group();
    g.add(cabin);
    const seatMat = mat(0x2a2224);
    for (const sx of [-1, 1]) {
      cabin.add(box(0.5, 0.12, 0.5, seatMat, [sx * 0.38, 0.12, -0.35]));
      const back = box(0.5, 0.72, 0.12, seatMat, [sx * 0.38, 0.2, -0.66]);
      back.rotation.x = -0.25;
      cabin.add(back);
    }
    cabin.add(box(1.6, 0.25, 0.4, 0x1e1e22, [0, 0.62, 0.62]));
    const dashGlow = new THREE.MeshStandardMaterial({ color: 0xffb070, emissive: 0xff9a40, emissiveIntensity: 1.2 });
    for (let i = 0; i < 3; i++) {
      const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 14), dashGlow);
      gauge.rotation.x = Math.PI / 2 - 0.6;
      gauge.position.set(0.38 + (i - 1) * 0.13, 0.84, 0.47);
      cabin.add(gauge);
    }
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 18), mat(0x1a1a1e));
    wheel.position.set(0.38, 0.76, 0.32);
    wheel.rotation.x = -0.45;
    cabin.add(wheel);
    cabin.add(cbox(0.05, 0.05, 0.25, 0x1a1a1e, [0.38, 0.72, 0.42], { cast: false }));
    // Splitter-Muster auf der Frontscheibe (Unfall)
    const crackTex = canvasTex(256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(235,245,255,0.95)';
      c.lineWidth = 2.2;
      const cx = w * 0.62;
      const cy = h * 0.45;
      let k = 7;
      const rnd = () => ((k = (k * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + rnd() * 0.3;
        c.beginPath();
        c.moveTo(cx, cy);
        let x = cx;
        let y = cy;
        for (let j = 0; j < 5; j++) {
          x += Math.cos(a + (rnd() - 0.5) * 0.5) * 26;
          y += Math.sin(a + (rnd() - 0.5) * 0.5) * 26;
          c.lineTo(x, y);
        }
        c.stroke();
      }
      for (const r of [18, 40, 66]) {
        c.beginPath();
        for (let i = 0; i <= 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          const rr = r * (0.85 + rnd() * 0.3);
          c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        c.stroke();
      }
    });
    const crack = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.62), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false }));
    crack.position.set(0, 1.07, 0.44);
    crack.rotation.x = -1.0;
    crack.visible = false;
    g.add(crack);
    // Unfall-Verformung: Vorderpartie (z > 0.9) stauchen, Haube aufwölben, leicht schief
    const pos = body.geometry.attributes.position;
    const orig = pos.array.slice();
    let lastK = -1;
    const lampBase = lamps.map((l) => l.position.clone());
    // Sitzmarke: Oberkante Fahrersitz (Figur: root.y = Weltposition.y − 0,40 bei Pose sit/drive)
    const seatMarker = new THREE.Object3D();
    seatMarker.position.set(0.38, 0.24, -0.25);
    g.add(seatMarker);
    g.userData = {
      seatMarker,
      cabin,
      wheels,
      setSpin(a) {
        for (const w of wheels) w.spin.rotation.x = a;
      },
      setSteer(a) {
        for (const w of wheels) if (w.front) w.steer.rotation.y = a;
      },
      setLights({ head = false, brake = false, hazard = false, flicker = 1 } = {}) {
        lamps.forEach((l, i) => (l.material = head && (i === 0 || flicker > 0.5) ? headOn : headOff));
        tail.material = brake || head ? tailOn : tailOff;
        tailOn.emissiveIntensity = brake ? 2.4 : 1.2;
        for (const h of hazards) h.material = hazard ? hazOn : hazOff;
      },
      setCrash(k) {
        if (Math.abs(k - lastK) < 1e-4) return;
        lastK = k;
        for (let i = 0; i < pos.count; i++) {
          // Geometrie ist gedreht: lokales z = Welt-z nach rotateY
          const x = orig[i * 3];
          const y = orig[i * 3 + 1];
          const z = orig[i * 3 + 2];
          let nz = z;
          let ny = y;
          let nx = x;
          if (z > 0.9) {
            const d = z - 0.9;
            nz = 0.9 + d * (1 - 0.42 * k);
            ny = y + k * 0.16 * Math.sin(Math.min(1, d / 1.3) * Math.PI) * (y > 0.6 ? 1 : 0.3);
            nx = x + k * 0.12 * d * (x > 0 ? -0.6 : 0.4);
          }
          pos.array[i * 3] = nx;
          pos.array[i * 3 + 1] = ny;
          pos.array[i * 3 + 2] = nz;
        }
        pos.needsUpdate = true;
        body.geometry.computeVertexNormals();
        lamps.forEach((l, i) => {
          l.position.z = lampBase[i].z - k * 0.5;
          l.position.y = lampBase[i].y + k * (i ? 0.06 : -0.05);
        });
        crack.visible = k > 0.5;
      },
    };
    g.userData.setLights({});
    return g;
  };

  // ---------- Friedhof ----------
  // Grabstein mit gerundetem Kopf; text = Inschrift (aus text.<lang>.json, Zeilen mit \n), optional Herz-Gravur.
  const gravestone = ({ text = '', w = 0.8, h = 1.0, color = 0x8c9096, letter = '#2a2c30', heart = false } = {}) => {
    const stone = mat(color, { roughness: 0.85 });
    const g = group(box(w + 0.2, 0.12, 0.5, color - 0x111111, [0, 0, 0]));
    g.add(box(w, h - w / 2, 0.16, stone, [0, 0.12, 0]));
    const top = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.16, 20, 1, false, -Math.PI / 2, Math.PI), stone);
    top.rotation.set(-Math.PI / 2, 0, 0);
    top.position.set(0, 0.12 + h - w / 2, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    g.add(top);
    if (text || heart) {
      const tex = canvasTex(512, 640, (c, W, H) => {
        c.clearRect(0, 0, W, H);
        c.fillStyle = letter;
        c.textAlign = 'center';
        const lines = text.split('\n');
        let y = 150;
        lines.forEach((ln, i) => {
          c.font = i === 0 ? '600 76px Georgia, serif' : '400 46px Georgia, serif';
          c.fillText(ln, W / 2, y);
          y += i === 0 ? 92 : 66;
        });
        if (heart) {
          c.beginPath();
          const cx = W / 2;
          const cy = y + 30;
          c.moveTo(cx, cy + 40);
          c.bezierCurveTo(cx - 70, cy - 10, cx - 30, cy - 60, cx, cy - 20);
          c.bezierCurveTo(cx + 30, cy - 60, cx + 70, cy - 10, cx, cy + 40);
          c.lineWidth = 7;
          c.strokeStyle = letter;
          c.stroke();
        }
      });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, w * 0.9 * 1.25), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9 }));
      face.position.set(0, 0.12 + (h - w / 2) * 0.48 + w * 0.2, 0.082);
      g.add(face);
    }
    return g;
  };
  // Grabfeld: Erde/Bepflanzung vor dem Stein (Länge entlang +z)
  const gravePlot = ({ l = 1.8, w = 0.9, soil = 0x5a4232, edge = 0x9a9ea4 } = {}) => {
    const g = group(box(w, 0.08, l, soil, [0, 0, l / 2 + 0.25]));
    for (const sx of [-1, 1]) g.add(box(0.08, 0.12, l, edge, [sx * (w / 2 + 0.04), 0, l / 2 + 0.25]));
    g.add(box(w + 0.16, 0.12, 0.08, edge, [0, 0, l + 0.29]));
    return g;
  };
  // Blumenstrauß (liegt in Papier; Mittelpunkt am Stielende)
  const flowers = ({ colors = [0xf2f2f2, 0xf0c0cc, 0xe8e0a0, 0xffffff, 0xd9a0c8], wrap = 0xf3ead8 } = {}) => {
    const g = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 7, 1, true), mat(wrap, { side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI;
    cone.position.y = 0.21;
    g.add(cone);
    const stem = mat(0x4a7a3a);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const r = i === 0 ? 0 : 0.06 + 0.02 * (i % 2);
      g.add(cbox(0.012, 0.42, 0.012, stem, [Math.cos(a) * r * 0.6, 0.28, Math.sin(a) * r * 0.6], { cast: false }));
      const bl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045 + 0.012 * (i % 3), 0), mat(colors[i % colors.length], { emissive: colors[i % colors.length], emissiveIntensity: 0.08 }));
      bl.position.set(Math.cos(a) * r, 0.5 + 0.03 * (i % 2), Math.sin(a) * r);
      bl.castShadow = true;
      g.add(bl);
    }
    for (let i = 0; i < 4; i++) {
      const lf = cbox(0.03, 0.12, 0.08, 0x5a9a48, [Math.cos(i * 1.6) * 0.08, 0.42, Math.sin(i * 1.6) * 0.08], { cast: false });
      lf.rotation.z = Math.cos(i) * 0.6;
      g.add(lf);
    }
    return g;
  };
  // Kinderzeichnung (Wachsmalstift): Familie aus vier Figuren an den Händen, Haus, Sonne, Herz – ohne Schrift.
  // Liegt flach (Bildseite +y) – für Hochhalten: rotation.x = −π/2 (Bildseite → +z). Größe A4 quer ≈ 0,30 × 0,21 m.
  const drawing = () => {
    const tex = canvasTex(600, 420, (c, W, H) => {
      c.fillStyle = '#fbf8f0';
      c.fillRect(0, 0, W, H);
      const crayon = (col, wdt = 7) => {
        c.strokeStyle = col;
        c.fillStyle = col;
        c.lineWidth = wdt;
        c.lineCap = 'round';
        c.lineJoin = 'round';
      };
      // Wiese
      crayon('#57a84a', 9);
      c.beginPath();
      for (let x = 10; x < W; x += 18) {
        c.moveTo(x, H - 18);
        c.lineTo(x + 6, H - 40);
      }
      c.stroke();
      // Sonne
      crayon('#f5b822', 8);
      c.beginPath();
      c.arc(520, 70, 38, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        c.beginPath();
        c.moveTo(520 + Math.cos(a) * 50, 70 + Math.sin(a) * 50);
        c.lineTo(520 + Math.cos(a) * 72, 70 + Math.sin(a) * 72);
        c.stroke();
      }
      // Haus
      crayon('#c8452f', 7);
      c.strokeRect(36, 170, 120, 110);
      c.beginPath();
      c.moveTo(26, 172);
      c.lineTo(96, 104);
      c.lineTo(166, 172);
      c.stroke();
      crayon('#3a6ec8', 6);
      c.strokeRect(80, 220, 32, 60);
      // Familie: Papa (groß, Bart), Mama (lange Haare), großer Junge, kleiner Junge – an den Händen
      const fig = (x, hgt, col, hair, beard) => {
        const top = H - 50 - hgt;
        crayon('#2a2a2a', 6);
        c.beginPath();
        c.arc(x, top + hgt * 0.14, hgt * 0.13, 0, Math.PI * 2);
        c.stroke();
        // Lächeln
        c.beginPath();
        c.arc(x, top + hgt * 0.15, hgt * 0.06, 0.2 * Math.PI, 0.8 * Math.PI);
        c.stroke();
        crayon(col, 9);
        c.beginPath();
        c.moveTo(x, top + hgt * 0.27);
        c.lineTo(x, top + hgt * 0.68);
        c.moveTo(x, top + hgt * 0.68);
        c.lineTo(x - hgt * 0.13, top + hgt);
        c.moveTo(x, top + hgt * 0.68);
        c.lineTo(x + hgt * 0.13, top + hgt);
        c.stroke();
        crayon(hair, 8);
        if (hair) {
          c.beginPath();
          c.arc(x, top + hgt * 0.12, hgt * 0.14, Math.PI * 1.05, Math.PI * 1.95);
          c.stroke();
        }
        if (beard) {
          crayon('#4a2e1e', 7);
          c.beginPath();
          c.arc(x, top + hgt * 0.16, hgt * 0.11, 0.15 * Math.PI, 0.85 * Math.PI);
          c.stroke();
        }
        return { x, y: top + hgt * 0.42, arm: hgt * 0.2 };
      };
      const ps = [fig(250, 230, '#2f62c0', '#4a2e1e', true), fig(330, 205, '#c8457a', '#8a5a2e', false), fig(405, 150, '#e0702a', '#3b2a20', false), fig(465, 120, '#3aa04a', '#d9b04a', false)];
      // Mama: lange Haare
      crayon('#8a5a2e', 8);
      c.beginPath();
      c.moveTo(310, 140);
      c.lineTo(306, 200);
      c.moveTo(350, 140);
      c.lineTo(354, 200);
      c.stroke();
      // Hände halten (Arme verbinden)
      crayon('#2a2a2a', 6);
      c.beginPath();
      c.moveTo(ps[0].x - ps[0].arm, ps[0].y + 20);
      c.lineTo(ps[0].x, ps[0].y - 10);
      for (let i = 0; i < ps.length - 1; i++) {
        c.moveTo(ps[i].x, ps[i].y - 10);
        c.lineTo(ps[i + 1].x, ps[i + 1].y - 10);
      }
      c.stroke();
      // Herz über allen
      crayon('#e0304a', 6);
      c.beginPath();
      const hx = 360;
      const hy = 60;
      c.moveTo(hx, hy + 34);
      c.bezierCurveTo(hx - 56, hy - 4, hx - 24, hy - 46, hx, hy - 14);
      c.bezierCurveTo(hx + 24, hy - 46, hx + 56, hy - 4, hx, hy + 34);
      c.fill();
    });
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.004, 0.21), [mat(0xf4f0e6), mat(0xf4f0e6), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), mat(0xf4f0e6), mat(0xf4f0e6), mat(0xf4f0e6)]);
    paper.castShadow = true;
    paper.receiveShadow = true;
    const g = group(paper);
    paper.position.y = 0.002;
    return g;
  };
  // Leitplanke (Länge entlang z, Ursprung Mitte): Pfosten + Profilband; userData.setDent(k, z0) beult eine Stelle ein (−x)
  const guardrail = ({ length = 40, spacing = 2.0, color = 0xb8bec6 } = {}) => {
    const g = new THREE.Group();
    const m = mat(color, { roughness: 0.5, metalness: 0.4 });
    for (let z = -length / 2; z <= length / 2 + 1e-6; z += spacing) g.add(box(0.12, 0.75, 0.12, 0x6a6e74, [0.12, 0, z]));
    const segs = Math.round(length / 0.5);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, length, 1, 2, segs), m);
    beam.position.set(0, 0.6, 0);
    beam.castShadow = true;
    beam.receiveShadow = true;
    g.add(beam);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.05, length, 1, 1, segs), mat(0x888c92));
    stripe.position.set(0, 0.6, 0);
    g.add(stripe);
    const P = beam.geometry.attributes.position;
    const O = P.array.slice();
    const S = stripe.geometry.attributes.position;
    const SO = S.array.slice();
    g.userData.setDent = (k, z0 = 0, width = 3.0, depth = 0.55) => {
      for (const [A, B] of [[P, O], [S, SO]]) {
        for (let i = 0; i < A.count; i++) {
          const z = B[i * 3 + 2];
          const d = Math.abs(z - z0) / width;
          const f = d < 1 ? Math.cos((d * Math.PI) / 2) ** 2 : 0;
          A.array[i * 3] = B[i * 3] - k * depth * f;
        }
        A.needsUpdate = true;
      }
      beam.geometry.computeVertexNormals();
    };
    return g;
  };
  // Warnschild Kurve (gelbe Raute mit Pfeil, ohne Schrift)
  const curveSign = () => {
    const tex = canvasTex(256, 256, (c, W, H) => {
      c.fillStyle = '#f2c418';
      c.beginPath();
      c.moveTo(W / 2, 6);
      c.lineTo(W - 6, H / 2);
      c.lineTo(W / 2, H - 6);
      c.lineTo(6, H / 2);
      c.closePath();
      c.fill();
      c.lineWidth = 8;
      c.strokeStyle = '#111';
      c.stroke();
      c.lineWidth = 16;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(110, 190);
      c.bezierCurveTo(110, 130, 160, 140, 160, 90);
      c.stroke();
      c.fillStyle = '#111';
      c.beginPath();
      c.moveTo(160, 52);
      c.lineTo(188, 98);
      c.lineTo(132, 98);
      c.closePath();
      c.fill();
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: 0x444422, emissiveMap: tex, emissiveIntensity: 0.25 }));
    plate.position.set(0, 2.0, 0.04);
    return group(box(0.08, 2.0, 0.08, 0x777b80), plate);
  };
  // Rauch (Unfall): aufsteigende graue Würfel; s = Sekunden seit Beginn, k = Stärke
  const smoke = ({ count = 26, color = 0x9aa0a8 } = {}) => {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: 0.5, depthWrite: false });
    const parts = Array.from({ length: count }, (_, i) => {
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), m);
      g.add(p);
      return { p, a: rng.next(), b: rng.next(), c: rng.next(), i };
    });
    g.userData.update = (s, k = 1) => {
      g.visible = s >= 0 && k > 0.01;
      if (!g.visible) return;
      m.opacity = 0.42 * Math.min(1, k);
      for (const q of parts) {
        const life = 2.6;
        const x = ((s + q.a * life) % life) / life;
        q.p.position.set((q.b - 0.5) * 0.6 + x * 0.5, x * 2.4, (q.c - 0.5) * 0.6 - x * 0.3);
        q.p.scale.setScalar(0.4 + x * 1.6);
        q.p.rotation.set(x * 3 + q.a, x * 2, 0);
      }
    };
    g.userData.update(-1);
    return g;
  };
  // Fallendes/wehendes Laub (Friedhof): Instanzen kleiner Blätter, deterministisch aus t
  const leaves = ({ count = 60, size = [10, 5, 10], colors = [0xc98a3a, 0xa8642a, 0xd9b04a] } = {}) => {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(0.07, 0.01, 0.05);
    const items = Array.from({ length: count }, (_, i) => {
      const m = new THREE.Mesh(geo, mat(colors[i % colors.length]));
      g.add(m);
      return { m, a: rng.next(), b: rng.next(), c: rng.next() };
    });
    g.userData.update = (t, wind = 0.3) => {
      for (const q of items) {
        const fall = 0.5 + q.c * 0.4;
        const y = size[1] - ((t * fall + q.a * size[1]) % size[1]);
        const x = ((q.b * size[0] + t * wind * 1.6 + Math.sin(t * 1.3 + q.a * 6) * 0.25) % size[0]) - size[0] / 2;
        q.m.position.set(x, y, (q.c - 0.5) * size[2]);
        q.m.rotation.set(t * 2 + q.a * 6, t * 1.3 + q.b * 5, t * 1.7);
      }
    };
    return g;
  };

  // ---------- Wohnzimmer ----------
  const sofa = (color = 0x6a7f9a) => {
    const g = group(box(2.1, 0.42, 0.9, color), box(2.1, 0.5, 0.22, color, [0, 0.42, -0.34]));
    for (const sx of [-1, 1]) g.add(box(0.2, 0.62, 0.9, color - 0x0a0a0a, [sx * 0.95, 0, 0]));
    for (const sx of [-0.5, 0.5]) g.add(box(0.88, 0.1, 0.62, color + 0x080808, [sx, 0.42, 0.08]));
    g.add(box(0.36, 0.3, 0.12, 0xe0b23a, [-0.6, 0.5, -0.18]));
    return g;
  };
  const coffeeTable = () => {
    const g = group(box(1.1, 0.05, 0.6, 0x9a6a42, [0, 0.38, 0]));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.05, 0.38, 0.05, 0x7a4f2e, [sx * 0.5, 0, sz * 0.25]));
    return g;
  };
  const tv = () => {
    const g = group(box(1.5, 0.45, 0.4, 0x3a2a22));
    g.add(box(1.2, 0.68, 0.05, 0x111114, [0, 0.55, -0.05]));
    g.add(box(1.12, 0.6, 0.01, 0x2a4a6a, [0, 0.59, -0.02], { cast: false, mat: { emissive: 0x2a5a8a, emissiveIntensity: 0.45 } }));
    return g;
  };
  const floorLamp = (on = true) => {
    const g = group(box(0.3, 0.04, 0.3, 0x333333), box(0.04, 1.5, 0.04, 0x333333));
    g.add(box(0.4, 0.3, 0.4, 0xf5e6c8, [0, 1.45, 0], { mat: on ? { emissive: 0xffd49a, emissiveIntensity: 0.9 } : {} }));
    return g;
  };
  // Bilderrahmen mit Familienfoto (vier Würfelköpfe, lächelnd)
  const familyPhoto = ({ w = 0.5, h = 0.38 } = {}) => {
    const tex = canvasTex(320, 240, (c, W, H) => {
      const gr = c.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#9fc6e8');
      gr.addColorStop(1, '#e8d8b0');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      const head = (x, y, s, hair, skin = '#e8c4a0', beard = false) => {
        c.fillStyle = skin;
        c.fillRect(x - s / 2, y - s / 2, s, s * 1.1);
        c.fillStyle = hair;
        c.fillRect(x - s / 2 - 2, y - s / 2 - 6, s + 4, s * 0.3);
        if (beard) c.fillRect(x - s / 2, y + s * 0.3, s, s * 0.3);
        c.fillStyle = '#1f1a18';
        c.fillRect(x - s * 0.22, y - s * 0.02, s * 0.12, s * 0.14);
        c.fillRect(x + s * 0.1, y - s * 0.02, s * 0.12, s * 0.14);
        c.fillRect(x - s * 0.16, y + s * 0.3, s * 0.32, s * 0.06);
      };
      head(95, 110, 64, '#3b2a20', '#d9a77e', true);
      head(190, 115, 58, '#8a5a2e');
      head(140, 175, 44, '#3b2a20');
      head(230, 182, 38, '#d9b04a');
    });
    return group(box(w + 0.06, h + 0.06, 0.03, 0x5a3a24), box(w, h, 0.005, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), [0, 0.03, 0.017], { cast: false }));
  };
  // Haustür mit Scharnier (+x-Kante): userData.setOpen(k) 0…1
  const door = ({ color = 0x7a4a2e } = {}) => {
    const g = new THREE.Group();
    const leaf = new THREE.Group();
    leaf.position.x = 0.45;
    g.add(leaf);
    leaf.add(box(0.9, 2.05, 0.06, color, [-0.45, 0, 0]));
    leaf.add(cbox(0.05, 0.05, 0.08, 0xd9c070, [-0.82, 1.0, 0.04]));
    g.add(box(1.04, 0.08, 0.1, 0xf2f2f2, [0, 2.05, 0]));
    for (const sx of [-1, 1]) g.add(box(0.07, 2.1, 0.1, 0xf2f2f2, [sx * 0.49, 0, 0]));
    g.userData.setOpen = (k) => (leaf.rotation.y = -1.6 * k);
    return g;
  };
  // Schlüsselbund (Autoschlüssel + zwei Schlüssel am Ring)
  const keys = () => {
    const g = group(cbox(0.05, 0.022, 0.03, 0x1a1a1e, [0, 0, 0]));
    g.add(cbox(0.012, 0.012, 0.055, 0xc0c4ca, [0.01, 0, 0.045]), cbox(0.012, 0.012, 0.05, 0xd9b04a, [-0.015, 0, 0.04]));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 4, 10), mat(0xc0c4ca));
    ring.rotation.x = Math.PI / 2;
    ring.position.z = 0.02;
    g.add(ring);
    return g;
  };
  const sideboard = (color = 0xe8e2d6) => group(box(1.2, 0.85, 0.42, color), box(0.3, 0.06, 0.2, 0x8a5a36, [0.3, 0.85, 0]));
  const toyBlocks = () => {
    const g = new THREE.Group();
    [[0, 0, 0, 0xe0303a], [0.13, 0, 0.02, 0x2f62c0], [0.06, 0.11, 0.01, 0xf2c418], [-0.16, 0, 0.12, 0x3aa04a]].forEach(([x, y, z, c]) => g.add(box(0.11, 0.11, 0.11, c, [x, y, z])));
    return g;
  };
  // Einfamilienhaus (Fassade nach +z), Fenster beleuchtet, Haustür, Vordach-Lampe, Einfahrt
  const house = ({ w = 9, h = 5.6, color = 0xe8dcc8, roof = 0x5a3a34, lit = 1 } = {}) => {
    const g = group(box(w, h, 7, color, [0, 0, -3.5]));
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.9, 2.4, 4, 1), mat(roof));
    rf.rotation.y = Math.PI / 4;
    rf.scale.set(w / 6.9, 1, 7 / 6.9);
    rf.position.set(0, h + 1.2, -3.5);
    rf.castShadow = true;
    g.add(rf);
    const winLit = new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffc878, emissiveIntensity: 1.1 * lit });
    for (const [x, y] of [[-2.8, 0.9], [2.6, 0.9], [-2.8, 3.4], [0.2, 3.4], [2.6, 3.4]]) {
      g.add(box(1.3, 1.3, 0.05, winLit, [x, y, 0.02], { cast: false }));
      g.add(box(1.45, 0.1, 0.14, 0xf4f4f4, [x, y - 0.06, 0.05], { cast: false }));
      g.add(box(0.06, 1.3, 0.07, 0xf4f4f4, [x, y, 0.06], { cast: false }));
    }
    const d = door({ color: 0x3a4a6a });
    d.position.set(-0.6, 0, 0.04);
    g.add(d);
    g.add(box(1.8, 0.1, 1.0, 0x9a9ea4, [-0.6, 0, 0.6]));
    g.add(box(1.6, 0.08, 0.8, 0x5a3a34, [-0.6, 2.5, 0.42]));
    const porch = cbox(0.18, 0.18, 0.12, 0xfff2cc, [0.6, 2.2, 0.08], { mat: { emissive: 0xffd890, emissiveIntensity: 2.0 } });
    g.add(porch);
    g.userData.door = d;
    g.userData.porch = porch;
    return g;
  };

  // ---------- Textkarte im Bild (Schwarzbild-Botschaft) ----------
  // Sprite (immer zur Kamera), unbeleuchtet, ohne Nebel/Tonemapping. Text kommt aus text.<lang>.json (Szene).
  // highlight = Wort in Signalfarbe. userData.setOpacity(a).
  const textCard = ({ text = '', highlight = '', width = 1.6, size = 92, color = '#FFFFFF', accent = '#F5C04A', font = 'Fraunces', weight = 600 } = {}) => {
    const PX = 1024;
    const H = 512;
    const tex = canvasTex(PX, H, (g, W, Hh) => {
      g.clearRect(0, 0, W, Hh);
      g.font = `${weight} ${size}px "${font}", serif`;
      g.textBaseline = 'middle';
      const words = text.split(/\s+/).filter(Boolean);
      const rows = [];
      let row = [];
      for (const w of words) {
        const test = [...row, w].join(' ');
        if (row.length && g.measureText(test).width > W * 0.92) { rows.push(row); row = [w]; } else row.push(w);
      }
      if (row.length) rows.push(row);
      const lh = size * 1.18;
      let y = Hh / 2 - ((rows.length - 1) * lh) / 2;
      for (const r of rows) {
        const full = r.join(' ');
        let x = (W - g.measureText(full).width) / 2;
        for (let i = 0; i < r.length; i++) {
          const w = r[i] + (i < r.length - 1 ? ' ' : '');
          const bare = r[i].replace(/[^\p{L}\p{N}'’-]/gu, '');
          g.fillStyle = highlight && bare.toLowerCase() === highlight.toLowerCase() ? accent : color;
          g.fillText(w, x, y);
          x += g.measureText(w).width;
        }
        y += lh;
      }
    });
    const m = new THREE.SpriteMaterial({ map: tex, transparent: true, fog: false, toneMapped: false, depthTest: false, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(m);
    s.scale.set(width, (width * H) / PX, 1);
    s.renderOrder = 10;
    s.userData.setOpacity = (a) => { m.opacity = a; s.visible = a > 0.001; };
    s.userData.setOpacity(0);
    return s;
  };

  return {
    sportsCar, gravestone, gravePlot, flowers, drawing, guardrail, curveSign, smoke, leaves,
    sofa, coffeeTable, tv, floorLamp, familyPhoto, door, keys, sideboard, toyBlocks, house, textCard,
  };
}
