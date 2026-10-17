// =============================================
//  弾丸合併  3D の見た目（Three.js）
//  ・計算は真上から見た2D。見た目だけ立体にする
//  ・紙の地図のような面 ＋ 回る所は金属のつや
//  ・視点：おまかせ（自動）／自由（ドラッグ・ピンチ）／真上
// =============================================
(function () {
  const DG = window.DG;
  const V3 = DG.V3 = {};
  const H_BASE = 0.3, TH = 0.3, GAP = 0.13;           // 下段の底の高さ・段の厚さ・すき間
  const LAYER_Y = [H_BASE + 2 * (TH + GAP), H_BASE + (TH + GAP), H_BASE];   // 上・中・下
  const TEAM = [0xd8402f, 0x3f6fc9], TEAM_D = [0x8e1d14, 0x16357a];
  // 段ごとの色：上段 オレンジ、中段 チームの色（赤・青）、下段 緑（作る画面・2D とそろえる）
  const FACE = s => [0xf3a645, s ? 0x5f8fe6 : 0xec6a52, 0x52b48a];
  const EDGE = s => [s ? 0x2c4f9e : 0xb8761c, TEAM[s], s ? 0x1f7a6a : 0x2f8a5f];
  const SCAR = 0xffe08a;   // 削れた断面（金色っぽく光る）
  let T, R, scene, cam, ctl, env, arena, root, ok = false, W = 1, Hh = 1;
  let tops = [], flying = [], sparks = [], mode = 'auto', shake = 0, autoA = 0.6, camT = null;
  V3.ok = () => ok;
  // ---------- 紙の地図の模様（経線・緯線と、うすい等高線） ----------
  function paperTex(tint) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#' + tint.toString(16).padStart(6, '0'); g.fillRect(0, 0, 256, 256);
    // 紙のむら
    let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,90,50,${r() * 0.05})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3); }
    g.strokeStyle = 'rgba(90,70,40,.22)'; g.lineWidth = 1.2;
    for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
    g.strokeStyle = 'rgba(150,110,60,.13)'; g.lineWidth = 1;
    for (let k = 0; k < 5; k++) { g.beginPath(); for (let a = 0; a <= 64; a++) { const t = a / 64 * Math.PI * 2, rr = 30 + k * 22 + Math.sin(t * 3 + k) * 6; const x = 128 + Math.cos(t) * rr, y = 128 + Math.sin(t) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(0.55, 0.55); tx.anisotropy = 4;
    return tx;
  }
  function arenaTex() {
    const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
    const gr = g.createRadialGradient(512, 512, 40, 512, 512, 512); gr.addColorStop(0, '#c9dbe0'); gr.addColorStop(0.75, '#a9c4cc'); gr.addColorStop(1, '#86a6b0');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(110,80,40,${r() * 0.04})`; g.fillRect(r() * 1024, r() * 1024, 1 + r() * 4, 1 + r() * 4); }
    // 地図の等高線のような輪
    g.strokeStyle = 'rgba(40,70,90,.25)'; g.lineWidth = 2;
    for (let k = 1; k <= 7; k++) { g.beginPath(); for (let a = 0; a <= 128; a++) { const t = a / 128 * Math.PI * 2, rr = k * 66 + Math.sin(t * 5 + k * 1.7) * 7 + Math.sin(t * 2 + k) * 9; const x = 512 + Math.cos(t) * rr, y = 512 + Math.sin(t) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.strokeStyle = 'rgba(30,60,80,.22)'; g.lineWidth = 2; g.setLineDash([10, 10]);
    for (let i = 0; i < 12; i++) { const t = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(512, 512); g.lineTo(512 + Math.cos(t) * 500, 512 + Math.sin(t) * 500); g.stroke(); }
    g.setLineDash([]);
    g.fillStyle = 'rgba(216,64,47,.85)'; g.beginPath(); g.arc(512, 512, 10, 0, Math.PI * 2); g.fill();
    const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4; return tx;
  }
  // すり鉢の高さ（見た目だけ）
  const bowl = r => 0.045 * r * r / 8;
  // ---------- はじめ ----------
  V3.init = function (canvas, opt) {
    T = window.THREE; if (!T || !T.WebGLRenderer) return false;
    try {
      R = new T.WebGLRenderer({ canvas, antialias: !(opt && opt.low), alpha: false, powerPreference: 'high-performance' });
    } catch (e) { return false; }
    if (!R.getContext()) return false;
    const low = !!(opt && opt.low);
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 2));
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 0.9;
    R.shadowMap.enabled = !low; R.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene(); scene.background = new T.Color(0x2a211b); scene.fog = new T.Fog(0x2a211b, 30, 60);
    if (T.RoomEnvironment) { const pm = new T.PMREMGenerator(R); env = pm.fromScene(new T.RoomEnvironment(), 0.04).texture; scene.environment = env; }
    cam = new T.PerspectiveCamera(42, 1, 0.1, 120); cam.position.set(0, 9, 11);
    scene.add(new T.HemisphereLight(0xfff4e0, 0x3a2a1a, 0.35));
    const sun = new T.DirectionalLight(0xfff6e8, 1.6); sun.position.set(-5, 12, 6); sun.castShadow = !low;
    sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = sc.bottom = -10; sc.right = sc.top = 10; sc.near = 1; sc.far = 30; sun.shadow.bias = -0.0008;
    scene.add(sun);
    // 土俵（すり鉢）
    const pts = []; for (let i = 0; i <= 24; i++) { const r = i / 24 * (DG.R_ARENA + 0.6); pts.push(new T.Vector2(r, bowl(r))); }
    pts.push(new T.Vector2(DG.R_ARENA + 0.6, bowl(DG.R_ARENA + 0.6) + 0.5));
    const lg = new T.LatheGeometry(pts, 96);
    // 上から見て中心が真ん中になるよう uv を作りなおす
    const pa = lg.attributes.position, uv = lg.attributes.uv; const RR = DG.R_ARENA + 0.6;
    for (let i = 0; i < pa.count; i++) uv.setXY(i, 0.5 + pa.getX(i) / RR / 2, 0.5 - pa.getZ(i) / RR / 2);
    arena = new T.Mesh(lg, new T.MeshStandardMaterial({ map: arenaTex(), roughness: 0.95, side: T.DoubleSide, envMapIntensity: 0.35 }));
    arena.receiveShadow = true; scene.add(arena);
    const rim = new T.Mesh(new T.TorusGeometry(DG.R_ARENA + 0.62, 0.16, 12, 96), new T.MeshStandardMaterial({ color: 0x5a3c22, metalness: 0.2, roughness: 0.55, envMapIntensity: 0.25 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = bowl(RR) + 0.5; scene.add(rim);
    const base = new T.Mesh(new T.CylinderGeometry(RR + 1.6, RR + 2.2, 1.2, 64), new T.MeshStandardMaterial({ color: 0x3a2a1d, roughness: 0.9, envMapIntensity: 0.15 }));
    base.position.y = -0.62; base.receiveShadow = true; scene.add(base);
    root = new T.Group(); scene.add(root);
    if (T.OrbitControls) {
      ctl = new T.OrbitControls(cam, canvas); ctl.enableDamping = true; ctl.dampingFactor = 0.12; ctl.enablePan = false;
      ctl.minDistance = 4; ctl.maxDistance = 34; ctl.maxPolarAngle = Math.PI * 0.47;
      ctl.addEventListener('start', () => { if (mode !== 'free') { mode = 'free'; V3.onMode && V3.onMode(mode); } });
    }
    ok = true; V3.low = low; return true;
  };
  V3.resize = function (w, h) { if (!ok) return; W = w; Hh = h; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 0.8 ? 55 : 42; cam.updateProjectionMatrix(); };
  V3.setMode = function (m) {
    mode = m; if (!ok) return;
    if (ctl) ctl.enabled = m !== 'top';
    camT = null; V3.onMode && V3.onMode(mode);
  };
  V3.mode = () => mode;
  // 決まった位置から写す（宣伝の画像づくり用）
  V3.setCam = function (p, t) { if (!ok) return; mode = 'fixed'; cam.position.set(p[0], p[1], p[2]); cam.up.set(0, 1, 0); cam.lookAt(t[0], t[1], t[2]); if (ctl) { ctl.target.set(t[0], t[1], t[2]); ctl.enabled = false; } };
  // 重いときに軽くする（影なし・解像度を下げる）
  V3.degrade = function () { if (!ok) return; V3.low = true; R.setPixelRatio(1); R.shadowMap.enabled = false; scene.traverse(x => { if (x.material) x.material.needsUpdate = true; }); R.setSize(W, Hh, false); };
  // ---------- コマの立体 ----------
  function fragGeo(f) {
    const sh = new T.Shape(); const p = f.poly;
    sh.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) sh.lineTo(p[i], p[i + 1]); sh.closePath();
    const g = new T.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false, curveSegments: 1 });
    g.rotateX(Math.PI / 2); g.translate(0, TH, 0);
    return g;
  }
  const matCache = {};
  function mats(side, tier) {
    const k = side + '_' + tier; if (matCache[k]) return matCache[k];
    const face = new T.MeshStandardMaterial({ map: paperTex(FACE(side)[tier]), roughness: 0.7, metalness: 0.05, envMapIntensity: 0.45 });
    const edge = new T.MeshStandardMaterial({ color: EDGE(side)[tier], metalness: 0.9, roughness: tier === 1 ? 0.2 : 0.28, envMapIntensity: 1.3 });
    return (matCache[k] = [face, edge]);
  }
  // 削れた所のとなり：側面を金色に光らせる
  function scarMats(side, tier) {
    const k = 's' + side + '_' + tier; if (matCache[k]) return matCache[k];
    const scar = new T.MeshStandardMaterial({ color: SCAR, emissive: 0xffb02e, emissiveIntensity: 0.55, metalness: 0.6, roughness: 0.35 });
    return (matCache[k] = [mats(side, tier)[0], scar]);
  }
  const lineMat = () => V3._lm || (V3._lm = new T.LineBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.55 }));
  function buildTop(o) {
    const g = new T.Group(), tilt = new T.Group(), spin = new T.Group();
    g.add(tilt); tilt.add(spin);
    const meshes = new Map();
    o.layers.forEach(L => {
      const lg = new T.Group(); lg.position.y = LAYER_Y[L.tier]; spin.add(lg);
      for (const f of L.frags) {
        const geo = fragGeo(f), m = new T.Mesh(geo, mats(o.side, L.tier));
        m.castShadow = true; m.receiveShadow = true;
        if (!V3.low) { const e = new T.LineSegments(new T.EdgesGeometry(geo, 35), lineMat()); m.add(e); }
        lg.add(m); meshes.set(f, m);
      }
    });
    // 軸（弾丸）
    const metal = new T.MeshStandardMaterial({ color: 0xd9dde3, metalness: 1, roughness: 0.18 });
    const top = LAYER_Y[0] + TH + 0.32;
    const shaft = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, top - 0.1, 16), metal); shaft.position.y = (top + 0.1) / 2; shaft.castShadow = true; spin.add(shaft);
    const tip = new T.Mesh(new T.ConeGeometry(0.16, 0.26, 16), metal); tip.rotation.x = Math.PI; tip.position.y = 0.13; spin.add(tip);
    const capM = new T.MeshStandardMaterial({ color: TEAM[o.side], emissive: TEAM[o.side], emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.25 });
    const cap = new T.Mesh(new T.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), capM);
    cap.position.y = top; spin.add(cap);
    // 回転の残像：段ごとの色のうすい輪（回っている向きに関係なく、tilt の中に置く）
    const rings = o.layers.map(L => {
      let r = 0; for (const f of L.frags) r = Math.max(r, Math.hypot(f.cx, f.cy) + f.r);
      const rm = new T.Mesh(new T.RingGeometry(r * 0.8, r, 56, 1), new T.MeshBasicMaterial({ color: FACE(o.side)[L.tier], transparent: true, opacity: 0.2, depthWrite: false, side: T.DoubleSide }));
      rm.rotation.x = -Math.PI / 2; rm.position.y = LAYER_Y[L.tier] + TH + 0.015; rm.userData.r0 = r; tilt.add(rm);
      return { L, m: rm };
    });
    root.add(g);
    return { o, g, tilt, spin, meshes, rings, capM, kick: 0, kx: 0, kz: 0 };
  }
  V3.clear = function () {
    if (!ok) return;
    for (const t of tops) { root.remove(t.g); t.g.traverse(x => { if (x.geometry) x.geometry.dispose(); }); }
    for (const f of flying) { root.remove(f.m); f.m.geometry.dispose(); }
    for (const s of sparks) { root.remove(s.p); s.p.geometry.dispose(); }
    tops = []; flying = []; sparks = [];
  };
  V3.setMatch = function (m) { if (!ok) return; V3.clear(); tops = [buildTop(m.A), buildTop(m.B)]; V3.m = m; autoA = 0.6; };
  // ---------- 火花 ----------
  function spark(x, y, v, big, col) {
    const n = big ? 60 : 24, pos = new Float32Array(n * 3), vel = [];
    let s = (x * 1000 + y * 7) | 0; const r = () => (s = (s * 16807 + 11) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = LAYER_Y[1] + 0.1; pos[i * 3 + 2] = y; const a = r() * 6.283, sp = (2 + r() * 5) * Math.min(2, 0.5 + v / 12); vel.push(Math.cos(a) * sp, 1 + r() * 4, Math.sin(a) * sp); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const p = new T.Points(geo, new T.PointsMaterial({ color: big ? 0xffffff : (col != null ? col : 0xffd65a), size: big ? 0.16 : 0.11, transparent: true, opacity: 1, depthWrite: false, blending: T.AdditiveBlending }));
    root.add(p); sparks.push({ p, vel, t: 0, life: big ? 0.9 : 0.5 });
  }
  V3.event = function (ev) {
    if (!ok) return;
    if (ev.k === 'hit') {
      // 火花：当たった段の色と、金色の火花
      const la = ev.lay || [1, 1];
      spark(ev.x, ev.y, ev.v, ev.burst.length > 0);
      if (!V3.low) { spark(ev.x, ev.y, ev.v * 0.8, false, FACE(0)[la[0]]); spark(ev.x, ev.y, ev.v * 0.8, false, FACE(1)[la[1]]); }
      shake = Math.max(shake, Math.min(0.35, ev.v / 60 + (ev.burst.length ? 0.4 : 0)));
      for (const t of tops) { const dx = t.o.x - ev.x, dy = t.o.y - ev.y, l = Math.hypot(dx, dy) || 1; t.kick = Math.min(0.5, t.kick + ev.v / 70); t.kx = dx / l; t.kz = dy / l; }
    }
  };
  // ---------- 毎フレーム ----------
  V3.frame = function (dt) {
    if (!ok) return;
    const m = V3.m;
    if (m) for (const t of tops) {
      const o = t.o;
      t.g.position.set(o.x, bowl(Math.hypot(o.x, o.y)), o.y);
      t.spin.rotation.y = -o.th;
      // かたむき：重心のずれ（いっしょに回る）＋ 当たったときのゆれ
      const [wx, wy] = [o.c * o.comx - o.s * o.comy, o.s * o.comx + o.c * o.comy];
      const wa = Math.min(0.32, Math.hypot(wx, wy) * 0.35) + 0.02;
      const wl = Math.hypot(wx, wy) || 1;
      t.kick *= Math.pow(0.02, dt);
      const tx = wx / wl * wa + t.kx * t.kick, tz = wy / wl * wa + t.kz * t.kick;
      t.tilt.rotation.set(tz, 0, -tx);
      // 残像の輪：削れて小さくなった段は輪も小さく。速く動くほど濃い
      const sp = Math.hypot(o.vx, o.vy);
      for (const R of t.rings) {
        if (R.L.burst) { R.m.visible = false; continue; }
        let r = 0, n = 0; for (const f of R.L.frags) if (f.alive) { r = Math.max(r, Math.hypot(f.cx, f.cy) + f.r); n++; }
        if (!n) { R.m.visible = false; continue; }
        const k = r / R.m.userData.r0; R.m.scale.set(k, k, 1);
        R.m.material.opacity = 0.16 + Math.min(0.14, sp * 0.015) + 0.04 * Math.sin(o.th * 3);
      }
      t.capM.emissiveIntensity = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(o.th * 2));
      // 割れた欠片を飛ばす
      for (const [f, mesh] of t.meshes) {
        if (f.alive || !mesh.parent || mesh.userData.gone) continue;
        mesh.userData.gone = true;
        // となりの残っている欠片は、削れた断面が見えるよう側面を金色に
        const L = o.layers[f.layer];
        for (const n of f.nb) { const g = L.frags[n]; if (g && g.alive) { const mm = t.meshes.get(g); if (mm && !mm.userData.scar) { mm.userData.scar = true; mm.material = scarMats(o.side, f.layer); } } }
        mesh.updateWorldMatrix(true, false);
        const wp = new T.Vector3(), wq = new T.Quaternion(), ws = new T.Vector3(); mesh.matrixWorld.decompose(wp, wq, ws);
        mesh.parent.remove(mesh); mesh.position.copy(wp); mesh.quaternion.copy(wq); root.add(mesh);
        const d = m.debris.find(x => x.f === f);
        const k = (f.seed * 2654435761 >>> 0) / 4294967296;
        flying.push({ m: mesh, vx: d ? d.vx : o.vx, vy: 2.5 + k * 4, vz: d ? d.vy : o.vy, ax: (k - 0.5) * 14, az: (0.5 - k) * 10, t: 0 });
      }
    }
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i]; f.t += dt; f.vy -= 14 * dt;
      f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.position.z += f.vz * dt;
      f.m.rotation.x += f.ax * dt; f.m.rotation.z += f.az * dt;
      const r = Math.hypot(f.m.position.x, f.m.position.z);
      if (r < DG.R_ARENA + 0.5 && f.m.position.y < bowl(r) && f.vy < 0) { f.m.position.y = bowl(r); f.vy *= -0.35; f.vx *= 0.6; f.vz *= 0.6; f.ax *= 0.5; f.az *= 0.5; }
      if (f.t > 2.4 || f.m.position.y < -6) { root.remove(f.m); f.m.geometry.dispose(); flying.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.t += dt; const a = s.p.geometry.attributes.position;
      for (let k = 0; k < a.count; k++) { s.vel[k * 3 + 1] -= 12 * dt; a.setXYZ(k, a.getX(k) + s.vel[k * 3] * dt, a.getY(k) + s.vel[k * 3 + 1] * dt, a.getZ(k) + s.vel[k * 3 + 2] * dt); }
      a.needsUpdate = true; s.p.material.opacity = Math.max(0, 1 - s.t / s.life);
      if (s.t > s.life) { root.remove(s.p); s.p.geometry.dispose(); s.p.material.dispose(); sparks.splice(i, 1); }
    }
    camera(dt);
    R.render(scene, cam);
  };
  function camera(dt) {
    let cx = 0, cz = 0, sep = 6;
    if (tops.length === 2) { const a = tops[0].o, b = tops[1].o; cx = (a.x + b.x) / 2; cz = (a.y + b.y) / 2; sep = Math.hypot(a.x - b.x, a.y - b.y) + a.reach + b.reach; }
    else if (tops.length === 1) { const a = tops[0].o; cx = a.x; cz = a.y; sep = a.reach * 2 + 2; }
    shake *= Math.pow(0.004, dt);
    const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
    if (mode === 'auto') {
      autoA += dt * 0.12;
      // 2つとも画面に入る距離（横の画角も考える）
      const asp = W / Hh, vf = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * asp), f = Math.min(vf, hf);
      const d = Math.max(7, Math.min(30, (sep / 2 + 0.8) / Math.tan(f) * 0.95));
      const want = new T.Vector3(cx * 0.6 + Math.sin(autoA) * d * 0.62, d * 0.78, cz * 0.6 + Math.cos(autoA) * d * 0.62);
      cam.position.lerp(want, 1 - Math.pow(0.15, dt));
      const look = new T.Vector3(cx * 0.6, 0.5, cz * 0.6);
      if (!camT) camT = look.clone(); camT.lerp(look, 1 - Math.pow(0.05, dt));
      cam.up.set(0, 1, 0); cam.lookAt(camT); if (ctl) ctl.target.copy(camT);
      cam.position.x += sx; cam.position.y += sy;
    } else if (mode === 'top') {
      const vf = cam.fov * Math.PI / 360, f = Math.min(vf, Math.atan(Math.tan(vf) * W / Hh)), h = (DG.R_ARENA + 0.9) / Math.tan(f) * 1.02;
      cam.position.lerp(new T.Vector3(0.001, h, 0.001), 1 - Math.pow(0.02, dt));
      cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0);
      cam.position.x += sx; cam.position.z += sy;
    } else if (mode === 'free' && ctl) { cam.up.set(0, 1, 0); ctl.update(); }
  }
  // ---------- タイトルの後ろ・作る画面用：コマを1つだけ回す ----------
  V3.showTops = function (list) { if (!ok) return; V3.clear(); V3.m = null; tops = list.map(o => buildTop(o)); };
  V3.snapshot = function () { try { R.render(scene, cam); return R.domElement.toDataURL('image/png'); } catch (e) { return null; } };
})();
