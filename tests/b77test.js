const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b77'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the tubes, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE;
    const M = C.makeGen(7, 'moon');
    let cells = 0, prims = 0, lights = 0, first = null;
    for (let cx = -3; cx <= 3; cx++) for (let cz = -3; cz <= 3; cz++){ const T = M.tubeCell(cx, cz); if (T.prims.length){ cells++; prims += T.prims.length; lights += T.lights.length; if (!first) first = T.prims[0]; } }
    const mx = (first.ax + first.bx) / 2, my = (first.ay + first.by) / 2, mz = (first.az + first.bz) / 2;
    const inTube = M.sdf(mx, my, mz), wall = M.sdf(mx, my - first.r - 3, mz), above = M.sdf(mx, M.height(mx, mz) + 1, mz), deepAway = M.sdf(mx + 300, -20, mz + 300);
    const L = M.makeLocal(Math.floor(mx / 16) * 16, Math.floor(mz / 16) * 16, Math.floor(mx / 16) * 16 + 16, Math.floor(mz / 16) * 16 + 16);
    const loc = L.sdf(mx, my, mz);
    const inBox = M.caveInBox([mx - 4, my - 4, mz - 4, mx + 4, my + 4, mz + 4]), noBox = M.caveInBox([mx + 400, -200, mz + 400, mx + 410, -190, mz + 410]);
    const sky = M.skylightsNear(0, 0, 400).length;
    return { cells, prims, lights, inTube: +inTube.toFixed(2), wall: +wall.toFixed(2), above: +above.toFixed(2), deepAway: +deepAway.toFixed(2), local: +loc.toFixed(2), inBox, noBox, skylightsIn400: sky, caves: M.caves, floor: M.caveFloorY };
  });
  console.log('1. tubes     :', JSON.stringify(r1));
  // 2. to the Moon; the lander and the rig
  await page.evaluate(() => {
    window.__api.loadSys.end(); const g = window.__game, api = window.__api; g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    const e = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); e.charge = 100; api.enterCar(e);
    const F = { phase: 'fadein', t: 0, e, from: 'earth', to: 'moon', h0: 0, burn: true };
    api.spaceSys.flight = F; api.spaceSys.arrive(F);
  });
  for (let i = 0; i < 60; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true;
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    const LB = api.moonBaseSys.nearestOf('lander'), RB = api.moonBaseSys.nearestOf('rig');
    const out = { kinds: {} };
    for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++){ const B2 = g.gen.mbaseAt(dx, dz); if (B2) out.kinds[B2.kind] = (out.kinds[B2.kind] || 0) + 1; }
    // the lander
    g.pos.set(LB.x - 20, g.gen.height(LB.x - 20, LB.z) + 2, LB.z);
    const e0 = g.edits.length, p0 = (g.pnodes || []).length;
    api.moonBaseSys.tick(1.1);
    let gL = g.gen.height(LB.x, LB.z) + 0.2;
    const chL = (g.pnodes || []).slice(p0).find(n => n.t === 'chest');
    out.lander = { stamped: !!g.mbases[LB.key], edits: g.edits.length - e0, deckAir: sdf(LB.x, gL + 0.6, LB.z) > 0, shellSolid: sdf(LB.x, gL - 1.2 + 6.1, LB.z) < 0, ripAir: sdf(LB.x + 5.8, gL + 0.9, LB.z + 1.0) > 0,
                   loot: chL && chL.inv.filter(Boolean).map(i => i.kind + (i.page ? '#' + i.page : 'x' + i.count)) };
    // the rig
    g.pos.set(RB.x - 20, g.gen.height(RB.x - 20, RB.z) + 2, RB.z);
    const e1 = g.edits.length, p1 = (g.pnodes || []).length, r0 = (g.ropes || []).length;
    api.moonBaseSys.tick(1.1);
    const gR = g.gen.height(RB.x, RB.z) + 0.2;
    const chR = (g.pnodes || []).slice(p1).find(n => n.t === 'chest');
    out.rig = { stamped: !!g.mbases[RB.key], edits: g.edits.length - e1, shaftAir: sdf(RB.x, gR - 10, RB.z) > 0, chamberAir: sdf(RB.x, gR - 30, RB.z) > 0, floorSolid: sdf(RB.x, gR - 33.5, RB.z) < 0, veinSolid: sdf(RB.x + 3.6, gR - 30.5, RB.z + 2.2) < 0, legSolid: sdf(RB.x + 3, gR + 5, RB.z + 3) < 0,
                ropes: (g.ropes || []).length - r0, rope: (g.ropes || []).slice(-1)[0], loot: chR && chR.inv.filter(Boolean).map(i => i.kind + (i.page ? '#' + i.page : 'x' + i.count)) };
    let pages = 'n/a'; try { pages = (api.expeditionSys ? api.expeditionSys.text(11).slice(0, 30) : 'no sys'); } catch (err){ pages = 'ERR ' + err.message; }
    out.page11 = pages;
    window.__RB = RB; window.__LB = LB;
    return out;
  });
  console.log('2. finds     :', JSON.stringify(r2));
  await settle(6);
  await page.evaluate(() => { const g = window.__game, B = window.__RB; g.pos.set(B.x - 18, g.gen.height(B.x, B.z) + 4, B.z - 12); g.yaw = Math.atan2(-(B.x - g.pos.x), -(B.z - g.pos.z)); g.pitch = 0.15; g.camView = 0; });
  await settle(4); await page.screenshot({ path: __dirname + '/b77_rig.png' });
  await page.evaluate(() => { const g = window.__game, B = window.__LB; g.pos.set(B.x + 16, g.gen.height(B.x + 16, B.z + 10) + 3, B.z + 10); g.yaw = Math.atan2(-(B.x - g.pos.x), -(B.z - g.pos.z)); g.pitch = -0.05; g.forceStream = true; });
  await settle(7); await page.screenshot({ path: __dirname + '/b77_lander.png' });
  // 3. a tube, meshed: stand in it
  const r3a = await page.evaluate(() => {
    const g = window.__game;
    const L = g.gen.skylightsNear(g.pos.x, g.pos.z, 600).sort((a, b2) => Math.hypot(a.x - g.pos.x, a.z - g.pos.z) - Math.hypot(b2.x - g.pos.x, b2.z - g.pos.z))[0];
    window.__L = L; g.pos.set(L.x, L.y - 1.5, L.z); g.forceStream = true; g.fly = true;
    return { sky: [L.x | 0, L.y | 0, L.z | 0], surface: +g.gen.height(L.x, L.z).toFixed(1) };
  });
  await settle(8);
  const r3b = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, L = window.__L, M = C.CHUNK_M;
    const key = Math.floor(L.x / M) + ',' + Math.floor((L.y - 1) / M) + ',' + Math.floor(L.z / M);
    const ch = g.terrain.chunks.get(key);
    const air = C.evalSDF(L.x, L.y - 1.5, L.z, g.edits, g.gen);
    // look along the tube
    const T = g.gen.tubeCell(Math.floor(L.x / g.gen.TUBE_CELL), Math.floor(L.z / g.gen.TUBE_CELL));
    const p = T.prims.find(q => Math.abs(q.ax - L.x) < 0.01 && Math.abs(q.az - L.z) < 0.01) || T.prims[0];
    g.yaw = Math.atan2(-(p.bx - L.x), -(p.bz - L.z)); g.pitch = 0.05;
    return { chunk: key, meshed: !!(ch && (ch.mesh || ch.built || ch.done)), empty: !!(ch && ch.empty), air: +air.toFixed(2) };
  });
  await settle(3); await page.screenshot({ path: __dirname + '/b77_tube.png' });
  console.log('3. the tube  :', JSON.stringify(Object.assign(r3a, r3b)));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
