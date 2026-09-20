const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b74'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the Moon generator, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const M = C.makeGen(7, 'moon');
    let mn = 1e9, mx = -1e9, n = 0, sum = 0;
    for (let x = -400; x <= 400; x += 4) for (let z = -400; z <= 400; z += 4){ const h = M.height(x, z); mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; n++; }
    // craters: points more than 3 m under the mean of their 40 m ring
    let bowls = 0;
    for (let x = -400; x <= 400; x += 20) for (let z = -400; z <= 400; z += 20){
      const h = M.height(x, z); let ring = 0; for (let a = 0; a < 6.28; a += 0.8) ring += M.height(x + Math.cos(a) * 40, z + Math.sin(a) * 40); ring /= 8;
      if (h < ring - 3) bowls++;
    }
    const sp = M.spawn(); const hs = M.height(sp.x, sp.z);
    const L = M.makeLocal(0, 0, 32, 32);
    const dloc = Math.abs(L.sdf(10.3, 5, 12.7) - M.sdf(10.3, 5, 12.7));
    const R = M.regionAt(100, 100);
    return { hmin: +mn.toFixed(1), hmax: +mx.toFixed(1), mean: +(sum / n).toFixed(1), bowls, spawn: sp, top: C.MAT_NAME[M.mat(sp.x, hs - 0.5, sp.z)], deep: C.MAT_NAME[M.mat(sp.x, hs - 10, sp.z)], veryDeep: C.MAT_NAME[M.mat(sp.x, -90, sp.z)],
             localMatch: dloc < 0.05, arch: R.arch, name: api.regionNameOf(R), hr: M.heightRange(0, 0, 32, 32).map(v => +v.toFixed(1)), nmat: C.NMAT, planet: M.planet, earthPlanet: C.makeGen(7).planet || 'none' };
  });
  console.log('1. moon gen  :', JSON.stringify(r1));
  // 2. a rocket on Earth, and the flight out
  const r2a = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.spaceSys.TRANSIT_T = 3; api.spaceSys.CLIMB_H = 50;
    const x = g.pos.x + 6, z = g.pos.z; const h = g.gen.height(x, z);
    const e = api.spawnEntity('rocket', x, h + 0.3, z); e.charge = 100; e.heading = 0;
    api.enterCar(e);
    window.__rocket = e;
    return { planet: g.planet, driving: g.driving === e, camView: g.camView, earthEdits: g.edits.length, earthPos: [g.pos.x | 0, g.pos.z | 0] };
  });
  await page.waitForTimeout(600);
  const r2b = await page.evaluate(() => { const api = window.__api; const ok = api.spaceSys.launch(window.__rocket); return { launched: ok, phase: api.spaceSys.flight && api.spaceSys.flight.phase, fuel: window.__rocket.charge }; });
  const phases = []; let shotT = false; let loadSeen = false;
  for (let i = 0; i < 240; i++){
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => { const api = window.__api, g = window.__game; const F = api.spaceSys.flight; return { phase: F ? F.phase : null, planet: g.planet, loading: api.loadSys.on, y: g.driving ? +g.driving.y.toFixed(0) : null, pend: api.loadSys.pending() }; });
    if (!phases.length || phases[phases.length - 1] !== st.phase) phases.push(st.phase);
    if (st.phase === 'transit' && !shotT){ shotT = true; await page.waitForTimeout(1200); await page.screenshot({ path: __dirname + '/b74_transit.png' }); }
    if (st.loading) loadSeen = true;
    if (st.phase === 'landing' && st.loading){ await page.evaluate(() => { window.__game.terrain.process(80); }); }
    else if (st.phase) await page.evaluate(() => { for (let k = 0; k < 16; k++) window.__api.spaceSys.tick(0.05); });   // the headless renderer is slow from altitude: run the flight clock on
    if (!st.phase && st.planet === 'moon') break;
  }
  const r2c = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const e = g.driving;
    const h = g.gen.height(g.pos.x, g.pos.z);
    return { phases: null, planet: g.planet, genPlanet: g.gen.planet, grav: api.gravityNow(), driving: e ? e.type : null, rocketY: e ? +(e.y - h).toFixed(1) : null, rockets: g.entities.filter(q => q.type === 'rocket').length,
             ground: C.MAT_NAME[g.gen.mat(g.pos.x, h - 0.4, g.pos.z)], earthUp: api.skySys.earth.visible, clouds: api.skySys.cloudGroup.visible, weather: api.weatherSys ? api.weatherSys.kind : 'n/a', otherPlanet: api.spaceSys.other && api.spaceSys.other.planet, fuel: e && e.charge,
             hud: document.getElementById('navpos').textContent };
  });
  r2c.phases = phases; r2c.loadSeen = loadSeen;
  console.log('2. liftoff   :', JSON.stringify(Object.assign(r2a, r2b, r2c)));
  // 3. on the Moon: step out, breathe (or not), the suit, a jump, an edit
  await page.evaluate(() => { const api = window.__api; api.exitCar(); const g = window.__game; const r = g.entities.find(q => q.type === 'rocket'); g.pos.set(r.x + 14, g.gen.height(r.x + 14, r.z + 18) + 1.5, r.z + 18); g.fly = true; g.yaw = Math.atan2(-(r.x - g.pos.x), -(r.z - g.pos.z)); g.pitch = 0.32; g.camView = 0; });
  await settle(3);
  await page.screenshot({ path: __dirname + '/b74_moon.png' });
  await page.evaluate(() => { const g = window.__game; g.fly = false; });
  const r3 = await page.evaluate(async () => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.mode = 'survival'; g.breath = 100; g.armor.head = null;
    for (let i = 0; i < 40; i++) api.updateSurvival(0.1);
    const noSuit = g.breath;
    g.armor.head = { kind: 'spacesuit', tier: 0 }; g.breath = 40;
    for (let i = 0; i < 20; i++) api.updateSurvival(0.1);
    const suit = g.breath;
    g.mode = 'creative'; g.breath = 100;
    // an edit on the Moon
    const before = g.edits.length;
    api.applyEdit(C.makeEdit(0, 0, g.pos.x + 3, g.gen.height(g.pos.x + 3, g.pos.z), g.pos.z, 2.5, 0));
    api.saveNow();
    const D = api.buildSaveData();
    return { noSuit: +noSuit.toFixed(0), suit: +suit.toFixed(0), moonEdits: g.edits.length - before, savePlanet: D.planet, saveHasEarth: !!D.earth && D.earth.planet === 'earth', earthEditsKept: D.earth ? D.earth.edits.length : -1, camView: g.camView, region: api.regionNameAt(g.pos.x, g.pos.z) };
  });
  console.log('3. the moon  :', JSON.stringify(r3));
  // 4. home again, and a reload
  const r4a = await page.evaluate(() => { const g = window.__game, api = window.__api; const e = g.entities.find(q => q.type === 'rocket'); api.enterCar(e); return { launched: api.spaceSys.launch(e) }; });
  const ph2 = [];
  for (let i = 0; i < 240; i++){
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => { const api = window.__api, g = window.__game; const F = api.spaceSys.flight; return { phase: F ? F.phase : null, planet: g.planet, loading: api.loadSys.on }; });
    if (!ph2.length || ph2[ph2.length - 1] !== st.phase) ph2.push(st.phase);
    if (st.phase === 'landing' && st.loading){ await page.evaluate(() => { window.__game.terrain.process(80); }); }
    else if (st.phase) await page.evaluate(() => { for (let k = 0; k < 16; k++) window.__api.spaceSys.tick(0.05); });
    if (!st.phase && st.planet === 'earth') break;
  }
  const r4b = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    return { phases: null, planet: g.planet, edits: g.edits.length, moonEditsKept: api.spaceSys.other && api.spaceSys.other.edits.length, near: [g.pos.x | 0, g.pos.z | 0], rockets: g.entities.filter(q => q.type === 'rocket').length, clouds: api.skySys.cloudGroup.visible, earthUp: api.skySys.earth.visible, grav: api.gravityNow(), id: g.worldId };
  });
  r4b.phases = ph2;
  console.log('4. home      :', JSON.stringify(Object.assign(r4a, r4b)));
  await page.evaluate(() => { const api = window.__api; api.exitCar(); api.quitToTitle(); });
  await page.waitForTimeout(500);
  await page.evaluate((id) => { window.__api.startWorld(id); }, r4b.id);
  await page.waitForTimeout(2500);
  const r5 = await page.evaluate(() => { const g = window.__game, api = window.__api; api.loadSys.end(); return { planet: g.planet, moonEdits: api.spaceSys.other && api.spaceSys.other.edits.length, moonPlayer: api.spaceSys.other && api.spaceSys.other.player && [api.spaceSys.other.player.x | 0, api.spaceSys.other.player.z | 0], rockets: g.entities.filter(q => q.type === 'rocket').length }; });
  console.log('5. reload    :', JSON.stringify(r5));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
