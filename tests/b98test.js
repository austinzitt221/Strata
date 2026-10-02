const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && /shader|GLSL|WebGL/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b98'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(120); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  // 1. on Earth: the crops in creative, no boss in a save, breeding at ninety
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const cat = api.catalogEntries ? api.catalogEntries() : [];
    const crops = ['tomato', 'wheat', 'lettuce'].map(k => cat.some(it => it && it.kind === k));
    const B = api.bossSys.spawn('warden', g.pos.x + 20, g.pos.y, g.pos.z + 20);
    const sv = api.buildSaveData().entities.filter(r => r[0] === 'warden').length;
    api.killEntity(B, false);
    return { crops, bossSaved: sv, grow: api.breedSys.GROW, rest: api.breedSys.REST, shaderErrs: 0 };
  });
  console.log('1. the Earth :', JSON.stringify(r1));
  // 2. a city, at its own level: the real buildings, nothing of the skin over them
  const r2 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE;
    let best = null; for (let cz = -2; cz <= 2; cz++) for (let cx = -2; cx <= 2; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; }
    const c = best.c; window.__C = c;
    g.pos.set(c.x + 10, g.gen.height(c.x + 10, c.z + 10) + 40, c.z + 10); g.vel.set(0, 0, 0); g.forceStream = true; g.holdT = 0;
    return { x: Math.round(c.x), z: Math.round(c.z) };
  });
  console.log('2. the city  :', JSON.stringify(r2));
  for (let i = 0; i < 60; i++){ await page.waitForTimeout(1000); const p = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(120); return api.loadSys.pending() + g.terrain.dirty.size; }); if (i > 20 && p === 0) break; }
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const rec = Object.values(g.cities || {}).find(c => c.stamped);
    const gy = rec && rec.gy != null ? rec.gy : g.gen.height(g.pos.x, g.pos.z);
    g.pos.set(window.__C.x + 4, gy + 1.7, window.__C.z + 4); g.camView = 0; g.yaw = 0.8; g.pitch = -0.02;
    // a real house wall stands in a real chunk?
    const H = rec && rec.houses ? rec.houses.find(h => Math.hypot(h.x - g.pos.x, h.z - g.pos.z) < 60) : null;
    let wall = null;
    if (H){ const [fx, fz] = H.face; const w = H.w || 5.4, d = H.d || 5.4; const px2 = fz, pz2 = fx; const hp = (fx ? d : w) / 2; const wx = H.x + px2 * (hp - 0.2), wz = H.z + pz2 * (hp - 0.2); const y = (H.gy != null ? H.gy : gy) + 1.2; wall = { sdf: +C.evalSDF(wx, y, wz, api.nearEdits([wx - 2, y - 2, wz - 2, wx + 2, y + 2, wz + 2]), g.gen).toFixed(2), chunk: (() => { const m = C.CHUNK_M; const ch = g.terrain.chunks.get(Math.floor(wx / m) + ',' + Math.floor(y / m) + ',' + Math.floor(wz / m)); return !ch ? 'none' : ch.mesh ? 'mesh' : ch.empty ? 'empty' : ch.banded ? 'banded' : 'pending'; })(), d: Math.round(Math.hypot(wx - g.pos.x, wz - g.pos.z)) }; }
    return { gy: +gy.toFixed(1), houses: rec && rec.houses ? rec.houses.length : 0, wall };
  });
  console.log('3. the walls :', JSON.stringify(r3));
  await settle(4); await page.screenshot({ path: __dirname + '/b98_city.png' });
  // 4. Strata: the tree refresh no longer stutters
  await fly('alien'); await settle(3);
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.loadSys.end(); api.exitCar(); g.fly = true; g.ui = 'none';
    const t = () => { const t0 = performance.now(); api.treeSys.lastCell = null; api.treeSys.refresh(); return +(performance.now() - t0).toFixed(0); };
    const first = t();
    g.pos.x += 11; const second = t();
    g.pos.x += 11; const third = t();
    const f0 = performance.now(); api.farTreeSys.lastCell = null; api.farTreeSys.refresh(); const far = +(performance.now() - f0).toFixed(0);
    g.pos.x += 11; const f1 = performance.now(); api.farTreeSys.lastCell = null; api.farTreeSys.refresh(); const far2 = +(performance.now() - f1).toFixed(0);
    return { refreshMs: [first, second, third], farMs: [far, far2], rd: g.opts.rd };
  });
  console.log('4. Strata    :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
