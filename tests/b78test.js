const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b78'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the station generator, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE;
    const S = C.makeGen(7, 'station');
    const shop = S.modules.find(m => m.role === 'shop'), hall = S.modules.find(m => m.role === 'hall'), q = S.modules.find(m => m.role === 'quarters'), L = S.links[0];
    const port = [shop.x + S.ED[0] * (shop.r + 0.4), shop.y + S.ED[1] * (shop.r + 0.4), shop.z + S.ED[2] * (shop.r + 0.4)];
    const f = (a) => +a.toFixed(2);
    return { modules: S.modules.length, links: S.links.length, hangarAir: f(S.sdf(0, 0, 0)), floorSolid: f(S.sdf(0, -8.5, 0)), wallSolid: f(S.sdf(16.5, 0, 0)), roofOpen: f(S.sdf(0, 12, 0)), roofEdgeSolid: f(S.sdf(16.5, 8.5, 0)),
             shopAir: f(S.sdf(shop.x, shop.y, shop.z)), shopWall: f(S.sdf(shop.x, shop.y + shop.r - 0.5, shop.z)), portAir: f(S.sdf(port[0], port[1], port[2])), corridorAir: f(S.sdf((L.ax + L.bx) / 2, (L.ay + L.by) / 2, (L.az + L.bz) / 2)),
             hallAir: f(S.sdf(hall.x, hall.y, hall.z)), quartersAir: f(S.sdf(q.x, q.y, q.z)), space: f(S.sdf(200, 0, 0)), h00: S.height(0, 0), hFar: S.height(300, 300), hrHangar: S.heightRange(-8, -8, 8, 8), hrFar: S.heightRange(400, 400, 416, 416), roles: C.STATION_ROLES };
  });
  console.log('1. station   :', JSON.stringify(r1));
  // 2. from Earth to the station (the short way); the landing through the roof
  await page.evaluate(() => {
    window.__api.loadSys.end(); const g = window.__game, api = window.__api; g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    const e = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); e.charge = 100; api.enterCar(e);
    window.__route = { earth: api.spaceSys.routes().slice(), dest0: api.spaceSys.destOf() };
    api.spaceSys.cycleDest(); window.__route.dest1 = api.spaceSys.destOf(); api.spaceSys.cycleDest(); window.__route.dest2 = api.spaceSys.destOf();
    const F = { phase: 'fadein', t: 0, e, from: 'earth', to: 'station', h0: 0, burn: true };
    api.spaceSys.flight = F; api.spaceSys.arrive(F);
  });
  let ys = [];
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return { ph: F ? F.phase : null, y: g.driving ? +g.driving.y.toFixed(1) : null }; }); ys.push(st.y); if (!st.ph) break; }
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const r = g.driving;
    return { route: window.__route, planet: g.planet, genPlanet: g.gen.planet, rocketAt: r && [+r.x.toFixed(1), +r.y.toFixed(1), +r.z.toFixed(1)], grav: api.gravityNow(), earthUp: api.skySys.earth.visible, moonUp: api.skySys.moon.visible, hud: document.getElementById('navpos').textContent, others: Object.keys(api.spaceSys.others), stationRoute: api.spaceSys.routes(), stationDest: api.spaceSys.destOf() };
  });
  r2.rocketYs = ys.filter((v, i) => i % 3 === 0).slice(0, 12);
  console.log('2. arrival   :', JSON.stringify(r2));
  // 3. zero-G: step out, float, thrust, and the cast
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.exitCar(); g.fly = false; g.mode = 'survival'; g.vel.set(0, 0, 0);
    g.pos.set(4, -3, 4);
    const y0 = g.pos.y;
    for (let i = 0; i < 60; i++) api.updatePlayer(0.05);
    const drift = +(g.pos.y - y0).toFixed(3);
    g.keys['KeyW'] = true; for (let i = 0; i < 20; i++) api.updatePlayer(0.05); g.keys['KeyW'] = false;
    const vAfterThrust = +Math.hypot(g.vel.x, g.vel.z).toFixed(2);
    for (let i = 0; i < 40; i++) api.updatePlayer(0.05);
    const vCoast = +Math.hypot(g.vel.x, g.vel.z).toFixed(2);
    g.keys['ShiftLeft'] = true; for (let i = 0; i < 40; i++) api.updatePlayer(0.05); g.keys['ShiftLeft'] = false;
    const vBraked = +Math.hypot(g.vel.x, g.vel.z).toFixed(2);
    g.keys['Space'] = true; for (let i = 0; i < 20; i++) api.updatePlayer(0.05); g.keys['Space'] = false;
    const vy = +g.vel.y.toFixed(2);
    const inside = Math.abs(g.pos.x) < 16 && Math.abs(g.pos.z) < 16 && g.pos.y < 9;
    const breath = g.breath;
    g.mode = 'creative'; g.vel.set(0, 0, 0);
    api.stationOneSys.tick(1.1);
    const cast = g.entities.filter(e => e.type === 'alien').map(e => e.cast).sort();
    const leader = g.entities.find(e => e.type === 'alien' && e.cast === 'leader');
    let said = ''; const t0 = document.getElementById('toast'); api.talkTo(leader); said = t0 ? t0.textContent.slice(0, 40) : 'no toast el';
    const D = api.buildSaveData();
    return { drift, vAfterThrust, vCoast, vBraked, vy, inside, breath, cast, said, saveOthers: Object.keys(D.others || {}), savedAliens: (D.entities || []).filter(r => r[0] === 'alien').length };
  });
  console.log('3. zero-G    :', JSON.stringify(r3));
  await settle(5);
  await page.evaluate(() => { const g = window.__game; g.pos.set(-10, -4, 10); g.yaw = Math.atan2(-(0 - g.pos.x), -(0 - g.pos.z)); g.pitch = 0.2; g.camView = 0; });
  await settle(3); await page.screenshot({ path: __dirname + '/b78_hangar.png' });
  await page.evaluate(() => { const g = window.__game, G = g.gen; const M = G.modules.find(m => m.role === 'shop'); g.pos.set(M.x - G.ED[0] * 3, M.y - 1, M.z - G.ED[2] * 3); g.yaw = Math.atan2(-G.ED[0], -G.ED[2]); g.pitch = 0.05; g.forceStream = true; });
  await settle(6); await page.screenshot({ path: __dirname + '/b78_shop.png' });
  // 4. on to the Moon, and the save carries three worlds
  await page.evaluate(() => { const g = window.__game, api = window.__api; const r = g.entities.find(e => e.type === 'rocket'); api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'station', to: 'moon', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 60; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  const r4 = await page.evaluate(() => { const g = window.__game, api = window.__api; api.saveNow(); const D = api.buildSaveData(); return { planet: g.planet, others: Object.keys(api.spaceSys.others), stationSaved: !!(D.others && D.others.station && D.others.station.planet === 'station'), earthEdits: D.others.earth.edits.length, route: api.spaceSys.routes() }; });
  console.log('4. onward    :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
