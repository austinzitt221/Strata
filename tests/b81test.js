const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b81'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket2'); api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  // 1. the alien world, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const A = C.makeGen(7, 'alien');
    const mats = {};
    for (let x = -300; x <= 300; x += 12) for (let z = -300; z <= 300; z += 12){ const h = A.height(x, z); const m = C.MAT_NAME[A.mat(x, h - 0.3, z)]; mats[m] = (mats[m] || 0) + 1; }
    const L = A.makeLocal(0, 0, 32, 32); const h0 = A.height(5, 5);
    return { mats, localMat: C.MAT_NAME[L.mat(5, h0 - 0.3, 5)], village: A.villageAt(0, 0), city: A.cityAt(0, 0), arch: A.regionAt(0, 0).arch, name: api.regionNameOf(A.regionAt(0, 0)), planet: A.planet, nmat: C.NMAT };
  });
  console.log('1. the world :', JSON.stringify(r1));
  // 2. the crossing: from the site in the star rocket, the ambush
  await page.evaluate(() => {
    window.__api.loadSys.end(); const g = window.__game, api = window.__api; g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    g.story = { word: 1, stage: 3, ship: 1, built: 1, site: 4, translator: 1 };
    const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r);
  });
  await fly('moon'); await fly('site');
  const r2a = await page.evaluate(() => { const g = window.__game, api = window.__api; const r = g.driving; api.spaceSys.TRANSIT_T = 10; api.spaceSys.CLIMB_H = 40; const routes = api.spaceSys.routes(r); const ok = api.spaceSys.launch(r); return { routes, dest: api.spaceSys.destOf(), launched: ok, planet: g.planet }; });
  const stages = []; let shot = false;
  for (let i = 0; i < 120; i++){
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => { const g = window.__game, api = window.__api; const F = api.spaceSys.flight; g.terrain.process(60);
      if (F && F.phase === 'transit' && F.ambush && F.ambush.stage === 2 && !window.__held){ window.__held = 1; return { phase: 'transit', stage: 2, hold: true, planet: g.planet }; }
      if (F && !api.loadSys.on && !(F.phase === 'transit' && F.ambush && F.ambush.stage === 2 && !window.__go)) for (let k = 0; k < 10; k++) api.spaceSys.tick(0.05);
      return { phase: F ? F.phase : null, stage: F && F.ambush ? F.ambush.stage : -1, planet: g.planet, y: g.driving && +g.driving.y.toFixed(0) }; });
    const tag = st.phase + ':' + st.stage; if (!stages.length || stages[stages.length - 1] !== tag) stages.push(tag);
    if (st.hold && !shot){ shot = true; await page.waitForTimeout(1500); await page.screenshot({ path: __dirname + '/b81_ambush.png' }); await page.evaluate(() => { window.__go = 1; }); }
    if (!st.phase && st.planet === 'alien') break;
  }
  const r2b = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const r = g.entities.find(e => e.type === 'rocket2');
    const D = api.buildSaveData();
    const row = (D.entities || []).find(q => q[0] === 'rocket2');
    return { stages: null, planet: g.planet, gen: g.gen.planet, wrecked: !!(r && r.wrecked), tilt: r && +(r.tilt || 0).toFixed(2), story: { ambushed: g.story.ambushed, siteLost: g.story.siteLost, site: g.story.site }, others: Object.keys(api.spaceSys.others), savedWreck: row && row[9], vehl: g.entities.some(e => e.type === 'alien' && e.cast === 'leader'), hud: document.getElementById('navpos').textContent.slice(0, 60), sky: [+g.skyNow.r.toFixed(2), +g.skyNow.g.toFixed(2), +g.skyNow.b.toFixed(2)], routes: api.spaceSys.routes(r) };
  });
  r2b.stages = stages; r2b.launch = r2a;
  console.log('2. crossing  :', JSON.stringify(r2b));
  // 3. the crash site; Vehl; the repair
  await page.evaluate(() => { const g = window.__game, api = window.__api; api.exitCar(); const r = g.entities.find(e => e.type === 'rocket2'); g.fly = true; g.pos.set(r.x - 14, g.gen.height(r.x - 14, r.z + 10) + 4, r.z + 10); g.yaw = Math.atan2(-(r.x - g.pos.x), -(r.z - g.pos.z)); g.pitch = 0.05; g.camView = 0; g.forceStream = true; g.timeOfDay = 0.3; });
  await settle(7); await page.screenshot({ path: __dirname + '/b81_crash.png' });
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const r = g.entities.find(e => e.type === 'rocket2');
    const out = []; api.alienSys.objectives(out);
    const L = g.entities.find(e => e.type === 'alien' && e.cast === 'leader');
    api.addStackItem('translator', 1); api.talkTo(L);
    const rows = [...document.querySelectorAll('#tradelist .craftrow')].map(q => q.textContent.slice(0, 24));
    api.closeOverlay();
    g.mode = 'survival'; const can0 = api.spaceSys.canRepair(); api.enterCar(r); const rep0 = api.spaceSys.repair(r);
    api.addStackItem('ironingot', 16); api.addStackItem('astrium', 2); C.addMat(g.slots, C.MAT.PLATING, 8);
    const can1 = api.spaceSys.canRepair(); const rep1 = api.spaceSys.repair(r);
    const left = { iron: C.countItem(g.slots, 'ironingot'), astrium: C.countItem(g.slots, 'astrium'), plating: C.countMat(g.slots, C.MAT.PLATING) };
    g.mode = 'creative';
    return { objectives: out.map(o => o.label), vehlRows: rows, can0, rep0, can1, rep1, wrecked: r.wrecked, charge: r.charge, left, surface: C.MAT_NAME[g.gen.mat(g.pos.x, g.gen.height(g.pos.x, g.pos.z) - 0.3, g.pos.z)] };
  });
  console.log('3. the wreck :', JSON.stringify(r3));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
