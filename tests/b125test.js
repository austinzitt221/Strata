// Build 125: STRATA YOU CAN READ -- the rock in beds, tilted and folded; every cut shows them
const { chromium } = require('playwright');
const FILE = process.argv[2] || '/home/user/Strata/strata.html';
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file://' + FILE);
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b125'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.timeOfDay = 0.3; window.__api.updateDayNight(0); g.fly = true; });
  // 0. the cost: meshing the same forty chunks
  const r0 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, px = Math.floor(g.pos.x / 8), pz = Math.floor(g.pos.z / 8), cy0 = Math.floor(g.gen.height(g.pos.x, g.pos.z) / 8);
    const t = performance.now(); let tris = 0;
    for (let i = 0; i < 40; i++){ const d = C.meshChunk(px + (i % 7) - 3, cy0 - 1 - ((i / 7) | 0) % 3, pz + ((i * 3) % 7) - 3, [], g.gen, 1); if (d) tris += d.positions.length / 9; }
    return { ms: Math.round(performance.now() - t), tris };
  });
  console.log('0. meshing    :', JSON.stringify(r0));
  if (process.argv[2]){ await b.close(); return; }
  // 1. what the ground is made of, below the surface
  const r1 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, N = C.MAT_NAME, cnt = {};
    let n = 0;
    for (let i = 0; i < 6000; i++){
      const x = g.pos.x + (Math.random() - 0.5) * 2000, z = g.pos.z + (Math.random() - 0.5) * 2000, h = g.gen.height(x, z), y = h - 2 - Math.random() * 70;
      if (y < -74) continue;
      const m = C.materialAt(x, y, z, [], g.gen); cnt[N[m]] = (cnt[N[m]] || 0) + 1; n++;
    }
    for (const k in cnt) cnt[k] = +(cnt[k] / n).toFixed(3);
    return cnt;
  });
  console.log('1. the ground :', JSON.stringify(r1));
  // 2. a column, top to bottom: the beds as you would drill them
  const r2 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, N = C.MAT_NAME, x = g.pos.x + 13, z = g.pos.z - 7, out = [];
    let last = null, from = 0;
    for (let y = Math.floor(g.gen.height(x, z)) - 1; y > -80; y -= 0.5){ const m = N[C.materialAt(x, y, z, [], g.gen)]; if (m !== last){ if (last) out.push(last + ' ' + from + '..' + (y + 0.5)); last = m; from = y; } }
    out.push(last + ' ' + from + '..-80');
    return out.slice(0, 24);
  });
  console.log('2. a column   :', JSON.stringify(r2));
  // 3. a bed mined gives its rock
  const r3 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, x = g.pos.x, z = g.pos.z;
    let hit = null;
    for (let y = g.gen.height(x, z) - 2; y > -60 && !hit; y -= 0.5){ const m = C.materialAt(x, y, z, [], g.gen); if (m === C.MAT.SANDSTONE || m === C.MAT.SHALE || m === C.MAT.LIMESTONE || m === C.MAT.GRANITE) hit = { y, m }; }
    if (!hit) return { none: true };
    const e = C.makeEdit(0, 0, x, hit.y, z, 0.8, 0, 0);
    const got = C.mineYield(g.edits, e, g.gen);
    return { bed: C.MAT_NAME[hit.m], yield: Object.fromEntries(Object.entries(got).map(([k, v]) => [C.MAT_NAME[k], v])) };
  });
  console.log('3. mined      :', JSON.stringify(r3));
  // 4. the picture: a big cut, looking at its wall
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const X = Math.round(g.pos.x), Z = Math.round(g.pos.z), H = Math.round(g.gen.height(X, Z));
    api.applyEdit(C.makeEdit(0, 1, X, H - 12, Z - 14, 28, 0, 0));
    g.pos.set(X - 6, H - 22, Z - 4); g.yaw = 0; g.pitch = 0.12; g.armor.head = { kind: 'headlamp' };   // the lamp on the wall, 10 m off
  });
  await settle(6);
  await page.screenshot({ path: __dirname + '/b125_cut.png' });
  // 5. the badlands: a mesa's flank
  const bad = await page.evaluate(() => {
    const g = window.__game;
    let best = null;
    for (let r = 100; r < 3000 && !best; r += 60) for (let a = 0; a < 6.28; a += 0.2){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; if (g.gen.archAt(x, z) === 3 && g.gen.height(x, z) > 18){ best = { x, z, h: g.gen.height(x, z) }; break; } }
    if (!best) return null;
    g.pos.set(best.x + 40, best.h - 4, best.z + 40); const dx = best.x - g.pos.x, dz = best.z - g.pos.z; g.yaw = Math.atan2(-dx, -dz); g.pitch = 0.05; g.forceStream = true;
    return best;
  });
  console.log('5. badlands   :', JSON.stringify(bad));
  if (bad){ await settle(10); await page.screenshot({ path: __dirname + '/b125_badlands.png' }); }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
