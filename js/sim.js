// =============================================
//  弾丸合併  コマの試合（真上から見た2Dの計算）
//  ・3つの形を1本の軸で刺したコマ。コマはずっと回り続ける
//  ・外にはみ出した所が当たって削れる。先に65%削られたら負け、60秒たったら残りの多い方の勝ち
//  ・削れるほど軽くなって速くなる。重心が軸からずれているほど暴れる
//  ・穴（軸のまわり）まで削れた段は、合併解消（バースト）で外れる
//  ・同じコマどうしなら、どの端末でも必ず同じ結果（Math.sin などは使わない）
// =============================================
(function (G) {
  const DG = G.DG, { dsin, dcos, sq, inPoly, polyProps, makeFragments, hashStr } = DG;
  const PI = 3.141592653589793;
  // 段：0 上段、1 中段、2 下段
  DG.TIER = ['上段', '中段', '下段'];
  const T_AREA = [2.3, 3.6, 2.8];       // 段ごとの見た目の広さ（中段がいちばん大きい）
  const T_SEED = [12, 24, 16];          // 欠片の数のめやす
  const T_HP = [0.9, 1.0, 1.0];
  const R_CAP = [3.4, 3.0, 3.4];        // 軸からいちばん遠い所の上限（土俵の半径は 8.2）
  const DMG = 0.003, SLIP = 0.12, DT = 1 / 180, TMAX = 60, LOSE = 0.35, R_ARENA = 8.2, HPA = 52;
  DG.DT = DT; DG.TMAX = TMAX; DG.LOSE = LOSE; DG.R_ARENA = R_ARENA;
  const rot = (x, y, c, s) => [c * x - s * y, s * x + c * y];

  // ---------- 1つの段を作る ----------
  // L：{ key, parts（面積1にそろえた座標）, st:[hp,atk,def,shp,spd], hole:{x,y}（parts の座標）, dir:0〜7 }
  function buildLayer(L, tier) {
    let s = Math.sqrt(T_AREA[tier]); const a = (L.dir | 0) * PI / 4, c = dcos(a), sn = dsin(a);
    const hx = L.hole.x, hy = L.hole.y;
    // 細長い・散らばった形は、軸からいちばん遠い所が R_CAP をこえないよう小さくする（はみ出しは残す）
    { let r2 = 0; for (const p of L.parts) for (let i = 0; i < p.length; i += 2) r2 = Math.max(r2, sq(p[i] - hx) + sq(p[i + 1] - hy)); const r = Math.sqrt(r2) * s; if (r > R_CAP[tier]) s *= R_CAP[tier] / r; }
    const parts = L.parts.map(p => { const q = []; for (let i = 0; i < p.length; i += 2) { const [x, y] = rot((p[i] - hx) * s, (p[i + 1] - hy) * s, c, sn); q.push(x, y); } return q; });
    const frags = makeFragments(parts, L.key + '|' + tier + '|' + L.hole.x.toFixed(4) + ',' + L.hole.y.toFixed(4) + '|' + (L.dir | 0), T_SEED[tier]);
    // 軸が刺さっている欠片（なければ、いちばん近い欠片）
    let anchor = -1, bd = 1e18;
    frags.forEach((f, i) => { if (anchor < 0 && inPoly(0, 0, f.poly)) anchor = i; });
    if (anchor < 0) frags.forEach((f, i) => { const d = f.cx * f.cx + f.cy * f.cy; if (d < bd) { bd = d; anchor = i; } });
    const st = L.st, hpK = (0.75 + st[0] / 100 * 0.7) * T_HP[tier];
    for (const f of frags) { let r2 = 0; for (let i = 0; i < f.poly.length; i += 2) r2 = Math.max(r2, sq(f.poly[i] - f.cx) + sq(f.poly[i + 1] - f.cy)); f.r = Math.sqrt(r2); }
    for (const f of frags) { f.layer = tier; f.alive = true; f.hp = f.a * HPA * hpK; f.max = f.hp; f.rho = 0.75 + st[0] / 100 * 0.7; f.sk = 1 + st[3] / 100 * 3.2; }
    frags[anchor].hp *= 2.0; frags[anchor].max = frags[anchor].hp; frags[anchor].anchor = true;
    return { tier, key: L.key, frags, anchor, st, parts, burst: false };
  }

  // ---------- コマ ----------
  class Top {
    constructor(def, side) {
      this.def = def; this.side = side;
      this.layers = def.layers.map((L, t) => buildLayer(L, t));
      this.frags = []; for (const L of this.layers) for (const f of L.frags) this.frags.push(f);
      const w = [0.25, 0.5, 0.25], stw = k => this.layers.reduce((a, L, t) => a + L.st[k] * w[t], 0);
      this.atk = 0.6 + stw(1) / 100 * 1.1;
      this.dfn = 0.8 + stw(2) / 100 * 0.5;
      this.omega = 21 * (0.85 + stw(4) / 100 * 0.3);
      // 下段：速さ（人口密度）と、軸からの広がり（広い・はしに刺すほど動き回る）
      const low = this.layers[2], lr = this.spread(low.frags), la = low.frags.reduce((a, f) => a + f.a, 0);
      this.roam = (0.55 + low.st[4] / 100 * 0.9) * (0.6 + Math.min(1.6, lr / Math.sqrt(la)) * 0.9);
      this.area0 = this.frags.reduce((a, f) => a + f.a, 0);
      this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.th = 0; this.c = 1; this.s = 0;
      this.mass(); this.m0 = this.m;
      this.dealt = 0; this.best = { a: 0, layer: -1 }; this.wobSum = 0; this.wobN = 0;
    }
    spread(frags) { let s = 0, a = 0; for (const f of frags) { s += Math.sqrt(f.cx * f.cx + f.cy * f.cy) * f.a; a += f.a; } return a ? s / a : 0; }
    mass() {
      let m = 0, cx = 0, cy = 0, r = 0;
      for (const f of this.frags) if (f.alive) { const k = f.a * f.rho; m += k; cx += f.cx * k; cy += f.cy * k; r = Math.max(r, Math.sqrt(f.cx * f.cx + f.cy * f.cy) + f.r); }
      this.m = m || 1e-6; this.comx = m ? cx / m : 0; this.comy = m ? cy / m : 0; this.reach = r;
      this.alive = this.frags.reduce((a, f) => a + (f.alive ? f.a : 0), 0);
    }
    ratio() { return this.alive / this.area0; }
    wob() { return Math.sqrt(this.comx * this.comx + this.comy * this.comy); }
    toWorld(x, y) { return [this.x + this.c * x - this.s * y, this.y + this.s * x + this.c * y]; }
    toLocal(x, y) { const dx = x - this.x, dy = y - this.y; return [this.c * dx + this.s * dy, -this.s * dx + this.c * dy]; }
  }
  DG.Top = Top;

  // ---------- 合体後の性能（作る画面で見せる数字。0〜100） ----------
  DG.stats = function (def) {
    const t = new Top(def, 0), L = t.layers;
    const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
    const reach = t.reach, wob = t.wob(), m = t.m;
    // どの段がいちばん外にはみ出しているか（角度ごとにいちばん外の段を数える）
    const out = [0, 0, 0];
    for (let k = 0; k < 72; k++) {
      const a = k / 72 * 2 * PI, ux = dcos(a), uy = dsin(a); let best = -1, bt = 1;
      for (const f of t.frags) for (let i = 0; i < f.poly.length; i += 2) { const v = f.poly[i] * ux + f.poly[i + 1] * uy; if (v > best) { best = v; bt = f.layer; } }
      out[bt]++;
    }
    let sharp = 0, sn = 0; for (const f of t.frags) { const r = Math.sqrt(f.cx * f.cx + f.cy * f.cy); if (r < reach * 0.7) continue; for (const v of f.sharp) { sharp += v * f.sk; sn++; } }
    sharp = sn ? sharp / sn : 0;
    return {
      weight: clamp((m - 6) / 6.5 * 100),
      reach: clamp((reach - 1.0) / 2.6 * 100),
      power: clamp(((t.atk - 0.6) / 1.1 * 50) + sharp * 25 + (reach - 1.2) * 12),
      guard: clamp((t.dfn - 0.8) / 0.5 * 45 + (L.reduce((a, l) => a + l.st[0], 0) / 300) * 35 + (m - 6) / 6.5 * 20),
      wobble: clamp(wob / 0.9 * 100),
      speed: clamp(t.roam / 2.6 * 100),
      out: out.map(v => Math.round(v / 72 * 100)),
      reachRaw: reach, wobRaw: wob, top: t,
    };
  };

  // ---------- 試合 ----------
  class Match {
    constructor(a, b) {
      this.A = new Top(a, 0); this.B = new Top(b, 1);
      this.A.x = -4.2; this.B.x = 4.2; this.A.y = 0.6; this.B.y = -0.6;
      // 放つ向き・強さは自動（コマの性能で決まる。同じなら点対称）
      for (const [o, sg] of [[this.A, 1], [this.B, -1]]) { const v = 3.5 + o.roam * 1.2; o.vx = 0; o.vy = sg * v; o.th = sg > 0 ? 0 : PI; o.c = dcos(o.th); o.s = dsin(o.th); }
      this.t = 0; this.step = 0; this.ev = []; this.debris = []; this.over = false; this.winner = -2; this.hitN = 0; this.cool = 0; this.idle = 0;
      this.mirror = JSON.stringify(a) === JSON.stringify(b);
    }
    run(n) { let k = 0; while (!this.over && k < n) { this.tick(); k++; } }
    tick() {
      if (this.over) return;
      const A = this.A, B = this.B; this.step++; this.t = this.step * DT;
      for (const [o, e] of [[A, B], [B, A]]) this.drive(o, e);
      for (const o of [A, B]) {
        o.x += o.vx * DT; o.y += o.vy * DT; o.th += o.omega * DT; if (o.th > 2 * PI) o.th -= 2 * PI;
        o.c = dcos(o.th); o.s = dsin(o.th);
        this.wall(o);
        o.wobSum += o.wob(); o.wobN++;
      }
      if (this.cool > 0) this.cool--;
      this.idle += DT;
      this.collide();
      for (const d of this.debris) { d.x += d.vx * DT; d.y += d.vy * DT; d.a += d.w * DT; d.vx *= 0.99; d.vy *= 0.99; d.t += DT; }
      if (this.step % 60 === 0) this.debris = this.debris.filter(d => d.t < 2.5);
      const ra = A.ratio(), rb = B.ratio();
      if (ra < LOSE || rb < LOSE || this.t >= TMAX) {
        this.over = true;
        if (this.mirror) this.winner = -1;
        else if (ra < LOSE && rb < LOSE) this.winner = ra === rb ? -1 : (ra > rb ? 0 : 1);
        else if (ra < LOSE) this.winner = 1; else if (rb < LOSE) this.winner = 0;
        else this.winner = ra === rb ? -1 : (ra > rb ? 0 : 1);
        this.endBy = ra >= LOSE && rb >= LOSE ? 'time' : 'break';
      }
    }
    // 動き：すり鉢で真ん中へ・相手に寄っていく・下段で動き回る・重心のずれで暴れる。軽くなるほど速い
    drive(o, e) {
      const k = o.m0 / o.m, d = Math.sqrt(o.x * o.x + o.y * o.y) || 1;
      let ax = -o.x * 1.1, ay = -o.y * 1.1;                       // すり鉢
      let dx = e.x - o.x, dy = e.y - o.y; const de = Math.sqrt(dx * dx + dy * dy) || 1; dx /= de; dy /= de;
      // 相手へ：しばらく当たっていないほど強く寄る（にらみ合いで回り続けないように）
      const pull = 3.0 * (1 + Math.min(4, this.idle * 1.2));
      ax += dx * pull * k; ay += dy * pull * k;
      // 下段で動き回る：向きがゆっくり変わる（花びらのような動き）
      const wa = this.t * (0.9 + o.roam * 0.25) + o.side * 2.1, wcx = dcos(wa), wsy = dsin(wa);
      ax += ((-o.y / d) * 0.6 + wcx * 0.8) * o.roam * 2.0 * k; ay += ((o.x / d) * 0.6 + wsy * 0.8) * o.roam * 2.0 * k;
      // 重心のずれ：コマの向きといっしょに回る力 → ぶれて暴れる
      const [wx, wy] = rot(o.comx, o.comy, o.c, o.s), wk = Math.min(16, o.omega * o.omega * 0.03);
      ax += wx * wk * k; ay += wy * wk * k;
      o.vx += ax * DT; o.vy += ay * DT;
      o.vx *= 0.995; o.vy *= 0.995;
      const sp = Math.sqrt(o.vx * o.vx + o.vy * o.vy), vm = 8 + 4 * Math.min(2, k - 1);
      if (sp > vm) { o.vx *= vm / sp; o.vy *= vm / sp; }
    }
    wall(o) {
      const lim = R_ARENA - o.reach * 0.35, d = Math.sqrt(o.x * o.x + o.y * o.y);
      if (d <= lim) return;
      const nx = o.x / d, ny = o.y / d; o.x = nx * lim; o.y = ny * lim;
      const vn = o.vx * nx + o.vy * ny; if (vn > 0) { o.vx -= 1.7 * vn * nx; o.vy -= 1.7 * vn * ny; if (vn > 3) this.ev.push({ k: 'wall', x: o.x, y: o.y, v: vn }); }
    }
    collide() {
      const A = this.A, B = this.B;
      if (Math.sqrt(sq(A.x - B.x) + sq(A.y - B.y)) > A.reach + B.reach + 0.05) return;
      const cs = []; this.points(A, B, cs, 0); this.points(B, A, cs, 1);
      if (!cs.length) return;
      cs.sort((p, q) => q.d - p.d || p.o - q.o);
      const use = cs.slice(0, 4);
      let nx = 0, ny = 0, dep = 0; for (const c of use) { nx += c.nx; ny += c.ny; dep += c.d; }
      const nl = Math.sqrt(nx * nx + ny * ny) || 1; nx /= nl; ny /= nl; dep /= use.length;
      const tot = A.m + B.m; A.x -= nx * dep * B.m / tot; A.y -= ny * dep * B.m / tot; B.x += nx * dep * A.m / tot; B.y += ny * dep * A.m / tot;
      let px = 0, py = 0; for (const c of use) { px += c.x; py += c.y; } px /= use.length; py /= use.length;
      // 当たった点の速さ（回転の分も入れる）
      const pa = [px - A.x, py - A.y], pb = [px - B.x, py - B.y];
      const vax = A.vx - A.omega * pa[1], vay = A.vy + A.omega * pa[0], vbx = B.vx - B.omega * pb[1], vby = B.vy + B.omega * pb[0];
      let vn = (vbx - vax) * nx + (vby - vay) * ny;
      // 回っているコマどうしは、こすれた所ではじき合う（回転のこすれの速さの分だけ、ぶつかりが強くなる）
      const vt = Math.abs((vbx - vax) * -ny + (vby - vay) * nx);
      vn -= Math.min(vt, 40) * SLIP;
      if (vn >= 0) return;
      vn = Math.max(vn, -32);
      const mu = A.m * B.m / tot, j = Math.min(-(1.35) * vn * mu, 26 * mu);
      A.vx -= j * nx / A.m; A.vy -= j * ny / A.m; B.vx += j * nx / B.m; B.vy += j * ny / B.m;
      this.idle = 0;
      if (this.cool > 0 || -vn < 1.2) return;
      this.cool = 8;
      this.damage(use, -vn, px, py, mu);
    }
    points(o, e, cs, who) {
      for (const f of o.frags) {
        if (!f.alive) continue;
        const [fx, fy] = o.toWorld(f.cx, f.cy);
        for (const g of e.frags) {
          if (!g.alive) continue;
          const [gx, gy] = e.toWorld(g.cx, g.cy), rr = f.r + g.r;
          if (sq(fx - gx) + sq(fy - gy) > rr * rr) continue;
          for (let i = 0; i < f.poly.length; i += 2) {
            const [wx, wy] = o.toWorld(f.poly[i], f.poly[i + 1]), [lx, ly] = e.toLocal(wx, wy);
            if (!inPoly(lx, ly, g.poly)) continue;
            let bd = 1e9, bnx = 0, bny = 0;
            for (let k = 0, n = g.poly.length; k < n; k += 2) {
              const ax = g.poly[k], ay = g.poly[k + 1], bx = g.poly[(k + 2) % n], by = g.poly[(k + 3) % n];
              const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey || 1e-12; let u = ((lx - ax) * ex + (ly - ay) * ey) / l2; u = u < 0 ? 0 : u > 1 ? 1 : u;
              const qx = ax + ex * u - lx, qy = ay + ey * u - ly, d = Math.sqrt(qx * qx + qy * qy);
              if (d < bd) { bd = d; const el = Math.sqrt(l2); bnx = ey / el; bny = -ex / el; }
            }
            if (bd > 0.4) continue;
            let nx = e.c * bnx - e.s * bny, ny = e.s * bnx + e.c * bny; if (who === 0) { nx = -nx; ny = -ny; }
            cs.push({ x: wx, y: wy, nx, ny, d: bd, o: cs.length * 2 + who, who, sh: (f.sharp[i / 2] || 0) * f.sk, lay: f.layer });
            break;
          }
        }
      }
    }
    damage(use, vn, px, py, mu) {
      const A = this.A, B = this.B, E = mu * vn * vn * DMG;
      let shA = 0, shB = 0, layA = 1, layB = 1;
      for (const c of use) { if (c.who === 0) { if (c.sh >= shA) { shA = c.sh; layA = c.lay; } } else { if (c.sh >= shB) { shB = c.sh; layB = c.lay; } } }
      const nA = use.filter(c => c.who === 0).length, nB = use.length - nA;   // どちらの角が刺さったか
      const shareA = (nA + 0.5) / (use.length + 1), shareB = 1 - shareA;
      // 軸から遠い所で当てた方が強い（回っている勢いが大きい＝はみ出しが長いほど得）
      const rA = Math.sqrt(sq(px - A.x) + sq(py - A.y)), rB = Math.sqrt(sq(px - B.x) + sq(py - B.y));
      const lev = x => Math.max(0.55, Math.min(1.7, x));
      const lA = lev(2 * rA / (rA + rB + 1e-9)), lB = lev(2 * rB / (rA + rB + 1e-9));
      const dmB = E * A.atk * lA * (1 + shA) * (0.35 + 1.3 * shareA) / B.dfn;      // A が B を削る
      const dmA = E * B.atk * lB * (1 + shB) * (0.35 + 1.3 * shareB) / A.dfn;
      // こだわり（重心のずれ）が大きいほど、自分も削れやすい
      const selfA = 1 + A.wob() * 0.9, selfB = 1 + B.wob() * 0.9;
      // 暴れているほど、当てる力も強い（こだわりの分、強みと弱みがはっきり出る）
      const ragA = 1 + Math.min(1, A.wob()) * 0.8, ragB = 1 + Math.min(1, B.wob()) * 0.8;
      this.hitN++;
      const ev = { k: 'hit', x: px, y: py, v: vn, br: [0, 0], burst: [], lay: [layA, layB] };
      const bA = this.apply(A, dmA * selfA * ragB, px, py), bB = this.apply(B, dmB * selfB * ragA, px, py);
      ev.br = [bA, bB];
      if (bB > 0) { A.dealt += bB; if (bB > A.best.a) A.best = { a: bB, layer: layA }; }
      if (bA > 0) { B.dealt += bA; if (bA > B.best.a) B.best = { a: bA, layer: layB }; }
      for (const o of [A, B]) for (const L of o.layers) if (L.burst && !L.told) { L.told = true; ev.burst.push({ side: o.side, tier: L.tier }); }
      this.ev.push(ev);
    }
    apply(o, dmg, px, py) {
      const [lx, ly] = o.toLocal(px, py), R = 0.75, ws = []; let tw = 0;
      for (let i = 0; i < o.frags.length; i++) {
        const f = o.frags[i]; if (!f.alive) continue;
        const d = Math.sqrt(sq(f.cx - lx) + sq(f.cy - ly)); if (d > R + f.r * 0.5) continue;
        const w = sq(Math.max(0.05, 1 - d / (R + f.r * 0.5))); ws.push([i, w]); tw += w;
      }
      if (!tw) return 0;
      let broken = 0; const brk = [];
      for (const [i, w] of ws) { const f = o.frags[i]; f.hp -= dmg * w / tw; if (f.hp <= 0) { f.alive = false; brk.push(f); broken += f.a; } }
      if (!brk.length) return 0;
      broken += this.cut(o);
      for (const f of brk) this.spawn(o, f, px, py);
      o.mass();
      return broken;
    }
    // つながりが切れた所は外れる。穴の欠片がなくなった段はバースト（その段ごと外れる）
    cut(o) {
      let lost = 0;
      for (const L of o.layers) {
        const fr = L.frags; if (L.burst) continue;
        if (!fr[L.anchor].alive) {
          L.burst = true;
          for (const f of fr) if (f.alive) { f.alive = false; lost += f.a; this.spawn(o, f, o.x, o.y, 1.6); }
          continue;
        }
        const seen = new Int32Array(fr.length).fill(-1); let gid = 0; const groups = [];
        for (let i = 0; i < fr.length; i++) {
          if (!fr[i].alive || seen[i] >= 0) continue;
          let a = 0; const st = [i], mem = []; seen[i] = gid;
          while (st.length) { const k = st.pop(); mem.push(k); a += fr[k].a; for (const n of fr[k].nb) if (fr[n].alive && seen[n] < 0) { seen[n] = gid; st.push(n); } }
          groups.push({ mem, a, part: fr[mem[0]].part, hasAnchor: mem.includes(L.anchor) }); gid++;
        }
        // 軸のある部分：軸とつながっている所だけ残る。ほかの部分（島など）：その部分でいちばん大きいかたまりを残す
        const keep = new Set(), bestOf = new Map(), ap = fr[L.anchor].part;
        groups.forEach((g, i) => { if (g.part === ap) { if (g.hasAnchor) keep.add(i); return; } const b = bestOf.get(g.part); if (b == null || g.a > groups[b].a + 1e-12) bestOf.set(g.part, i); });
        for (const i of bestOf.values()) keep.add(i);
        groups.forEach((g, i) => { if (keep.has(i)) return; for (const k of g.mem) { fr[k].alive = false; lost += fr[k].a; this.spawn(o, fr[k], o.x, o.y); } });
      }
      return lost;
    }
    spawn(o, f, px, py, boost) {
      const [wx, wy] = o.toWorld(f.cx, f.cy); let dx = wx - px, dy = wy - py; const l = Math.sqrt(dx * dx + dy * dy) || 1;
      const k = (f.seed * 2654435761 >>> 0) / 4294967296;
      // 回っている勢いの分も、外へ飛ぶ
      const tvx = -o.omega * (wy - o.y), tvy = o.omega * (wx - o.x);
      this.debris.push({ side: o.side, f, x: wx, y: wy, a: o.th, vx: o.vx + tvx * 0.35 + dx / l * (2 + k * 2.5) * (boost || 1), vy: o.vy + tvy * 0.35 + dy / l * (2 + k * 2.5) * (boost || 1), w: o.omega * 0.6 + (k - 0.5) * 10, t: 0 });
    }
    digest() { return [this.winner, this.step, Math.round(this.A.ratio() * 1e6), Math.round(this.B.ratio() * 1e6), this.hitN].join(':'); }
  }
  DG.Match = Match;
})(typeof window !== 'undefined' ? window : globalThis);
