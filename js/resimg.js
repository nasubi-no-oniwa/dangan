// =============================================
//  弾丸合併  結果画像（SNSに貼る画像 1200×675）
//  ・左：決着の瞬間（試合の画面をそのまま）
//  ・右：勝ち名乗り（合併した名前を大きく、3つの材料、「〇〇を破る」、HP、自慢の一言）
// =============================================
(function () {
  const DG = window.DG, D = JM.D;
  const W = 1200, H = 675, LW = 690, RX = 940;
  const F_BIG = '"Dela Gothic One", sans-serif', F_FUDE = '"Yuji Syuku", serif', F_UI = '"M PLUS Rounded 1c", sans-serif';
  const TEAM = ['#d8402f', '#3f6fc9'];
  const hpOf = o => Math.max(0, Math.min(1, (o.ratio() - DG.LOSE) / (1 - DG.LOSE)));
  // 決着の瞬間をとっておく（試合の画面の絵をそのまま写す）
  // 決着の瞬間をとっておく：2つのコマが真ん中に来るように写して、横長に切り出す（1.0：0.98）
  DG.grabSnap = function (is3) {
    try {
      const m = DG.st.m; if (!m) return null;
      const mx = (m.A.x + m.B.x) / 2, my = (m.A.y + m.B.y) / 2, sep = Math.hypot(m.A.x - m.B.x, m.A.y - m.B.y) + m.A.reach + m.B.reach;
      let src, cx, cy, side;
      if (is3) {
        const prev = DG.V3.mode(), d = Math.max(11, Math.min(34, sep * 2.0 + 6));
        DG.V3.setCam([mx - d * 0.35, d * 0.8, my + d * 0.62], [mx, 0.3, my]);
        src = DG.V3.canvasNow(); DG.V3.setMode(prev);
        if (!src || !src.width) return null;
        cx = src.width / 2; cy = src.height / 2; side = Math.min(src.width, src.height);
      } else {
        src = document.getElementById('arena2'); if (!src || !src.width) return null;
        const w = src.width, h = src.height, R = DG.R_ARENA + 0.6, k = Math.min(w, h) / (2 * R + 1.2);
        cx = w / 2 + mx * k; cy = h / 2 + my * k; side = Math.min(Math.min(w, h), Math.max(sep * k * 1.5, Math.min(w, h) * 0.55));
      }
      const c = document.createElement('canvas'); c.width = 700; c.height = 686;
      const sw = side, sh = side * 686 / 700;
      c.getContext('2d').drawImage(src, cx - sw / 2, cy - sh / 2, sw, sh, 0, 0, 700, 686);
      return c;
    } catch (e) { return null; }
  };
  // 自慢の一言（強い順に3つまで）
  DG.resultTags = function (m, chal) {
    const out = [], w = m.winner;
    if (w < 0) { out.push({ t: m.mirror ? '同じコマどうし' : '引き分け' }); return out; }
    const W_ = w ? m.B : m.A, L_ = w ? m.A : m.B;
    const lb = L_.layers.filter(L => L.burst).length;
    if (lb) out.push({ t: lb >= 2 ? '合併解消×' + lb + '！' : '合併解消させた！', gold: true });
    if (m.endBy === 'break' && hpOf(W_) >= 0.8) out.push({ t: '圧勝！', gold: true });
    if (m.endBy === 'break' && hpOf(W_) <= 0.15) out.push({ t: 'ギリギリの勝ち', gold: true });
    if (m.endBy === 'break' && m.t < 12) out.push({ t: 'スピード決着' });
    if (m.endBy === 'time') out.push({ t: '時間切れ判定' });
    if (W_.best.a > 0 && W_.best.a / L_.area0 >= 0.12) out.push({ t: '大きな一撃' });
    if (chal) out.push({ t: chal.n + 'さんの挑戦状' });
    return out.slice(0, 3);
  };
  function fitLines(c, text, font, size, min, maxW, cuts) {
    let s = size; c.font = font(s);
    while (c.measureText(text).width > maxW && s > min) { s -= 2; c.font = font(s); }
    if (c.measureText(text).width <= maxW) return { s, lines: [text] };
    let cut = -1, best = 1e9;
    // 合併した名前は、つなぎ目（上・中・下の境目）で切る
    for (const i of (cuts || [])) if (i > 0 && i < text.length && Math.abs(i - text.length / 2) < best) { best = Math.abs(i - text.length / 2); cut = i; }
    if (cut < 0) for (let i = 1; i < text.length; i++) if ('＝・ 　'.includes(text[i - 1]) && Math.abs(i - text.length / 2) < best) { best = Math.abs(i - text.length / 2); cut = i; }
    if (cut < 0) cut = Math.ceil(text.length / 2);
    const lines = [text.slice(0, cut), text.slice(cut)];
    s = size; c.font = font(s);
    while (Math.max(...lines.map(t => c.measureText(t).width)) > maxW && s > 20) { s -= 2; c.font = font(s); }
    return { s, lines };
  }
  async function fontsReady() {
    if (!document.fonts || !document.fonts.load) return;
    const wait = Promise.all([
      document.fonts.load('400 80px "Dela Gothic One"', '弾丸合併の勝ち'),
      document.fonts.load('400 60px "Yuji Syuku"', '勝負あり痛み分け！'),
      document.fonts.load('800 20px "M PLUS Rounded 1c"', 'を破るHP上段中段下段'),
    ]);
    await Promise.race([wait, new Promise(r => setTimeout(r, 2500))]).catch(() => { });
  }
  const cut = (t, n) => t.length > n ? t.slice(0, n) + '…' : t;
  // o：{ m, snap, spec:[a,b], chal, url }
  DG.drawResultImage = async function (cv, o) {
    await fontsReady();
    const c = cv.getContext('2d'), m = o.m, w = m.winner, draw = w < 0;
    const names = o.spec.map(DG.nameOf);
    c.setTransform(1, 0, 0, 1, 0, 0); c.textBaseline = 'middle';
    c.fillStyle = '#17110d'; c.fillRect(0, 0, W, H);
    // ---- 左：決着の瞬間 ----
    c.save(); c.beginPath(); c.rect(0, 0, LW, H); c.clip();
    const s = o.snap;
    if (s) {
      // 絵の真ん中あたりを、左の枠いっぱいに
      const k = Math.max(LW / s.width, H / s.height), dw = s.width * k, dh = s.height * k;
      c.drawImage(s, (LW - dw) / 2, (H - dh) / 2, dw, dh);
    } else { c.fillStyle = '#a9c4cc'; c.beginPath(); c.arc(LW / 2, H / 2, 300, 0, Math.PI * 2); c.fill(); }
    if (!draw) {   // 集中線
      c.save(); c.translate(LW / 2, H / 2); c.globalAlpha = 0.13; c.fillStyle = '#fff';
      for (let i = 0; i < 72; i++) { const an = i / 72 * Math.PI * 2 + (i % 3) * 0.021, r0 = 250 + (i * 37 % 70); c.beginPath(); c.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); c.lineTo(Math.cos(an + 0.011) * 1000, Math.sin(an + 0.011) * 1000); c.lineTo(Math.cos(an - 0.011) * 1000, Math.sin(an - 0.011) * 1000); c.fill(); }
      c.restore();
    }
    const vg = c.createRadialGradient(LW / 2, H / 2, 200, LW / 2, H / 2, 620); vg.addColorStop(0, 'rgba(23,17,13,0)'); vg.addColorStop(1, 'rgba(23,17,13,.8)'); c.fillStyle = vg; c.fillRect(0, 0, LW, H);
    const fade = c.createLinearGradient(LW - 220, 0, LW, 0); fade.addColorStop(0, 'rgba(23,17,13,0)'); fade.addColorStop(1, 'rgba(23,17,13,1)'); c.fillStyle = fade; c.fillRect(LW - 220, 0, 220, H);
    c.restore();
    // ロゴ
    c.textAlign = 'left'; c.font = '400 32px ' + F_BIG; c.lineJoin = 'round';
    c.lineWidth = 7; c.strokeStyle = 'rgba(23,17,13,.85)'; c.strokeText('弾丸合併', 28, 44);
    c.fillStyle = '#fff'; c.fillText('弾丸', 28, 44); c.fillStyle = '#ffcf3a'; c.fillText('合併', 28 + c.measureText('弾丸').width, 44);
    // ---- 右：勝ち名乗り ----
    c.save(); c.translate(1112, 86); c.rotate(0.12);   // はんこ
    c.fillStyle = draw ? '#6a5a4a' : '#c8281c'; c.beginPath(); c.arc(0, 0, 56, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#f6eedb'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 48, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#f6eedb'; c.textAlign = 'center'; c.font = '400 32px ' + F_FUDE;
    if (draw) { c.fillText('痛み', 0, -15); c.fillText('分け', 0, 21); } else { c.fillText('勝負', 0, -15); c.fillText('あり', 0, 21); }
    c.restore();
    c.textAlign = 'center';
    if (draw) {
      c.font = '400 92px ' + F_FUDE; c.fillStyle = '#fff'; c.fillText('引き分け', RX, 220);
      const a = fitLines(c, names[0] + ' と ' + names[1], s => `800 ${s}px ${F_UI}`, 26, 18, 470);
      c.fillStyle = '#d8c6a4'; a.lines.forEach((t, i) => c.fillText(t, RX, 320 + i * 32));
    } else {
      const sp = o.spec[w];
      // 3つの材料（上・中・下）
      c.font = '800 19px ' + F_UI;
      const parts = sp.map((x, i) => DG.TIER[i][0] + '：' + D.byId.get(x[0]).n);
      const pl = fitLines(c, parts.join('　'), s => `800 ${s}px ${F_UI}`, 19, 14, 480);
      c.fillStyle = '#d8c6a4'; c.font = `800 ${pl.s}px ${F_UI}`; pl.lines.forEach((t, i) => c.fillText(t, RX, 150 + i * (pl.s + 6)));
      // 合併した名前を大きく
      const st0 = DG.stem(D.byId.get(sp[0][0]).n).length, st1 = DG.stem(D.byId.get(sp[1][0]).n).length;
      let nm = fitLines(c, names[w], s => `400 ${s}px ${F_BIG}`, 96, 46, 480, [st0, st0 + st1]);
      if (nm.lines.length > 1) nm.s = Math.min(nm.s, 58);
      const lh = nm.s * 1.08, top = nm.lines.length === 1 ? 240 : 240 - lh / 2;
      nm.lines.forEach((t, i) => {
        const yy = top + i * lh; c.font = `400 ${nm.s}px ${F_BIG}`;
        c.lineWidth = Math.max(8, nm.s * 0.13); c.strokeStyle = w ? '#16357a' : '#7a1a12'; c.strokeText(t, RX, yy);
        const gr = c.createLinearGradient(0, yy - nm.s / 2, 0, yy + nm.s / 2); gr.addColorStop(0, '#fff6d8'); gr.addColorStop(1, '#ffcf3a'); c.fillStyle = gr; c.fillText(t, RX, yy);
      });
      c.font = '400 60px ' + F_FUDE; c.fillStyle = '#fff'; c.fillText('の勝ち！', RX, 330);
      const lt = fitLines(c, names[1 - w] + ' を破る', s => `800 ${s}px ${F_UI}`, 25, 18, 480);
      c.fillStyle = '#e9dcc0'; c.font = `800 ${lt.s}px ${F_UI}`;
      lt.lines.forEach((t, i) => c.fillText(t, RX, 384 + i * (lt.s + 4)));
    }
    // HP（両方）
    const by = 452;
    [m.A, m.B].forEach((b, side) => {
      const yy = by + side * 54, x0 = RX - 210, bw = 420, hp = hpOf(b);
      c.textAlign = 'left'; c.font = '800 19px ' + F_UI; c.fillStyle = '#efe4cc'; c.fillText(cut(names[side], 14), x0, yy);
      c.textAlign = 'right'; c.font = '400 24px ' + F_BIG; c.fillStyle = side === w ? '#ffcf3a' : '#a89c90'; c.fillText('HP ' + Math.ceil(hp * 100), x0 + bw, yy);
      c.fillStyle = 'rgba(255,255,255,.13)'; c.fillRect(x0, yy + 18, bw, 10);
      c.fillStyle = hp > 0.5 ? '#3e9a55' : hp > 0.25 ? '#e0a21b' : TEAM[0]; c.fillRect(x0, yy + 18, bw * hp, 10);
      c.fillStyle = TEAM[side]; c.fillRect(x0 - 12, yy - 10, 5, 38);
    });
    // 札
    const tags = DG.resultTags(m, o.chal);
    let tx = RX - 210, ty = by + 104; c.textAlign = 'left'; c.font = '800 19px ' + F_UI;
    for (const g of tags) {
      const tw = c.measureText(g.t).width + 26; if (tx + tw > RX + 215) break;
      c.fillStyle = g.gold ? '#ffcf3a' : 'rgba(255,255,255,.15)'; c.beginPath(); (c.roundRect ? c.roundRect(tx, ty, tw, 34, 17) : c.rect(tx, ty, tw, 34)); c.fill();
      c.fillStyle = g.gold ? '#2a211b' : '#efe4cc'; c.fillText(g.t, tx + 13, ty + 18); tx += tw + 9;
    }
    // 下の帯
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, H - 44, W, 44);
    c.font = '800 18px ' + F_UI; c.fillStyle = '#d8c6a4'; c.textAlign = 'left'; c.fillText('#弾丸合併', 24, H - 22);
    c.textAlign = 'right'; c.fillText(o.url.replace('https://', '').replace(/\/$/, ''), W - 24, H - 22);
  };
})();
