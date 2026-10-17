// =============================================
//  弾丸合併  音（その場で作る音。ファイルの読みこみなし）
// =============================================
(function () {
  const DG = window.DG, S = DG.S = { on: true };
  let ac = null, master = null, hum = null, noiseBuf = null;
  try { S.on = localStorage.getItem('dangan_snd') !== '0'; } catch (e) { }
  function ctx() {
    if (ac) return ac;
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ac = new C(); } catch (e) { return null; }
    master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }
  S.unlock = function () { const a = ctx(); if (a && a.state === 'suspended') a.resume(); };
  S.toggle = function () { S.on = !S.on; try { localStorage.setItem('dangan_snd', S.on ? '1' : '0'); } catch (e) { } if (!S.on) S.humStop(); return S.on; };
  const ok = () => S.on && ctx() && ac.state === 'running';
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  // 金属どうしが当たる音：高い倍音いくつか＋短いノイズ
  S.hit = function (v, big) {
    if (!ok()) return; const t = ac.currentTime, vol = Math.min(1, 0.25 + v / 30) * (big ? 1.2 : 0.8);
    const base = 520 + Math.random() * 380;
    for (const r of [1, 2.76, 5.4, 8.9]) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = base * r;
      env(g, t, 0.002, vol * 0.18 / r ** 0.5, 0.18 + 0.25 / r); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.6);
    }
    const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); n.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 1.2;
    env(g, t, 0.001, vol * 0.35, 0.07); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.15);
  };
  // 合併解消（バースト）：低いドン＋はじける音
  S.burst = function () {
    if (!ok()) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    env(g, t, 0.005, 0.8, 0.55); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.7);
    const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g2 = ac.createGain(); n.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = 1800;
    env(g2, t, 0.002, 0.6, 0.4); n.connect(f); f.connect(g2); g2.connect(master); n.start(t); n.stop(t + 0.5);
  };
  // 回る音（試合のあいだずっと）
  S.humStart = function () {
    if (!ok() || hum) return;
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o1.type = 'sawtooth'; o2.type = 'sawtooth'; o1.frequency.value = 92; o2.frequency.value = 97;
    f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 0.4);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start();
    hum = { o1, o2, g, f };
  };
  S.humSet = function (speed) { if (!hum) return; const t = ac.currentTime; hum.o1.frequency.setTargetAtTime(80 + speed * 9, t, 0.1); hum.o2.frequency.setTargetAtTime(85 + speed * 9.5, t, 0.1); hum.f.frequency.setTargetAtTime(400 + speed * 90, t, 0.1); };
  S.humStop = function () { if (!hum) return; const h = hum; hum = null; try { const t = ac.currentTime; h.g.gain.setTargetAtTime(0.0001, t, 0.1); h.o1.stop(t + 0.5); h.o2.stop(t + 0.5); } catch (e) { } };
  // カウントダウン・はじめ
  S.beep = function (hi) {
    if (!ok()) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = hi ? 1320 : 660; env(g, t, 0.005, 0.18, hi ? 0.35 : 0.12); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
  };
  // 合体：がちゃん
  S.clunk = function (i) {
    if (!ok()) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(220 + i * 70, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.15);
    env(g, t, 0.002, 0.5, 0.18); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
    S.hit(6, false);
  };
  S.win = function () {
    if (!ok()) return; const t = ac.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f; env(g, t + i * 0.11, 0.01, 0.22, 0.5); o.connect(g); g.connect(master); o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.7); });
  };
})();
