const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b93'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  // 1. the generator in the page: how many, and one of them
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, G = C.makeGen(7, 'alien');
    let n = 0, k = 0; for (let cz = -6; cz <= 6; cz++) for (let cx = -6; cx <= 6; cx++){ n++; if (G.ruinAt(cx, cz)) k++; }
    return { cells: n, villages: k, perKm2: +(k / (n * 0.224 * 0.224)).toFixed(2) };
  });
  console.log('1. how many  :', JSON.stringify(r1));
  await fly('alien');
  await settle(2);
  // 2. to the nearest village: found, the chest, the record, the map, the save
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.loadSys.end(); api.exitCar(); g.fly = true; g.ui = 'none'; g.spawnT = -1e9;
    const C = g.gen.RUIN_CELL, cx = Math.floor(g.pos.x / C), cz = Math.floor(g.pos.z / C);
    let best = null; for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++){ const R = g.gen.ruinAt(cx + dx, cz + dz); if (!R) continue; const d = Math.hypot(R.x - g.pos.x, R.z - g.pos.z); if (!best || d < best.d) best = { R, d }; }
    const R = best.R; window.__R = R;
    g.pos.set(R.x + 4, R.base + 1.5, R.z + 4); g.vel.set(0, 0, 0); g.forceStream = true; g.holdT = 0;
    return { d: Math.round(best.d), huts: R.huts.length, r: +R.r.toFixed(1), base: +R.base.toFixed(1), biome: R.b };
  });
  console.log('2. the way   :', JSON.stringify(r2));
  await settle(14);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.terrain.process(300);
    const R = window.__R;
    const before = g.pnodes.filter(n => n.t === 'chest' && Math.hypot(n.x - R.x, n.z - R.z) < R.r).length;
    api.ruinSys.accT = 5; api.ruinSys.tick(0.1);
    const chests = g.pnodes.filter(n => n.t === 'chest' && Math.hypot(n.x - R.x, n.z - R.z) < R.r);
    const ch = chests[chests.length - 1];
    const H = R.huts[R.best];
    const inv = ch ? ch.inv.filter(Boolean).map(it => it.kind + '×' + it.count) : null;
    const rec = g.ruins && g.ruins[R.key];
    api.ruinSys.accT = 5; api.ruinSys.tick(0.1);
    const again = g.pnodes.filter(n => n.t === 'chest').length;
    const save = api.buildSaveData();
    const le = api.nearEdits([R.x - 30, R.base - 3, R.z - 30, R.x + 30, R.base + 12, R.z + 30]);
    const sd = (x, y, z) => +C.evalSDF(x, y, z, le, g.gen).toFixed(2);
    const world = { wall: sd(H.x - Math.cos(H.dd) * (H.R - 0.35), R.base + 1.2, H.z - Math.sin(H.dd) * (H.R - 0.35)), door: sd(H.x + Math.cos(H.dd) * (H.R - 0.3), R.base + 1.0, H.z + Math.sin(H.dd) * (H.R - 0.3)), inside: sd(H.x, R.base + 1.2, H.z), plaza: sd(R.x + 3, R.base + 0.6, R.z), obelisk: sd(R.x, R.base + 1, R.z), under: sd(R.x + 3, R.base - 0.6, R.z) };
    // the thralls keep to their homes by day
    g.timeOfDay = 0.25; api.updateDayNight(0);
    const D = api.ENT_DEF; for (const e of [...g.entities]) if (D[e.type] && D[e.type].war) api.killEntity(e, false);
    let spawned = {}, probe = null; for (let i = 0; i < 60; i++){ const a = i * 0.7, x = R.x + Math.cos(a) * (R.r * 0.5), z = R.z + Math.sin(a) * (R.r * 0.5); const e = api.warSys.spawn({}, x, R.base, z, false); if (e) spawned[e.type] = (spawned[e.type] || 0) + 1; } if (!Object.keys(spawned).length){ const x = R.x + 6, z = R.z - 5, h = R.base, le = api.nearEdits([x - 3, h - 2, z - 3, x + 3, h + 6, z + 3]); probe = { ended: !!(g.story && g.story.ended), deep: g.pos.y < g.gen.height(g.pos.x, g.pos.z) - 6, arch: g.gen.archAt(x, z), list: api.warSys.DAY[g.gen.archAt(x, z)], near: !!g.gen.ruinNear(x, z), air1: +C.evalSDF(x, h + 0.8, z, le, g.gen).toFixed(2), air2: +C.evalSDF(x, h + 2.2, z, le, g.gen).toFixed(2), thrallCap: D.thrall.cap, thralls: g.entities.filter(e => e.type === 'thrall').length }; }
    for (const e of [...g.entities]) if (D[e.type] && D[e.type].war) api.killEntity(e, false);
    api.openMap(); const mapRuins = Object.keys(api.planetMap.ctx().ruins).length; api.closeOverlay();
    return { chests: chests.length, at: ch ? [+(ch.x - H.x).toFixed(1), +(ch.y - R.base).toFixed(2), +(ch.z - H.z).toFixed(1)] : null, inv, rec, again: again - chests.length, saved: save.ruins && Object.keys(save.ruins).length, world, spawned, probe, mapRuins };
  });
  console.log('3. the ruin  :', JSON.stringify(r3));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const R = window.__R; g.camView = 0; g.pos.set(R.x + R.r * 0.9, R.base + 14, R.z + R.r * 0.9); g.yaw = Math.atan2(-(R.x - g.pos.x), -(R.z - g.pos.z)); g.pitch = -0.5; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(4); await page.screenshot({ path: __dirname + '/b93_village.png' });
  await page.evaluate(() => { const g = window.__game; const R = window.__R, H = R.huts[R.best]; g.pos.set(H.x + Math.cos(H.dd) * (H.R + 3.5), R.base + 1.6, H.z + Math.sin(H.dd) * (H.R + 3.5)); g.yaw = Math.atan2(-(H.x - g.pos.x), -(H.z - g.pos.z)); g.pitch = 0.05; });
  await settle(3); await page.screenshot({ path: __dirname + '/b93_hut.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
