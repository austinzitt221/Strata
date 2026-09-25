// same scenario on two builds: the water must come out the same, cell for cell
const { chromium } = require('playwright');
const run = async (FILE) => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 320, height: 180 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file://' + FILE); await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','ab'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys, S = api.shoreSys;
    // a lake edge near spawn
    let w = null, bd = 1e9;
    for (let dx = -200; dx <= 200; dx += 4) for (let dz = -200; dz <= 200; dz += 4){ const x = Math.round(g.pos.x) + dx, z = Math.round(g.pos.z) + dz, WW = S.wetAt(x, z); if (!WW || WW.depth < 1.5) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, top: WW.top }; } }
    if (!w) return { err: 'no water' };
    W.reset();
    // a trench from the water out onto the land, then a pit, then a block placed in the flow
    const out = [];
    for (let k = 0; k < 10; k++){ const x = w.x + k * 2.5, z = w.z; const e = C.makeEdit(0, 1, x, Math.floor(w.top) - 1, z, 3, 0, 0); api.applyEdit(e); }
    for (let n = 0; n < 60; n++) W.tick(0.13);
    api.applyEdit(C.makeEdit(0, 0, w.x + 27, Math.floor(w.top) - 3, w.z, 6, 0, 0));
    for (let n = 0; n < 60; n++) W.tick(0.13);
    api.applyEdit(C.makeEdit(1, 1, w.x + 12, Math.floor(w.top) - 1, w.z, 3, 0, 0));
    for (let n = 0; n < 80; n++) W.tick(0.13);
    // world-stamped edits the frame defers: drain them, as a frame would
    if (W.matQ){ W.defer = true; api.applyEdit(C.makeEdit(0, 1, w.x + 6, Math.floor(w.top) - 1, w.z + 4, 4, 0, 0)); W.defer = false; W.drainMat(); }
    else api.applyEdit(C.makeEdit(0, 1, w.x + 6, Math.floor(w.top) - 1, w.z + 4, 4, 0, 0));
    for (let n = 0; n < 60; n++) W.tick(0.13);
    const keys = [...W.cells.keys()].sort();
    let h = 0, wet = 0, src = 0;
    for (const k of keys){ const a = W.cells.get(k), d = W.dist.get(k); for (let q = 0; q < 512; q++){ h = (Math.imul(h, 31) + a[q] * 7 + (d ? d[q] : 0)) | 0; if (a[q] >= 1 && a[q] <= 8) wet++; if (a[q] === 8) src++; } h = (Math.imul(h, 17) + k.length) | 0; }
    return { at: [w.x, w.z, +w.top.toFixed(2)], chunks: keys.length, wet, src, hash: h };
  });
  await b.close();
  return { r, errs: errs.slice(0, 3) };
};
(async () => {
  const A = await run(process.argv[2]), B = await run(process.argv[3]);
  console.log('A', JSON.stringify(A)); console.log('B', JSON.stringify(B));
  console.log(A.r.hash === B.r.hash && A.r.wet === B.r.wet ? 'SAME' : 'DIFFERENT');
})();
