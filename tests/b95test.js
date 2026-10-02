const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b95'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1, translator: 1, ended: 1, endVehl: 1 }; });
  await fly('alien');
  await settle(2);
  // 1. to the nearest ruin; Vehl's row; the rebuilding
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.loadSys.end(); api.exitCar(); g.fly = true; g.ui = 'none'; g.spawnT = -1e9;
    const N = api.villageLifeSys.nearestRuin(); const R = N.R; window.__K = R.key; window.__RX = R.x; window.__RZ = R.z;
    g.pos.set(R.x + 3, R.base + 1.5, R.z - 3); g.vel.set(0, 0, 0); g.forceStream = true; g.holdT = 0;
    // before: a broken hut, a leaning obelisk
    const Hb = R.huts.reduce((a, h) => h.brk > a.brk ? h : a, R.huts[0]);
    window.__HB = { x: Hb.x, z: Hb.z, R: Hb.R, dd: Hb.dd, brk: Hb.brk };
    const sd = (x, y, z) => +g.gen.sdf(x, y, z).toFixed(2);
    const sh = (H) => { const k = (H.R - 0.35) / Math.hypot(1, 0.7); return [H.x - Math.sin(H.dd) * k, R.base + 0.7 * k, H.z + Math.cos(H.dd) * k]; }; const P0 = sh(Hb);   // the side wall, clear of door and window
    const before = { hutHigh: sd(P0[0], P0[1], P0[2]), obTop: sd(R.x, R.base + R.ob.h + 1.0, R.z), alive: R.alive };
    for (let i = 0; i < 40; i++) g.slots[i] = null; api.addStackItem('relic', 2);
    g.mode = 'survival';
    const ok = api.villageLifeSys.rebuild(R);
    const R2 = g.gen.ruinAt(Math.floor(R.x / g.gen.RUIN_CELL), Math.floor(R.z / g.gen.RUIN_CELL));
    const after = { hutHigh: sd(P0[0], P0[1], P0[2]), obTop: sd(R.x, R.base + R.ob.h + 1.0, R.z), column: sd((R.cols[0].x0 + R.cols[0].x1) / 2, R.base + 3, (R.cols[0].z0 + R.cols[0].z1) / 2), alive: R2.alive, window: sd(Hb.x - Math.cos(Hb.dd) * (Hb.R - 0.3), R.base + Hb.R * 0.55, Hb.z - Math.sin(Hb.dd) * (Hb.R - 0.3)) };
    g.mode = 'creative';
    return { d: Math.round(N.d), huts: R.huts.length, before, ok, relics: C.countItem(g.slots, 'relic'), rebuilt: Object.keys(g.story.rebuilt), after, dirty: g.terrain.dirty.size, rec: g.ruins[R.key] };
  });
  console.log('1. rebuilt   :', JSON.stringify(r1));
  await settle(14);
  // 2. the people come home; what they say and sell; the lamps; the weaver's way
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.terrain.process(300);
    for (let i = 0; i < 40; i++) g.slots[i] = null; api.addStackItem('translator', 1);
    api.villageLifeSys.accT = 5; api.villageLifeSys.tick(0.1);
    const folk = g.entities.filter(e => e.type === 'alien' && e.vkey === window.__K).map(e => [e.cast, e.sname, +Math.hypot(e.x - window.__RX, e.z - window.__RZ).toFixed(1)]);
    api.villageLifeSys.accT = 5; api.villageLifeSys.tick(0.1);
    const again = g.entities.filter(e => e.type === 'alien' && e.vkey === window.__K).length;
    const talkRows = (cast) => { const e = g.entities.find(q => q.type === 'alien' && q.vkey === window.__K && q.cast === cast); api.talkTo(e); const rows = [...document.querySelectorAll('#tradescreen .craftrow')].map(r => r.textContent.slice(0, 64)); const title = document.getElementById('tradetitle').textContent; api.closeOverlay(); return { title, rows }; };
    const elder = talkRows('elder'), trader = talkRows('trader'), weaver = talkRows('weaver');
    // the lamps
    for (let i = 0; i < 40; i++) g.slots[i] = null; C.addMat(g.slots, C.MAT.GLOWSTALK, 8);
    g.mode = 'survival';
    const R = g.gen.ruinNear(window.__RX, window.__RZ);
    const e0 = g.edits.length;
    const lit = api.villageLifeSys.light(R);
    const lamps = { lit, edits: g.edits.length - e0, stalks: C.countMat(g.slots, C.MAT.GLOWSTALK), astrium: C.countItem(g.slots, 'astrium'), rec: g.ruins[R.key].lit };
    // the weaver's way
    api.addStackItem('coin', 200);
    const v0 = Object.keys(g.vaults || {}).length;
    const way = api.villageLifeSys.wayToVault();
    const vaults = { way, coins: C.countItem(g.slots, 'coin'), added: Object.keys(g.vaults || {}).length - v0 };
    const save = api.buildSaveData();
    g.mode = 'creative';
    return { folk, again, elder, trader, weaver, lamps, vaults, savedRebuilt: Object.keys(save.story.rebuilt || {}).length, saveRuinAlive: save.ruins[window.__K].alive };
  });
  console.log('2. the people:', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const R = g.gen.ruinNear(window.__RX, window.__RZ); g.camView = 0; g.fly = true; g.pos.set(R.x + R.r * 0.85, R.base + 9, R.z + R.r * 0.85); g.yaw = Math.atan2(-(R.x - g.pos.x), -(R.z - g.pos.z)); g.pitch = -0.35; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(5); await page.screenshot({ path: __dirname + '/b95_alive.png' });
  await page.evaluate(() => { const g = window.__game; const R = g.gen.ruinNear(window.__RX, window.__RZ); const e = g.entities.find(q => q.type === 'alien' && q.vkey === R.key && q.cast === 'elder'); g.pos.set(e.x + 3, R.base + 1.6, e.z + 2.5); g.yaw = Math.atan2(-(e.x - g.pos.x), -(e.z - g.pos.z)); g.pitch = 0.02; });
  await settle(3); await page.screenshot({ path: __dirname + '/b95_elder.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
