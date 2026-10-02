const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b91'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  const sky = async () => page.evaluate(() => { const S = window.__api.skySys; const out = {}; for (const k in S.far){ const m = S.far[k]; out[k] = m.visible ? [+m.scale.x.toFixed(2), +m.material.opacity.toFixed(2)] : null; } out.earthBig = S.earth.visible; out.alienBig = S.alien.visible; out.ourMoon = S.moon.visible; return out; });
  // 1. Earth: Strata small, by night and by day
  const e1 = await page.evaluate(() => { const g = window.__game, api = window.__api; g.timeOfDay = 0.75; api.updateDayNight(0); api.skySys.update(0.016); });
  const r1a = await sky();
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.timeOfDay = 0.25; api.updateDayNight(0); api.skySys.update(0.016); });
  const r1b = await sky();
  console.log('1. Earth     :', JSON.stringify({ night: r1a, day: r1b }));
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.timeOfDay = 0.78; api.updateDayNight(0); g.fly = true; g.camView = 0; const d = api.skySys.FAR_DIR.alien; g.yaw = Math.atan2(-d[0], -d[2]); g.pitch = Math.asin(d[1] / Math.hypot(d[0], d[1], d[2])); });
  await page.waitForTimeout(500); await page.screenshot({ path: __dirname + '/b91_earthsky.png' });
  // 2. the Moon and the site, then Strata
  await fly('moon'); await settle(1);
  await page.evaluate(() => { window.__api.skySys.update(0.016); });
  const r2 = await sky();
  await fly('site'); await settle(1);
  await page.evaluate(() => { window.__api.skySys.update(0.016); });
  const r3 = await sky();
  console.log('2. Moon, site:', JSON.stringify({ moon: r2, site: r3 }));
  await page.evaluate(() => { const g = window.__game, api = window.__api; api.exitCar(); g.story.ship = 1; });
  await page.evaluate(() => { const g = window.__game, api = window.__api; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'site', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(2);
  await page.evaluate(() => { const g = window.__game, api = window.__api; api.exitCar(); g.timeOfDay = 0.78; api.updateDayNight(0); api.skySys.update(0.016); });
  const r4 = await sky();
  console.log('3. Strata    :', JSON.stringify(r4));
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.fly = true; g.camView = 0; const d = api.skySys.FAR_DIR.earth; g.yaw = Math.atan2(-d[0], -d[2]); g.pitch = Math.asin(d[1] / Math.hypot(d[0], d[1], d[2])); g.pos.y = g.gen.height(g.pos.x, g.pos.z) + 30; });
  await page.waitForTimeout(500); await page.screenshot({ path: __dirname + '/b91_stratasky.png' });
  // 4. transit: the far planets in the scene
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const r = g.entities.find(e => e.type === 'rocket2'); api.enterCar(r);
    const F = { phase: 'transit', t: 0, e: r, from: 'alien', to: 'moon', h0: 0, burn: true };
    api.spaceSys.flight = F; api.spaceSys.beginTransit(F);
    const far = api.spaceSys.bodies.far.map(sp => [Math.round(sp.position.x), Math.round(sp.position.y), Math.round(sp.position.z), sp.scale.x]);
    for (let k = 0; k < 40; k++) api.spaceSys.tick(0.05);
    return { far, n: far.length, phase: api.spaceSys.flight && api.spaceSys.flight.phase };
  });
  console.log('4. transit   :', JSON.stringify(r5));
  await page.evaluate(() => { const g = window.__game; g.yaw = 2.4; g.pitch = 0.35; });
  await page.waitForTimeout(600); await page.screenshot({ path: __dirname + '/b91_transit.png' });
  await page.evaluate(() => { const api = window.__api; api.spaceSys.flight = null; api.spaceSys.endTransit(); });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
