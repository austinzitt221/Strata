const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b63'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); });   // the tests drive the world themselves; skip the loading gate
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  await page.evaluate(() => { const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = false; });
  await settle(4);
  const key = async (code) => page.evaluate(c => document.dispatchEvent(new KeyboardEvent('keydown', { code: c, bubbles: true, cancelable: true })), code);
  // 1. every menu closes: E, and Escape
  const r1 = { };
  for (const ui of ['phone', 'pit', 'casino', 'bank', 'exchange', 'chart', 'race', 'station', 'page', 'board', 'inv', 'map', 'blue', 'craft']){
    await page.evaluate(u => { const g = window.__game, api = window.__api; g.ui = 'none'; if (u === 'phone'){ g.slots[9] = { kind: 'phone' }; api.phoneSys.open(); } else { g.ui = u; const el = document.getElementById(u + 'screen'); if (el) el.classList.remove('hidden'); } }, ui);
    const opened = await page.evaluate(() => window.__game.ui);
    await key('KeyE');
    const afterE = await page.evaluate(() => window.__game.ui);
    await page.evaluate(u => { const g = window.__game; g.ui = u; const el = document.getElementById(u + 'screen'); if (el) el.classList.remove('hidden'); }, ui);
    await key('Escape');
    const afterEsc = await page.evaluate(() => { const g = window.__game; const el = document.getElementById(g.ui + 'screen'); return g.ui + (document.querySelectorAll('.screen:not(.hidden)').length ? ' +' + document.querySelectorAll('.screen:not(.hidden)').length + ' screens still open' : ''); });
    r1[ui] = [opened, afterE, afterEsc];
  }
  console.log('1. menus     :', JSON.stringify(r1));
  // 2. the fists never grab the vehicle you are driving; the race car has a body
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.ui = 'none';
    for (let i = 0; i < 10; i++) g.slots[i] = null;
    g.hotSel = 0; api.refreshHotbar(); g.fistsUp = false;
    const H = api.spawnEntity('heli', g.pos.x + 3, g.pos.y + 0.5, g.pos.z); H.charge = 100;
    const bodyBefore = !!H.mesh;
    api.enterCar(H);
    const bodyOnEnter = !!H.mesh;
    g.pitch = -0.6; g.mouseL = true; g.mouseEdge = true;
    api.tryAction(0.016, performance.now());
    api.tryAction(0.016, performance.now() + 20);
    g.mouseL = false;
    const carried = !!game_carried_of(g), driving = g.driving === H, inWorld = g.entities.includes(H);
    function game_carried_of(gg){ return gg.carried; }
    api.exitCar();
    return { bodyBefore, bodyOnEnter, carried, driving, inWorld, heliY: +(H.y - g.pos.y).toFixed(1) };
  });
  console.log('2. fists     :', JSON.stringify(r2));
  // 3. third person orbits with the mouse; the tank fires where the turret points
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const T = api.spawnEntity('tank', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.6, g.pos.z); T.charge = 100; T.heading = 0;
    api.enterCar(T);
    g.camView = 1; g.pitch = -0.2; g.yaw = 0;
    for (let i = 0; i < 40; i++) api.driveCar(0.05);
    const c0 = g.camera.position.clone();
    g.yaw = Math.PI / 2;                    // look left: the chase cam swings round
    for (let i = 0; i < 40; i++) api.driveCar(0.05);
    const c1 = g.camera.position.clone();
    const dx0 = c0.x - T.x, dz0 = c0.z - T.z, dx1 = c1.x - T.x, dz1 = c1.z - T.z;
    const swung = +(Math.atan2(dx1, dz1) - Math.atan2(dx0, dz0)).toFixed(2);
    // fire: the shell's line follows the turret (game.yaw), not the chase camera
    g.yaw = 1.0; g.pitch = 0.05;
    for (let i = 0; i < 5; i++) api.driveCar(0.05);
    const turret = +T.mesh.userData.turret.rotation.y.toFixed(2);
    const orig = api.baseSys.shell;
    let shot = null;
    api.baseSys.shell = (from, to, r, dmg, byP) => { shot = { dx: to.x - from.x, dz: to.z - from.z }; return orig.call(api.baseSys, from, to, r, dmg, byP); };
    g.mouseL = true; api.driveCar(0.05); g.mouseL = false;
    api.baseSys.shell = orig;
    const shotYaw = shot ? +Math.atan2(-shot.dx, -shot.dz).toFixed(2) : null;
    const camDir = new (g.camera.position.constructor)(); g.camera.getWorldDirection(camDir);
    const camYaw = +Math.atan2(-camDir.x, -camDir.z).toFixed(2);
    g.camView = 0; api.exitCar();
    return { swung, turret, shotYaw, lookYaw: 1.0, camYaw, back: +Math.hypot(dx1, dz1).toFixed(1) };
  });
  console.log('3. chase/aim :', JSON.stringify(r3));
  // 4. creative is one to one: fort raiders and train raiders stay
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.mode = 'creative';
    const a = api.spawnEntity('lurker', g.pos.x + 5, g.pos.y + 0.5, g.pos.z); a.raider = true; a.noburn = true; a.fortKey = 'x';
    const b2 = api.spawnEntity('lurker', g.pos.x - 5, g.pos.y + 0.5, g.pos.z); b2.raider = true; b2.mailRaid = 'k';
    const c = api.spawnEntity('lurker', g.pos.x, g.pos.y + 0.5, g.pos.z + 5);
    let t = performance.now(); for (let i = 0; i < 20; i++){ t += 50; api.updateEntities(0.05, t); }
    const alive = [a, b2, c].map(e => g.entities.includes(e));
    for (const e of [a, b2, c]) if (g.entities.includes(e)) api.killEntity(e, false);
    return { alive };
  });
  console.log('4. creative  :', JSON.stringify(r4));
  // 5. the seam between two cube holes, through the drill: no dip, no stall
  const r5 = {};
  for (const eff of [1.5, 3]){
    await page.evaluate((eff) => {
      const g = window.__game, api = window.__api, C = window.__CORE;
      g.slots[0] = { kind: 'drill', tier: 0 }; g.hotSel = 0; api.refreshHotbar();
      const tool = api.activeTool(); g.tool.shape = 1; g.snapOn = true; g.gridIdx = 3;
      const cell = C.GRID_SIZES[g.gridIdx];
      // a level stone pad under the player, so the only ground is the holes' floor
      const px = Math.round(g.pos.x), pz = Math.round(g.pos.z);
      const gy = Math.round(g.gen.height(px, pz)) + 4;
      api.applyEdit(C.makeEdit(1, 1, px, gy - 10, pz, 20, C.MAT.STONE, 0));
      api.applyEdit(C.makeEdit(0, 1, px, gy + 10, pz, 20, 0, 0));
      const P0 = C.snapPlace(px, gy, pz, eff, cell, 0, 0, 0);
      const sp = C.snapSpacing(eff, cell);
      api.doMine(tool, { x: P0[0], y: P0[1], z: P0[2] }, 1, eff);
      api.doMine(tool, { x: P0[0] + sp, y: P0[1], z: P0[2] }, 1, eff);
      window.__SEAM = { P0, sp, floor: P0[1] - eff / 2, seam: P0[0] + sp / 2 };
      g.pos.set(P0[0], P0[1] - eff / 2 + 0.05, P0[2]); g.vel.set(0, 0, 0); g.yaw = -Math.PI / 2; g.pitch = 0; g.fly = false; g.forceStream = true;
    }, eff);
    await settle(4);                                     // the pad's chunks mesh (Build 64 holds the player otherwise)
    r5['size' + eff] = await page.evaluate(() => {
      const g = window.__game, api = window.__api, Sm = window.__SEAM, floor = Sm.floor, seam = Sm.seam;
      const ready = api.groundReadyAt(g.pos.x, g.pos.y, g.pos.z);
      for (let i = 0; i < 30; i++) api.updatePlayer(1 / 60);
      g.keys['KeyW'] = true;
      let minY = 1, maxY = -1, stuck = 0, lastX = g.pos.x;
      for (let i = 0; i < 240; i++){
        api.updatePlayer(1 / 60);
        const dx = g.pos.x - lastX; lastX = g.pos.x;
        const rel = g.pos.x - seam;
        if (Math.abs(rel) < 0.6){ minY = Math.min(minY, g.pos.y - floor); maxY = Math.max(maxY, g.pos.y - floor); if (dx < 0.02) stuck++; }
      }
      g.keys['KeyW'] = false;
      return { ready, dip: +minY.toFixed(3), rise: +maxY.toFixed(3), stuck, crossed: g.pos.x > seam + 0.5, holdT: +(g.holdT || 0).toFixed(1) };
    });
  }
  console.log('5. the seam  :', JSON.stringify(r5));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
