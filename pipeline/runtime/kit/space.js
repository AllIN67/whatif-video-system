// Weltraum-Teile für den Baukasten: Erdkugel (stilisiert), Atmosphären-Saum, Wolkenschicht, Sternenfelder
// mit Parallaxe, Markierungen auf der Oberfläche. Alles deterministisch (Zufall nur über rng).
//
//   const land = await fetchJson('/pipeline/runtime/kit/assets/land_50m.json');   // Natural Earth, gemeinfrei
//   const earth = kit.space.globe({ land, radius: 10 });
//   scene.add(earth.root);
//   earth.setSpin(angle);          // Drehung um die Erdachse (Bogenmaß, positiv = nach Osten)
//   earth.clouds.rotation.y = …;   // Wolken eigenständig (z. B. bewegen sich weiter, wenn die Erde stoppt)
//   const p = earth.surface(40.71, -74.0);   // Punkt (lokal, dreht mit) für Breite/Länge
//   const stars = kit.space.stars({ layers: [[900, 300, 2.2], [700, 600, 1.6], [1400, 1100, 1.2]] });
//
// Koordinaten: Nordpol = +y. Länge 0° = +x, 90° Ost = −z (passend zur UV-Abbildung von THREE.SphereGeometry).

export function createSpace(THREE, core, rng) {
  const deg = Math.PI / 180;
  const latLon = (lat, lon, r = 1) => new THREE.Vector3(r * Math.cos(lat * deg) * Math.cos(lon * deg), r * Math.sin(lat * deg), -r * Math.cos(lat * deg) * Math.sin(lon * deg));

  const canvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  // Wertrauschen mit horizontal periodischem Gitter (nahtlos um die Kugel)
  const makeNoise = (px, py) => {
    const g = new Float32Array(px * py);
    for (let i = 0; i < g.length; i++) g[i] = rng.next();
    const at = (x, y) => g[(((y % py) + py) % py) * px + (((x % px) + px) % px)];
    const sm = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      // x, y in Gitterzellen
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const fx = sm(x - xi);
      const fy = sm(y - yi);
      const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * fx;
      const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * fx;
      return a + (b - a) * fy;
    };
  };
  const fbm = (w, h, { cells = 8, octaves = 5, stretchX = 1 } = {}) => {
    const layers = [];
    for (let o = 0; o < octaves; o++) {
      const cx = Math.round(cells * 2 ** o);
      const cy = Math.max(2, Math.round((cells * 2 ** o) / 2 / stretchX));
      layers.push({ n: makeNoise(cx, cy), cx, cy, a: 0.5 ** o });
    }
    const out = new Float32Array(w * h);
    let norm = 0;
    for (const l of layers) norm += l.a;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let v = 0;
        for (const l of layers) v += l.a * l.n((x / w) * l.cx, (y / h) * l.cy);
        out[y * w + x] = v / norm;
      }
    }
    return out;
  };

  // Equirektangulare Erdtextur aus Landpolygonen: Ozean mit Flachwasser-Saum, Land nach Breite getönt, Eis.
  const earthTexture = (land, { w = 4096, h = 2048 } = {}) => {
    const c = canvas(w, h);
    const g = c.getContext('2d');
    const X = (lon) => ((lon + 180) / 360) * w;
    const Y = (lat) => ((90 - lat) / 180) * h;
    // Ozean: dunkler zu den Polen
    const og = g.createLinearGradient(0, 0, 0, h);
    og.addColorStop(0, '#0d2d5e');
    og.addColorStop(0.5, '#1458a8');
    og.addColorStop(1, '#0d2d5e');
    g.fillStyle = og;
    g.fillRect(0, 0, w, h);
    const path = () => {
      g.beginPath();
      for (const poly of land.polygons) {
        for (let i = 0; i < poly.length; i += 2) {
          const x = X(poly[i]);
          const y = Y(poly[i + 1]);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.closePath();
      }
    };
    // Flachwasser-Saum
    path();
    g.strokeStyle = 'rgba(70,170,220,0.55)';
    g.lineWidth = 14;
    g.lineJoin = 'round';
    g.stroke();
    g.strokeStyle = 'rgba(110,200,235,0.6)';
    g.lineWidth = 6;
    g.stroke();
    // Land
    path();
    g.fillStyle = '#4f9a4a';
    g.fill();
    g.save();
    path();
    g.clip();
    // Breitengrad-Tönung: Trockengürtel (15–35°) sandfarben, Tundra hell, Pole weiß
    const lg = g.createLinearGradient(0, 0, 0, h);
    const stop = (lat, col) => lg.addColorStop((90 - lat) / 180, col);
    stop(90, 'rgba(244,248,252,1)');
    stop(72, 'rgba(236,242,248,1)');
    stop(64, 'rgba(160,170,140,0.9)');
    stop(52, 'rgba(70,128,70,0.0)');
    stop(36, 'rgba(201,170,104,0.0)');
    stop(26, 'rgba(206,172,108,0.85)');
    stop(16, 'rgba(160,160,90,0.25)');
    stop(4, 'rgba(40,120,60,0.15)');
    stop(-12, 'rgba(60,130,60,0.0)');
    stop(-24, 'rgba(201,165,100,0.7)');
    stop(-34, 'rgba(120,140,80,0.2)');
    stop(-56, 'rgba(120,150,110,0.3)');
    stop(-64, 'rgba(240,244,250,1)');
    stop(-90, 'rgba(250,252,255,1)');
    g.fillStyle = lg;
    g.fillRect(0, 0, w, h);
    // Struktur: weiche Flecken (geseedet)
    for (let i = 0; i < 2600; i++) {
      const x = rng.range(0, w);
      const y = rng.range(h * 0.08, h * 0.92);
      const r = rng.range(6, 38);
      g.fillStyle = rng.next() < 0.5 ? 'rgba(30,80,30,0.10)' : 'rgba(230,210,150,0.08)';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    // Küstenlinie fein
    path();
    g.strokeStyle = 'rgba(20,50,30,0.35)';
    g.lineWidth = 1.5;
    g.stroke();
    // Arktisches Meereis um den Nordpol
    const ice = g.createLinearGradient(0, 0, 0, Y(70));
    ice.addColorStop(0, 'rgba(242,247,252,1)');
    ice.addColorStop(0.55, 'rgba(232,240,248,0.95)');
    ice.addColorStop(1, 'rgba(220,235,248,0)');
    g.fillStyle = ice;
    g.fillRect(0, 0, w, Y(70));
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  };

  // Wolken (RGBA): fbm mit Schwelle; stretchX > 1 → Schlieren (Sturm)
  const cloudTexture = ({ w = 1024, h = 512, cover = 0.52, stretchX = 1, color = [255, 255, 255], alpha = 0.95 } = {}) => {
    const n = fbm(w, h, { cells: 6, octaves: 5, stretchX });
    const c = canvas(w, h);
    const g = c.getContext('2d');
    const img = g.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const y = Math.floor(i / w) / h;
      const polar = Math.sin(y * Math.PI); // weniger Wolken direkt an den Polen
      const v = Math.min(1, Math.max(0, (n[i] - cover) / 0.18)) * (0.35 + 0.65 * polar);
      img.data[4 * i] = color[0];
      img.data[4 * i + 1] = color[1];
      img.data[4 * i + 2] = color[2];
      img.data[4 * i + 3] = Math.round(255 * alpha * v);
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // Atmosphären-Saum: äußerer Schein (Rückseite) + innerer Rand (Vorderseite), additiv
  const atmosphere = (radius, { color = 0x5fb4ff, scale = 1.16, strength = 1.0 } = {}) => {
    const col = new THREE.Color(color);
    const outer = new THREE.Mesh(
      new THREE.SphereGeometry(radius * scale, 96, 64),
      new THREE.ShaderMaterial({
        uniforms: { col: { value: col }, k: { value: strength } },
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform vec3 col; uniform float k; varying vec3 vN; void main(){ float i = pow(clamp(0.78 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.2); gl_FragColor = vec4(col * i * 2.2 * k, 1.0); }',
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      }),
    );
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.015, 96, 64),
      new THREE.ShaderMaterial({
        uniforms: { col: { value: col }, k: { value: strength } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform vec3 col; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float r = 1.0 - max(dot(vN, vV), 0.0); gl_FragColor = vec4(col * pow(r, 3.0) * 1.3 * k, 1.0); }',
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      }),
    );
    const g = new THREE.Group();
    g.add(outer, inner);
    g.userData.setStrength = (s) => {
      outer.material.uniforms.k.value = s;
      inner.material.uniforms.k.value = s;
    };
    return g;
  };

  const globe = ({ land, radius = 10, segments = 160, clouds = true } = {}) => {
    if (!land?.polygons) throw new Error('globe: land (Polygone) fehlt');
    const root = new THREE.Group();
    const spin = new THREE.Group(); // dreht mit der Erde
    root.add(spin);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments / 2), new THREE.MeshStandardMaterial({ map: earthTexture(land), roughness: 0.82, metalness: 0 }));
    earth.receiveShadow = false;
    earth.castShadow = false;
    spin.add(earth);
    let cloudMesh = null;
    if (clouds) {
      cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.012, segments, segments / 2), new THREE.MeshStandardMaterial({ map: cloudTexture(), transparent: true, depthWrite: false, roughness: 1 }));
      root.add(cloudMesh); // eigenständig – nicht in spin
    }
    const atmo = atmosphere(radius);
    root.add(atmo);
    const api = {
      root,
      spin,
      earth,
      clouds: cloudMesh,
      atmo,
      radius,
      setSpin(a) {
        spin.rotation.y = a;
        return api;
      },
      // lokaler Oberflächenpunkt (in spin-Koordinaten)
      surface: (lat, lon, h = 0) => latLon(lat, lon, radius + h),
      // Weltposition eines Oberflächenpunkts bei aktueller Drehung
      world(lat, lon, h = 0) {
        root.updateMatrixWorld(true);
        return api.surface(lat, lon, h).applyMatrix4(spin.matrixWorld);
      },
      // Markierung (Stecknadel + pulsierender Ring), dreht mit der Erde
      marker(lat, lon, { color = 0xff3b30, size = 0.35 } = {}) {
        const m = new THREE.Group();
        const glow = new THREE.MeshBasicMaterial({ color, toneMapped: false });
        const head = new THREE.Mesh(new THREE.SphereGeometry(size * 0.55, 20, 14), glow);
        head.position.y = size * 1.9;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.12, size * 0.04, size * 1.9, 10), glow);
        stem.position.y = size * 0.95;
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
        const ring = new THREE.Mesh(new THREE.RingGeometry(size * 0.7, size * 0.95, 48), ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        m.add(head, stem, ring);
        const p = latLon(lat, lon, radius);
        m.position.copy(p);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize());
        spin.add(m);
        m.userData.pulse = (t) => {
          const k = (t * 1.2) % 1;
          ring.scale.setScalar(1 + k * 2.2);
          ringMat.opacity = 0.85 * (1 - k);
        };
        return m;
      },
    };
    return api;
  };

  // Sterne in mehreren Kugelschalen (verschiedene Entfernungen → Parallaxe bei Kamerafahrten)
  const starSprite = (() => {
    let tex = null;
    return () => {
      if (tex) return tex;
      const c = canvas(64, 64);
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.25, 'rgba(255,255,255,0.85)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      tex = new THREE.CanvasTexture(c);
      return tex;
    };
  })();
  const stars = ({ layers = [[1200, 300, 2.4], [900, 600, 1.8], [1800, 1100, 1.3]], center = [0, 0, 0] } = {}) => {
    const g = new THREE.Group();
    for (const [count, r, size] of layers) {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = rng.range(-1, 1);
        const a = rng.range(0, Math.PI * 2);
        const s = Math.sqrt(1 - u * u);
        const rr = r * rng.range(0.9, 1.1);
        pos.set([center[0] + rr * s * Math.cos(a), center[1] + rr * u, center[2] + rr * s * Math.sin(a)], 3 * i);
        const b = rng.range(0.45, 1);
        const tint = rng.next();
        col.set(tint < 0.2 ? [b * 0.75, b * 0.85, b] : tint > 0.9 ? [b, b * 0.9, b * 0.75] : [b, b, b], 3 * i);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const m = new THREE.Points(geo, new THREE.PointsMaterial({ size: size * 2.2, sizeAttenuation: false, map: starSprite(), vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, alphaTest: 0.02 }));
      g.add(m);
    }
    return g;
  };

  return { globe, stars, atmosphere, cloudTexture, earthTexture, latLon, fbm };
}
