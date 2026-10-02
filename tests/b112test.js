const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b112'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    const x = g.pos.x + 4, z = g.pos.z; const y = g.gen.height(x, z);
    g.slots[0] = { kind: 'megatorch', count: 3 }; g.hotSel = 0;
    g.pos.set(x, y + 0.2, z - 3); g.camera.position.set(x, y + 1.8, z - 3); g.camera.lookAt(x, y, z);
    const n0 = g.torches.length; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    const T = g.torches[g.torches.length - 1];
    api.torchSys.updateUniforms(0);
    const U = g.terrainMat.uniforms; let neg = null; for (let i = 0; i < U.uTorchN.value; i++) if (U.uTorch.value[i].w < 0) neg = +U.uTorch.value[i].w.toFixed(1);
    const far = api.nearestLightDist(T[0] + 30, T[1], T[2]);
    // an ordinary torch beside it, then the drill takes both back
    api.torchSys.add(T[0] + 1, T[1], T[2]);
    g.slots[0] = null; api.doMine({ kind: 'drill', tier: 11 }, { x: T[0] + 0.5, y: T[1] + 0.2, z: T[2] }, 0, 4);
    const back = { mega: C.countItem(g.slots, 'megatorch'), torch: C.countItem(g.slots, 'torch') };
    api.torchSys.add(T[0], T[1], T[2], 1);
    const saved = api.buildSaveData().torches.filter(t => t[3]).length;
    return { placed: g.torches.length - n0 + 0, flag: T && T[3], left: 2, neg, far: +far.toFixed(2), back, saved, label: api.itemLabel({ kind: 'megatorch', count: 1 }) };
  });
  console.log('1. mega torch :', JSON.stringify(r1));
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.slots[5] = { kind: 'headlamp' }; g.armor = g.armor || {}; g.armor.head = null;
    const mv = api.uiMove ? api.uiMove(5, 'ahead') : null;
    const worn = g.armor.head && g.armor.head.kind;
    return { mv, worn, red: api.armorRed() };
  }).catch(e => ({ err: e.message }));
  await page.waitForTimeout(1500);
  const r2c = await page.evaluate(() => { const g = window.__game; const U = g.terrainMat.uniforms; const dir = { x: 0, y: 0, z: 0 }; const v = U.uHeadDir.value; const c = g.camera; const e = c.matrixWorld.elements; return { on: U.uHead.value, dir: [v.x, v.y, v.z].map(q => +q.toFixed(2)), cam: [-e[8], -e[9], -e[10]].map(q => +q.toFixed(2)) }; });
  console.log('2. headlamp   :', JSON.stringify(r2), JSON.stringify(r2c));
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, S = api.stoveSys;
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    g.slots[0] = { kind: 'greatstove', count: 1 }; g.hotSel = 0;
    const x = g.pos.x - 5, z = g.pos.z + 2, y = g.gen.height(x, z);
    g.pos.set(x, y + 0.2, z - 3); g.camera.position.set(x, y + 1.8, z - 3); g.camera.lookAt(x, y, z);
    g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    const st = g.stoves.find(q => q.great);
    if (!st) return { placed: false };
    api.openStove(st);
    const feed = [['ironore', 10], ['rubyore', 10], ['meat', 10], ['aetherore', 10], ['flour', 10], ['coal', 3]];
    feed.forEach(([k, n], i) => { g.slots[10 + i] = { kind: k, count: n }; api.quickMove(10 + i); });
    const lanes = st.gin.map(q => q && q.kind);
    const fuel0 = st.fuel && st.fuel.count;
    // a round every SMELT_T / 2 seconds unpowered
    let t = 0; while (t < C.SMELT_T * 0.5 * 4 + 0.01){ S.update(0.05); t += 0.05; }
    const outs = st.gout.map(q => q ? q.kind + ':' + q.count : null);
    const fuel1 = st.fuel ? st.fuel.count : 0, burn = st.burn;
    // a plain stove beside it, the same seconds: one item in two rounds
    S.add(x + 3, y, z, 0); const ps = g.stoves[g.stoves.length - 1]; ps.in = { kind: 'ironore', count: 10 }; ps.fuel = { kind: 'coal', count: 3 };
    t = 0; while (t < C.SMELT_T * 0.5 * 4 + 0.01){ S.update(0.05); t += 0.05; }
    const plain = ps.out ? ps.out.count : 0;
    // tubes: a hopper feeds it
    const hop = api.pnodeSys.add('hopper', x + 2, y, z - 2, 0); hop.inv = new Array(24).fill(null); hop.inv[0] = { kind: 'ironore', count: 2 }; hop.inv[1] = { kind: 'scarcoal', count: 2 };
    const before = st.gin[0].count; api.powerSys.give(st, { kind: 'ironore' }); const tubeOre = st.gin[0].count - before;
    // the drill takes it back as a great stove
    api.closeOverlay(); g.ui = 'none';
    api.doMine({ kind: 'drill', tier: 11 }, { x: st.x, y: st.y + 0.5, z: st.z }, 0, 3);
    return { placed: true, lanes, fuel0, outs, fuelUsed: fuel0 - fuel1, burn, plain, tubeOre, back: C.countItem(g.slots, 'greatstove') };
  });
  console.log('3. great stove:', JSON.stringify(r3));
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const gen = api.pnodeSys.add('gen', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z), g.pos.z, 0);
    const ok = api.powerSys.give(gen, { kind: 'scarcoal' }), mixed = api.powerSys.give(gen, { kind: 'coal' });
    return { gave: ok, fuel: gen.fuel, mixedRefused: !mixed, ops: C.fuelOps({ kind: 'scarcoal', count: 1 }) };
  });
  console.log('4. scarcoal   :', JSON.stringify(r4));
  // night: mega torches round a yard, and the headlamp on
  await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const x = g.pos.x + 20, z = g.pos.z + 20;
    for (const [dx, dz, m] of [[0, 0, 1], [-18, 10, 0], [16, 14, 1]]){ const y = g.gen.height(x + dx, z + dz); api.torchSys.add(x + dx, y, z + dz, m); }
    g.fly = true; g.camView = 0; g.hotSel = 7; g.pos.set(x, g.gen.height(x, z - 22) + 12, z - 22); g.yaw = Math.PI; g.pitch = -0.45; g.timeOfDay = 0.75; api.updateDayNight(0); api.torchSys.rebuild();
  });
  await settle(4);
  await page.screenshot({ path: __dirname + '/b112_night.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
