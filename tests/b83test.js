const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b83'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 2 }; });
  await fly('moon'); await fly('site');
  // 1. the three on the pad; Kro's panel, in survival, with and without the price
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true; api.siteSys.tick(2);
    const cast = g.entities.filter(e => e.type === 'alien').map(e => e.cast).sort();
    const K = g.entities.find(e => e.type === 'alien' && e.cast === 'builder');
    for (let i = 0; i < 40; i++) if (g.slots[i] && g.slots[i].kind === 'translator') g.slots[i] = null;
    const t0 = document.getElementById('toast'); api.talkTo(K); const babble = t0.textContent.slice(0, 30); const ui0 = g.ui;
    api.addStackItem('translator', 1); g.mode = 'survival';
    api.talkTo(K);
    const rows0 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 40));
    const F0 = g.gen.frames[0];
    C.addMat(g.slots, C.MAT.PLATING, 64); api.addStackItem('ironingot', 16);
    api.tradeSys.refresh();
    const row = [...document.querySelectorAll('#tradelist .craftrow')].find(r => /BUILD THE HANGAR/.test(r.textContent));
    const act = row && row.textContent.slice(-12).trim();
    row.click();
    const rows1 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 28));
    api.closeOverlay();
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    const out = []; api.siteSys.objectives(out);
    return { cast, babble, ui0, rows0, act, stage: api.siteSys.stage(), plating: C.countMat(g.slots, C.MAT.PLATING), iron: C.countItem(g.slots, 'ironingot'), rows1,
             hangar: { air: sdf(0, 12, 0) > 0, wall: sdf(12.5, 12, 0) < 0, hatch: sdf(0, 4.6, 0) > 0, keelHole: sdf(0, 2.2, 0) > 0, roof: sdf(0, 19.5, 0) < 0 }, objectives: out.map(o => o.label) };
  });
  console.log('1. Kro       :', JSON.stringify(r1));
  // 2. the rest, paid in creative; the corridors open; the other two speak
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.mode = 'creative';
    const K = g.entities.find(e => e.type === 'alien' && e.cast === 'builder');
    for (let i = 1; i < 4; i++){ api.talkTo(K); const row = [...document.querySelectorAll('#tradelist .craftrow')].find(r => /^BUILD/.test(r.textContent)); if (row) row.click(); api.closeOverlay(); }
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    api.talkTo(K); const kro = document.querySelector('#tradelist .craftrow:nth-child(2)').textContent.slice(0, 30); api.closeOverlay();
    const S = g.entities.find(e => e.type === 'alien' && e.cast === 'roomer'); api.talkTo(S); const sef = document.querySelector('#tradelist .craftrow:nth-child(2)').textContent.slice(0, 30); api.closeOverlay();
    return { stage: api.siteSys.stage(), built: g.story.built, wires: api.siteSys.group ? api.siteSys.group.children.length : -1, ring: { air: sdf(22, 8, 0) > 0, corridor: sdf(14, 8, 0) > 0, hangarWallCut: sdf(12.4, 8, 0) > 0, ringWallCut: sdf(15.6, 8, 0) > 0 },
             quarters: { corridor: sdf(-14, 8, 0) > 0 }, spire: { air: sdf(0, 33, 0) > 0, opening: sdf(0, 20.6, 0) > 0, beacon: sdf(0, 46.5, 0) < 0 }, kro, sef };
  });
  console.log('2. the rest  :', JSON.stringify(r2));
  await settle(6);
  await page.evaluate(() => { const g = window.__game; g.pos.set(-34, 16, -44); g.yaw = Math.atan2(-(0 - g.pos.x), -(0 - g.pos.z)); g.pitch = -0.02; g.camView = 0; g.forceStream = true; });
  await settle(6); await page.screenshot({ path: __dirname + '/b83_station.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
