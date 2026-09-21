const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b94'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  const r0 = await page.evaluate(() => { const api = window.__api; return { relicIcon: (api.itemIconURL({ kind: 'relic', count: 1 }) || '').length > 100, label: api.itemLabel({ kind: 'relic', count: 1 }), sova: api.stationOneSys.offers('relics').some(o => o.sell && o.sell.k === 'relic'), keeper: api.ENT_DEF.keeper.boss, mesh: api.entMesh('keeper', { type: 'keeper' }).children.length }; });
  console.log('0. the relic :', JSON.stringify(r0));
  await fly('alien');
  await settle(2);
  // 1. to the nearest vault, into its hall
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.loadSys.end(); api.exitCar(); g.fly = true; g.ui = 'none'; g.spawnT = -1e9;
    const C = g.gen.VAULT_CELL, cx = Math.floor(g.pos.x / C), cz = Math.floor(g.pos.z / C);
    let best = null; for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++){ const V = g.gen.vaultAt(cx + dx, cz + dz); if (!V) continue; const d = Math.hypot(V.x - g.pos.x, V.z - g.pos.z); if (!best || d < best.d) best = { V, d }; }
    const V = best.V; window.__V = V;
    g.pos.set(V.x - 5, V.base + 0.2, V.z - 5); g.vel.set(0, 0, 0); g.forceStream = true; g.holdT = 0;
    return { d: Math.round(best.d), base: +V.base.toFixed(1), b: V.b };
  });
  console.log('1. the way   :', JSON.stringify(r1));
  await settle(14);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, D = api.ENT_DEF;
    g.terrain.process(300);
    const V = window.__V;
    const found = !!(g.vaults && g.vaults[V.key]);
    const here = !!api.vaultSys.here();
    api.vaultSys.check();
    const K = api.bossSys.anyBoss();
    const woke = K ? { type: K.type, state: K.state, home: !!K.home } : null;
    // the fight, by hand: survival, standing off across the hall
    g.mode = 'survival'; g.hp = 600; g.fly = false; g.armor = {}; for (let i = 0; i < 40; i++) g.slots[i] = null;
    g.pos.set(V.x - 6, V.base + 0.2, V.z - 6);
    let bolts = 0; const ob = api.warSys.bolt; api.warSys.bolt = (e, P, RG) => { bolts++; return ob.call(api.warSys, e, P, RG); };
    let now = performance.now(), minD = 1e9, slams = 0, hp0 = 600, pounds = g.edits.length;
    for (let i = 0; i < 240; i++){ now += 50; api.updateEntities(0.05, now); const d = Math.hypot(K.x - g.pos.x, K.z - g.pos.z); if (d < minD) minD = d; }
    api.warSys.bolt = ob;
    const fight = { bolts, minD: +minD.toFixed(1), hpLost: hp0 - g.hp, edits: g.edits.length - pounds, kx: +(K.x - V.x).toFixed(1), kz: +(K.z - V.z).toFixed(1), ky: +(K.y - V.base).toFixed(1) };
    // leave the mound: it goes home and mends
    K.hp = 300; g.pos.set(V.x + 40, g.gen.height(V.x + 40, V.z) + 1, V.z); for (let i = 0; i < 60; i++){ now += 50; api.updateEntities(0.05, now); }
    const mended = { hp: Math.round(K.hp), d: +Math.hypot(K.x - V.x, K.z - V.z).toFixed(1) };
    g.pos.set(V.x - 6, V.base + 0.2, V.z - 6);
    // the kill
    api.killEntity(K, true);
    const ch = g.pnodes.filter(n => n.t === 'chest' && Math.hypot(n.x - V.x, n.z - V.z) < 3).pop();
    const inv = ch ? ch.inv.filter(Boolean).map(it => it.kind + '×' + it.count) : null;
    const rec = g.vaults[V.key];
    api.vaultSys.check(); const again = !!api.bossSys.anyBoss();
    const save = api.buildSaveData();
    api.openMap(); const mv = api.planetMap.ctx().vaults; api.closeOverlay();
    g.mode = 'creative'; g.fly = true; g.hp = 100;
    return { found, here, woke, fight, mended, chestAt: ch ? [+(ch.x - V.x).toFixed(1), +(ch.y - V.base).toFixed(2)] : null, inv, rec, again, saved: save.vaults && Object.keys(save.vaults).length, mapVaults: Object.keys(mv).length, kills: g.bossKills.keeper };
  });
  console.log('2. the vault :', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const V = window.__V; g.camView = 0; g.pos.set(V.x + Math.cos(V.ea) * 30, V.base + 6, V.z + Math.sin(V.ea) * 30); g.yaw = Math.atan2(-(V.x - g.pos.x), -(V.z - g.pos.z)); g.pitch = -0.1; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(5); await page.screenshot({ path: __dirname + '/b94_mound.png' });
  await page.evaluate(() => { const g = window.__game, api = window.__api; const V = window.__V; g.pos.set(V.x - 7, V.base + 1.6, V.z - 7); g.yaw = Math.atan2(-(V.x - g.pos.x), -(V.z - g.pos.z)); g.pitch = 0.05; const K = api.bossSys.spawn('keeper', V.x, V.base + 0.3, V.z - 3.6); K.home = { x: V.x, z: V.z, g: V.base }; K.charge = 1; K.state = 'walk'; });
  await settle(3); await page.screenshot({ path: __dirname + '/b94_hall.png' });
  await page.evaluate(() => { const api = window.__api; const K = api.bossSys.anyBoss(); if (K) api.killEntity(K, false); });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
