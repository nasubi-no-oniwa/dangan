// =============================================
//  弾丸合併  形の道具
//  ・地元の最強と同じ「決まった答えの sin / cos」「欠片づくり」（同じ作りなら必ず同じ結果）
//  ・刺せる穴の自動づくり
// =============================================
(function (G) {
  const DG = G.DG = G.DG || {};
  // ---------- 決まった答えの sin / cos ----------
  const PI = 3.141592653589793, TAU = 6.283185307179586;
  function dsin(x) {
    x = x - TAU * Math.round(x / TAU);              // -π〜π
    if (x > PI / 2) x = PI - x; else if (x < -PI / 2) x = -PI - x;   // -π/2〜π/2
    const x2 = x * x;
    return x * (1 - x2 / 6 * (1 - x2 / 20 * (1 - x2 / 42 * (1 - x2 / 72 * (1 - x2 / 110 * (1 - x2 / 156 * (1 - x2 / 210)))))));
  }
  const dcos = x => dsin(x + PI / 2);
  const sq = v => v * v;   // 2乗はかけ算で（べき乗は端末で答えがずれることがある）

  // ---------- 決まった並びの乱数（欠片の種の位置に使う） ----------
  function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function hashStr(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  // ---------- 多角形の道具 ----------
  function polyArea(p) { let a = 0; for (let i = 0, n = p.length; i < n; i += 2) { const j = (i + 2) % n; a += p[i] * p[j + 1] - p[j] * p[i + 1]; } return a / 2; }
  function polyProps(p) {   // 面積・重心・慣性（重心まわり、密度1）
    let a = 0, cx = 0, cy = 0, ix = 0;
    for (let i = 0, n = p.length; i < n; i += 2) {
      const j = (i + 2) % n, x0 = p[i], y0 = p[i + 1], x1 = p[j], y1 = p[j + 1], c = x0 * y1 - x1 * y0;
      a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; ix += c * (x0 * x0 + x0 * x1 + x1 * x1 + y0 * y0 + y0 * y1 + y1 * y1);
    }
    a /= 2; if (Math.abs(a) < 1e-12) return { a: 0, cx: p[0], cy: p[1], i: 0 };
    cx /= 6 * a; cy /= 6 * a; const io = ix / 12;
    return { a: Math.abs(a), cx, cy, i: Math.abs(io) - Math.abs(a) * (cx * cx + cy * cy) };
  }
  function inPoly(x, y, p) {
    let c = false;
    for (let i = 0, n = p.length, j = n - 2; i < n; j = i, i += 2) {
      const yi = p[i + 1], yj = p[j + 1];
      if ((yi > y) !== (yj > y) && x < (p[j] - p[i]) * (y - yi) / (yj - yi) + p[i]) c = !c;
    }
    return c;
  }
  // 凸の切り取り（半平面 nx*x+ny*y <= d のがわを残す）。新しくできた辺には tag をつける
  function clipHalf(pts, tags, nx, ny, d, tag) {
    const out = [], ot = [], n = pts.length / 2; if (!n) return [out, ot];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ax = pts[2 * i], ay = pts[2 * i + 1], bx = pts[2 * j], by = pts[2 * j + 1];
      const da = nx * ax + ny * ay - d, db = nx * bx + ny * by - d;
      if (da <= 0) { out.push(ax, ay); ot.push(tags[i]); }
      if ((da <= 0) !== (db <= 0)) { const t = da / (da - db); out.push(ax + (bx - ax) * t, ay + (by - ay) * t); ot.push(da <= 0 ? tag : tags[i]); }
    }
    return [out, ot];
  }
  // ---------- 形から欠片を作る ----------
  // parts: [[x,y,x,y...]]（面積が 1 になるよう正規化済みの座標をさらに world に拡大したもの）
  // 辺の tag：-1 = もとの輪郭（外がわ）、0以上 = となりの欠片の種の番号
  function makeFragments(parts, key, nSeed) {
    const rnd = lcg(hashStr(key));
    // 輪の向きを反時計回り（面積が正）にそろえる
    parts = parts.map(p => { if (polyArea(p) >= 0) return p; const q = []; for (let i = p.length - 2; i >= 0; i -= 2) q.push(p[i], p[i + 1]); return q; });
    // 外形の頂点の「とがり」：前後に少し離れた点との角度で測る
    const sharpOf = [];
    for (const p of parts) {
      const n = p.length / 2, sh = new Float64Array(n);
      let per = 0; for (let i = 0; i < n; i++) { const j = (i + 1) % n; per += Math.sqrt(sq(p[2 * j] - p[2 * i]) + sq(p[2 * j + 1] - p[2 * i + 1])); }
      const reach = per * 0.02;
      for (let i = 0; i < n; i++) {
        // reach だけ前後に進んだ点
        let a = i, acc = 0; while (acc < reach) { const b = (a - 1 + n) % n; acc += Math.sqrt(sq(p[2 * a] - p[2 * b]) + sq(p[2 * a + 1] - p[2 * b + 1])); a = b; if (a === i) break; }
        let c = i; acc = 0; while (acc < reach) { const b = (c + 1) % n; acc += Math.sqrt(sq(p[2 * c] - p[2 * b]) + sq(p[2 * c + 1] - p[2 * b + 1])); c = b; if (c === i) break; }
        const ux = p[2 * a] - p[2 * i], uy = p[2 * a + 1] - p[2 * i + 1], vx = p[2 * c] - p[2 * i], vy = p[2 * c + 1] - p[2 * i + 1];
        const lu = Math.sqrt(ux * ux + uy * uy) || 1, lv = Math.sqrt(vx * vx + vy * vy) || 1;
        const cosA = (ux * vx + uy * vy) / (lu * lv), cross = vx * uy - vy * ux;   // 反時計回りの輪で cross>0 が出っぱり
        // 角度が小さい（cos が 1 に近い）出っぱりほどとがっている
        sh[i] = cross > 0 ? Math.max(0, (cosA + 0.2) / 1.2) : 0;
      }
      sharpOf.push(sh);
    }
    // 種：六角形にならべて、形の中にあるものだけ。少しずらす
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9, area = 0;
    for (const p of parts) { area += Math.abs(polyArea(p)); for (let i = 0; i < p.length; i += 2) { minx = Math.min(minx, p[i]); maxx = Math.max(maxx, p[i]); miny = Math.min(miny, p[i + 1]); maxy = Math.max(maxy, p[i + 1]); } }
    const sp = Math.sqrt(area / (nSeed || 34)) * 1.07, seeds = [];
    for (let row = 0, y = miny + sp * 0.4; y < maxy; y += sp * 0.866, row++) {
      for (let x = minx + (row % 2 ? sp * 0.5 : 0) + sp * 0.3; x < maxx; x += sp) {
        const jx = x + (rnd() - 0.5) * sp * 0.5, jy = y + (rnd() - 0.5) * sp * 0.5;
        if (parts.some(p => inPoly(jx, jy, p))) seeds.push(jx, jy);
      }
    }
    // 小さい島などで種がない部分には、その部分の重心に1つ置く
    for (const p of parts) { let has = false; for (let i = 0; i < seeds.length; i += 2) if (inPoly(seeds[i], seeds[i + 1], p)) { has = true; break; } if (!has) { const q = polyProps(p); seeds.push(q.cx, q.cy); } }
    const ns = seeds.length / 2, frags = [];
    const big = (maxx - minx + maxy - miny) * 2;
    for (let s = 0; s < ns; s++) {
      const sx = seeds[2 * s], sy = seeds[2 * s + 1];
      // ボロノイの領域（凸）を各部分に当てて切る
      const planes = [], far = [];
      for (let t = 0; t < ns; t++) {
        if (t === s) continue; const tx = seeds[2 * t], ty = seeds[2 * t + 1], dx = tx - sx, dy = ty - sy;
        (dx * dx + dy * dy > sp * sp * 9 ? far : planes).push([dx, dy, (dx * (sx + tx) + dy * (sy + ty)) / 2, t]);
      }
      parts.forEach((p, pi) => {
        let pts = Array.from(p), tags = new Array(p.length / 2).fill(-1), vsh = Array.from(sharpOf[pi]);
        // 頂点のとがりは、頂点の位置で引き継ぐ（切ってできた点は 0）
        let shp = vsh;
        const clip = list => {
          for (const [nx, ny, d, t] of list) {
            const out = [], ot = [], os = [], n = pts.length / 2; if (!n) break;
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n, ax = pts[2 * i], ay = pts[2 * i + 1], bx = pts[2 * j], by = pts[2 * j + 1];
              const da = nx * ax + ny * ay - d, db = nx * bx + ny * by - d;
              if (da <= 0) { out.push(ax, ay); ot.push(tags[i]); os.push(shp[i]); }
              if ((da <= 0) !== (db <= 0)) { const k = da / (da - db); out.push(ax + (bx - ax) * k, ay + (by - ay) * k); ot.push(da <= 0 ? t : tags[i]); os.push(0); }
            }
            pts = out; tags = ot; shp = os;
          }
        };
        clip(planes);
        // 欠片が種から 1.5 マスより遠くまで広がっているときだけ、遠い種でも切る。
        // （離れた島の種の領域が本土全体にかぶると「割れない大きな欠片」ができて無敵になる。北海道など）
        // ふつうの欠片は遠い種では切れないので、前と同じ形・同じ結果のまま
        let ext = false; for (let i = 0; i < pts.length; i += 2) if (sq(pts[i] - sx) + sq(pts[i + 1] - sy) > sp * sp * 2.25) { ext = true; break; }
        if (ext) clip(far);
        if (pts.length < 6) return;
        const pr = polyProps(pts); if (pr.a < area * 0.0015) return;
        frags.push({ seed: s, part: pi, poly: pts, tags, sharp: shp, a: pr.a, cx: pr.cx, cy: pr.cy, inertia: pr.i });
      });
    }
    // となりどうし（seed番号→欠片の番号）
    const bySeed = new Map(); frags.forEach((f, i) => { if (!bySeed.has(f.seed)) bySeed.set(f.seed, []); bySeed.get(f.seed).push(i); });
    for (const f of frags) {
      f.nb = []; for (const t of f.tags) if (t >= 0 && bySeed.has(t)) for (const k of bySeed.get(t)) if (!f.nb.includes(k) && frags[k].part === f.part) f.nb.push(k);
      let r = 0; for (let i = 0; i < f.poly.length; i += 2) r = Math.max(r, sq(f.poly[i] - f.cx) + sq(f.poly[i + 1] - f.cy)); f.r = Math.sqrt(r);
    }
    return frags;
  }
  DG.makeFragments = makeFragments;
  DG.polyArea = polyArea; DG.polyProps = polyProps; DG.inPoly = inPoly; DG.sq = sq; DG.dsin = dsin; DG.dcos = dcos; DG.lcg = lcg; DG.hashStr = hashStr;

  // ---------- 点から輪郭までのいちばん短い距離 ----------
  function edgeDist(x, y, parts) {
    let best = 1e18;
    for (const p of parts) for (let i = 0, n = p.length; i < n; i += 2) {
      const ax = p[i], ay = p[i + 1], bx = p[(i + 2) % n], by = p[(i + 3) % n];
      const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey || 1e-12; let u = ((x - ax) * ex + (y - ay) * ey) / l2; u = u < 0 ? 0 : u > 1 ? 1 : u;
      const dx = ax + ex * u - x, dy = ay + ey * u - y, d = dx * dx + dy * dy; if (d < best) best = d;
    }
    return Math.sqrt(best);
  }
  DG.edgeDist = edgeDist;
  // ---------- 刺せる穴（3〜8個） ----------
  // parts：その段の形（world 座標）。返り値：[{x,y,k:'重心'|'はし'|'とがり'|'太い所'|'ほか'}]
  DG.makeHoles = function (parts) {
    let A = 0, cx = 0, cy = 0;
    for (const p of parts) { const q = polyProps(p); A += q.a; cx += q.cx * q.a; cy += q.cy * q.a; }
    cx /= A; cy /= A;
    const L = Math.sqrt(A), dmin0 = L * 0.075, sepMin = L * 0.16;
    const inside = (x, y) => parts.some(p => inPoly(x, y, p));
    // いちばん大きい部分
    let main = parts[0], ma = 0; for (const p of parts) { const a = Math.abs(polyArea(p)); if (a > ma) { ma = a; main = p; } }
    // 格子で候補点をとる（ふちからの距離つき）
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    for (let i = 0; i < main.length; i += 2) { minx = Math.min(minx, main[i]); maxx = Math.max(maxx, main[i]); miny = Math.min(miny, main[i + 1]); maxy = Math.max(maxy, main[i + 1]); }
    const step = Math.max(maxx - minx, maxy - miny) / 34, grid = [];
    for (let y = miny + step / 2; y < maxy; y += step) for (let x = minx + step / 2; x < maxx; x += step) {
      if (!inPoly(x, y, main)) continue; grid.push([x, y, edgeDist(x, y, parts)]);
    }
    if (!grid.length) return [{ x: cx, y: cy, k: '重心' }];
    const out = [];
    const ok = (x, y, dmin) => inside(x, y) && edgeDist(x, y, parts) >= dmin && out.every(h => (h.x - x) * (h.x - x) + (h.y - y) * (h.y - y) >= sepMin * sepMin);
    const nearestGood = (x, y, dmin) => { let b = null, bd = 1e18; for (const g of grid) { if (g[2] < dmin) continue; const d = (g[0] - x) * (g[0] - x) + (g[1] - y) * (g[1] - y); if (d < bd && ok(g[0], g[1], dmin)) { bd = d; b = g; } } return b; };
    const add = (x, y, k, dmin) => { if (ok(x, y, dmin)) { out.push({ x, y, k }); return true; } const g = nearestGood(x, y, dmin); if (g) { out.push({ x: g[0], y: g[1], k }); return true; } return false; };
    for (const dmin of [dmin0, dmin0 * 0.6, dmin0 * 0.35]) {
      out.length = 0;
      // 1. 重心
      add(cx, cy, '重心', dmin);
      // 2. 太い所（ふちからいちばん遠い点）
      let fat = grid[0]; for (const g of grid) if (g[2] > fat[2]) fat = g;
      add(fat[0], fat[1], '太い所', dmin);
      // 3. はし：主な向き（いちばん長い向き）の両はしから、少し内がわ
      let sxx = 0, syy = 0, sxy = 0; for (const g of grid) { const dx = g[0] - cx, dy = g[1] - cy; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
      const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy), ux = dcos(ang), uy = dsin(ang);
      let lo = null, hi = null, lov = 1e18, hiv = -1e18;
      for (const g of grid) { if (g[2] < dmin) continue; const v = (g[0] - cx) * ux + (g[1] - cy) * uy; if (v < lov) { lov = v; lo = g; } if (v > hiv) { hiv = v; hi = g; } }
      if (hi) add(hi[0], hi[1], 'はし', dmin);
      if (lo) add(lo[0], lo[1], 'はし', dmin);
      // 4. 横向きのはし（細長くない形のとき）
      let lo2 = null, hi2 = null, l2v = 1e18, h2v = -1e18;
      for (const g of grid) { if (g[2] < dmin) continue; const v = -(g[0] - cx) * uy + (g[1] - cy) * ux; if (v < l2v) { l2v = v; lo2 = g; } if (v > h2v) { h2v = v; hi2 = g; } }
      if (hi2 && h2v > L * 0.3) add(hi2[0], hi2[1], 'はし', dmin);
      if (lo2 && -l2v > L * 0.3) add(lo2[0], lo2[1], 'はし', dmin);
      // 5. とがった所の近く：輪郭の頂点のうち、重心からいちばん遠い点の方向
      let far = null, fd = -1; for (let i = 0; i < main.length; i += 2) { const d = (main[i] - cx) * (main[i] - cx) + (main[i + 1] - cy) * (main[i + 1] - cy); if (d > fd) { fd = d; far = [main[i], main[i + 1]]; } }
      if (far) { const g = nearestGood(far[0], far[1], dmin); if (g) out.push({ x: g[0], y: g[1], k: 'とがり' }); }
      // 6. すき間をうめる：ほかの点からいちばん遠い候補
      while (out.length < 8) {
        let b = null, bs = -1;
        for (const g of grid) { if (g[2] < dmin || !ok(g[0], g[1], dmin)) continue; let m = 1e18; for (const h of out) m = Math.min(m, (h.x - g[0]) * (h.x - g[0]) + (h.y - g[1]) * (h.y - g[1])); if (m > bs) { bs = m; b = g; } }
        if (!b || bs < sepMin * sepMin * 2.2) break;
        out.push({ x: b[0], y: b[1], k: 'ほか' });
      }
      if (out.length >= 3) break;
    }
    return out.slice(0, 8);
  };
})(typeof window !== 'undefined' ? window : globalThis);
