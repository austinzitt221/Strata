const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b85'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the generator, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const A = C.makeGen(7, 'alien');
    let mn = 1e9, mx = -1e9, steps = 0, n = 0; const mats = {}, biomes = {};
    for (let x = -600; x <= 600; x += 10) for (let z = -600; z <= 600; z += 10){
      const h = A.height(x, z); mn = Math.min(mn, h); mx = Math.max(mx, h); n++;
      const f = ((h % 8) + 8) % 8; if (f < 0.6 || f > 7.4) steps++;
      const m = C.MAT_NAME[A.mat(x, h - 0.4, z)]; mats[m] = (mats[m] || 0) + 1;
      biomes[A.biome(x, z)] = (biomes[A.biome(x, z)] || 0) + 1;
    }
    // overhangs: solid above the heightfield; caves: air below it; spires
    let over = 0, caves = 0, spires = 0, checked = 0;
    for (let x = -300; x <= 300; x += 15) for (let z = -300; z <= 300; z += 15){
      const h = A.height(x, z); checked++;
      for (let dy = 1; dy <= 5; dy += 2) if (A.sdf(x, h + dy, z) < 0){ over++; break; }
      for (let y = h - 12; y > -80; y -= 6) if (A.sdf(x, y, z) > 0.5){ caves++; break; }
    }
    for (let cx = -6; cx <= 6; cx++) for (let cz = -6; cz <= 6; cz++) if (A.spireCell(cx, cz)) spires++;
    const sp = A.spawn(); const hs = A.height(sp.x, sp.z);
    const L = A.makeLocal(0, 0, 32, 32); const dl = Math.abs(L.sdf(7.3, A.height(7.3, 9.1) - 2, 9.1) - A.sdf(7.3, A.height(7.3, 9.1) - 2, 9.1));
    let ore = 0; for (let x = 0; x < 120; x += 2) for (let z = 0; z < 120; z += 2) for (let y = -120; y < -4; y += 2) if (A.mat(x, y, z) === C.MAT.VOIDORE) ore++;
    const earthMats = Object.keys(mats).filter(m => ['grass', 'rock', 'sand', 'mud', 'snow', 'dry grass', 'leaf litter'].includes(m));
    return { hmin: +mn.toFixed(1), hmax: +mx.toFixed(1), onStep: +(steps / n).toFixed(2), mats, earthMats, biomes, over, caves, checked, spires, spawn: sp, spawnH: +hs.toFixed(1), localMatch: dl < 0.05, ore, names: [0, 1, 2].map(b => api.regionNameOf({ arch: 14 + b, seed: 12345 })), village: A.villageAt(0, 0), planet: A.planet, nmat: C.NMAT, hr: A.heightRange(0, 0, 16, 16).map(v => +v.toFixed(0)) };
  });
  console.log('1. Strata    :', JSON.stringify(r1));
  // 2. arrive: the ground under you, the countries in the HUD, the blight burns
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game, api = window.__api; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'moon', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true;
    const h = g.gen.height(g.pos.x, g.pos.z);
    const ground = C.MAT_NAME[g.gen.mat(g.pos.x, h - 0.4, g.pos.z)];
    // the blight: stand on it in survival
    let sx = null, sz = null;
    for (let r = 50; r < 3000 && sx == null; r += 50) for (let a = 0; a < 6.28; a += 0.4){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; const hh = g.gen.height(x, z); if (g.gen.mat(x, hh - 0.4, z) === C.MAT.CORRUPT){ sx = x; sz = z; break; } }
    let burn = null;
    if (sx != null){ let y = g.gen.height(sx, sz) + 20; while (y > -50 && g.gen.sdf(sx, y, sz) > 0) y -= 0.25; g.mode = 'survival'; g.hp = 100; g.fly = false; g.pos.set(sx, y + 0.05, sz); g.lavaAcc = 1; g.holdT = 10; api.updatePlayer(0.05); burn = 100 - g.hp; g.mode = 'creative'; g.fly = true; g.pos.set(g.pos.x, g.pos.y + 5, g.pos.z); }
    return { planet: g.planet, gen: g.gen.planet, ground, hud: document.getElementById('navpos').textContent.slice(0, 70), blightAt: sx != null && [sx | 0, sz | 0], burn, chunks: g.terrain.chunks.size };
  });
  console.log('2. landing   :', JSON.stringify(r2));
  await settle(8);
  await page.evaluate(() => { const g = window.__game; const r = g.entities.find(e => e.type === 'rocket2'); g.pos.set(r.x - 30, Math.max(g.gen.height(r.x - 30, r.z + 20), r.y) + 12, r.z + 20); g.yaw = Math.atan2(-(r.x - g.pos.x), -(r.z - g.pos.z)); g.pitch = -0.02; g.camView = 0; g.forceStream = true; g.timeOfDay = 0.3; });
  await settle(8); await page.screenshot({ path: __dirname + '/b85_strata.png' });
  // a second look: the Scar
  await page.evaluate(() => { const g = window.__game; let sx = null, sz = null; for (let r = 100; r < 4000 && sx == null; r += 100) for (let a = 0; a < 6.28; a += 0.5){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; if (g.gen.biome(x, z) === 1){ sx = x; sz = z; break; } } if (sx != null){ g.pos.set(sx, g.gen.height(sx, sz) + 14, sz); g.yaw += 1; g.pitch = 0.15; g.forceStream = true; } });
  await settle(9); await page.screenshot({ path: __dirname + '/b85_scar.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
