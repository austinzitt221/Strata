// Build 121: a world stamp that cuts from a lake into dry ground still lets the water in
// (dry chunks of a wet stamp are no longer made at once; the flow makes them when it gets there)
const { chromium } = require('playwright');
const FILE = process.argv[2] || '/home/user/Strata/strata.html';
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 480, height: 270 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file://' + FILE);
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b121t'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api, W = api.waterSys, S = api.shoreSys, C = window.__CORE;
    // a lake shore: wet here, dry ground 16 m on
    let best = null;
    for (let dx = -900; dx <= 900 && !best; dx += 4) for (let dz = -900; dz <= 900; dz += 4){
      const x = g.pos.x + dx, z = g.pos.z + dz, w = S.wetAt(x, z); if (!w || w.depth < 1.2 || w.top < g.gen.seaLevel + 2) continue;   // a river or a high lake: water the flow has to carry
      for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
        const ex = x + ax * 20, ez = z + az * 20;
        if (S.wetAt(ex, ez) || S.wetAt(x + ax * 12, z + az * 12)) continue;
        if (g.gen.height(ex, ez) < w.top + 1.5 || g.gen.height(ex, ez) > w.top + 6) continue;
        best = { x, z, ax, az, top: w.top }; break;
      }
      if (best) break;
    }
    if (!best) return { none: true };
    g.pos.set(best.x - best.ax * 6, best.top + 4, best.z - best.az * 6); g.fly = true; g.terrain.update(g.pos.x, g.pos.y, g.pos.z);
    // the trench, as the world stamps it: a long box from 4 m inside the water to 20 m out, 3 m deep under the lake's top
    const L = 24, cx = best.x + best.ax * (L / 2 - 4), cz = best.z + best.az * (L / 2 - 4);
    const e = C.makeEdit(0, 1, cx, best.top - 1.5 + 0.0, cz, 3, 0, 0);
    e.sx = best.ax ? L : 3; e.sz = best.az ? L : 3; e.sy = 3;
    W.defer = true; api.applyEdit(e); W.defer = false;
    for (let i = 0; i < 200 && W.matQ.length; i++) W.drainMat(null);
    for (let i = 0; i < 400; i++) W.step();
    // the far end of the trench, 18 m out from the shore point: water in it?
    const wetAt = (d) => { const x = Math.floor(best.x + best.ax * d), z = Math.floor(best.z + best.az * d), y = Math.floor(best.top - 2.5); const v = W.lv(x, y, z); return v; };
    const far = [8, 12, 16, 18].map(d => wetAt(d));
    return { sea: g.gen.seaLevel, shore: [best.x, best.z], dir: [best.ax, best.az], top: +best.top.toFixed(2), levels: far, wetFar: far.filter(v => v >= 1 && v <= 8).length, made: W.cells.size, lazy: W.lazy ? W.lazy.size : 'n/a' };
  });
  console.log('1. the trench :', JSON.stringify(r));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
