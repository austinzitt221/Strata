// Build 119: THE WATER'S FACE -- light on the water, foam on the shore, rings where things touch it
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /shader|GLSL|program/i.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b119'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.spawnT = -1e9; for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshToolHUD(); });
  // a lake: the nearest wide water
  const r0 = await page.evaluate(() => {
    const g = window.__game, S = window.__api.shoreSys;
    let w = null, bd = 1e9;
    for (let dx = -240; dx <= 240; dx += 6) for (let dz = -240; dz <= 240; dz += 6){ const x = g.pos.x + dx, z = g.pos.z + dz, W = S.wetAt(x, z); if (!W || W.depth < 2) continue; let wide = 0; for (const [ax, az] of [[12, 0], [-12, 0], [0, 12], [0, -12]]) if (S.wetAt(x + ax, z + az)) wide++; if (wide < 4) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, top: W.top }; } }
    window.__L = w; return w;
  });
  console.log('0. the lake   :', JSON.stringify(r0));
  // 1. afternoon, the sun low over the water: glints and the sky in it
  await page.evaluate(() => { const g = window.__game, L = window.__L, api = window.__api; g.timeOfDay = 0.44; api.updateDayNight(0); g.fly = true; g.pos.set(L.x + 14, L.top + 3, L.z + 14); const U = g.terrainMat.uniforms.uSunDir.value; g.yaw = Math.atan2(-U.x, -U.z); g.pos.x -= U.x * 20; g.pos.z -= U.z * 20; g.pitch = -0.18; });
  await settle(6);
  await page.screenshot({ path: __dirname + '/b119_glint.png' });
  const r1 = await page.evaluate(() => { const m = window.__game.waterMat; return { shared: m.uniforms.uSunDir === window.__game.terrainMat.uniforms.uSunDir, rip: m.uniforms.uRip.value.length, skinSun: !!window.__api.farTerrain.waterSurfMat[0].uniforms.uSunDir }; });
  console.log('1. the light  :', JSON.stringify(r1));
  // 2. wading in: a ring as you go in, rings as you walk
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, R = api.rippleSys, L = window.__L;
    g.timeOfDay = 0.3; api.updateDayNight(0); g.fly = false;
    const before = R.slots().filter(v => v.w > 0).length;
    g.pos.set(L.x, L.top + 3, L.z); R.tick(0.05);            // dry
    g.pos.set(L.x, L.top - 0.6, L.z); R.tick(0.05);          // in
    const entered = R.slots().filter(v => v.w > 0).length - before;
    g.vel.set(3, 0, 0); for (let i = 0; i < 20; i++){ g.pos.x += 0.15; R.tick(0.05); }
    g.vel.set(0, 0, 0);
    const walked = R.slots().filter(v => v.w > 0).length - before - entered;
    return { entered, walked };
  });
  console.log('2. wading     :', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game, L = window.__L; g.fly = true; g.pos.set(L.x - 2.5, L.top + 1.6, L.z + 3.5); g.yaw = Math.atan2(2.5, -3.5) + Math.PI; g.pitch = -0.7; const R = window.__api.rippleSys; for (let k = 0; k < 4; k++) R.add(L.x + (k % 2) * 1.4, L.z + (k >> 1) * 1.3, 0.8); });
  await settle(2);
  await page.evaluate(() => {
    // a headless frame takes a second: the rings are held at 0.8 s old for the picture
    const L = window.__L, R = window.__api.rippleSys, g = window.__game; for (const v of R.slots()) v.w = 0;
    const pts = [[0, 0, 0.9], [1.8, -0.4, 0.7], [-1.2, -1.3, 0.8], [0.6, -2.2, 0.6]];
    const t0 = R.tick.bind(R); R.tick = (dt) => { t0(dt); pts.forEach((q, i) => R.slots()[i].set(L.x + q[0], L.z + q[1], g.uTime.value - 0.5 - i * 0.25, q[2])); };
  });
  await settle(2);
  await page.screenshot({ path: __dirname + '/b119_rings.png' });
  // 3. rain on the lake
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, R = api.rippleSys, W = api.weatherSys;
    const k0 = W.kind; W.kind = 'rain'; for (const v of R.slots()) v.w = 0;
    for (let i = 0; i < 20; i++) R.tick(0.05);
    const n = R.slots().filter(v => v.w > 0).length; W.kind = k0;
    return { rainRings: n };
  });
  console.log('3. rain       :', JSON.stringify(r3));
  // 4. across the lake: the near water and the far skin's water under the same light
  await page.evaluate(() => { const g = window.__game, L = window.__L, api = window.__api; g.timeOfDay = 0.42; api.updateDayNight(0); const U = g.terrainMat.uniforms.uSunDir.value; g.pos.set(L.x - U.x * 30, L.top + 7, L.z - U.z * 30); g.pitch = -0.08; g.yaw = Math.atan2(-U.x, -U.z); });
  await settle(5);
  await page.screenshot({ path: __dirname + '/b119_across.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
