const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b103'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, B = api.breedSys, PS = api.petSys;
    const p = g.pos, gy = g.gen.height(p.x + 4, p.z + 4);
    const a = api.spawnEntity('sheep', p.x + 4, gy + 0.7, p.z + 4), b2 = api.spawnEntity('sheep', p.x + 5, gy + 0.7, p.z + 4);
    const c = B.pair(a, b2);
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'tomato', count: 10 };
    const feeds = []; const pets = [];
    for (let i = 0; i < 3; i++){ feeds.push(B.feed(c)); pets.push(!!c.pet); }
    const name = c.pet && c.pet.name, tomatoes = g.slots[0].count, grownYet = c.grow;
    const again = B.feed(c);                       // still growing: no meal, no second adoption
    // its walk
    const far = PS.steer(c, 0.1, 20), near = PS.steer(c, 0.1, 2);
    PS.click(c); const stayed = c.pet.mode; const stayStep = PS.steer(c, 0.1, 20); PS.click(c);
    // it never despawns, the parents do
    g.pos.set(p.x + 120, p.y, p.z); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
    api.updateEntities(0.1);
    const parentsGone = !g.entities.includes(a) && !g.entities.includes(b2), petKept = g.entities.includes(c);
    const dNow = +Math.hypot(c.x - g.pos.x, c.z - g.pos.z).toFixed(1);   // it caught up (teleport past 70 m)
    g.pos.set(p.x, p.y, p.z); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); c.x = p.x + 2; c.z = p.z + 2;
    const row = api.buildSaveData().entities.find(r => r[11] && r[11].name === name);
    let map = 'ok'; try { api.openMap(); api.drawMap(); api.closeOverlay(); } catch (e){ map = e.message; } g.ui = 'none';
    return { born: !!c, feeds, pets, name, inList: api.petSys.all().length, tomatoes, grownYet: grownYet > 0, again, far: far && far.map(v => +v.toFixed(2)), near, stayed, stayStep, parentsGone, petKept, dNow, saved: row && [row[0], row[11], row[10] > 0], map };
  });
  console.log('1. the pet   :', JSON.stringify(r1));
  // 2. it rides the rocket to the Moon
  await fly('moon'); await settle(2);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.loadSys.end(); api.exitCar();
    const pets = api.petSys.all();
    const earth = api.spaceSys.others.earth;
    const leftBehind = (earth && earth.entities || []).filter(r => r[11]).length;
    return { planet: g.planet, here: pets.map(e => [e.type, e.pet.name, e.pet.mode, +Math.hypot(e.x - g.pos.x, e.z - g.pos.z).toFixed(1), e.grow > 0]), leftBehind };
  });
  console.log('2. the Moon  :', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const c = api.petSys.all()[0]; if (c){ c.x = g.pos.x + 2.2; c.z = g.pos.z - 2.5; c.y = g.pos.y + 0.3; } g.fly = true; g.camView = 0; g.hotSel = 7; g.pos.y += 1.0; g.yaw = -0.7; g.pitch = -0.35; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(4);
  await page.screenshot({ path: __dirname + '/b103_moon.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
