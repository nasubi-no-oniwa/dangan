// =============================================
//  弾丸合併  2D の見た目（3D が動かない端末用・作る画面の絵）
// =============================================
(function () {
  const DG = window.DG;
  const V2 = DG.V2 = {};
  const TEAM = ['#d8402f', '#3f6fc9'], TEAM_D = ['#8e1d14', '#16357a'];
  // 上・中・下の色（はみ出しの色。3D の紙の色とそろえる）
  // 段ごとの色：上段 オレンジ、中段 チームの色、下段 緑
  DG.tierCol = (t, side) => [ '#f3a645', side ? '#5f8fe6' : '#ec6a52', '#52b48a'][t];
  DG.TIER_COL = [0, 1, 2].map(t => DG.tierCol(t, 0));
  let cv, g, W = 1, H = 1, dpr = 1, sparks = [], shake = 0;
  V2.init = function (canvas) { cv = canvas; g = cv.getContext('2d'); return !!g; };
  V2.resize = function (w, h) { if (!cv) return; dpr = Math.min(2, window.devicePixelRatio || 1); W = w; H = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); };
  V2.setMatch = function (m) { V2.m = m; sparks = []; };
  V2.event = function (ev) { if (ev.k === 'hit') { sparks.push({ x: ev.x, y: ev.y, t: 0, big: ev.burst.length > 0, v: ev.v }); shake = Math.max(shake, Math.min(10, ev.v / 4)); } };
  function poly(c, p, ox, oy, cs, sn, k) {
    c.beginPath();
    for (let i = 0; i < p.length; i += 2) { const x = ox + (cs * p[i] - sn * p[i + 1]) * k, y = oy + (sn * p[i] + cs * p[i + 1]) * k; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath();
  }
  // コマ1つを描く（上から見た形：下段→中段→上段の順に重ねる）
  DG.drawTop = function (c, o, ox, oy, k, opt) {
    opt = opt || {};
    for (const t of [2, 1, 0]) {
      const L = o.layers[t];
      for (const f of L.frags) {
        if (!f.alive) continue;
        poly(c, f.poly, ox, oy, o.c, o.s, k);
        c.fillStyle = DG.tierCol(t, opt.tierCol ? 0 : o.side); c.fill();
        c.lineWidth = Math.max(0.6, k * 0.02); c.strokeStyle = opt.tierCol ? 'rgba(42,31,23,.35)' : TEAM_D[o.side]; c.stroke();
      }
      // 段のふち（チームの色）
      if (!opt.tierCol) { c.lineWidth = Math.max(1.5, k * 0.05); c.strokeStyle = TEAM[o.side]; for (const f of L.frags) if (f.alive) { poly(c, f.poly, ox, oy, o.c, o.s, k); c.stroke(); } }
    }
    // 軸
    c.fillStyle = opt.tierCol ? '#2a1f17' : '#e5e7ea'; c.beginPath(); c.arc(ox, oy, Math.max(3, k * 0.13), 0, Math.PI * 2); c.fill();
    c.lineWidth = 2; c.strokeStyle = opt.tierCol ? '#fff' : TEAM_D[o.side]; c.stroke();
  };
  V2.frame = function (dt) {
    if (!g) return;
    const m = V2.m;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#2a211b'; g.fillRect(0, 0, W, H);
    shake *= Math.pow(0.01, dt);
    const R = DG.R_ARENA + 0.6, k = Math.min(W, H) / (2 * R + 1.2), ox = W / 2 + (Math.random() - 0.5) * shake, oy = H / 2 + (Math.random() - 0.5) * shake;
    const gr = g.createRadialGradient(ox, oy, 10, ox, oy, R * k); gr.addColorStop(0, '#c9dbe0'); gr.addColorStop(0.75, '#a9c4cc'); gr.addColorStop(1, '#86a6b0');
    g.fillStyle = gr; g.beginPath(); g.arc(ox, oy, R * k, 0, Math.PI * 2); g.fill();
    g.lineWidth = k * 0.3; g.strokeStyle = '#5a3c22'; g.stroke();
    g.strokeStyle = 'rgba(40,70,90,.25)'; g.lineWidth = 1.5; for (let r = 1; r <= 7; r++) { g.beginPath(); g.arc(ox, oy, r * R / 7.8 * k, 0, Math.PI * 2); g.stroke(); }
    if (!m) return;
    // 飛んでいく欠片
    for (const d of m.debris) {
      const a = Math.max(0, 1 - d.t / 2.5); g.globalAlpha = a;
      poly(g, d.f.poly.map((v, i) => v - (i % 2 ? d.f.cy : d.f.cx)), ox + d.x * k, oy + d.y * k, Math.cos(d.a), Math.sin(d.a), k);
      g.fillStyle = DG.tierCol(d.f.layer, d.side); g.fill(); g.strokeStyle = TEAM[d.side]; g.lineWidth = 1.5; g.stroke();
    }
    g.globalAlpha = 1;
    for (const o of [m.A, m.B]) {
      // 影
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(ox + (o.x + 0.15) * k, oy + (o.y + 0.2) * k, o.reach * k * 0.45, 0, Math.PI * 2); g.fill();
      DG.drawTop(g, o, ox + o.x * k, oy + o.y * k, k);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.t += dt; const L = s.big ? 0.8 : 0.4; if (s.t > L) { sparks.splice(i, 1); continue; }
      const a = 1 - s.t / L, r = (0.3 + s.t * (s.big ? 9 : 5)) * k;
      g.strokeStyle = `rgba(255,210,80,${a})`; g.lineWidth = 3; g.beginPath();
      for (let j = 0; j < 10; j++) { const t = j / 10 * Math.PI * 2 + s.x; g.moveTo(ox + s.x * k + Math.cos(t) * r * 0.4, oy + s.y * k + Math.sin(t) * r * 0.4); g.lineTo(ox + s.x * k + Math.cos(t) * r, oy + s.y * k + Math.sin(t) * r); }
      g.stroke();
    }
  };
})();
