const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b100'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, S = api.springSys, W = api.waterSys;
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    // a dry flat yard, well above any water
    const yx = Math.round(p.x) + 8, yz = Math.round(p.z);
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 24, yz, 30, 0, 0)); api.applyEdit(C.makeEdit(1, 1, yx, gy - 6, yz, 30, 0, C.MAT.GRASS)); g.terrain.process(200);
    const top = gy + 9;   // the yard's top: the slab is 30 tall centred at gy - 6
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'springstone', count: 2 }; g.slots[1] = { kind: 'can', water: 0 }; g.slots[2] = { kind: 'ichorstone', count: 1 }; g.slots[3] = { kind: 'lavastone', count: 1 };
    const ichorHere = S.add('ichorstone', yx + 6, top, yz + 6);
    const sp = S.add('springstone', yx, top, yz);
    const twice = S.add('springstone', yx + 1, top, yz);
    const sd = (x, y, z) => +C.evalSDF(x, y, z, api.nearEdits([x - 2, y - 2, z - 2, x + 2, y + 2, z + 2]), g.gen).toFixed(2);
    const basin = { middle: sd(sp.x + 0.5, sp.y, sp.z + 0.5), rim: sd(sp.x + 2.5, sp.y, sp.z + 0.5), floor: sd(sp.x + 0.5, sp.y - 1.2, sp.z + 0.5) };
    const key = W.keyOf(sp.x, sp.y, sp.z); const a = W.cells.get(key);
    const src = a ? a[W.idx(sp.x & 7, sp.y & 7, sp.z & 7)] : null;
    const staticSrc = W.staticLevel(sp.x, sp.y, sp.z), hasW = W.hasWater(key), active = W.active.has(key);
    for (let i = 0; i < 30; i++) W.step();
    W.maintain();
    const filled = { inWater: api.inWater(sp.x + 0.5, sp.y, sp.z + 0.5), inWaterRim: api.inWater(sp.x + 3.5, sp.y, sp.z + 0.5), mesh: W.meshes.has(key), top: api.waterTopAt(sp.x + 0.5, sp.z + 0.5, sp.y) };
    // the can fills there
    g.pos.set(sp.x + 0.5, sp.y + 0.6, sp.z - 2.5); g.yaw = 0; g.pitch = 0.6; g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.rotation.set(-0.6, Math.PI, 0);
    g.hotSel = 1; const can = g.slots[1]; api.farmSys.rmb(can); const canWater = can.water;
    // an edit beside it does not lose the sources; a reload keeps them
    api.applyEdit(C.makeEdit(0, 0, sp.x + 3, sp.y + 0.5, sp.z, 1.2, 0, 0));
    const after = W.cells.get(key)[W.idx(sp.x & 7, sp.y & 7, sp.z & 7)];
    const save = api.buildSaveData();
    // the lava stone
    const lv = S.add('lavastone', yx - 5, top, yz - 5);
    const lava = C.MAT_NAME[C.materialAt(yx - 5, top - 0.4, yz - 5, api.nearEdits([yx - 7, top - 3, yz - 7, yx - 3, top + 2, yz - 3]), g.gen)];
    return { ichorHere, sp, twice, basin, src, staticSrc, hasW, active, filled, canWater, after, saved: save.springs.length, lava, icons: ['springstone', 'lavastone', 'ichorstone'].map(k => (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100), craft: (() => { const r = C.RECIPES.find(r => r.kind === 'springstone'); const sl = new Array(40).fill(null); return C.craft(sl, r, true); })() };
  });
  console.log('1. the spring:', JSON.stringify(r1));
  await page.evaluate(() => { const g = window.__game; const sp = g.springs[0]; g.fly = true; g.camView = 0; g.pos.set(sp.x + 0.5, sp.y + 2.4, sp.z - 4.5); g.yaw = Math.PI; g.pitch = -0.5; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(4); await page.screenshot({ path: __dirname + '/b100_spring.png' });
  // 2. the Moon refuses; Strata takes the ichor stone
  await fly('moon'); await settle(1);
  const r2 = await page.evaluate(() => { const g = window.__game, api = window.__api; api.loadSys.end(); api.exitCar(); return { moon: api.springSys.add('springstone', g.pos.x + 3, g.pos.y, g.pos.z), n: (g.springs || []).length }; });
  console.log('2. the Moon  :', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'moon', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(3);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, S = api.springSys, W = api.waterSys;
    api.loadSys.end(); api.exitCar(); g.fly = true;
    const p = g.pos; const yx = Math.round(p.x) + 8, yz = Math.round(p.z); const gy = g.gen.height(yx, yz);
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 24, yz, 30, 0, 0)); api.applyEdit(C.makeEdit(1, 1, yx, gy - 6, yz, 30, 0, C.MAT.ASH)); g.terrain.process(200);
    const sp = S.add('ichorstone', yx, gy + 9, yz);
    for (let i = 0; i < 30; i++) W.step(); W.maintain();
    return { sp: !!sp, inIchor: sp ? api.inWater(sp.x + 0.5, sp.y, sp.z + 0.5) : null, uni: g.uIchor.value, springsHere: g.springs.length };
  });
  console.log('3. Strata    :', JSON.stringify(r3));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
