const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b75'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the Moon's ores and bases, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const M = C.makeGen(7, 'moon');
    const ores = {};
    for (let x = 0; x < 160; x += 2) for (let z = 0; z < 160; z += 2) for (let y = -140; y < -2; y += 2){ const m = M.mat(x, y, z); if (m === C.MAT.IRON || m === C.MAT.LUNITE || m === C.MAT.DIAMOND) ores[C.MAT_NAME[m]] = (ores[C.MAT_NAME[m]] || 0) + 1; }
    let bases = 0, first = null;
    for (let cx = -3; cx <= 3; cx++) for (let cz = -3; cz <= 3; cz++){ const B = M.mbaseAt(cx, cz); if (B){ bases++; if (!first) first = B; } }
    const icons = ['mech', 'lunite'].map(k => (api.itemIconURL({ kind: k, count: 1, tier: 4 }) || '').length > 100);
    return { ores, bases, origin: M.mbaseAt(0, 0), first, nmat: C.NMAT, names: C.MAT_NAME.slice(35), icons, luniteItem: C.ORE_ITEM[C.MAT.LUNITE] };
  });
  console.log('1. moon gen  :', JSON.stringify(r1));
  // 2. to the Moon (the short way), to the nearest base
  await page.evaluate(() => {
    window.__api.loadSys.end(); const g = window.__game, api = window.__api; g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    const e = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); e.charge = 100; api.enterCar(e);
    const F = { phase: 'fadein', t: 0, e, from: 'earth', to: 'moon', h0: 0, burn: true };
    api.spaceSys.flight = F; api.spaceSys.arrive(F);
  });
  for (let i = 0; i < 60; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar();
    const B = api.moonBaseSys.nearest();
    const edits0 = g.edits.length, pn0 = (g.pnodes || []).length, beds0 = g.beds.length;
    g.pos.set(B.x - 24, g.gen.height(B.x - 24, B.z - 10) + 1.5, B.z - 10); g.fly = true; g.forceStream = true;
    api.moonBaseSys.tick(1.1);
    const gy = g.gen.height(B.x, B.z) + 0.2;
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    const ch = (g.pnodes || []).find(n => n.t === 'chest');
    window.__B = B;
    return { base: [B.x, B.z], dist: Math.round(Math.hypot(B.x - g.pos.x, B.z - g.pos.z)), stamped: !!(g.mbases && g.mbases[B.key]), edits: g.edits.length - edits0, chests: (g.pnodes || []).length - pn0, beds: g.beds.length - beds0,
             loot: ch && ch.inv.filter(Boolean).map(i => i.kind + 'x' + i.count), insideAir: sdf(B.x, gy + 1.5, B.z) > 0, wallSolid: sdf(B.x, gy + 6.6, B.z) < 0, doorAir: sdf(B.x + 6.5, gy + 1.2, B.z) > 0, corridorAir: sdf(B.x, gy + 1.4, B.z + 10) > 0, moduleAir: sdf(B.x, gy + 1.5, B.z + 17.5) > 0,
             wallMat: C.MAT_NAME[C.matAt ? C.matAt(B.x, gy + 6.6, B.z, g.edits, g.gen) : 35] };
  });
  console.log('2. the base  :', JSON.stringify(r2));
  await settle(6);
  await page.evaluate(() => { const g = window.__game, B = window.__B; g.pos.set(B.x - 22, g.gen.height(B.x, B.z) + 6, B.z - 14); g.yaw = Math.atan2(-(B.x + 2 - g.pos.x), -(B.z + 6 - g.pos.z)); g.pitch = -0.12; g.camView = 0; g.timeOfDay = 0.3; });
  await settle(4);
  await page.screenshot({ path: __dirname + '/b75_base.png' });
  // 3. the night: dust crawlers, and the wyrm
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.timeOfDay = 0.75; api.updateDayNight(0);
    g.entities = g.entities.filter(e => e.type === 'rocket');
    g.fly = false; g.mode = 'survival';
    for (let i = 0; i < 400; i++) api.trySpawnEntities();
    const counts = {}; for (const e of g.entities) counts[e.type] = (counts[e.type] || 0) + 1;
    const w = api.bossSys.spawn('dustwyrm', g.pos.x + 20, g.pos.y - 8, g.pos.z);
    const segs = w.mesh && w.mesh.userData.segs ? w.mesh.userData.segs.length : 0;
    api.bossSys.updateBoss(w, 0.05, performance.now());
    const before = window.__CORE.countItem(g.slots, 'lunite');
    api.killEntity(w, true);
    const after = window.__CORE.countItem(g.slots, 'lunite');
    g.mode = 'creative';
    // by day nothing spawns
    g.timeOfDay = 0.3; api.updateDayNight(0);
    g.entities = g.entities.filter(e => e.type === 'rocket');
    for (let i = 0; i < 300; i++) api.trySpawnEntities();
    return { night: counts, wyrmSegs: segs, wyrmState: w.state, luniteFromWyrm: after - before, bossKill: !!(g.bossKills && g.bossKills.dustwyrm), byDay: g.entities.length - 1 };
  });
  console.log('3. the night :', JSON.stringify(r3));
  // 4. the mech suit
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.armor.head = null; g.armor.chest = { kind: 'mech', tier: 4 };
    api.playerBody.dressBody();
    const meshes = api.playerBody.armorMeshes.length;
    g.mode = 'survival'; g.breath = 100;
    for (let i = 0; i < 30; i++) api.updateSurvival(0.1);
    const breath = g.breath;
    const red = api.armorRed(), dig = api.farmSys.mul('dig'), jump = api.farmSys.mul('jump'), speed = api.farmSys.mul('speed');
    g.armor.chest = { kind: 'plate', tier: 2 };
    const red2 = api.armorRed(), dig2 = api.farmSys.mul('dig');
    g.armor.chest = null; g.mode = 'creative';
    const D = api.buildSaveData();
    return { meshes, breathInMech: breath, red, dig, jump, speed, plateRed: red2, plateDig: dig2, label: api.itemLabel ? api.itemLabel({ kind: 'mech' }) : 'n/a', saveBases: Object.keys(D.mbases || {}).length };
  });
  console.log('4. the mech  :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
