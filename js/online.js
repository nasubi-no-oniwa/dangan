// =============================================
//  弾丸合併  あいことば対戦（Firebase Realtime Database）
//  ・同じあいことばの2人が、保存したコマから30秒以内に1つえらんで「準備OK」
//  ・2人そろったら同時に公開して試合。結果は毎回同じになるので、試合はそれぞれの画面で計算する
//  ・3人目からは観戦
//
//  データの形： dangan/{あいことば}/
//    players/{0|1}: { id, name }   watchers/{id}: { name }   ready/{0|1}: 何試合目をやりたいか
//    game: { m }（0番の人が書く）   sel/{0|1}: { ok }   pick/{m}/{0|1}: { k: コマの作り方 }   res/{m}/{0|1}: 結果の要約
// =============================================
(function () {
  const DG = window.DG, JM = window.JM;
  const T = (k, v) => I18N.t(k, v);
  const $ = id => document.getElementById(id);
  const clean = s => String(s || '').replace(/[.#$\[\]\/\s]/g, '').slice(0, 20);
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  function loadScript(src) { return new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error(T('err_net'))); document.head.appendChild(el); }); }
  async function getDb() {
    if (DG._db) return DG._db;
    const v = '10.12.2';
    if (!window.firebase || !firebase.database) { await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-app-compat.js'); await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-database-compat.js'); }
    if (!firebase.apps.length) firebase.initializeApp(JM.FIREBASE_CONFIG);
    return DG._db = firebase.database();
  }
  DG.getDb = getDb; DG.cleanCode = clean;
  let R = null;
  class Room {
    constructor(db, code, name) { this.db = db; this.code = clean(code); this.name = QM.ng(name) || 'ななし'; this.id = uid(); this.slot = -1; this.watching = false; this.players = {}; this.subs = []; this.ms = []; this.game = null; this.sel = {}; this.left = false; this.root = db.ref('dangan/' + this.code); }
    on(ref, ev, fn, list) { ref.on(ev, fn); (list || this.subs).push([ref, ev, fn]); }
    async join() {
      if (!this.code) throw new Error(T('err_code_short'));
      for (const s of [0, 1]) {
        const r = await this.root.child('players/' + s).transaction(cur => (cur ? undefined : { id: this.id, name: this.name }));
        if (r.committed && r.snapshot.val() && r.snapshot.val().id === this.id) { this.slot = s; break; }
      }
      if (this.slot < 0) {
        const w = (await this.root.child('watchers').once('value')).val() || {};
        if (Object.keys(w).length >= 10) throw new Error(T('room_full'));
        this.watching = true; const me = this.root.child('watchers/' + this.id); await me.set({ name: this.name }); me.onDisconnect().remove();
      } else {
        for (const k of ['players/', 'ready/', 'sel/']) this.root.child(k + this.slot).onDisconnect().remove();
        const other = (await this.root.child('players/' + (1 - this.slot)).once('value')).val();
        const g0 = (await this.root.child('game').once('value')).val();
        if (!other) { for (const k of ['game', 'ready', 'sel', 'pick', 'res']) await this.root.child(k).remove(); this.joinM = 1; }
        else this.joinM = ((g0 && g0.m) || 0) + 1;
      }
      this.on(this.root.child('players'), 'value', s => {
        const prev = this.players; this.players = s.val() || {};
        for (const k in this.players) if (this.players[k] && this.players[k].name) this.players[k].name = QM.ng(this.players[k].name);
        ui.people();
        const gone = this.watching ? ((prev[0] && !this.players[0]) || (prev[1] && !this.players[1])) : (prev[1 - this.slot] && !this.players[1 - this.slot]);
        if (gone) ui.left();
        this.tryStart();
      });
      this.on(this.root.child('ready'), 'value', s => { this.ready = s.val() || {}; this.tryStart(); });
      this.on(this.root.child('game'), 'value', s => this.onGame(s.val()));
      this.on(this.root.child('sel'), 'value', s => { this.sel = s.val() || {}; ui.sel(); });
      if (this.slot >= 0) await this.root.child('ready/' + this.slot).set(this.joinM);
      return { slot: this.slot, watching: this.watching };
    }
    tryStart() {
      if (this.slot !== 0 || this.left || !this.joinM) return;
      const r = this.ready || {}, next = ((this.game && this.game.m) || 0) + 1;
      if (!this.players[0] || !this.players[1]) return;
      if (!(r[0] >= next && r[1] >= next) || this.starting === next) return;
      if (this.game && this.game.m && !this.game.done) return;
      this.starting = next;
      this.root.child('sel').remove(); this.root.child('pick').remove(); this.root.child('res').remove();
      this.root.child('game').set({ m: next });
    }
    onGame(g) {
      if (this.left) return; this.game = g; if (!g || !g.m) return;
      if (!this.watching && g.m < (this.joinM || 0)) return;
      if (this.gm === g.m) return; this.gm = g.m;
      for (const [r, e, f] of this.ms) r.off(e, f); this.ms = [];
      this.picks = {};
      this.on(this.root.child('pick/' + g.m), 'value', s => { this.picks = s.val() || {}; ui.picks(); }, this.ms);
      this.on(this.root.child('res/' + g.m), 'value', s => ui.res(s.val() || {}), this.ms);
      ui.newGame(g.m);
    }
    setSel(o) { if (this.slot >= 0 && !this.left) this.root.child('sel/' + this.slot).set(o); }
    pick(o) { if (this.slot >= 0 && this.game) this.root.child('pick/' + this.game.m + '/' + this.slot).set(o); }
    unpick() { if (this.slot >= 0 && this.game) this.root.child('pick/' + this.game.m + '/' + this.slot).remove(); }
    result(d) { if (this.slot >= 0 && this.game) this.root.child('res/' + this.game.m + '/' + this.slot).set(d); }
    done() { if (this.slot === 0 && this.game && !this.game.done) this.root.child('game').set({ m: this.game.m, done: 1 }); }
    again() { if (this.slot >= 0 && this.game) this.root.child('ready/' + this.slot).set(this.game.m + 1); }
    names() { return [0, 1].map(s => (this.players[s] ? DG.who(this.players[s].name) : '…')); }
    leave() {
      if (this.left) return; this.left = true;
      for (const [r, e, f] of this.subs.concat(this.ms)) r.off(e, f); this.subs = []; this.ms = [];
      if (this.watching) this.root.child('watchers/' + this.id).remove();
      else if (this.slot >= 0) for (const k of ['players/', 'ready/', 'sel/']) this.root.child(k + this.slot).remove();
    }
  }
  // ---------- えらぶ画面（30秒） ----------
  const PICK_SEC = 30;
  const P = { list: [], sel: -1, ready: false, until: 0, timer: 0, m: 0 };
  function pickList() {
    const L = [];
    let cur = null; try { cur = DG.decode(localStorage.getItem('dangan_cur')); } catch (e) { }
    if (cur) L.push({ sp: cur, lab: 'lab_made' });   // lab は訳のキー
    for (const x of DG.saved()) { const sp = DG.decode(x.code); if (sp && !L.some(y => DG.encode(y.sp) === x.code)) L.push({ sp, lab: 'lab_saved' }); }
    const nr = L.length ? 1 : 3; for (let i = 0; i < nr; i++) L.push({ sp: DG.random(), lab: 'random' });
    return L;
  }
  function renderPick() {
    const n = R ? R.names() : ['', ''], box = $('pk-list');
    $('pk-title').textContent = R && R.watching ? T('watching_vs', { a: n[0], b: n[1] }) : `${n[0]} VS ${n[1]}`;
    if (R && R.watching) { box.innerHTML = '<div class="sv-empty">' + T('both_picking') + '</div>'; $('pk-ok').classList.add('hide'); return; }
    $('pk-ok').classList.remove('hide');
    box.innerHTML = P.list.map((it, i) => `<button class="sv pk${i === P.sel ? ' on' : ''}" data-i="${i}"><canvas></canvas><div class="sv-i"><div class="v-name">${DG.esc(DG.dispName(it.sp))}</div><div class="v-parts">${DG.partsTxt(it.sp)}</div><span class="tag lab">${T(it.lab)}</span></div></button>`).join('');
    box.querySelectorAll('.sv').forEach(el => DG.preview(el.querySelector('canvas'), P.list[+el.dataset.i].sp));
    status();
  }
  function status() {
    if (!R) return;
    const fo = R.sel[1 - R.slot], left = Math.max(0, Math.ceil((P.until - Date.now()) / 1000));
    let t = P.ready ? T('you_ready') : T('pick_left', { n: left });
    if (!R.watching) t += T(fo && fo.ok ? 'opp_ready' : 'opp_picking');
    $('pk-st').textContent = t; $('pk-time').textContent = R.watching ? '' : left;
    $('pk-ok').textContent = T(P.ready ? 'ready_re' : 'ready');
    $('pk-ok').disabled = P.sel < 0;
  }
  function tick() {
    if (!R || DG.st.scr !== 'pick') { clearInterval(P.timer); return; }
    if (!P.ready && !R.watching && Date.now() >= P.until) { if (P.sel < 0) P.sel = P.list.length - 1; Net.ready(); }
    status();
  }
  // ---------- 画面との橋わたし ----------
  const ui = {
    people() { if (!R) return; const n = R.names(); $('on-people').textContent = n[0] + ' VS ' + n[1]; if (DG.st.scr === 'pick') status(); },
    sel() { if (DG.st.scr === 'pick') status(); },
    newGame(m) {
      const s = DG.st; s.mode = R.watching ? 'watch' : 'net'; s.reveal = false; s.netNote = ''; P.m = m;
      QM.started({ code: R.code, watch: R.watching });
      DG.stopMatch(); DG.show('pick');
      P.list = pickList(); P.ready = false; P.until = Date.now() + PICK_SEC * 1000;
      // 前の試合で使ったコマを最初からえらんでおく
      const lastK = store('dangan_netlast'); P.sel = Math.max(0, P.list.findIndex(x => DG.encode(x.sp) === lastK));
      renderPick(); clearInterval(P.timer); P.timer = setInterval(tick, 300);
      if (!R.watching) R.setSel({ ok: 0 });
    },
    async picks() {
      const s = DG.st, Pk = R.picks || {};
      if (!Pk[0] || !Pk[1] || s.reveal) return;
      const a = DG.decode(Pk[0].k), b = DG.decode(Pk[1].k); if (!a || !b) return;
      s.reveal = true; clearInterval(P.timer);
      const n = R.names();
      DG.startMatch(a, b, { who: n, net: true, onEnd: m => { if (!R.watching) R.result(m.digest()); } });
    },
    res(v) {
      if (!v[0] || !v[1]) return;
      DG.st.netNote = T(v[0] === v[1] ? 'net_same' : 'net_diff');
      DG.netNote && DG.netNote();
      if (R && R.slot === 0) R.done();
    },
    left() {
      if (QM.isRandom()) {
        const after = DG.st.scr === 'result';
        QM.notice(T(after ? 'opp_left_room' : 'you_win'), T(after ? 'play_other' : 'left_win'), [
          { label: T('qm_next'), fn: () => QM.next() },
          { label: T('to_title'), sub: true, fn: () => { Net.leave(); DG.toTitle(); } },
        ]);
        return;
      }
      DG.toast(T('opp_gone')); setTimeout(() => { Net.leave(); DG.toTitle(); }, 1500);
    },
  };
  const Net = DG.Net = {
    open() {
      DG.stopMatch(); DG.show('online');
      $('on-form').classList.remove('hide'); $('on-wait').classList.add('hide'); $('on-err').textContent = '';
      $('in-name').value = store('dangan_name') || store('jm_name') || ''; $('in-code').value = store('dangan_code') || '';
    },
    async join(name, code) {
      $('on-err').textContent = '';
      if (!clean(code)) { $('on-err').textContent = T('err_code_short'); return; }
      if (!JM.D.ready) { $('on-err').textContent = T('loading_wait'); return; }
      const nm = String(name || '').trim().slice(0, 8);
      if (nm && QM.isBad(nm)) { $('on-err').textContent = T('qm_badname'); return; }
      store('dangan_name', nm); store('dangan_code', code);
      if (DG.st.scr !== 'online') { Net.open(); $('in-name').value = nm; $('in-code').value = code; }
      $('btn-join').disabled = true;
      try {
        if (R) { R.leave(); R = null; }
        const db = await getDb(); R = new Room(db, code, nm); DG.room = R;
        const r = await R.join();
        $('on-form').classList.add('hide'); $('on-wait').classList.remove('hide');
        $('on-msg').textContent = T(r.watching ? 'watch_wait' : 'waiting');
      } catch (e) { $('on-err').textContent = e.message || T('err_conn'); R = null; }
      $('btn-join').disabled = false;
    },
    choose(i) {
      if (!R || R.watching || i < 0 || i >= P.list.length) return;
      if (P.sel === i) return;
      P.sel = i;
      if (P.ready) { P.ready = false; R.unpick(); R.setSel({ ok: 0 }); }
      renderPick();
    },
    ready() {
      if (!R || R.watching || P.sel < 0) return;
      const it = P.list[P.sel], k = DG.encode(it.sp);
      store('dangan_netlast', k);
      P.ready = true; R.setSel({ ok: 1 }); R.pick({ k });
      renderPick();
    },
    again() { if (R && !R.watching) { R.again(); DG.st.netNote = ''; DG.toast(T('waiting')); } },
    leave() { QM.ended(); clearInterval(P.timer); if (R) { R.leave(); R = null; DG.room = null; } DG.st.mode = 'local'; },
    active: () => !!R, _P: P,
  };
  // ボタン
  $('btn-join').onclick = () => Net.join($('in-name').value, $('in-code').value);
  $('in-code').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-join').click(); });
  $('btn-on-back').onclick = () => { Net.leave(); DG.toTitle(); };
  $('pk-list').addEventListener('click', ev => { const b = ev.target.closest('.pk'); if (b) Net.choose(+b.dataset.i); });
  $('pk-ok').onclick = () => Net.ready();
  $('pk-back').onclick = () => { Net.leave(); DG.toTitle(); };
})();
