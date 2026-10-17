// =============================================
//  弾丸合併  挑戦状
//  ・試合のあとや保存したコマから「挑戦状を置く」：コマの作り方を名前つきで置いていく
//  ・「挑戦状と戦う」：だれかが置いた挑戦状と、いつでも戦える。挑戦状ごとのリンク（?c=ID）もある
//  ・「あなたの挑戦状」：成績・最近の挑戦者・引退・引き継ぎコード、破られたお知らせと仕返し
//  ・番付：中段の県・国ごとに、この30日で挑戦者を倒した数。勝ちは試合を計算しなおして確かめる
//  ・人気パーツ：新しい挑戦状でよく使われている市町村・国（段ごと）
//
//  データの形
//   dg_chal/{id}     : { k: コマの作り方, n: なまえ, t: 置いた時刻, w: 勝ち, l: 負け, p: 地域（中段）, u: 最後に戦われた時刻 }
//   dg_res/{id}/{rid}: { k: 挑んだ側のコマ, n: なまえ, w: 1=挑戦状が負けた 0=挑戦状が勝った, t }
//   dg_own/{id}      : 引退の合いかぎ（だれも読めない）   dg_retire/{id}/{合いかぎ}: true
//   dg_xfer/{コード} : { v: 'id:合いかぎ,…', t }（引き継ぎ）
//   ※管理人が Firebase の画面で dg_chal/{id}/x = true をつけると、その挑戦状はどこにも出なくなる
// =============================================
(function () {
  const DG = window.DG, JM = window.JM, D = JM.D;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const URL_GAME = 'https://nasubi-no-oniwa.github.io/dangan/';
  const DAY = 86400000, BZ_DAYS = 30, MINE_MAX = 20, DONE_MAX = 400, LIST_N = 200;
  const C = DG.Chal = {};
  let cache = null, cacheAt = 0, retired = null, retiredAt = 0;
  const mine = () => store.get('dg_mychal', []);
  const toks = () => store.get('dg_mytok', {});
  const done = () => store.get('dg_chaldone', []);
  const recText = c => (c.w || c.l) ? `${c.w || 0}勝${c.l || 0}敗` : 'まだだれも挑戦していない';
  const myName = () => { try { return localStorage.getItem('dangan_name') || localStorage.getItem('jm_name') || ''; } catch (e) { return ''; } };
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  C.link = id => URL_GAME + '?c=' + encodeURIComponent(id);
  // 地域：中段の市町村・国で決まる（日本は都道府県、世界の国は W、海外の州・都市・町は国ごと）
  const region = e => e.p <= 47 ? 'J' + String(e.p).padStart(2, '0') : e.p === 48 ? 'W' : 'C' + e.p;
  C.region = sp => region(D.byId.get(sp[1][0]));
  let regions = null;
  function regs() {
    if (regions) return regions;
    const jp = D.pref.slice(0, 47).map((n, i) => ({ k: 'J' + String(i + 1).padStart(2, '0'), n })), seen = new Map();
    for (const e of D.list) if (e.p >= 100 && !seen.has(e.p)) seen.set(e.p, e.pn);
    const world = [...seen.entries()].map(([p, n]) => ({ k: 'C' + p, n })).sort((a, b) => a.n.localeCompare(b.n, 'ja'));
    regions = { jp, world, all: [...jp, { k: 'W', n: '世界の国・昔の国' }, ...world] };
    regions.name = k => (regions.all.find(r => r.k === k) || { n: '' }).n;
    return regions;
  }
  // ---------- 通信 ----------
  const DBURL = () => JM.FIREBASE_CONFIG.databaseURL;
  async function rest(path, q) {
    const qs = q ? '?' + Object.entries(q).map(([k, v]) => k + '=' + encodeURIComponent(k === 'limitToLast' || k === 'limitToFirst' || k === 'shallow' ? String(v) : JSON.stringify(v))).join('&') : '';
    const r = await fetch(DBURL() + '/' + path + '.json' + qs, { cache: 'no-store' });
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }
  C.rest = rest;
  const late = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
  async function restPut(path, val) {
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), 12000);
    try {
      const r = await fetch(DBURL() + '/' + path + '.json', { method: 'PUT', body: JSON.stringify(val), signal: ac ? ac.signal : undefined, cache: 'no-store' });
      if (r.ok) return true;
      const now = await rest(path).catch(() => null);
      if (now != null && JSON.stringify(now).length > 2) return true;
      throw new Error('http ' + r.status);
    } finally { if (t) clearTimeout(t); }
  }
  let sdkSlow = false;   // 常時接続が6秒たってもつながらない端末は、ふつうの通信で書く
  async function put(path, val) {
    if (!sdkSlow) {
      try { const d = await Promise.race([DG.getDb(), late(6000)]); await Promise.race([d.ref(path).set(val), late(6000)]); return; }
      catch (e) { if (e && /permission/i.test(String(e.code || e.message || ''))) throw e; sdkSlow = true; }
    }
    await restPut(path, val);
  }
  async function bump(id, winner) {
    const f = cur => { if (!cur) return cur; if (winner === 1) cur.w = (cur.w || 0) + 1; else cur.l = (cur.l || 0) + 1; cur.u = Date.now(); return cur; };
    if (!sdkSlow) {
      try { const d = await Promise.race([DG.getDb(), late(6000)]); const res = await Promise.race([d.ref('dg_chal/' + id).transaction(f), late(6000)]); return res.snapshot && res.snapshot.val(); }
      catch (e) { if (e && /permission/i.test(String(e.code || e.message || ''))) return null; sdkSlow = true; }
    }
    const cur = await rest('dg_chal/' + id); if (!cur) return null;
    const nv = f(cur); await restPut('dg_chal/' + id, nv); return nv;
  }
  async function retiredSet(force) {
    if (!force && retired && Date.now() - retiredAt < 60000) return retired;
    try { const v = await rest('dg_retire', { shallow: true }); retired = new Set(Object.keys(v || {})); } catch (e) { retired = retired || new Set(); }
    retiredAt = Date.now(); return retired;
  }
  const usable = (c, ret) => c && !c.x && DG.decode(c.k) && !ret.has(c.id);
  async function list(force) {
    if (!force && cache && Date.now() - cacheAt < 60000) return cache;
    const [v, ret] = await Promise.all([rest('dg_chal', { orderBy: 't', limitToLast: LIST_N }), retiredSet(force)]);
    const out = []; for (const id in v || {}) { const c = Object.assign({ id }, v[id]); if (usable(c, ret)) out.push(c); }
    out.sort((a, b) => a.t - b.t);
    cache = out; cacheAt = Date.now(); return out;
  }
  async function getChal(id) { const v = await rest('dg_chal/' + id); return v ? Object.assign({ id }, v) : null; }
  // ---------- 計算しなおして、成績が本物か確かめる（挑んだ側が赤、挑戦状が青） ----------
  const ver = () => store.get('dg_ver', {});
  C.verify = async function (c, r, key) {
    const cv = ver(); if (key && cv[key] != null) return !!cv[key];
    const a = DG.decode(r.k), b = DG.decode(c.k); if (!a || !b) return false;
    await DG.fix(a); await DG.fix(b);
    const m = new DG.Match(await DG.def(a), await DG.def(b)); m.run(1e7);
    const ok = (m.winner === 0 && r.w === 1) || (m.winner === 1 && r.w === 0);
    if (key) { const v = ver(); v[key] = ok ? 1 : 0; const ks = Object.keys(v); if (ks.length > 1500) for (const k of ks.slice(0, ks.length - 1500)) delete v[k]; store.set('dg_ver', v); }
    return ok;
  };
  // ---------- 挑戦状と戦う ----------
  C.open = async function (fromWait) {
    try {
      if (!D.ready) throw new Error('市町村を読みこみ中です。少し待ってください');
      DG.toast('挑戦状をさがしています…');
      const L = await list();
      const my = new Set(mine()), dn = new Set(done());
      let cand = L.filter(c => !my.has(c.id) && !dn.has(c.id));
      if (!cand.length) cand = L.filter(c => !my.has(c.id));
      if (!cand.length) { DG.toast(L.length ? 'いまある挑戦状は、ぜんぶあなたのものです' : 'まだ挑戦状がありません。試合のあとに置いてみよう'); return false; }
      let sum = 0; const wts = cand.map((c, i) => (sum += 1 + i / cand.length * 2));
      const r = Math.random() * sum; const c = cand[wts.findIndex(w => w >= r)] || cand[cand.length - 1];
      C.start(c); return true;
    } catch (e) { DG.toast(e.message && !/^http/.test(e.message) ? e.message : '挑戦状を読みこめませんでした'); return false; }
  };
  C.start = function (c) {
    const s = DG.st; s.chal = c; s.chalRec = false; s.tmp = false;
    s.vs[1] = DG.decode(c.k); s.vsLab[1] = `${c.n}さんの挑戦状（${recText(c)}）`;
    if (!s.vs[0]) { s.vs[0] = DG.curSpec() || DG.random(); s.vsLab[0] = '作ったコマ'; }
    DG.openVs();
  };
  C.fromLink = async function () {
    let id = null; try { id = new URLSearchParams(location.search).get('c'); } catch (e) { }
    if (!id || !/^[0-9a-z]{4,24}$/i.test(id)) return false;
    try { history.replaceState(null, '', location.pathname); } catch (e) { }
    try {
      const [c, ret] = await Promise.all([getChal(id), retiredSet(true)]);
      if (!c || !usable(c, ret)) { DG.toast(c && ret.has(id) ? 'この挑戦状は引退しました' : 'この挑戦状は見つかりませんでした'); return false; }
      C.start(c); DG.toast(`${c.n}さんの挑戦状が届きました`); return true;
    } catch (e) { DG.toast('挑戦状を読みこめませんでした'); return false; }
  };
  C.end = function () { const s = DG.st; s.chal = null; s.chalRec = false; };
  // 試合が終わった：挑戦状の成績をつける（1つの挑戦状につき1回だけ）。赤＝挑んだ側
  C.onResult = async function (winner, mySpec) {
    const s = DG.st, c = s.chal; if (!c) return null;
    let note = winner === 0 ? `${c.n}さんの挑戦状に勝った！` : winner === 1 ? `${c.n}さんの挑戦状に負けた…` : `${c.n}さんの挑戦状と引き分け`;
    const dn = done();
    if (s.chalRec || dn.includes(c.id) || winner < 0 || mine().includes(c.id)) { s.chalRec = true; return note + `（この挑戦状：${recText(c)}）`; }
    s.chalRec = true;
    dn.push(c.id); store.set('dg_chaldone', dn.slice(-DONE_MAX));
    try {
      await put('dg_res/' + c.id + '/' + rid(), { k: DG.encode(mySpec), n: QM.ng(myName()) || 'ななし', w: winner === 0 ? 1 : 0, t: Date.now() });
      const v = await bump(c.id, winner); if (v) { c.w = v.w; c.l = v.l; }
    } catch (e) { }
    return note + `（この挑戦状：${recText(c)}）`;
  };
  // ---------- 投稿・リンク ----------
  C.shareText = async function (text) {
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
  };
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); DG.toast('コピーしました'); }
    catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); DG.toast('コピーしました'); } catch (e2) { DG.toast('コピーできませんでした'); } a.remove(); }
  }
  C.copy = copy;
  const boshu = (sp, id) => `弾丸合併「${DG.nameOf(sp)}」で挑戦状を置きました。倒せるものなら倒してみて！\n${C.link(id)}\n#弾丸合併`;
  // ---------- 挑戦状を置く（list：[{sp, lab}] の中からえらぶ） ----------
  C.put = function (items) {
    items = items.filter(x => x && x.sp); if (!items.length) return;
    const card = QM.dialog(`<h3>挑戦状を置く</h3>
      <p class="qm-sub">えらんだコマが、そのまま挑戦状になります。だれかが挑戦すると成績がつき、挑戦者をたくさん倒すと番付にのります（中段の県・国の番付）。</p>
      <label class="qm-fld">なまえ<input id="ch-name" maxlength="8" autocomplete="off" placeholder="ななし" value="${esc(myName())}"></label>
      <p class="qm-err" id="ch-err"></p>
      ${items.map((it, i) => `<button class="qm-b${i ? ' alt' : ''}" data-i="${i}">${esc(it.lab)}：${esc(DG.nameOf(it.sp))}を置く</button>`).join('')}
      <button class="qm-b sub" id="ch-x">やめる</button>`);
    card.querySelector('#ch-x').onclick = () => QM.close();
    card.querySelectorAll('[data-i]').forEach(b => b.onclick = async () => {
      const it = items[+b.dataset.i], n = card.querySelector('#ch-name').value.trim().slice(0, 8);
      if (n && QM.isBad(n)) { card.querySelector('#ch-err').textContent = 'その名前は使えません。ほかの名前にしてね'; return; }
      try { localStorage.setItem('dangan_name', n); } catch (e) { }
      card.querySelectorAll('button').forEach(x => { x.disabled = true; });
      try {
        card.querySelector('#ch-err').textContent = '置いています…';
        const id = rid(), tok = 't' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
        const v = { k: DG.encode(it.sp), n: QM.ng(n) || 'ななし', t: { '.sv': 'timestamp' }, w: 0, l: 0, p: C.region(it.sp) };
        await put('dg_chal/' + id, v);
        const my = mine(); my.push(id); store.set('dg_mychal', my.slice(-MINE_MAX));
        try { await put('dg_own/' + id, tok); const tk = toks(); tk[id] = tok; store.set('dg_mytok', tk); } catch (e) { }
        const sn = store.get('dg_seen', {}); sn[id] = Date.now(); store.set('dg_seen', sn);
        cache = null;
        const dlg = QM.dialog(`<h3>挑戦状を置きました！</h3><p><b>${esc(DG.nameOf(it.sp))}</b></p>
          <p class="qm-sub">リンクを送ると、その人とすぐ勝負できます。成績はタイトルの「あなたの挑戦状」で見られます。</p>
          <button class="qm-b" id="ch-sh">挑戦者を募集する（投稿）</button><button class="qm-b alt" id="ch-cp">リンクをコピー</button><button class="qm-b sub" id="ch-ok">OK</button>`);
        dlg.querySelector('#ch-sh').onclick = () => C.shareText(boshu(it.sp, id));
        dlg.querySelector('#ch-cp').onclick = () => copy(C.link(id));
        dlg.querySelector('#ch-ok').onclick = () => QM.close();
        C.mineSummary(true);
      } catch (e) {
        card.querySelectorAll('button').forEach(x => { x.disabled = false; });
        card.querySelector('#ch-err').textContent = '置けませんでした。通信を確認してね';
      }
    });
  };
  // ---------- タイトル：成績と、破られたお知らせ ----------
  let sumAt = 0, news = [];
  C.mineSummary = async function (force) {
    const el = $('chal-mine'), nb = $('chal-news'); if (!el) return;
    const ids = mine();
    if (!ids.length) { el.textContent = ''; if (nb) nb.hidden = true; return; }
    if (!force && Date.now() - sumAt < 30000) return; sumAt = Date.now();
    let w = 0, l = 0, n = 0; const seen = store.get('dg_seen', {}), nw = [];
    const ret = await retiredSet();
    await Promise.all(ids.map(async id => {
      try {
        const v = await rest('dg_chal/' + id); if (!v) return;
        n++; w += v.w || 0; l += v.l || 0;
        if (ret.has(id) || !v.u || v.u <= (seen[id] || 0)) return;
        const rs = await rest('dg_res/' + id, { orderBy: 't', startAt: (seen[id] || 0) + 1, limitToLast: 30 });
        for (const k in rs || {}) nw.push(Object.assign({ id: k, cid: id, chal: Object.assign({ id }, v) }, rs[k]));
      } catch (e) { }
    }));
    news = nw.sort((a, b) => b.t - a.t);
    el.textContent = n ? `あなたの挑戦状 ${n}枚：${w}勝${l}敗` : '';
    if (nb) {
      const lost = news.filter(r => r.w === 1).length, won = news.length - lost;
      nb.hidden = !news.length;
      nb.innerHTML = lost ? `🔔 挑戦状が<b>${lost}回</b>破られました${won ? `・${won}勝` : ''}` : `🔔 挑戦状が<b>${won}回</b>勝ちました`;
    }
  };
  function markSeen() {
    const sn = store.get('dg_seen', {});
    for (const r of news) sn[r.cid] = Math.max(sn[r.cid] || 0, r.t);
    store.set('dg_seen', sn); news = []; const nb = $('chal-news'); if (nb) nb.hidden = true;
  }
  // ---------- 仕返し：自分の挑戦状（赤）と、それを破った人のコマ（青） ----------
  C.revenge = function (c, r) {
    const a = DG.decode(c.k), b = DG.decode(r.k); if (!a || !b) { DG.toast('コマが見つかりません'); return; }
    const s = DG.st; s.chal = null; s.tmp = true;
    s.vs[0] = a; s.vsLab[0] = 'あなたの挑戦状'; s.vs[1] = b; s.vsLab[1] = `${r.n}さんのコマ`;
    DG.openVs(); DG.toast(`仕返し！青が${r.n}さんのコマです。赤を作り直して勝ちにいこう`);
  };
  // ---------- あなたの挑戦状（画面） ----------
  function topCanvas(sp, px) { const cv = document.createElement('canvas'); cv.className = 'mc-shape'; cv.style.width = cv.style.height = px + 'px'; DG.preview(cv, sp); return cv; }
  const ago = t => { const m = (Date.now() - t) / 60000; return m < 60 ? Math.max(1, Math.round(m)) + '分前' : m < 1440 ? Math.round(m / 60) + '時間前' : Math.round(m / 1440) + '日前'; };
  C.openMine = async function () {
    DG.stopMatch(); DG.show('mine');
    const box = $('mine-list'); box.innerHTML = '<p class="mc-empty">読みこみ中…</p>';
    const newIds = new Set(news.map(r => r.id)); markSeen();
    const ids = mine().slice().reverse(), tk = toks();
    if (!ids.length) { box.innerHTML = '<p class="mc-empty">まだ挑戦状を置いていません。<br>試合のあとや「保存したコマ」から置けます。</p>'; return; }
    let ret; try { ret = await retiredSet(true); } catch (e) { ret = new Set(); }
    const rows = await Promise.all(ids.map(async id => {
      try { const [c, rs] = await Promise.all([getChal(id), rest('dg_res/' + id, { orderBy: 't', limitToLast: 5 })]); return { id, c, rs: Object.entries(rs || {}).map(([k, v]) => Object.assign({ id: k }, v)).sort((a, b) => b.t - a.t) }; }
      catch (e) { return { id, err: true }; }
    }));
    if (DG.st.scr !== 'mine') return;
    box.innerHTML = '';
    for (const { id, c, rs, err } of rows) {
      const el = document.createElement('div'); el.className = 'mc';
      if (err) { el.innerHTML = '<p class="mc-empty">読みこめませんでした。通信を確認してね</p>'; box.appendChild(el); continue; }
      const sp = c && DG.decode(c.k);
      if (!c || !sp) { el.classList.add('gone'); el.innerHTML = '<p class="mc-empty">この挑戦状は見つかりませんでした</p>'; box.appendChild(el); continue; }
      const isRet = ret.has(id), hid = !!c.x;
      el.classList.toggle('gone', isRet || hid);
      const head = document.createElement('div'); head.className = 'mc-head';
      head.appendChild(topCanvas(sp, 64));
      const info = document.createElement('div'); info.className = 'mc-info';
      info.innerHTML = `<b>${esc(DG.nameOf(sp))}</b><small>${DG.partsTxt(sp)}</small>
        <div class="mc-rec"><span class="w">${c.w || 0}勝</span><span class="l">${c.l || 0}敗</span>${isRet ? '<em>引退</em>' : hid ? '<em>非表示</em>' : ''}<small>${ago(c.t)}に置いた</small></div>`;
      head.appendChild(info); el.appendChild(head);
      const ul = document.createElement('ul'); ul.className = 'mc-res';
      if (!rs.length) ul.innerHTML = '<li class="none">まだだれも挑戦していません</li>';
      for (const r of rs) {
        const rsp = DG.decode(r.k), li = document.createElement('li'); if (newIds.has(r.id)) li.classList.add('new');
        li.innerHTML = `<span class="mk ${r.w ? 'l' : 'w'}">${r.w ? '負' : '勝'}</span><span class="who"><b>${esc(r.n)}</b>さんの${esc(rsp ? DG.nameOf(rsp) : '（わからないコマ）')}${r.w ? 'に破られた' : 'を倒した'}<small>${ago(r.t)}</small></span>`;
        if (r.w && rsp && !isRet) { const b = document.createElement('button'); b.className = 'btn sm hot'; b.textContent = '仕返し'; b.onclick = () => C.revenge(c, r); li.appendChild(b); }
        ul.appendChild(li);
      }
      el.appendChild(ul);
      if (!isRet && !hid) {
        const bt = document.createElement('div'); bt.className = 'mc-btns';
        bt.innerHTML = `<button class="btn sm hot" data-a="sh">挑戦者を募集</button><button class="btn sm" data-a="cp">リンクをコピー</button>${tk[id] ? '<button class="btn sm" data-a="rt">引退させる</button>' : ''}`;
        bt.onclick = ev => { const a = ev.target.closest('button'); if (!a) return; if (a.dataset.a === 'sh') C.shareText(boshu(sp, id)); else if (a.dataset.a === 'cp') copy(C.link(id)); else if (a.dataset.a === 'rt') retire(id, sp); };
        el.appendChild(bt);
      }
      box.appendChild(el);
    }
  };
  function retire(id, sp) {
    const dlg = QM.dialog(`<h3>引退させますか？</h3><p><b>${esc(DG.nameOf(sp))}</b>の挑戦状は、もうだれとも戦わず、番付からも外れます。<br>もとにもどせません。</p><p class="qm-err" id="rt-err"></p><button class="qm-b" id="rt-ok">引退させる</button><button class="qm-b sub" id="rt-x">やめる</button>`);
    dlg.querySelector('#rt-x').onclick = () => QM.close();
    dlg.querySelector('#rt-ok').onclick = async () => {
      const tok = toks()[id]; if (!tok) return;
      dlg.querySelectorAll('button').forEach(b => { b.disabled = true; });
      try { await put('dg_retire/' + id + '/' + tok, true); retired = null; cache = null; QM.close(); DG.toast('引退させました'); C.openMine(); C.mineSummary(true); }
      catch (er) { dlg.querySelectorAll('button').forEach(b => { b.disabled = false; }); dlg.querySelector('#rt-err').textContent = 'できませんでした。通信を確認してね'; }
    };
  }
  // ---------- 引き継ぎコード ----------
  const CODE_CH = 'abcdefghjkmnpqrstuvwxyz23456789';
  C.xferOut = async function () {
    const ids = mine(); if (!ids.length) { DG.toast('まだ挑戦状がありません'); return; }
    const tk = toks(), v = ids.map(id => id + ':' + (tk[id] || '')).join(',');
    let code = ''; for (let i = 0; i < 10; i++) code += CODE_CH[Math.floor(Math.random() * CODE_CH.length)];
    try {
      await put('dg_xfer/' + code, { v, t: Date.now() });
      const shown = code.slice(0, 5) + '-' + code.slice(5);
      const dlg = QM.dialog(`<h3>引き継ぎコード</h3><p class="xf-code">${shown}</p><p class="qm-sub">新しい端末の「あなたの挑戦状」→「コードを入れる」に入力すると、挑戦状（${ids.length}枚）を引き継げます。<br>コードは人に教えないでください（引退もできてしまいます）。</p><button class="qm-b" id="xf-cp">コピー</button><button class="qm-b sub" id="xf-ok">とじる</button>`);
      dlg.querySelector('#xf-cp').onclick = () => copy(shown);
      dlg.querySelector('#xf-ok').onclick = () => QM.close();
    } catch (e) { DG.toast('コードを作れませんでした。通信を確認してね'); }
  };
  C.xferIn = function () {
    const dlg = QM.dialog(`<h3>コードを入れる</h3><p class="qm-sub">前の端末で出した引き継ぎコード（10文字）を入れてください。</p><label class="qm-fld">コード<input id="xf-in" maxlength="16" autocomplete="off" autocapitalize="off" placeholder="abcde-fghjk"></label><p class="qm-err" id="xf-err"></p><button class="qm-b" id="xf-go">引き継ぐ</button><button class="qm-b sub" id="xf-x">やめる</button>`);
    dlg.querySelector('#xf-x').onclick = () => QM.close();
    dlg.querySelector('#xf-go').onclick = async () => {
      const code = dlg.querySelector('#xf-in').value.toLowerCase().replace(/[^a-z0-9]/g, ''), err = dlg.querySelector('#xf-err');
      if (code.length !== 10) { err.textContent = '10文字のコードを入れてください'; return; }
      try {
        const v = await rest('dg_xfer/' + code); if (!v || !v.v) { err.textContent = 'そのコードは見つかりませんでした'; return; }
        const my = mine(), tk = toks(); let add = 0;
        for (const it of String(v.v).split(',')) { const [id, t] = it.split(':'); if (!id) continue; if (!my.includes(id)) { my.push(id); add++; } if (t) tk[id] = t; }
        store.set('dg_mychal', my.slice(-MINE_MAX)); store.set('dg_mytok', tk);
        QM.close(); DG.toast(add ? `${add}枚の挑戦状を引き継ぎました` : 'もう全部この端末にあります'); C.openMine(); C.mineSummary(true);
      } catch (e) { err.textContent = '読みこめませんでした。通信を確認してね'; }
    };
  };
  // ---------- 番付 ----------
  const RANKS = ['横綱', '大関', '関脇', '小結'];
  const rankName = i => i < 4 ? RANKS[i] : '前頭' + '一二三四五六'[i - 4] + '枚目';
  let bzToken = 0;
  C.openBanzuke = async function (key) {
    DG.stopMatch(); DG.show('bz');
    const R = regs(), sel = $('bz-reg');
    if (!sel.options.length) {
      sel.innerHTML = `<optgroup label="日本（都道府県）">${R.jp.map(r => `<option value="${r.k}">${esc(r.n)}</option>`).join('')}</optgroup><optgroup label="世界"><option value="W">世界の国・昔の国</option>${R.world.map(r => `<option value="${r.k}">${esc(r.n)}</option>`).join('')}</optgroup>`;
      sel.onchange = () => { store.set('dg_bzreg', sel.value); C.openBanzuke(sel.value); };
    }
    if (!key) { key = store.get('dg_bzreg', null); const my = mine(); if (!key && my.length) { try { const lc = await getChal(my[my.length - 1]); if (lc && lc.p) key = lc.p; } catch (e) { } } const cur = DG.curSpec(); if (!key && cur) key = C.region(cur); if (!key || !R.all.some(r => r.k === key)) key = 'J13'; }
    sel.value = key;
    const tokn = ++bzToken, box = $('bz-list'), stt = $('bz-st');
    box.innerHTML = ''; stt.textContent = '読みこみ中…';
    let v, ret;
    try { [v, ret] = await Promise.all([rest('dg_chal', { orderBy: 'p', equalTo: key }), retiredSet()]); }
    catch (e) { stt.textContent = '読みこめませんでした。通信を確認してね'; return; }
    if (tokn !== bzToken) return;
    const since = Date.now() - BZ_DAYS * DAY;
    let cand = Object.entries(v || {}).map(([id, c]) => Object.assign({ id }, c)).filter(c => usable(c, ret) && (c.u || 0) >= since && (c.w || 0) > 0);
    cand.sort((a, b) => (b.w || 0) - (a.w || 0) || a.t - b.t); cand = cand.slice(0, 30);
    if (!cand.length) { stt.textContent = ''; box.innerHTML = `<p class="mc-empty">まだ「${esc(R.name(key))}」の番付にのった挑戦状はありません。<br>中段に「${esc(R.name(key))}」の市町村・国を入れた挑戦状を置いて、挑戦者を倒すと番付にのります。</p>`; return; }
    await Promise.all(cand.map(async c => {
      try { const rs = await rest('dg_res/' + c.id, { orderBy: 't', startAt: since, limitToLast: 200 }); c.res = Object.entries(rs || {}).map(([k, r]) => Object.assign({ id: k }, r)); }
      catch (e) { c.res = []; }
      const seen = new Set(); c.wins = [];
      for (const r of c.res.sort((a, b) => b.t - a.t)) { if (r.w !== 0) continue; if (seen.has(r.k)) continue; seen.add(r.k); c.wins.push(r); }
    }));
    if (tokn !== bzToken) return;
    const VMAX = 30;
    for (const c of cand) { c.vw = 0; c.vi = 0; }
    let busy = true;
    const draw = () => {
      const show = cand.filter(c => c.vw > 0).sort((a, b) => b.vw - a.vw || (b.w || 0) - (a.w || 0) || a.t - b.t).slice(0, 10);
      box.innerHTML = '';
      if (!show.length) { if (!busy) box.innerHTML = `<p class="mc-empty">この30日、「${esc(R.name(key))}」で挑戦者を倒した挑戦状はまだありません。</p>`; return; }
      show.forEach((c, i) => {
        const sp = DG.decode(c.k), row = document.createElement('div'); row.className = 'bz-row' + (i === 0 ? ' top' : '');
        row.innerHTML = `<div class="bz-rank">${esc(rankName(i))}</div>`;
        row.appendChild(topCanvas(sp, 52));
        const info = document.createElement('div'); info.className = 'bz-info';
        const more = c.vi < Math.min(VMAX, c.wins.length);
        info.innerHTML = `<small><b>${esc(c.n)}</b>さんの</small><b class="nm">${esc(DG.nameOf(sp))}</b><small>${DG.partsTxt(sp)}</small><span class="bz-w"><span>30日で<b>${c.vw}${c.vw >= VMAX ? '勝以上' : '勝'}</b></span><span>通算${c.w || 0}勝${c.l || 0}敗</span>${more ? '<i>確認中</i>' : ''}</span>`;
        row.appendChild(info);
        const b = document.createElement('button'); b.className = 'btn sm hot'; b.textContent = '挑む';
        if (mine().includes(c.id)) { b.textContent = 'あなた'; b.disabled = true; } else b.onclick = () => { bzToken++; C.start(c); };
        row.appendChild(b); box.appendChild(row);
      });
    };
    const jobs = []; for (let i = 0; i < VMAX; i++) for (const c of cand) if (c.wins[i]) jobs.push([c, c.wins[i]]);
    let k = 0, lastDraw = 0;
    for (const [c, r] of jobs) {
      if (tokn !== bzToken) return;
      const key2 = c.id + '/' + r.id, known = ver()[key2] != null;
      if (!known) { stt.textContent = `勝ちを確かめています… ${k + 1}/${jobs.length}`; await new Promise(res => setTimeout(res, 15)); }
      let ok = false; try { ok = await C.verify(c, r, key2); } catch (e) { ok = false; }
      k++; c.vi++; if (ok) c.vw++;
      if (!known || Date.now() - lastDraw > 400 || k === jobs.length) { draw(); lastDraw = Date.now(); }
    }
    if (tokn !== bzToken) return;
    busy = false; draw(); stt.textContent = '';
  };
  // ---------- 人気パーツ：新しい挑戦状（最大200枚）で、段ごとによく使われている市町村・国 ----------
  let popAt = 0, popV = null;
  C.popular = async function () {
    if (popV && Date.now() - popAt < 120000) return popV;
    const L = await list();
    const cnt = [new Map(), new Map(), new Map()], all = new Map();
    for (const c of L) { const sp = DG.decode(c.k); if (!sp) continue; sp.forEach((s, t) => { cnt[t].set(s[0], (cnt[t].get(s[0]) || 0) + 1); all.set(s[0], (all.get(s[0]) || 0) + 1); }); }
    popV = { n: L.length, tier: cnt.map(m => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)), all: [...all.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40) };
    popAt = Date.now(); return popV;
  };
  // ---------- 画面のボタン ----------
  $('btn-chal').onclick = () => C.open();
  $('btn-mine').onclick = () => C.openMine();
  $('chal-news').onclick = () => C.openMine();
  $('btn-bz').onclick = () => C.openBanzuke();
  $('btn-mine-back').onclick = () => DG.toTitle();
  $('btn-bz-back').onclick = () => { bzToken++; DG.toTitle(); };
  $('btn-xf-out').onclick = () => C.xferOut(); $('btn-xf-in').onclick = () => C.xferIn();
})();
