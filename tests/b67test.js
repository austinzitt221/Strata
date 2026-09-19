const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b67'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  const r = await page.evaluate(() => {
    const A = window.__api.AudioSys, api = window.__api, g = window.__game;
    const ok = A.init();
    const out = { init: ok, state: A.ctx && A.ctx.state };
    // the voices and the sounds: none of them throw
    const tried = [];
    for (const [n, a] of [['boom', 3], ['boom', 60], ['boom', 140], ['shot', 0], ['shot', 0.5], ['shot', 1], ['rocket'], ['thunder'], ['laser'], ['hit'], ['die'], ['break', 2], ['place'], ['step', 1]]){
      try { A.sfx(n, a); tried.push(n); } catch (err){ tried.push(n + '!' + err.message); }
    }
    out.sfx = tried.join(' ');
    // every track steps, makes notes, and asks for a positive wait
    let notes = 0; const orig = A.note; A.note = () => { notes++; };
    const tracks = {};
    for (const ctx in A.TRACKS) for (const name of A.TRACKS[ctx]){ notes = 0; let wait = 0; for (let st = 0; st < 64; st++) wait += A.stepTrack(name, st, 0); tracks[name] = { notes, secs: +wait.toFixed(1) }; }
    // the pick never repeats the track that just played
    let repeats = 0; for (let i = 0; i < 60; i++){ const p = A.pickTrack('surface', 'roam'); if (p === 'roam') repeats++; const q = A.pickTrack('cave', 'deep'); if (q === 'deep') repeats++; }
    // the handover: a track ends, the next of the context comes with a gap; the boss cuts in at once
    g.opts.music = 45;
    A.music('surface'); const t1 = A.track, m1 = A.musicMode;
    const t = A.ctx.currentTime;
    A.trackUntil = t - 1; A.music('surface'); const t2 = A.track, gap = A.trackGap - t;
    A.music('boss'); const t3 = A.track, bossGap = A.trackGap - A.ctx.currentTime;
    A.music('cave'); const t4 = A.track;
    A.note = orig;
    out.tracks = tracks; out.repeats = repeats; out.handover = { first: t1, mode: m1, next: t2, changed: t1 !== t2, gap: +gap.toFixed(1), boss: t3, bossGap: +bossGap.toFixed(1), cave: A.TRACKS.cave.includes(t4) };
    // an explosion tells the sound how far away it was
    let last = null; const os = A.sfx; A.sfx = (n, a) => { last = [n, a]; };
    api.explode(g.pos.x + 30, g.pos.y, g.pos.z, 0.5, 1);
    A.sfx = os;
    out.boomDist = last && last[0] === 'boom' ? +last[1].toFixed(0) : last;
    return out;
  });
  console.log(JSON.stringify(r));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
