// =============================================
//  弾丸合併  画面と流れ
// =============================================
(function () {
  const DG = window.DG, D = JM.D, S = DG.S;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const st = { bg: true, mode: 'local', lmode: 'rec', sortK: 0, sortDir: -1, filt: 'all', scr: 'title', spec: null, cur: null, prev: null, tab: 1, vs: [null, null], vsLab: ['', ''], m: null, run: false, acc: 0, demo: false, trial: false, pickFor: -1, endAt: 0, rec: {} };
  DG.st = st;
  // ---------- 表示（3D／2D） ----------
  const low = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  let V = null, is3 = false, no3 = false;
  function setView(three) {
    if (three && !DG.V3.ok()) { three = !no3 && DG.V3.init($('arena3'), { low }); if (!three) no3 = true; }
    is3 = !!three; V = is3 ? DG.V3 : DG.V2; if (!is3) DG.V2.init($('arena2'));
    $('arena3').classList.toggle('hide', !is3); $('arena2').classList.toggle('hide', is3);
    $('c-dim').textContent = is3 ? '2D' : '3D'; $('c-dim').classList.toggle('hide', no3);
    $('c-auto').classList.toggle('hide', !is3); $('c-top').classList.toggle('hide', !is3); $('hint3d').classList.toggle('hide', !is3);
    resize(); if (st.m) V.setMatch(st.m);
  }
  function resize() { const w = innerWidth, h = innerHeight; DG.V2.resize(w, h); if (DG.V3.ok()) DG.V3.resize(w, h); if (st.scr === 'build') drawPrev(); }
  addEventListener('resize', resize);
  DG.V3.onMode = m => { $('c-auto').classList.toggle('on', m === 'auto'); $('c-top').classList.toggle('on', m === 'top'); };
  // ---------- 画面 ----------
  function show(id) {
    st.scr = id; document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + id));
    const bg = id !== 'build';
    st.bg = bg; $('arena3').style.visibility = $('arena2').style.visibility = bg ? 'visible' : 'hidden';
  }
  let toastT = 0;
  function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('in'), 2200); }
  // ---------- 毎フレーム ----------
  const SLOW_N = Math.round(1.1 / DG.DT);   // 決着の1.1秒前からスロー
  let last = performance.now(), fpsT = 0, fpsN = 0, fpsChecked = 0;
  function loop(ts) {
    const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts;
    if (st.m && st.run) {
      // 決着の少し前からスローにする（結果は先に計算してあるので、決まる瞬間がわかる）
      const left = st.endStep ? st.endStep - st.m.step : 1e9;
      const slow = !st.demo && left < SLOW_N;
      st.acc += dt * (slow ? 0.3 : 1); let n = 0;
      if (slow && !st.slowOn) { st.slowOn = true; document.body.classList.add('slow'); }
      while (st.acc >= DG.DT && n < 30 && !st.m.over) { st.m.tick(); st.acc -= DG.DT; n++; }
      if (n >= 30) st.acc = 0;
      pump();
    }
    if (V && st.bg) V.frame(dt * (st.slowOn && st.run ? 0.3 : 1));
    if (st.scr === 'battle') hud();
    // 重い端末は軽い表示に
    if (is3 && st.scr === 'battle' && st.run && fpsChecked < 2) {
      fpsT += dt; fpsN++;
      if (fpsT > 4) { const fps = fpsN / fpsT; fpsT = 0; fpsN = 0; fpsChecked++; if (fps < 20) { if (!DG.V3.low) { DG.V3.degrade(); toast('軽い表示にしました'); } else { setView(false); toast('2Dの表示に切りかえました'); } } }
    }
    requestAnimationFrame(loop);
  }
  function pump() {
    const m = st.m;
    for (const ev of m.ev) {
      V.event(ev);
      if (st.demo) continue;
      if (ev.k === 'hit') { S.hit(ev.v, ev.burst.length > 0); if (ev.burst.length) { S.burst(); callout('合併解消！'); } }
    }
    m.ev.length = 0;
    if (!st.demo) S.humSet(Math.hypot(m.A.vx, m.A.vy) + Math.hypot(m.B.vx, m.B.vy));
    if (m.over && st.run) {
      st.run = false;
      if (st.demo) { setTimeout(() => { if (st.demo && st.scr === 'title') demo(); }, 1500); return; }
      S.humStop(); callout(m.endBy === 'time' ? '時間切れ！' : '決着！');
      if (st.onEnd) { try { st.onEnd(m); } catch (e) { } st.onEnd = null; }
      setTimeout(() => document.body.classList.remove('slow'), 1200);
      setTimeout(result, 2000);
    }
  }
  let coT = 0;
  function callout(t) { const e = $('callout'); e.textContent = t; e.classList.add('in'); clearTimeout(coT); coT = setTimeout(() => e.classList.remove('in'), 1100); }
  // ---------- タイトルの後ろの試合 ----------
  const DEMO = [['大垣市', '北海道', '千代田区'], ['チリ共和国', '日本国', 'イタリア共和国'], ['ノルウェー王国', 'オーストラリア連邦', '佐渡市'], ['四日市市', 'ブラジル連邦共和国', '神戸市'], ['廿日市市', 'カナダ', '奥州市'], ['インドネシア共和国', '高山市', '小豆島町']];
  let demoI = 0;
  function byName(n) { return D.list.find(e => e.n === n && !e.t) || D.list.find(e => e.n === n); }
  async function demo() {
    if (st.scr !== 'title') return;
    const pick = () => { const L = DEMO[demoI++ % DEMO.length].map(byName); if (L.some(x => !x)) return DG.random(); return L.map((e, i) => [e.id, (demoI * 3 + i) % 4, (demoI + i * 3) % 8]); };
    try {
      const a = await DG.fix(pick()), b = await DG.fix(pick());
      if (st.scr !== 'title') return;
      st.m = new DG.Match(await DG.def(a), await DG.def(b)); st.demo = true; st.run = true; st.acc = 0; V.setMatch(st.m);
      if (is3) DG.V3.setMode('auto');
    } catch (e) { console.warn(e); }
  }
  // ---------- 作る ----------
  const STAT = [['weight', '重さ', '重いほどはじかれにくい'], ['reach', '届く', 'はみ出しの長さ。長いほど先に当たる'], ['power', '攻め', 'とがり・強さ。当てたときの削る力'], ['guard', '守り', '体力・重さ。削られにくさ'], ['wobble', '暴れ', '重心のずれ。強く当たるが自分も削れる'], ['speed', '動き', '下段の速さと広がり。よく動き回る']];
  function saveCur() { try { localStorage.setItem('dangan_cur', DG.encode(st.spec)); } catch (e) { } }
  async function openBuild(spec) {
    if (!spec) { let c = null; try { c = DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { } spec = c || DG.random(); }
    st.spec = spec.map(s => s.slice()); st.prev = null; st.cur = null; st.tab = 1;
    stopMatch(); show('build'); $('b-q').value = '';
    renderBuild(true); await DG.fix(st.spec); await calc(); renderBuild(true);
  }
  let calcN = 0;
  async function calc() {
    const n = ++calcN;
    try { const def = await DG.def(st.spec); if (n !== calcN) return; const s = DG.stats(def); if (n !== calcN) return; st.cur = s; }
    catch (e) { console.warn(e); toast('形を読みこめませんでした'); }
  }
  async function change(fn) {
    const before = st.cur; fn(); saveCur(); renderBuild(false);
    await DG.fix(st.spec); await calc(); st.prev = before; renderBuild(false);
  }
  function renderBuild(list) {
    const sp = st.spec, es = sp.map(s => D.byId.get(s[0]));
    $('b-name').textContent = DG.mergeName(es.map(e => e.n));
    $('b-tabs').innerHTML = DG.TIER.map((t, i) => `<button class="tab${i === st.tab ? ' on' : ''}" data-t="${i}"><i style="background:${DG.TIER_COL[i]}"></i>${t}<span class="tn">${esc(es[i].n)}</span></button>`).join('');
    const e = es[st.tab], b = D.badge(e), h = DG.hint(e);
    $('b-cname').innerHTML = `${esc(e.n)}<small>${esc(e.pn || '')}${e.c ? ' ' + esc(e.c) : ''}${e.kd ? '（' + esc(e.kd) + '）' : ''}</small>`;
    $('b-meta').innerHTML = `<span class="tag${b.cur ? '' : ' old'}">${esc(b.txt)}</span><span class="tag h${h.t}">${h.txt}</span>`;
    $('b-ang').textContent = (sp[st.tab][2] * 45) + '°';
    drawHole(); drawPrev(); drawStats();
    if (list) renderList();
  }
  function drawStats() {
    const s = st.cur, p = st.prev;
    if (!s) { $('b-stats').innerHTML = '<div class="st-note">計算中…</div>'; return; }
    $('b-stats').innerHTML = STAT.map(([k, lab]) => {
      const v = s[k], d = p ? v - p[k] : 0;
      return `<div class="st"><span>${lab}</span><span class="bar2"><i style="width:${v}%;${k === 'wobble' ? 'background:#c77d1e' : ''}"></i></span><span class="d ${d > 0 ? 'up' : d < 0 ? 'dn' : ''}">${v}${d ? (d > 0 ? ' ↑' : ' ↓') + Math.abs(d) : ''}</span></div>`;
    }).join('') + `<div class="b-out"><span class="st-note">はみ出し</span>${s.out.map((v, i) => `<span class="chip" style="background:${DG.TIER_COL[i]}">${DG.TIER[i][0]} ${v}%</span>`).join('')}</div><div class="st-note">${p ? '↑↓は前の作りとくらべて' : '外にはみ出した所が当たって削れる'}</div>`;
  }
  function fitCanvas(cv) { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } return [w, h]; }
  function drawPrev() {
    const cv = $('b-cv'); if (!cv || st.scr !== 'build') return; const [w, h] = fitCanvas(cv), g = cv.getContext('2d');
    g.clearRect(0, 0, w, h); if (!st.cur) return;
    const o = st.cur.top, k = Math.min(w, h) / 2 / (o.reach * 1.08 + 0.1);
    // 軸のまわりの目安の輪
    g.strokeStyle = 'rgba(42,31,23,.12)'; g.lineWidth = 1; for (let r = 1; r <= 4; r++) { g.beginPath(); g.arc(w / 2, h / 2, r * k, 0, Math.PI * 2); g.stroke(); }
    DG.drawTop(g, o, w / 2, h / 2, k, { tierCol: true });
    // いま選んでいる段をふちどり
    g.lineWidth = 2.5; g.strokeStyle = '#d8402f'; g.setLineDash([5, 4]);
    for (const f of o.layers[st.tab].frags) { g.beginPath(); for (let i = 0; i < f.poly.length; i += 2) { const x = w / 2 + f.poly[i] * k, y = h / 2 + f.poly[i + 1] * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); }
    g.setLineDash([]);
  }
  let holePts = [];
  async function drawHole() {
    const cv = $('b-hcv'), [w, h] = fitCanvas(cv), g = cv.getContext('2d'), s = st.spec[st.tab];
    let P; try { P = await DG.part(s[0]); } catch (e) { return; }
    if (st.spec[st.tab][0] !== s[0]) return;
    g.clearRect(0, 0, w, h);
    const a = s[2] * Math.PI / 4, c = Math.cos(a), sn = Math.sin(a);
    let r = 0; for (const p of P.parts) for (let i = 0; i < p.length; i += 2) r = Math.max(r, Math.hypot(p[i], p[i + 1]));
    const k = Math.min(w, h) / 2 / (r * 1.12), ox = w / 2, oy = h / 2 - h * 0.03;
    const tx = (x, y) => [ox + (c * x - sn * y) * k, oy + (sn * x + c * y) * k];
    g.fillStyle = DG.TIER_COL[st.tab]; g.strokeStyle = 'rgba(42,31,23,.6)'; g.lineWidth = 1.5;
    for (const p of P.parts) { g.beginPath(); for (let i = 0; i < p.length; i += 2) { const [x, y] = tx(p[i], p[i + 1]); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.fill(); g.stroke(); }
    holePts = P.holes.map((hh, i) => { const [x, y] = tx(hh.x, hh.y); return { x, y, i, k: hh.k }; });
    const R = Math.max(9, Math.min(w, h) * 0.055);
    for (const p of holePts) {
      const on = p.i === s[1];
      g.beginPath(); g.arc(p.x, p.y, on ? R * 1.15 : R, 0, Math.PI * 2);
      g.fillStyle = on ? '#2a1f17' : 'rgba(255,255,255,.92)'; g.fill(); g.lineWidth = 2; g.strokeStyle = on ? '#fff' : '#2a1f17'; g.stroke();
      g.fillStyle = on ? '#fff' : '#2a1f17'; g.font = `900 ${Math.round(R * 1.1)}px 'M PLUS Rounded 1c', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(p.i + 1), p.x, p.y + 1);
    }
    const sel = P.holes[s[1]]; $('b-hlab').textContent = sel ? `穴${s[1] + 1}：${sel.k}（${P.holes.length}個）` : '';
  }
  $('b-hcv').addEventListener('click', ev => {
    const cv = $('b-hcv'), r = cv.getBoundingClientRect(), d = cv.width / r.width, x = (ev.clientX - r.left) * d, y = (ev.clientY - r.top) * d;
    let b = null, bd = 1e9; for (const p of holePts) { const dd = Math.hypot(p.x - x, p.y - y); if (dd < bd) { bd = dd; b = p; } }
    if (b && bd < cv.width * 0.2 && b.i !== st.spec[st.tab][1]) change(() => { st.spec[st.tab][1] = b.i; });
  });
  $('b-rl').onclick = () => change(() => { const s = st.spec[st.tab]; s[2] = (s[2] + 7) % 8; });
  $('b-rr').onclick = () => change(() => { const s = st.spec[st.tab]; s[2] = (s[2] + 1) % 8; });
  $('b-tabs').addEventListener('click', ev => { const b = ev.target.closest('.tab'); if (!b) return; st.tab = +b.dataset.t; renderBuild(true); });
  $('b-random').onclick = async () => { const before = st.cur; st.spec = DG.random(); await DG.fix(st.spec); saveCur(); renderBuild(true); await calc(); st.prev = before; renderBuild(false); toast('おまかせで合併しました'); };
  // 候補の一覧
  let recCache = {};
  function rec(t) {
    if (recCache[t]) return recCache[t];
    const L = D.list.filter(e => !e.t && DG.hint(e).t === t), out = [];
    for (let i = 0; i < 40 && L.length; i++) out.push(L.splice(Math.floor(Math.random() * L.length), 1)[0]);
    return (recCache[t] = out);
  }
  // 並べかえ・しぼりこみ（元の数字：体力＝面積、勢い＝人口、かたさ＝まとまり、鋭さ＝トゲ、速さ＝人口密度）
  const SORTK = [['0', '体力'], ['1', '勢い'], ['2', 'かたさ'], ['3', '鋭さ'], ['4', '速さ'], ['pop', '人口']];
  const FILT = [['all', '全部'], ['now', '今ある'], ['old', 'なくなった'], ['jp', '日本'], ['world', '世界']];
  const sortVal = e => st.sortK === 'pop' ? (e.pop || 0) : e.st[+st.sortK];
  const passF = e => st.filt === 'all' || (st.filt === 'now' ? !e.t : st.filt === 'old' ? !!e.t : st.filt === 'jp' ? e.p <= 47 : e.p >= 48);
  function sorted(L) { const d = st.sortDir; return L.filter(passF).sort((a, b) => (sortVal(a) - sortVal(b)) * d || a.i - b.i); }
  const fmtPop = v => v >= 1e8 ? (v / 1e8).toFixed(1) + '億' : v >= 1e4 ? Math.round(v / 1e4) + '万' : String(v);
  let popReq = 0;
  async function renderList() {
    const q = $('b-q').value.trim(), cur = st.spec[st.tab][0], mode = st.lmode;
    $('b-modes').querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    $('b-sort').classList.toggle('hide', mode !== 'sort');
    let L, head, cnt = null;
    if (mode === 'sort') {
      const all = q ? D.search(q, 30000) : D.list; L = sorted(all); const n = L.length; L = L.slice(0, 80);
      head = `${q ? '「' + esc(q) + '」' : '全体'}を${SORTK.find(k => k[0] === String(st.sortK))[1]}の${st.sortDir < 0 ? '多い' : '少ない'}順（${n.toLocaleString()}件${n > 80 ? 'の上から80件' : ''}）`;
    } else if (q) {
      L = D.search(q, 80); head = L.length ? `${D.lastCount > L.length ? D.lastCount + '件中 ' + L.length + '件' : L.length + '件'}` : '見つかりません';
    } else if (mode === 'pop') {
      const tok = ++popReq; $('b-list').innerHTML = '<div class="b-lhead">読みこみ中…</div>';
      let P; try { P = await DG.Chal.popular(); } catch (e) { P = null; }
      if (tok !== popReq || st.lmode !== 'pop' || $('b-q').value.trim()) return;
      if (!P || !P.n) { $('b-list').innerHTML = '<div class="b-lhead">まだ挑戦状が少なくて、人気がわかりません。</div>'; return; }
      const row = P.tier[st.tab].length ? P.tier[st.tab] : P.all; cnt = new Map(row);
      L = row.map(([id]) => D.byId.get(id)).filter(Boolean);
      head = `新しい挑戦状${P.n}枚で、${DG.TIER[st.tab]}によく使われている`;
    } else {
      L = rec(st.tab); head = `${DG.TIER[st.tab]}向きの候補（さがすと24,838から選べる）<button class="btn sm" id="b-more" style="margin-left:6px">ほかの候補</button>`;
    }
    $('b-list').innerHTML = `<div class="b-lhead">${head}</div>` + L.map(e => {
      const h = DG.hint(e);
      const side = mode === 'sort' ? `<span class="val">${SORTK.find(k => k[0] === String(st.sortK))[1]} ${st.sortK === 'pop' ? fmtPop(e.pop || 0) : e.st[+st.sortK]}</span>` : cnt ? `<span class="val">${cnt.get(e.id)}回</span>` : '';
      return `<button class="it${e.id === cur ? ' on' : ''}" data-id="${esc(e.id)}"><span class="nm">${esc(e.n)}<small>${esc(e.pn || '')}${e.t ? ' ・' + esc(e.t.slice(0, 4)) + '年まで' : ''}</small></span>${side}<span class="tag h${h.t}">${h.txt}</span></button>`;
    }).join('');
    const mb = $('b-more'); if (mb) mb.onclick = () => { delete recCache[st.tab]; renderList(); };
  }
  $('b-sk').innerHTML = SORTK.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  $('b-fl').innerHTML = FILT.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  $('b-modes').addEventListener('click', ev => { const b = ev.target.closest('[data-m]'); if (!b) return; st.lmode = b.dataset.m; renderList(); });
  $('b-sk').onchange = () => { st.sortK = $('b-sk').value; renderList(); };
  $('b-fl').onchange = () => { st.filt = $('b-fl').value; renderList(); };
  $('b-dir').onclick = () => { st.sortDir = -st.sortDir; $('b-dir').textContent = st.sortDir < 0 ? '多い順' : '少ない順'; renderList(); };
  let qT = 0; $('b-q').addEventListener('input', () => { clearTimeout(qT); qT = setTimeout(renderList, 160); });
  $('b-q').addEventListener('keydown', e => { if (e.key === 'Enter') { e.target.blur(); renderList(); } });
  $('b-list').addEventListener('click', ev => {
    const b = ev.target.closest('.it'); if (!b) return; const id = b.dataset.id;
    if (id === st.spec[st.tab][0]) return;
    $('b-list').querySelectorAll('.it.on').forEach(x => x.classList.remove('on')); b.classList.add('on');
    change(() => { st.spec[st.tab] = [id, 0, st.spec[st.tab][2]]; });
  });
  $('b-back').onclick = () => toTitle();
  $('b-save').onclick = () => { if (DG.save({ name: DG.nameOf(st.spec), code: DG.encode(st.spec) })) toast('保存しました（この端末）'); else toast('保存できませんでした'); };
  $('b-go').onclick = () => { st.vs[0] = st.spec.map(s => s.slice()); st.vsLab[0] = '作ったコマ'; if (!st.vs[1]) { st.vs[1] = null; } openVs(); };
  $('b-try').onclick = async () => { const opp = await DG.fix(DG.random()); st.trial = true; startMatch(st.spec.map(s => s.slice()), opp); };
  // ---------- 対戦の相手えらび ----------
  async function preview(cv, spec) {
    // まだ画面に出ていないキャンバスは、指定の大きさ（なければ76px）で描く
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1), css = r.width || parseFloat(cv.style.width) || 76;
    const w = Math.round(css * d), h = w; cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.clearRect(0, 0, w, h);
    try { await DG.fix(spec); const t = new DG.Top(await DG.def(spec), 0); const k = Math.min(w, h) / 2 / (t.reach * 1.08); DG.drawTop(g, t, w / 2, h / 2, k, { tierCol: true }); } catch (e) { }
  }
  function partsTxt(spec) { return spec.map((s, i) => DG.TIER[i][0] + '：' + esc(D.byId.get(s[0]).n)).join('　'); }
  function openVs() {
    stopMatch(); show('vs');
    if (!st.vs[1]) { st.vs[1] = DG.random(); st.vsLab[1] = 'おまかせ'; }
    for (const k of [0, 1]) {
      const el = $('v-s' + k), sp = st.vs[k];
      const lock = k === 1 && (st.chal || st.tmp);
      el.innerHTML = `<span class="v-side">${k ? '青' : '赤'}${st.vsLab[k] ? '・' + esc(st.vsLab[k]) : ''}</span>` + (sp ? `<canvas class="v-cv"></canvas><div class="v-info"><div class="v-name">${esc(DG.nameOf(sp))}</div><div class="v-parts">${partsTxt(sp)}</div></div>` : '<div class="v-info"><div class="v-name">まだない</div></div>') +
        (lock ? '' : `<div class="v-btns"><button class="btn sm" data-a="saved">保存から</button><button class="btn sm" data-a="rand">おまかせ</button>${k === 0 ? '<button class="btn sm" data-a="build">作る</button>' : ''}</div>`);
      if (sp) preview(el.querySelector('canvas'), sp);
      el.onclick = ev => {
        const b = ev.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
        if (a === 'rand') { st.vs[k] = DG.random(); st.vsLab[k] = 'おまかせ'; openVs(); }
        else if (a === 'saved') openSaved(k);
        else if (a === 'build') openBuild(st.vs[0]);
      };
    }
    $('v-go').disabled = !(st.vs[0] && st.vs[1]);
    $('v-title').textContent = st.chal ? '挑戦状と戦う' : st.tmp ? '仕返し' : '対戦';
  }
  $('v-back').onclick = () => toTitle();
  $('v-go').onclick = () => { if (st.vs[0] && st.vs[1]) { st.trial = false; startMatch(st.vs[0], st.vs[1]); } };
  // ---------- 保存したコマ ----------
  function openSaved(pickFor) {
    st.pickFor = pickFor; stopMatch(); show('saved');
    $('sv-title').textContent = pickFor >= 0 ? (pickFor ? '青' : '赤') + 'のコマをえらぶ' : '保存したコマ';
    const L = DG.saved().map(x => ({ x, sp: DG.decode(x.code) })).filter(y => y.sp);
    $('sv-list').innerHTML = L.length ? L.map(({ x, sp }, i) => `<div class="sv" data-i="${i}"><canvas></canvas><div class="sv-i"><div class="v-name">${esc(DG.nameOf(sp))}</div><div class="v-parts">${partsTxt(sp)}</div><div class="v-btns">${pickFor >= 0 ? '<button class="btn sm hot" data-a="use">これにする</button>' : '<button class="btn sm hot" data-a="vs">戦う</button><button class="btn sm" data-a="edit">作り直す</button>'}<button class="btn sm" data-a="send">送る</button>${pickFor >= 0 ? '' : '<button class="btn sm" data-a="chal">挑戦状にする</button>'}<button class="btn sm" data-a="del">消す</button></div></div></div>`).join('') : '<div class="sv-empty">まだ保存したコマはありません。<br>「コマを作る」で作って「保存」をおしてください。</div>';
    $('sv-list').querySelectorAll('.sv').forEach(el => preview(el.querySelector('canvas'), L[+el.dataset.i].sp));
    $('sv-list').onclick = ev => {
      const b = ev.target.closest('[data-a]'); if (!b) return; const it = L[+b.closest('.sv').dataset.i], a = b.dataset.a;
      if (a === 'use') { st.vs[pickFor] = it.sp; st.vsLab[pickFor] = '保存'; openVs(); }
      else if (a === 'vs') { st.vs[0] = it.sp; st.vsLab[0] = '保存'; openVs(); }
      else if (a === 'edit') openBuild(it.sp);
      else if (a === 'send') send(it.sp);
      else if (a === 'chal') DG.Chal.put([{ sp: it.sp, lab: 'このコマ' }]);
      else if (a === 'del') { DG.unsave(it.x.code); openSaved(pickFor); toast('消しました'); }
    };
  }
  $('sv-back').onclick = () => st.pickFor >= 0 ? openVs() : toTitle();
  async function send(sp) {
    const url = location.origin + location.pathname + '?t=' + encodeURIComponent(DG.encode(sp)), text = `弾丸合併「${DG.nameOf(sp)}」と戦って！`;
    if (navigator.share) { try { await navigator.share({ title: '弾丸合併', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(text + ' ' + url); toast('リンクをコピーしました'); } catch (e) { prompt('このリンクを送ってください', url); }
  }
  // ---------- 合体 → 試合 ----------
  let mergeT = [];
  async function startMatch(a, b, opt) {
    opt = opt || {};
    stopMatch(); S.unlock();
    st.net = !!opt.net; st.who = opt.who || null; st.onEnd = opt.onEnd || null;
    await DG.fix(a); await DG.fix(b);
    let da, db; try { [da, db] = [await DG.def(a), await DG.def(b)]; } catch (e) { toast('形を読みこめませんでした'); return; }
    st.match = { a, b };
    show('merge');
    const side = (sp, k) => `<div class="mg-side s${k}">${st.who ? `<div class="mg-who">${esc(st.who[k])}</div>` : ''}${sp.map((s, i) => `<div class="mg-p" style="background:${DG.tierCol(i, k)}">${DG.TIER[i]}　${esc(D.byId.get(s[0]).n)}</div>`).join('')}<div class="mg-n">${esc(DG.nameOf(sp))}</div></div>`;
    $('mg').innerHTML = side(a, 0) + '<div class="mg-vs">VS</div>' + side(b, 1);
    const ps = [...$('mg').querySelectorAll('.mg-side')];
    mergeT.forEach(clearTimeout); mergeT = [];
    // 同じ作りなら必ず同じ結果になるので、先に最後まで計算して決着の瞬間を知っておく
    st.endStep = 0; st.slowOn = false; document.body.classList.remove('slow');
    try { const pre = new DG.Match(da, db); pre.run(1e7); if (pre.endBy === 'break') st.endStep = pre.step; } catch (e) { }
    for (let i = 0; i < 3; i++) mergeT.push(setTimeout(() => { ps.forEach(p => p.querySelectorAll('.mg-p')[i].classList.add('in')); S.clunk(i); }, 200 + i * 330));
    mergeT.push(setTimeout(() => { ps.forEach(p => p.querySelector('.mg-n').classList.add('in')); S.beep(false); }, 1250));
    mergeT.push(setTimeout(() => {
      st.m = new DG.Match(da, db); st.demo = false; st.acc = 0; V.setMatch(st.m);
      for (const o of [st.m.A, st.m.B]) for (const L of o.layers) L.a0 = L.frags.reduce((x, f) => x + f.a, 0);
      show('battle'); if (is3) DG.V3.setMode('auto'); hudInit();
      fpsT = 0; fpsN = 0; fpsChecked = 0;
      callout('回せ！'); S.beep(true); S.humStart(); st.run = true;
      $('hint3d').style.opacity = 1; setTimeout(() => { $('hint3d').style.opacity = 0; }, 3500);
    }, 2500));
  }
  function stopMatch() { document.body.classList.remove('slow'); st.endStep = 0; st.run = false; st.demo = false; mergeT.forEach(clearTimeout); mergeT = []; S.humStop(); }
  function hudInit() {
    const m = st.m;
    [m.A, m.B].forEach((o, k) => {
      const sp = k ? st.match.b : st.match.a;
      $('h' + k).innerHTML = `<div class="nm">${st.who ? '<small>' + esc(st.who[k]) + '</small> ' : ''}${esc(DG.nameOf(sp))}</div><div class="hp"><u></u><i></i><span class="hpn">HP 100</span></div><div class="ly">${o.layers.map((L, i) => `<span><i style="background:${DG.tierCol(i, k)}"></i><em>${DG.TIER[i][0]}</em></span>`).join('')}</div>`;
    });
  }
  function hud() {
    const m = st.m; if (!m || st.demo) return;
    $('clock').textContent = Math.max(0, Math.ceil(DG.TMAX - m.t));
    [m.A, m.B].forEach((o, k) => {
      const el = $('h' + k); if (!el.firstChild) return;
      // HP：残り35%で0になる（0で負け）。減るほど 緑→黄→赤、少ないと点滅
      const hp = Math.max(0, Math.min(1, (o.ratio() - DG.LOSE) / (1 - DG.LOSE))), w = (hp * 100).toFixed(1) + '%';
      const bar = el.querySelector('.hp i'), gh = el.querySelector('.hp u');
      bar.style.width = w; gh.style.width = w;
      bar.style.background = hp > 0.5 ? '#3e9a55' : hp > 0.25 ? '#e0a21b' : '#d8402f';
      el.classList.toggle('pinch', hp > 0 && hp <= 0.15);
      const t = 'HP ' + Math.ceil(hp * 100); const hn = el.querySelector('.hpn'); if (hn.textContent !== t) hn.textContent = t;
      const sp = el.querySelectorAll('.ly span');
      o.layers.forEach((L, i) => { const r = L.frags.reduce((x, f) => x + (f.alive ? f.a : 0), 0) / L.a0; sp[i].querySelector('i').style.width = (r * 100).toFixed(0) + '%'; sp[i].classList.toggle('burst', L.burst); });
    });
  }
  $('c-auto').onclick = () => DG.V3.setMode('auto');
  $('c-top').onclick = () => DG.V3.setMode(DG.V3.mode() === 'top' ? 'auto' : 'top');
  $('c-dim').onclick = () => setView(!is3);
  $('c-quit').onclick = () => { stopMatch(); if (st.mode !== 'local') { DG.Net.leave(); toTitle(); } else st.trial ? openBuild(st.spec) : openVs(); };
  // ---------- 結果 ----------
  function result() {
    const m = st.m; if (!m) return; show('result'); S.win();
    const sp = [st.match.a, st.match.b], nm = sp.map(DG.nameOf), O = [m.A, m.B];
    const w = m.winner;
    const pct = v => (v * 100).toFixed(0) + '%';
    const best = (o, e) => o.best.a > 0 ? pct(o.best.a / e.area0) + (o.best.layer >= 0 ? '（' + DG.TIER[o.best.layer] + '）' : '') : '—';
    const wob = o => Math.min(100, Math.round((o.wobSum / Math.max(1, o.wobN)) / 0.9 * 100));
    const rows = [
      ['残り', o => pct(o.ratio())],
      ['削った量', (o, e) => pct(o.dealt / e.area0)],
      ['削られた量', o => pct(1 - o.ratio())],
      ['最大の一撃', best],
      ['暴れ度', wob],
      ['合併解消', o => o.layers.filter(L => L.burst).map(L => DG.TIER[L.tier]).join('・') || 'なし'],
    ];
    const why = w < 0 ? (m.mirror ? '同じコマどうしは引き分け' : '残りが同じ') : m.endBy === 'time' ? '60秒たって、残りが多かった' : '相手を65%削った';
    $('res').innerHTML = `<h2>${w < 0 ? '引き分け' : `<span class="wn w${w}">${esc(nm[w])}</span>の勝ち！`}</h2><div class="why">${why}（${m.t.toFixed(1)}秒）</div>
      <table><tr><th></th><th class="c0">${esc(nm[0])}</th><th class="c1">${esc(nm[1])}</th></tr>${rows.map(([lab, f]) => `<tr><td>${lab}</td><td>${f(O[0], O[1])}</td><td>${f(O[1], O[0])}</td></tr>`).join('')}</table>
      <p class="res-note" id="res-note">${esc(st.netNote || '')}</p>
      <div class="row">${btns()}</div>`;
    function btns() {
      if (st.mode === 'watch') return '<button class="btn hot" data-a="leave">部屋を出る</button>';
      if (st.mode === 'net') return '<button class="btn hot" data-a="netagain">もう一戦</button><button class="btn" data-a="leave">部屋を出る</button>';
      if (st.trial) return '<button class="btn hot" data-a="back">作る画面にもどる</button><button class="btn" data-a="again">別の相手と試す</button><button class="btn" data-a="title">タイトル</button>';
      if (st.chal) return '<button class="btn hot" data-a="rebuild">作り直して再挑戦</button><button class="btn" data-a="nextchal">別の挑戦状</button><button class="btn" data-a="title">タイトル</button>';
      return '<button class="btn hot" data-a="rebuild">作り直す</button><button class="btn" data-a="opp">相手を変える</button><button class="btn" data-a="save">赤を保存</button>' + (st.tmp ? '' : '<button class="btn" data-a="putchal">挑戦状を置く</button>') + '<button class="btn" data-a="title">タイトル</button>';
    }
    QM.syncNext();
    if (st.chal && st.mode === 'local') DG.Chal.onResult(w, sp[0]).then(t => { if (t && st.scr === 'result') $('res-note').textContent = t; });
    $('res').onclick = async ev => {
      const b = ev.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'back') openBuild(st.spec);
      else if (a === 'again') { const opp = await DG.fix(DG.random()); startMatch(st.spec.map(s => s.slice()), opp); }
      else if (a === 'rebuild') openBuild(st.match.a);
      else if (a === 'opp') { st.vs[1] = DG.random(); st.vsLab[1] = 'おまかせ'; st.tmp = false; openVs(); }
      else if (a === 'save') { DG.save({ name: nm[0], code: DG.encode(sp[0]) }); toast('保存しました（この端末）'); }
      else if (a === 'putchal') DG.Chal.put([{ sp: sp[0], lab: '赤' }, { sp: sp[1], lab: '青' }]);
      else if (a === 'nextchal') DG.Chal.open();
      else if (a === 'netagain') { DG.Net.again(); b.disabled = true; b.textContent = 'あいてを待っています…'; }
      else if (a === 'leave') { DG.Net.leave(); toTitle(); }
      else if (a === 'title') toTitle();
    };
  }
  DG.netNote = () => { const e = $('res-note'); if (e && st.scr === 'result' && st.mode !== 'local') e.textContent = st.netNote || ''; };
  // ---------- タイトル ----------
  function toTitle() {
    stopMatch(); if (DG.Net && DG.Net.active()) DG.Net.leave(); QM.ended();
    st.mode = 'local'; st.chal = null; st.tmp = false; st.net = false; st.who = null; QM.close();
    show('title'); demo(); if (DG.Chal) DG.Chal.mineSummary();
  }
  // ほかのファイルから使う
  const curSpec = () => { try { return DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { return null; } };
  Object.assign(DG, { show, toast, stopMatch, startMatch, toTitle, openVs, openBuild, preview, partsTxt, esc, curSpec });
  $('btn-build').onclick = () => { S.unlock(); openBuild(); };
  $('btn-online').onclick = () => { S.unlock(); DG.Net.open(); };
  $('btn-vs').onclick = () => { S.unlock(); st.chal = null; st.tmp = false; if (!st.vs[0]) { let c = null; try { c = DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { } st.vs[0] = c || DG.random(); st.vsLab[0] = c ? '作ったコマ' : 'おまかせ'; } openVs(); };
  $('btn-saved').onclick = () => openSaved(-1);
  $('btn-howto').onclick = () => $('m-howto').classList.remove('hide');
  $('m-howto').addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.id === 'm-howto') $('m-howto').classList.add('hide'); });
  $('btn-snd').onclick = () => { S.unlock(); $('snd-name').textContent = S.toggle() ? 'あり' : 'なし'; };
  $('snd-name').textContent = S.on ? 'あり' : 'なし';
  // ダブルタップで拡大しないように
  let lastTap = 0; document.addEventListener('touchend', e => { const t = Date.now(); if (t - lastTap < 320 && !e.target.closest('input,button,a,canvas')) e.preventDefault(); lastTap = t; }, { passive: false });
  // ---------- はじめ ----------
  setView(true);
  requestAnimationFrame(loop);
  document.querySelectorAll('#s-title .btn').forEach(b => b.disabled = true);
  QM.setup({
    game: 'dangan', ver: 'v1', name: '弾丸合併',
    getDb: () => DG.getDb(), anchor: '#btn-online', anchorWhere: 'before', btnClass: 'btn big hot', nextClass: 'btn', nameKey: 'dangan_name',
    prep: () => { stopMatch(); },
    join: (code, name) => { S.unlock(); DG.Net.join(name, code); },
    cpu: () => DG.Chal.open(true), cpuLabel: '挑戦状と戦いながら待つ',
    quit: () => { if (DG.Net) DG.Net.leave(); toTitle(); },
    colors: { main: 'var(--red)', alt: 'var(--blue)', bg: '#f6eedb', fg: '#2a211b' },
  });
  QM.resultSlot('#res-qm', null);
  D.load().then(async () => {
    $('loading').textContent = '';
    DG.Chal.mineSummary(true);
    if (await DG.Chal.fromLink()) return;
    document.querySelectorAll('#s-title .btn').forEach(b => b.disabled = false);
    const q = new URLSearchParams(location.search), t = q.get('t');
    if (t) { const sp = DG.decode(t); if (sp) { st.vs[1] = sp; st.vsLab[1] = 'もらったコマ'; let c = null; try { c = DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { } st.vs[0] = c || DG.random(); st.vsLab[0] = c ? '作ったコマ' : 'おまかせ'; history.replaceState(null, '', location.pathname); openVs(); toast('もらったコマと戦えます'); return; } }
    demo();
  }).catch(e => { console.error(e); $('loading').textContent = '読みこめませんでした。通信を確かめて、ページを読みこみなおしてください。'; });
})();
