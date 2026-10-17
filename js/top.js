// =============================================
//  弾丸合併  コマの組み立て
//  ・段の材料（形・穴）を読みこむ
//  ・作り方 [[id,穴,向き]×3] から、試合で使う形を作る
//  ・合併した名前、段の向き、保存・リンク
// =============================================
(function () {
  const DG = window.DG, D = JM.D;
  const cache = new Map();
  // 材料：{ e, parts（面積1・重心が原点）, holes }
  DG.part = async function (id) {
    if (cache.has(id)) return cache.get(id);
    const p = (async () => {
      const e = D.byId.get(id); if (!e) throw new Error('見つかりません');
      const raw = await D.shape(id);
      let parts = raw.map(q => q.map(v => v / 1000));
      // 輪の向きをそろえる（左回り）
      parts = parts.map(q => { if (DG.polyArea(q) >= 0) return q; const r = []; for (let i = q.length - 2; i >= 0; i -= 2) r.push(q[i], q[i + 1]); return r; });
      let A = 0, cx = 0, cy = 0; for (const q of parts) { const pr = DG.polyProps(q); A += pr.a; cx += pr.cx * pr.a; cy += pr.cy * pr.a; }
      cx /= A; cy /= A; const k = 1 / Math.sqrt(A);
      parts = parts.map(q => q.map((v, j) => (v - (j % 2 ? cy : cx)) * k));
      const holes = DG.makeHoles(parts).map(h => ({ x: Math.round(h.x * 1e5) / 1e5, y: Math.round(h.y * 1e5) / 1e5, k: h.k }));
      return { e, parts, holes };
    })();
    cache.set(id, p);
    p.catch(() => cache.delete(id));
    return p;
  };
  // 作り方 → 試合用の def
  DG.def = async function (spec) {
    const layers = [];
    for (let t = 0; t < 3; t++) {
      const [id, h, dir] = spec[t], P = await DG.part(id), hole = P.holes[Math.min(h | 0, P.holes.length - 1)];
      layers.push({ key: id, parts: P.parts, st: P.e.st, hole: { x: hole.x, y: hole.y }, dir: dir | 0 });
    }
    return { layers };
  };
  // ---------- 合併した名前 ----------
  const SUF = ['民主人民共和国', '人民民主共和国', '民主共和国', '人民共和国', '社会主義共和国', 'イスラム共和国', '首長国連邦', '連合王国', '合衆国', '共和国', '大公国', '連邦', '王国', '公国', '帝国', '国', '島庁', '支庁', '市', '町', '村', '区', '郡', '都', '道', '府', '県', '州', '省'];
  function stem(n) {
    n = String(n || '').replace(/[（(].*$/, '').trim();
    for (const s of SUF) if (n.length > s.length && n.endsWith(s)) return n.slice(0, -s.length);
    return n;
  }
  DG.stem = stem;
  // 上→中→下の順に、頭の部分をつなぐ。最後（下段）の名前の終わり方（市・町・村・国…）でしめる
  DG.mergeName = function (names) { return stem(names[0]) + stem(names[1]) + String(names[2] || '').replace(/[（(].*$/, '').trim(); };
  // ---------- 何段向きか（材料の数字から） ----------
  // 上段：とがり・強さ（当てる所）／中段：体力・守り（本体）／下段：速さ（動き回る）
  DG.hint = function (e) {
    const s = e.st, v = [s[1] + s[3], s[0] + s[2], s[4] * 2], t = v.indexOf(Math.max(...v));
    return { t, txt: DG.TIER[t] + '向き' };
  };
  // ---------- 保存（この端末だけ） ----------
  const KEY = 'dangan_tops';
  DG.saved = function () { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  DG.save = function (top) {
    const L = DG.saved().filter(x => x.code !== top.code);
    L.unshift({ name: top.name, code: top.code, at: Date.now() });
    try { localStorage.setItem(KEY, JSON.stringify(L.slice(0, 60))); return true; } catch (e) { return false; }
  };
  DG.unsave = function (code) { try { localStorage.setItem(KEY, JSON.stringify(DG.saved().filter(x => x.code !== code))); } catch (e) { } };
  // ---------- 作り方の文字（リンク・保存用）：id.穴.向き を ~ でつなぐ ----------
  DG.encode = spec => spec.map(([id, h, d]) => id + '.' + (h | 0) + '.' + (d | 0)).join('~');
  DG.decode = function (code) {
    const a = String(code || '').split('~'); if (a.length !== 3) return null;
    const spec = a.map(s => { const m = s.match(/^(.+)\.(\d)\.(\d)$/); return m && D.byId.has(m[1]) ? [m[1], +m[2], +m[3] % 8] : null; });
    return spec.every(Boolean) ? spec : null;
  };
  DG.nameOf = spec => DG.mergeName(spec.map(s => D.byId.get(s[0]).n));
  // おまかせ合併：中段は大きめ・強めの所、上下はとがった所・速い所から選ぶ
  DG.random = function (rnd) {
    rnd = rnd || Math.random;
    const L = D.list, pick = f => { let b = null, bs = -1; for (let i = 0; i < 24; i++) { const e = L[Math.floor(rnd() * L.length)]; const s = f(e) + rnd() * 60; if (s > bs) { bs = s; b = e; } } return b; };
    const a = pick(e => e.st[1] + e.st[3]), b = pick(e => e.st[0] + e.st[2]), c = pick(e => e.st[4] * 2);
    return [[a.id, Math.floor(rnd() * 8), Math.floor(rnd() * 8)], [b.id, Math.floor(rnd() * 3), Math.floor(rnd() * 8)], [c.id, Math.floor(rnd() * 8), Math.floor(rnd() * 8)]];
  };
  // 穴の番号を、その材料にある数におさめる
  DG.fix = async function (spec) { for (const s of spec) { const P = await DG.part(s[0]); s[1] = Math.min(s[1], P.holes.length - 1); } return spec; };
})();
