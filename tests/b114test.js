const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b114'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(3);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, S = api.shoreSys;
    // stand at a shore: shallows near
    let w = null, bd = 1e9;
    for (let dx = -200; dx <= 200; dx += 4) for (let dz = -200; dz <= 200; dz += 4){ const x = g.pos.x + dx, z = g.pos.z + dz, W = S.wetAt(x, z); if (!W || W.depth < 1 || W.depth > 3) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, W }; } }
    g.pos.set(w.x, w.W.top + 3, w.z - 8); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
    S.hide(); S.spawnT = 0;
    const kinds = {};
    for (let i = 0; i < 400; i++){ S.tick(0.1); }
    for (const F of S.flocks) kinds[F.kind] = (kinds[F.kind] || 0) + 1;
    const flocks = S.flocks.length, schools = S.schools.length, birds = S.meshes.body.count, fish = S.meshes.fish.count;
    // every school is in water of the right depth; every fish under the surface
    let okDepth = true; for (const sc of S.schools){ const W = S.wetAt(sc.x, sc.z); if (!W || W.depth < 0.6) okDepth = false; }
    return { shore: +bd.toFixed(0), flocks, kinds, schools, birds, fish, okDepth };
  }).catch(e => ({ err: e.message }));
  console.log('1. the shore  :', JSON.stringify(r1));
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, S = api.shoreSys;
    // a landed flock, and you walking up to it
    let F = S.flocks[0] || S.spawnFlock();
    F.state = 'land'; F.landT = 30; F.x = g.pos.x + 20; F.z = g.pos.z;
    for (let i = 0; i < 5; i++) S.tick(0.1);
    const landed = F.state;
    g.pos.set(F.x - 7, g.pos.y, F.z);
    S.tick(0.1);
    const after = F.state, flee = F.fleeT > 0, away = Math.sin(F.hd) > 0.5;   // heading +x, away from you at -x
    // fish: swim into a school, it darts
    const sc = S.schools[0] || S.spawnSchool();
    const W = S.wetAt(sc.x, sc.z); const x0 = sc.x, z0 = sc.z;
    g.pos.set(sc.x - 2, W.top - 1.0, sc.z);
    S.tick(0.1); const dart = sc.dart > 0;
    for (let i = 0; i < 10; i++) S.tick(0.1);
    const moved = +Math.hypot(sc.x - x0, sc.z - z0).toFixed(1);
    // a cast over a school bites sooner
    const R = Math.random; Math.random = () => 0.5;
    const plain = (3 + 0.5 * 7), near = S.near(sc.x, sc.z, 6);
    Math.random = R;
    return { landed, after, flee, away, dart, moved, near: !!near, plainBite: plain };
  });
  console.log('2. scatter    :', JSON.stringify(r2));
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, S = api.shoreSys;
    g.timeOfDay = 0.75; api.updateDayNight(0);
    for (let i = 0; i < 900; i++) S.tick(0.1);
    const night = { flocks: S.flocks.length, schools: S.schools.length };
    g.timeOfDay = 0.3; api.updateDayNight(0);
    const planet = g.planet; g.planet = 'moon'; S.tick(0.1); const moon = { birds: S.meshes.body.count, fish: S.meshes.fish.count }; g.planet = planet;
    return { night, moon };
  });
  console.log('3. night/moon :', JSON.stringify(r3));
  // the picture: over the shallows, birds overhead
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, S = api.shoreSys;
    S.hide(); S.spawnT = 0;
    const sc = S.spawnSchool() || S.spawnSchool(); const F = S.spawnFlock() || S.spawnFlock();
    if (sc){ const W = S.wetAt(sc.x, sc.z); g.fly = true; g.camView = 0; g.hotSel = 7; g.pos.set(sc.x - 3, W.top + 2.2, sc.z + 3); g.yaw = Math.atan2(-(sc.x - g.pos.x), -(sc.z - g.pos.z)); g.pitch = -0.95; window.__shot = { top: +W.top.toFixed(2), depth: +W.depth.toFixed(2), fish: sc.fish.length }; }
    if (F){ const fx = -Math.sin(g.yaw), fz = -Math.cos(g.yaw); F.x = g.pos.x + fx * 16; F.z = g.pos.z + fz * 16; F.y = g.pos.y + 7; F.hx = F.x; F.hz = F.z; F.state = 'fly'; F.landT = 99; }
    for (let i = 0; i < 3; i++) S.tick(0.05);
  });
  await settle(3);
  await page.screenshot({ path: __dirname + '/b114_shallows.png' });
  console.log('4. the shot   :', JSON.stringify(await page.evaluate(() => Object.assign(window.__shot || {}, { fishDrawn: window.__api.shoreSys.meshes.fish.count, birdsDrawn: window.__api.shoreSys.meshes.body.count }))));
  await page.evaluate(() => { const g = window.__game; g.pitch = 0.3; const S = window.__api.shoreSys; for (const F of S.flocks){ F.landT = 99; } });
  await settle(2);
  await page.screenshot({ path: __dirname + '/b114_sky.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
