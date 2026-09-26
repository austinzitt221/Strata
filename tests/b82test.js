const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b82'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const waitLoad = async () => { for (let i = 0; i < 40; i++){ await page.waitForTimeout(1000); const on = await page.evaluate(() => { window.__game.terrain.process(80); return window.__api.loadSys.on; }); if (!on) break; } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket2' || e.type === 'rocket'); api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  // 1. the band on Earth: targets, a same-world hop, the map's list and menu
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    const bx = g.pos.x + 40, bz = g.pos.z + 30, by = g.gen.height(bx, bz) + 0.2;
    api.beaconSys.add(bx, by, bz);
    const r = api.spawnEntity('rocket', g.pos.x - 20, g.gen.height(g.pos.x - 20, g.pos.z) + 0.3, g.pos.z); r.charge = 100;
    const before = api.teleportSys.has();
    api.addStackItem('band', 1);
    const T = api.teleportSys.targets();
    const tb = T.find(t => t.kind === 'beacon');
    const ok = api.teleportSys.go(tb);
    api.loadSys.end();
    const near = Math.hypot(g.pos.x - bx, g.pos.z - bz);
    api.openMap();
    const listShown = !document.getElementById('tplist').classList.contains('hidden');
    const listRows = document.querySelectorAll('#tplist .btn').length;
    api.drawMap();
    const sp = api.mapToScreen(bx, bz);
    api.mapMenu.open(sp.x != null ? sp.x : sp.sx, sp.y != null ? sp.y : sp.sy);
    const menu = document.getElementById('mapmenu').textContent.slice(0, 80);
    api.mapMenu.close(); api.closeOverlay();
    return { before, has: api.teleportSys.has(), targets: T.map(t => t.kind + '@' + t.planet), ok, near: +near.toFixed(1), listShown, listRows, menu };
  });
  console.log('1. the band  :', JSON.stringify(r1));
  // 2. across worlds: a beacon on the Moon, and back and forth without a flight
  await fly('moon');
  const r2a = await page.evaluate(() => { const g = window.__game, api = window.__api; api.exitCar(); g.fly = true; const mx = g.pos.x + 12, mz = g.pos.z + 5; api.beaconSys.add(mx, g.gen.height(mx, mz) + 0.2, mz); const T = api.teleportSys.targets(); const te = T.find(t => t.kind === 'beacon' && t.planet === 'earth'); window.__te = te; api.teleportSys.go(te); return { targets: T.map(t => t.kind + '@' + t.planet), goingTo: te && te.planet }; });
  await waitLoad();
  const r2b = await page.evaluate(() => { const g = window.__game, api = window.__api; api.loadSys.end(); const te = window.__te; const T = api.teleportSys.targets(); const tm = T.find(t => t.kind === 'beacon' && t.planet === 'moon'); const near = Math.hypot(g.pos.x - te.x, g.pos.z - te.z); const planet = g.planet, others = Object.keys(api.spaceSys.others); api.teleportSys.go(tm); return { planet, near: +near.toFixed(1), others, tm: !!tm }; });
  await waitLoad();
  const r2c = await page.evaluate(() => { const g = window.__game, api = window.__api; api.loadSys.end(); return { planet: g.planet, others: Object.keys(api.spaceSys.others), tps: g.story.tps, rocketsOnEarth: (api.spaceSys.others.earth.entities || []).filter(r => r[0] === 'rocket').length }; });
  console.log('2. worlds    :', JSON.stringify(Object.assign(r2a, { back: r2b, again: r2c })));
  // 3. the crossing retold: stages, the standing arrival, the ship from the sky, the band from Vehl
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.story = Object.assign(g.story || {}, { word: 1, stage: 3, ship: 1, built: 1, site: 4, translator: 1 }); for (let i = 0; i < 40; i++) if (g.slots[i] && g.slots[i].kind === 'band') g.slots[i] = null; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); });
  await fly('site');
  await page.evaluate(() => { const api = window.__api, g = window.__game; api.spaceSys.TRANSIT_T = 14; api.spaceSys.CLIMB_H = 40; api.spaceSys.launch(g.driving); });
  const stages = []; let shot = false;
  for (let i = 0; i < 160; i++){
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => { const g = window.__game, api = window.__api; const F = api.spaceSys.flight; g.terrain.process(60);
      const hold = F && F.phase === 'transit' && F.ambush && F.ambush.stage === 3 && !window.__go;
      if (hold && !window.__held){ window.__held = 1; for (let k = 0; k < 30; k++) api.spaceSys.tick(0.05); return { phase: 'transit', stage: 3, hold: true, planet: g.planet }; }
      if (F && !api.loadSys.on && !hold) for (let k = 0; k < 10; k++) api.spaceSys.tick(0.05);
      return { phase: F ? F.phase : null, stage: F && F.ambush ? F.ambush.stage : -1, planet: g.planet, driving: !!g.driving, cam: g.camView }; });
    const tag = st.phase + ':' + st.stage + (st.phase === 'appear' ? ':d' + st.driving + 'c' + st.cam : ''); if (!stages.length || stages[stages.length - 1] !== tag) stages.push(tag);
    if (st.hold && !shot){ shot = true; await page.waitForTimeout(1500); await page.screenshot({ path: __dirname + '/b82_hole.png' }); await page.evaluate(() => { window.__go = 1; }); }
    if (!st.phase && st.planet === 'alien') break;
  }
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const r = g.entities.find(e => e.type === 'rocket2');
    api.exitCar(); g.fly = true; api.alienSys.tick(2);
    const L = g.entities.find(e => e.type === 'alien' && e.cast === 'leader');
    api.addStackItem('translator', 1); api.talkTo(L);
    const rows = [...document.querySelectorAll('#tradelist .craftrow')].map(q => q.textContent.slice(0, 22));
    api.closeOverlay();
    return { stages: null, planet: g.planet, wrecked: !!(r && r.wrecked), band: C.countItem(g.slots, 'band'), storyBand: g.story.band, rows };
  });
  r3.stages = stages;
  console.log('3. the fall  :', JSON.stringify(r3));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
