const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b90'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 2 }; });
  // 1. on Earth: the map, the button, the planet view
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, PM = api.planetMap;
    api.openMap();
    const t0 = document.getElementById('maptitle').textContent, m0 = PM.mode;
    document.getElementById('btnPlanetView').click();
    const t1 = document.getElementById('maptitle').textContent, m1 = PM.mode, rects = PM.rects.map(r => r.p);
    const known = PM.ORDER.map(p => PM.known(p));
    const pickMoon = PM.pick('moon');
    const stillPlanets = PM.mode;
    const pickEarth = PM.pick('earth');
    const after = { mode: PM.mode, world: PM.world(), title: document.getElementById('maptitle').textContent };
    const sprites = ['earth', 'moon', 'alien', 'station', 'site', 'lost'].map(k => api.planetSprite(k).width);
    api.closeOverlay();
    return { t0, m0, t1, m1, rects, known, pickMoon, stillPlanets, pickEarth, after, sprites, ui: g.ui };
  });
  console.log('1. on Earth  :', JSON.stringify(r1));
  // 2. on the Moon: the Earth's map as you left it, the band across it
  await fly('moon');
  await settle(3);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, PM = api.planetMap;
    api.exitCar(); g.ui = 'none';
    g.beacons.push([g.pos.x + 5, g.pos.y, g.pos.z]);
    api.openMap();
    document.getElementById('btnPlanetView').click();
    const known = PM.ORDER.filter(p => PM.known(p));
    const ok = PM.pick('earth');
    const MV = PM.ctx();
    const w = api.mapToWorld(320, 320);
    const tl = [...document.querySelectorAll('#tplist .btn')].map(b => b.textContent);
    return { known, ok, mode: PM.mode, world: PM.world(), live: MV.live, genPlanet: MV.gen.planet || 'earth', explored: MV.explored.size, centre: [Math.round(MV.px), Math.round(MV.pz)], toWorld: [Math.round(w.x), Math.round(w.z)], title: document.getElementById('maptitle').textContent, tplist: tl };
  });
  console.log('2. from Moon :', JSON.stringify(r2));
  await page.waitForTimeout(300); await page.screenshot({ path: __dirname + '/b90_earthmap.png' });
  await page.evaluate(() => { const api = window.__api; api.planetMap.toggle(); });
  await page.waitForTimeout(300); await page.screenshot({ path: __dirname + '/b90_planets.png' });
  // 3. the seat: SPACE opens the view; a click flies (or says why not)
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, PM = api.planetMap;
    api.closeOverlay();
    const r = g.entities.find(e => e.type === 'rocket') || api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z);
    r.charge = 100; api.enterCar(r);
    g.keys = g.keys || {};
    PM.open(r);
    const opened = { ui: g.ui, mode: PM.mode, launch: !!PM.launch, title: document.getElementById('maptitle').textContent, subs: PM.rects.length };
    const noAlien = PM.pick('alien'), flightA = !!api.spaceSys.flight;
    const noHere = PM.pick('moon');
    const yes = PM.pick('earth');
    const F = api.spaceSys.flight;
    return { opened, noAlien, flightA, noHere, yes, flight: F ? { phase: F.phase, to: F.to } : null, ui: g.ui, dest: api.spaceSys.dest };
  });
  console.log('3. the seat  :', JSON.stringify(r3));
  await page.waitForTimeout(800); await page.screenshot({ path: __dirname + '/b90_launch.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
