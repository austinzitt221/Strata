const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b96'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  // 1. the burrower has left the Earth
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.pos.y = g.gen.height(g.pos.x, g.pos.z) - 40; g.fly = true;
    let n = 0; for (let i = 0; i < 300; i++){ api.bossSys.accT = 5; api.bossSys.tick(0.1); if (api.bossSys.anyBoss()){ n++; api.killEntity(api.bossSys.anyBoss(), false); } }
    g.pos.y = g.gen.height(g.pos.x, g.pos.z) + 1;
    return { earthBurrowers: n, farScale: api.skySys.FAR_SCALE };
  });
  console.log('1. the Earth :', JSON.stringify(r1));
  await fly('alien');
  await settle(2);
  // 2. the seal, by right click, in creative with nothing in the bag
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.loadSys.end(); api.exitCar(); g.fly = true; g.ui = 'none'; g.spawnT = -1e9;
    const K = g.gen.centre; g.pos.set(K.x + 13, K.floor + 1.2, K.z + 1.5); g.forceStream = true; g.holdT = 0;
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    return { at: [K.x + 11, K.z] };
  });
  await settle(12);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.terrain.process(200);
    api.centreSys.accT = 5; api.centreSys.tick(0.1);
    const seal = g.entities.find(e => e.type === 'seal');
    const d = seal ? +Math.hypot(seal.x - g.pos.x, seal.z - g.pos.z).toFixed(1) : null;
    g.yaw = Math.PI; g.pitch = 0.6;    // looking at the floor, not the seal: the click still counts
    document.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { button: 2, bubbles: true }));
    const B = api.bossSys.anyBoss();
    const out = { seal: !!seal, d, boss: B ? B.type : null, state: B && B.state, sealGone: !g.entities.some(e => e.type === 'seal'), open: g.story.sealOpen };
    if (B) api.killEntity(B, false);
    return out;
  });
  console.log('2. the seal  :', JSON.stringify(r3));
  // 3. the burrower under Strata; the flights' bodies
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const K = g.gen.centre; g.pos.set(K.x + 300, g.gen.height(K.x + 300, K.z) - 40, K.z); g.story.sealOpen = 0;
    let first = null; api.bossSys.burrowT = -1e9; for (let i = 0; i < 400 && first == null; i++){ api.bossSys.accT = 5; api.bossSys.tick(0.1); if (api.bossSys.anyBoss()) first = i; }
    const B = api.bossSys.anyBoss(); const type = B && B.type; if (B) api.killEntity(B, false);
    let second = 0; for (let i = 0; i < 200; i++){ api.bossSys.accT = 5; api.bossSys.tick(0.1); if (api.bossSys.anyBoss()) second++; }
    g.pos.y = g.gen.height(g.pos.x, g.pos.z) + 1;
    const r = api.spawnEntity('rocket2', g.pos.x + 6, g.pos.y, g.pos.z); r.charge = 100; api.enterCar(r);
    const F = { phase: 'transit', t: 0, e: r, from: 'alien', to: 'moon', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.beginTransit(F);
    const bod = api.spaceSys.bodies;
    const flight = { from: bod.from.isSprite ? [bod.from.scale.x, bod.from.userData.rad] : 'mesh', to: bod.to.isSprite ? [bod.to.scale.x, bod.to.userData.rad] : 'mesh', far: bod.far.map(s => s.scale.x) };
    for (let k = 0; k < 30; k++) api.spaceSys.tick(0.05);
    const F2 = { phase: 'transit', t: 0, e: r, from: 'moon', to: 'station', h0: 0, burn: true };
    api.spaceSys.endTransit(); api.spaceSys.flight = F2; api.spaceSys.beginTransit(F2);
    const st = api.spaceSys.bodies.to.isSprite ? 'sprite' : 'mesh';
    return { firstTick: first, type, withinCooldown: second, flight, stationBody: st };
  });
  console.log('3. burrower  :', JSON.stringify(r4));
  await page.evaluate(() => { const g = window.__game; g.yaw = 0.4; g.pitch = 0.1; });
  await page.waitForTimeout(600); await page.screenshot({ path: __dirname + '/b96_transit.png' });
  await page.evaluate(() => { const api = window.__api; api.spaceSys.endTransit(); api.spaceSys.flight = { phase: 'transit', t: 0, e: window.__game.driving, from: 'alien', to: 'moon', h0: 0, burn: true }; api.spaceSys.beginTransit(api.spaceSys.flight); for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); window.__game.yaw = Math.PI; window.__game.pitch = 0.05; });
  await page.waitForTimeout(600); await page.screenshot({ path: __dirname + '/b96_leaving.png' });
  await page.evaluate(() => { const api = window.__api; api.spaceSys.flight = null; api.spaceSys.endTransit(); });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
