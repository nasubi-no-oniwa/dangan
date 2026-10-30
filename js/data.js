// =============================================
//  弾丸合併  データの読みこみと検索（地元の最強のデータをそのまま使う：/jimoto/data/）
//  ・名前の一覧は最初に読みこむ（検索をすぐできるように）
//  ・形は県ごとのファイルを、使うときだけ読みこむ
// =============================================
(function () {
  const JM = window.JM = window.JM || {};
  const D = JM.D = { ready: false, list: [], byId: new Map(), shapes: {}, pref: [], dpref: [] };
  // ---------- ことば（地名の表示だけ。画面の文字は i18n.js） ----------
  const LG = () => (window.I18N && I18N.lang) || 'ja';
  const TX = {
    load: ['読みこめませんでした：', "Couldn't load: ", '無法載入：', '불러오지 못했습니다: '],
    nf: ['見つかりません', 'Not found', '找不到', '찾을 수 없습니다'],
    ns: ['形がありません', 'No shape data', '沒有形狀資料', '모양 데이터가 없습니다'],
    cur: ['現存', 'Exists today', '現存', '현존'],
    gone: ['{y}年になくなった', 'Gone in {y}', '{y}年消失', '{y}년에 사라짐'],
    until: ['{y}年まで（今の{s}の前の形）', 'Until {y} (earlier form of today\'s {s})', '至{y}年（現在{s}的前身）', '{y}년까지 (지금 {s}의 이전 모습)'],
    to: ['{y}年 {s}へ', '{y}: merged into {s}', '{y}年 併入{s}', '{y}년 {s}(으)로'],
    nowis: ['（今は{n}）', ' (now {n})', '（現為{n}）', ' (지금은 {n})'],
    yr: ['{y}年', '{y}', '{y}年', '{y}년'],
  };
  const LI = { ja: 0, en: 1, zh: 2, ko: 3 };
  function tx(k, v) { let t = TX[k][LI[LG()] || 0]; if (v) for (const x in v) t = t.split('{' + x + '}').join(v[x]); return t; }
  D.tx = tx;
  // 地名の訳（names-xx.json）をのせる。日本語のときは元のまま
  let NL = null, NLlang = 'ja';
  function label(e) {
    const L = NL && NLlang !== 'ja' ? NL : null, i = e.i;
    e.dn = (L && L.n[i]) || e.n;
    e.dpn = L ? (e.p >= 100 || e.p < 48 ? (L.pn[i] || e.pn) : '') : e.pn;
    e.dc = L ? (L.c[i] || '') : e.c;
    e.dwhere = L ? (L.w[i] || (e.p === 48 ? e.dc : '')) : e.where;
    e.hay = e.hay0 + (L ? '|' + norm(e.dn) + '|' + norm(e.dpn) : '');
  }
  async function loadNames(lang) {
    if (lang === 'ja') { NL = null; NLlang = 'ja'; D.dpref = D.pref.slice(); return; }
    try { NL = await getJSON('names-' + lang + '.json'); NLlang = lang; D.dpref = NL.pref.concat(D.pref.slice(NL.pref.length)); }
    catch (err) { console.warn(err); NL = null; NLlang = 'ja'; D.dpref = D.pref.slice(); }
  }
  // 言語を切りかえたら、地名の表示もかえる
  D.relabel = async function (lang) {
    if (!D.ready) return;
    await loadNames(lang || LG());
    for (const e of D.list) label(e);
    try { document.dispatchEvent(new CustomEvent('namesrelabeled')); } catch (err) {}
  };
  document.addEventListener('langchange', ev => { D.relabel(ev.detail); });
  JM.url = name => (JM.ASSETS && JM.ASSETS[name]) || ((JM.BASE || '../jimoto/data/') + name);
  async function getJSON(name) {
    if (JM.DATA && JM.DATA[name]) return JM.DATA[name];
    const r = await fetch(JM.url(name)); if (!r.ok) throw new Error(tx('load') + name); return r.json();
  }
  D.load = async function () {
    const lang0 = LG();
    const [idx, meta] = await Promise.all([getJSON('index.json'), getJSON('meta.json'), loadNames(lang0 === 'ja' ? 'ja' : lang0).catch(() => {})]);
    D.pref = meta.pref; if (!NL) D.dpref = D.pref.slice(); else D.dpref = NL.pref.concat(D.pref.slice(NL.pref.length));
    const n = idx.id.length;
    for (let i = 0; i < n; i++) {
      const e = { i, id: idx.id[i], n: idx.n[i], p: idx.p[i], c: idx.c[i], k: idx.k[i], f: idx.f[i], t: idx.t[i], s: idx.s[i], pop: idx.pop[i], py: idx.py[i], pe: idx.pe[i], a: idx.a[i], st: idx.st[i], ky: idx.ky[i], al: idx.al ? idx.al[i] : '', nw: idx.nw ? idx.nw[i] : '' };
      e.pn = D.pref[e.p - 1] || '';
      // 海外の州・都市・町は、国名を県名と同じ位置に出す（例：トルコ共和国 ムシュ県）
      if (e.p >= 100) { e.pn = e.c; e.c = ''; }
      // どこの何か（例：トルコ共和国の州・県、イタリア共和国の町）
      e.where = e.p >= 100 ? e.pn + 'の' + (e.id[0] === 'C' ? '都市' : e.id[0] === 'T' ? '町' : e.pn === '日本国' ? '都道府県' : '州・県') : e.p === 48 ? e.c : '';
      e.w = e.p >= 48;   // 世界（48：国・地域と昔の国、100〜：国ごとの州・省・県）
      // よみが名前と同じ（カタカナの国名など）なら、よみは出さない
      e.kd = norm(e.k) === norm(e.n) ? '' : e.k;
      e.full = e.pn + ' ' + e.n;
      // 探す文字：「県＋名前」「県＋郡＋名前」「郡＋名前」「別名」のどの書き方でも見つかるように
      e.key = norm([e.pn + e.n, e.pn + (e.c || '') + e.n, (e.c || '') + e.n, e.al || ''].join('|')); e.kk = norm(e.k); e.nn = norm(e.n);
      e.hay0 = e.key + '|' + e.kk + '|' + (PK[e.p - 1] || '');
      label(e);
      D.list.push(e); D.byId.set(e.id, e);
    }
    D.ready = true;
  };
  // 都道府県の読み（「ひろしま ふちゅう」のように、ひらがなで県もしぼれるように）
  const PK = ['ほっかいどう', 'あおもりけん', 'いわてけん', 'みやぎけん', 'あきたけん', 'やまがたけん', 'ふくしまけん', 'いばらきけん', 'とちぎけん', 'ぐんまけん', 'さいたまけん', 'ちばけん', 'とうきょうと', 'かながわけん', 'にいがたけん', 'とやまけん', 'いしかわけん', 'ふくいけん', 'やまなしけん', 'ながのけん', 'ぎふけん', 'しずおかけん', 'あいちけん', 'みえけん', 'しがけん', 'きょうとふ', 'おおさかふ', 'ひょうごけん', 'ならけん', 'わかやまけん', 'とっとりけん', 'しまねけん', 'おかやまけん', 'ひろしまけん', 'やまぐちけん', 'とくしまけん', 'かがわけん', 'えひめけん', 'こうちけん', 'ふくおかけん', 'さがけん', 'ながさきけん', 'くまもとけん', 'おおいたけん', 'みやざきけん', 'かごしまけん', 'おきなわけん'];
  // 書き方のちがう字（旧字・異体字）をそろえる。名前の側と、入力の側の両方にかける
  const VAR = { '龍': '竜', '澤': '沢', '濱': '浜', '邊': '辺', '邉': '辺', '嶋': '島', '嶌': '島', '齋': '斎', '齊': '斎', '櫻': '桜', '曾': '曽', '舘': '館', '冨': '富', '槇': '槙', '廣': '広', '國': '国', '縣': '県', '眞': '真', '德': '徳', '實': '実', '藏': '蔵', '惠': '恵', '淺': '浅', '關': '関', '條': '条', '與': '与', '壽': '寿', '萬': '万', '彌': '弥', '亞': '亜', '會': '会', '豐': '豊', '靜': '静', '驛': '駅', '鐵': '鉄', '髙': '高', '﨑': '崎', '嵜': '崎', '埼': '埼', '塚': '塚', '桒': '桑', '檜': '桧', '莊': '荘', '峯': '峰', '岡': '岡', '鷗': '鴎', '蘆': '芦', '葛': '葛', '寶': '宝', '黑': '黒', '淸': '清', '來': '来', '隆': '隆' };
  const VAR_RE = new RegExp('[' + Object.keys(VAR).join('') + ']', 'g');
  // ひらがな・カタカナ・全角半角・旧字をそろえる。「ヶ」「ケ」「ヵ」も同じにする
  function norm(s) {
    s = String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').normalize('NFKC').toLowerCase().replace(/[\s・･]+/g, '');
    s = s.replace(VAR_RE, c => VAR[c]).replace(/[ヶヵ]/g, c => (c === 'ヶ' ? 'ケ' : 'カ'));
    return s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/ゖ/g, 'け').replace(/ゕ/g, 'か');
  }
  D.norm = norm;
  // 画面に出す名前（県名・国名つき）
  D.fname = e => {
    const L = NLlang;
    if (L === 'ja' || !NL) return e.p >= 100 ? e.pn + ' ' + e.n : e.pn + e.n;
    if (!e.dpn) return e.dn;
    if (L === 'en') return e.dn + ', ' + e.dpn;
    if (L === 'zh') return e.p < 48 ? e.dpn + e.dn : e.dpn + ' ' + e.dn;
    return e.dpn + ' ' + e.dn;
  };
  // 合併先をたどって「今は〇〇」を出す
  // 役場があった場所が、今どの市町村・区に入っているか（nw）を先に使う。なければ合併先をたどる
  D.now = function (e) {
    const w = e.nw && D.byId.get(e.nw); if (w && !w.t) return w;
    let x = e, guard = 0;
    while (x && x.t && x.s && guard++ < 12) x = D.byId.get(x.s);
    return x && !x.t ? x : null;
  };
  D.badge = function (e) {
    if (!e.t) return { cur: true, txt: tx('cur') };
    const y = e.t.slice(0, 4), s = e.s && D.byId.get(e.s);
    if (!s) return { cur: false, txt: tx('gone', { y }) };
    // 同じ名前の今の市に続くもの（例：区ができる前の神戸市）
    if (s.n === e.n && s.p === e.p && !s.t) return { cur: false, txt: tx('until', { y, s: s.dn || s.n }) };
    const ja = NLlang === 'ja' || !NL;
    const nm = x => ja ? (x.p !== e.p ? x.pn : '') + x.n : (x.p !== e.p ? D.fname(x) : x.dn);
    const sname = nm(s);
    const now = D.now(e);
    let txt = tx('to', { y, s: sname });
    if (now && now !== s) txt += tx('nowis', { n: nm(now) });
    return { cur: false, txt };
  };
  D.years = e => (!e.f && !e.t) ? '' : (e.f ? tx('yr', { y: e.f }) : '') + (NLlang === 'en' ? '–' : '〜') + (e.t ? tx('yr', { y: e.t.slice(0, 4) }) : '');
  // 検索：空白で区切った言葉が、ぜんぶ入っているものを出す（「広島県 安芸郡」「北海道 村」「ひろしま ふちゅう」など）
  D.search = function (q, max = 80, cls) {
    const toks = String(q || '').normalize('NFKC').split(/[\s　]+/).map(norm).filter(Boolean);
    if (!toks.length) return [];
    const out = [];
    for (const e of D.list) {
      
      let ok = true; for (const t of toks) if (!e.hay.includes(t)) { ok = false; break; }
      if (!ok) continue;
      // 名前そのものに当たったものを上に
      let sc = 2;
      const dn = e.dnn !== undefined && e.dnS === e.dn ? e.dnn : (e.dnS = e.dn, e.dnn = norm(e.dn));
      for (const t of toks) { if (e.nn === t || e.kk === t || dn === t) { sc = 0; break; } if (e.nn.startsWith(t) || e.kk.startsWith(t) || dn.startsWith(t)) sc = Math.min(sc, 1); }
      out.push([sc, e.t ? 1 : 0, e.p, e.i, e]);
    }
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3]);
    D.lastCount = out.length;
    return out.slice(0, max).map(x => x[4]);
  };
  D.random = function () { return D.list[Math.floor(Math.random() * D.list.length)]; };
  // 形（県ごとのファイル）
  D.shape = async function (id) {
    const e = D.byId.get(id); if (!e) throw new Error(tx('nf'));
    // 海外の州・都市（p≧100）は、国20か国ずつ1つのファイルにまとめている（アップロードのファイル数をおさえるため）
    const key = e.p >= 100 ? 'shape/w' + Math.floor((e.p - 100) / 20) + '.json' : 'shape/' + String(e.p).padStart(2, '0') + '.json';
    if (!D.shapes[key]) D.shapes[key] = getJSON(key);
    const pack = await D.shapes[key];
    const enc = pack[id]; if (!enc) throw new Error(tx('ns'));
    // 差分をもとにもどす
    return enc.map(q => { const out = []; let x = 0, y = 0; for (let i = 0; i < q.length; i += 2) { x += q[i]; y += q[i + 1]; out.push(x, y); } return out; });
  };
})();
