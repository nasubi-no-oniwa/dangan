// =============================================
//  弾丸合併  画面と流れ
// =============================================
(function () {
  const DG = window.DG, D = JM.D, S = DG.S;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const st = { bg: true, scr: 'title', spec: null, cur: null, prev: null, tab: 1, vs: [null, null], vsLab: ['', ''], m: null, run: false, acc: 0, demo: false, trial: false, pickFor: -1, endAt: 0, rec: {} };
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
    const bg = id === 'title' || id === 'battle' || id === 'merge' || id === 'result' || id === 'vs' || id === 'saved';
    st.bg = bg; $('arena3').style.visibility = $('arena2').style.visibility = bg ? 'visible' : 'hidden';
  }
  let toastT = 0;
  function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('in'), 2200); }
  // ---------- 毎フレーム ----------
  let last = performance.now(), fpsT = 0, fpsN = 0, fpsChecked = 0;
  function loop(ts) {
    const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts;
    if (st.m && st.run) {
      st.acc += dt; let n = 0;
      while (st.acc >= DG.DT && n < 30 && !st.m.over) { st.m.tick(); st.acc -= DG.DT; n++; }
      if (n >= 30) st.acc = 0;
      pump();
    }
    if (V && st.bg) V.frame(dt);
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
      setTimeout(result, 1600);
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
  function renderList() {
    const q = $('b-q').value.trim(), cur = st.spec[st.tab][0];
    const L = q ? D.search(q, 80) : rec(st.tab);
    const head = q ? (L.length ? `${D.lastCount > L.length ? D.lastCount + '件中 ' + L.length + '件' : L.length + '件'}` : '見つかりません') : `${DG.TIER[st.tab]}向きの候補（さがすと24,838から選べる）<button class="btn sm" id="b-more" style="margin-left:6px">ほかの候補</button>`;
    $('b-list').innerHTML = `<div class="b-lhead">${head}</div>` + L.map(e => { const h = DG.hint(e); return `<button class="it${e.id === cur ? ' on' : ''}" data-id="${esc(e.id)}"><span class="nm">${esc(e.n)}<small>${esc(e.pn || '')}${e.t ? ' ・' + esc(e.t.slice(0, 4)) + '年まで' : ''}</small></span><span class="tag h${h.t}">${h.txt}</span></button>`; }).join('');
    const mb = $('b-more'); if (mb) mb.onclick = () => { delete recCache[st.tab]; renderList(); };
  }
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
    const [w, h] = fitCanvas(cv), g = cv.getContext('2d'); g.clearRect(0, 0, w, h);
    try { await DG.fix(spec); const t = new DG.Top(await DG.def(spec), 0); const k = Math.min(w, h) / 2 / (t.reach * 1.08); DG.drawTop(g, t, w / 2, h / 2, k, { tierCol: true }); } catch (e) { }
  }
  function partsTxt(spec) { return spec.map((s, i) => DG.TIER[i][0] + '：' + esc(D.byId.get(s[0]).n)).join('　'); }
  function openVs() {
    stopMatch(); show('vs');
    if (!st.vs[1]) { st.vs[1] = DG.random(); st.vsLab[1] = 'おまかせ'; }
    for (const k of [0, 1]) {
      const el = $('v-s' + k), sp = st.vs[k];
      el.innerHTML = `<span class="v-side">${k ? '青' : '赤'}${st.vsLab[k] ? '・' + esc(st.vsLab[k]) : ''}</span>` + (sp ? `<canvas class="v-cv"></canvas><div class="v-info"><div class="v-name">${esc(DG.nameOf(sp))}</div><div class="v-parts">${partsTxt(sp)}</div></div>` : '<div class="v-info"><div class="v-name">まだない</div></div>') +
        `<div class="v-btns"><button class="btn sm" data-a="saved">保存から</button><button class="btn sm" data-a="rand">おまかせ</button>${k === 0 ? '<button class="btn sm" data-a="build">作る</button>' : ''}</div>`;
      if (sp) preview(el.querySelector('canvas'), sp);
      el.onclick = ev => {
        const b = ev.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
        if (a === 'rand') { st.vs[k] = DG.random(); st.vsLab[k] = 'おまかせ'; openVs(); }
        else if (a === 'saved') openSaved(k);
        else if (a === 'build') openBuild(st.vs[0]);
      };
    }
    $('v-go').disabled = !(st.vs[0] && st.vs[1]);
  }
  $('v-back').onclick = () => toTitle();
  $('v-go').onclick = () => { if (st.vs[0] && st.vs[1]) { st.trial = false; startMatch(st.vs[0], st.vs[1]); } };
  // ---------- 保存したコマ ----------
  function openSaved(pickFor) {
    st.pickFor = pickFor; stopMatch(); show('saved');
    $('sv-title').textContent = pickFor >= 0 ? (pickFor ? '青' : '赤') + 'のコマをえらぶ' : '保存したコマ';
    const L = DG.saved().map(x => ({ x, sp: DG.decode(x.code) })).filter(y => y.sp);
    $('sv-list').innerHTML = L.length ? L.map(({ x, sp }, i) => `<div class="sv" data-i="${i}"><canvas></canvas><div class="sv-i"><div class="v-name">${esc(DG.nameOf(sp))}</div><div class="v-parts">${partsTxt(sp)}</div><div class="v-btns">${pickFor >= 0 ? '<button class="btn sm hot" data-a="use">これにする</button>' : '<button class="btn sm hot" data-a="vs">戦う</button><button class="btn sm" data-a="edit">作り直す</button>'}<button class="btn sm" data-a="send">送る</button><button class="btn sm" data-a="del">消す</button></div></div></div>`).join('') : '<div class="sv-empty">まだ保存したコマはありません。<br>「コマを作る」で作って「保存」をおしてください。</div>';
    $('sv-list').querySelectorAll('.sv').forEach(el => preview(el.querySelector('canvas'), L[+el.dataset.i].sp));
    $('sv-list').onclick = ev => {
      const b = ev.target.closest('[data-a]'); if (!b) return; const it = L[+b.closest('.sv').dataset.i], a = b.dataset.a;
      if (a === 'use') { st.vs[pickFor] = it.sp; st.vsLab[pickFor] = '保存'; openVs(); }
      else if (a === 'vs') { st.vs[0] = it.sp; st.vsLab[0] = '保存'; openVs(); }
      else if (a === 'edit') openBuild(it.sp);
      else if (a === 'send') send(it.sp);
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
  async function startMatch(a, b) {
    stopMatch(); S.unlock();
    await DG.fix(a); await DG.fix(b);
    let da, db; try { [da, db] = [await DG.def(a), await DG.def(b)]; } catch (e) { toast('形を読みこめませんでした'); return; }
    st.match = { a, b };
    show('merge');
    const side = (sp, k) => `<div class="mg-side s${k}">${sp.map((s, i) => `<div class="mg-p" style="background:${DG.TIER_COL[i]}">${DG.TIER[i]}　${esc(D.byId.get(s[0]).n)}</div>`).join('')}<div class="mg-n">${esc(DG.nameOf(sp))}</div></div>`;
    $('mg').innerHTML = side(a, 0) + '<div class="mg-vs">VS</div>' + side(b, 1);
    const ps = [...$('mg').querySelectorAll('.mg-side')];
    mergeT.forEach(clearTimeout); mergeT = [];
    for (let i = 0; i < 3; i++) mergeT.push(setTimeout(() => { ps.forEach(p => p.children[i].classList.add('in')); S.clunk(i); }, 200 + i * 330));
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
  function stopMatch() { st.run = false; st.demo = false; mergeT.forEach(clearTimeout); mergeT = []; S.humStop(); }
  function hudInit() {
    const m = st.m;
    [m.A, m.B].forEach((o, k) => {
      const sp = k ? st.match.b : st.match.a;
      $('h' + k).innerHTML = `<div class="nm">${esc(DG.nameOf(sp))}</div><div class="hp"><i></i><b></b></div><div class="ly">${o.layers.map((L, i) => `<span><i style="background:${DG.TIER_COL[i]}"></i><em>${DG.TIER[i][0]}</em></span>`).join('')}</div>`;
    });
  }
  function hud() {
    const m = st.m; if (!m || st.demo) return;
    $('clock').textContent = Math.max(0, Math.ceil(DG.TMAX - m.t));
    [m.A, m.B].forEach((o, k) => {
      const el = $('h' + k); if (!el.firstChild) return;
      el.querySelector('.hp i').style.width = (o.ratio() * 100).toFixed(1) + '%';
      const sp = el.querySelectorAll('.ly span');
      o.layers.forEach((L, i) => { const r = L.frags.reduce((x, f) => x + (f.alive ? f.a : 0), 0) / L.a0; sp[i].querySelector('i').style.width = (r * 100).toFixed(0) + '%'; sp[i].classList.toggle('burst', L.burst); });
    });
  }
  $('c-auto').onclick = () => DG.V3.setMode('auto');
  $('c-top').onclick = () => DG.V3.setMode(DG.V3.mode() === 'top' ? 'auto' : 'top');
  $('c-dim').onclick = () => setView(!is3);
  $('c-quit').onclick = () => { stopMatch(); st.trial ? openBuild(st.spec) : openVs(); };
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
      <div class="row">${st.trial ? '<button class="btn hot" data-a="back">作る画面にもどる</button><button class="btn" data-a="again">別の相手と試す</button>' : '<button class="btn hot" data-a="rebuild">作り直す</button><button class="btn" data-a="opp">相手を変える</button><button class="btn" data-a="save">赤を保存</button>'}<button class="btn" data-a="title">タイトル</button></div>`;
    $('res').onclick = async ev => {
      const b = ev.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'back') openBuild(st.spec);
      else if (a === 'again') { const opp = await DG.fix(DG.random()); startMatch(st.spec.map(s => s.slice()), opp); }
      else if (a === 'rebuild') openBuild(st.match.a);
      else if (a === 'opp') { st.vs[1] = DG.random(); st.vsLab[1] = 'おまかせ'; openVs(); }
      else if (a === 'save') { DG.save({ name: nm[0], code: DG.encode(sp[0]) }); toast('保存しました（この端末）'); }
      else if (a === 'title') toTitle();
    };
  }
  // ---------- タイトル ----------
  function toTitle() { stopMatch(); show('title'); demo(); }
  $('btn-build').onclick = () => { S.unlock(); openBuild(); };
  $('btn-vs').onclick = () => { S.unlock(); if (!st.vs[0]) { let c = null; try { c = DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { } st.vs[0] = c || DG.random(); st.vsLab[0] = c ? '作ったコマ' : 'おまかせ'; } openVs(); };
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
  D.load().then(async () => {
    $('loading').textContent = '';
    document.querySelectorAll('#s-title .btn').forEach(b => b.disabled = false);
    const q = new URLSearchParams(location.search), t = q.get('t');
    if (t) { const sp = DG.decode(t); if (sp) { st.vs[1] = sp; st.vsLab[1] = 'もらったコマ'; let c = null; try { c = DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { } st.vs[0] = c || DG.random(); st.vsLab[0] = c ? '作ったコマ' : 'おまかせ'; history.replaceState(null, '', location.pathname); openVs(); toast('もらったコマと戦えます'); return; } }
    demo();
  }).catch(e => { console.error(e); $('loading').textContent = '読みこめませんでした。通信を確かめて、ページを読みこみなおしてください。'; });
})();
