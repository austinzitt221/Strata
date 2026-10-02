const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b92'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  // 1. the generator, in the page
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, G = C.makeGen(7, 'alien');
    let riv = 0, n = 0, jumps = 0, maxH = -1e9, maxJump = 0;
    for (let z = -600; z < 600; z += 6) for (let x = -600; x < 600; x += 6){ n++; const h = G.height(x, z); if (h > maxH) maxH = h; const j = Math.abs(G.height(x + 1, z) - h); if (j > maxJump) maxJump = j; if (j > 12) jumps++; const R = G.riverAt(x, z); if (R && R.d < R.w) riv++; }
    return { n, riverFrac: +(riv / n).toFixed(3), jumpFrac: +(jumps / n).toFixed(3), maxJump: +maxJump.toFixed(1), maxH: +maxH.toFixed(1), sea: G.seaLevel, ichor: G.ichor };
  });
  console.log('1. the land  :', JSON.stringify(r1));
  await fly('alien');
  await settle(2);
  // 2. to the nearest river: in it, on it, burned by it
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true; g.ui = 'none'; g.spawnT = -1e9;
    let first = null; for (let r = 10; r < 1500 && !first; r += 3) for (let a = 0; a < 6.28 && !first; a += 0.25){ const x = Math.round(g.pos.x + Math.cos(a) * r), z = Math.round(g.pos.z + Math.sin(a) * r); const R = g.gen.riverAt(x, z); if (R && R.d < R.w * 0.4) first = { x, z, R }; }
    if (!first) return { none: true };
    g.pos.set(first.x, first.R.y + 1.5, first.z); g.vel.set(0, 0, 0); g.forceStream = true; g.holdT = 10;
    return { at: [first.x, first.z], y: +first.R.y.toFixed(1), w: +first.R.w.toFixed(1), h: +g.gen.height(first.x, first.z).toFixed(1), d: +Math.hypot(first.x - g.pos.x, first.z - g.pos.z).toFixed(0) };
  });
  console.log('2. the river :', JSON.stringify(r2));
  await settle(12);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.terrain.process(300);
    const p = g.pos; const R = g.gen.riverAt(p.x, p.z);
        const inW = api.inWater(p.x, R.y - 0.5, p.z), above = api.inWater(p.x, R.y + 0.5, p.z);
    const top = api.waterTopAt(p.x, p.z, R.y);
    let waterMeshes = 0; for (const ch of g.terrain.chunks.values()) if (ch.water) waterMeshes++;
    const col = api.mapCellColor(Math.floor(p.x / 16), Math.floor(p.z / 16), null);
    const uni = g.uIchor && g.uIchor.value;
    // the burn: survival, standing in it, with nothing in the bag that drinks a burn
    g.mode = 'survival'; g.hp = 100; g.fly = false; g.armor = {}; p.y = R.y - 1.0;
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    let direct = null; if (api.updatePlayer){ g.lavaAcc = 5; api.updatePlayer(0.016); direct = { hp: Math.round(g.hp), warned: !!g.ichorWarned }; }
    g.hp = 100;
    return { inW, above, top: top == null ? null : +top.toFixed(1), riverY: +R.y.toFixed(1), waterMeshes, col, uni, direct, bed: C.MAT_NAME[C.materialAt(p.x, R.y - 2.2, p.z, api.nearEdits([p.x - 1, R.y - 4, p.z - 1, p.x + 1, R.y, p.z + 1]), g.gen)] };
  });
  console.log('3. in it     :', JSON.stringify(r3));
  // (the live loop runs at about a frame a second headless, so the burn's beat is read from the direct call above)
  const r4 = await page.evaluate(() => { const g = window.__game; const out = { hp: Math.round(g.hp), warned: !!g.ichorWarned, swim: !!g.swim }; g.mode = 'creative'; g.fly = true; g.hp = 100; return out; });
  console.log('4. the burn  :', JSON.stringify(r4));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const p = g.pos, R = g.gen.riverAt(p.x, p.z); p.set(p.x - R.tx * 3 + R.tz * 9, R.y + 3.5, p.z - R.tz * 3 - R.tx * 9); g.yaw = Math.atan2(-(R.tx), -(R.tz)) + 0.6; g.pitch = -0.15; g.camView = 0; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(3); await page.screenshot({ path: __dirname + '/b92_ichor.png' });
  await page.evaluate(() => { const g = window.__game; g.pos.y += 90; g.pitch = -0.5; g.yaw += 1.2; });
  await settle(6); await page.screenshot({ path: __dirname + '/b92_land.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
