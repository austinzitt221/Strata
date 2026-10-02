const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b88'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  // 0. the generator, headless: the bowl, the spike, the plate, nothing growing
  const r0 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const G = C.makeGen(7, 'alien'), K = G.centre;
    const sd = (x, y, z) => +G.sdf(x, y, z).toFixed(2);
    const floor = [sd(K.x + 20, K.floor + 0.6, K.z), sd(K.x + 20, K.floor - 0.6, K.z), +G.height(K.x + 20, K.z).toFixed(1), +G.height(K.x + 50, K.z).toFixed(1), +G.height(K.x + 69, K.z).toFixed(1)];
    const spike = [sd(K.x, 0, K.z), sd(K.x, K.top + 20, K.z), sd(K.x, K.top + 40, K.z), sd(K.x + 6, K.floor + 2, K.z)];
    const mats = [C.MAT_NAME[G.mat(K.x, 0, K.z)], C.MAT_NAME[G.mat(K.x + 20, K.floor - 0.5, K.z)], C.MAT_NAME[G.mat(K.x + 50, K.floor + 16 - 0.5, K.z)]];
    let maws = 0; for (let cx = -12; cx <= 12; cx++) for (let cz = -12; cz <= 12; cz++){ const t = G.treeAt(Math.floor(K.x / 11) + cx, Math.floor(K.z / 11) + cz); if (t && Math.hypot(t.x - K.x, t.z - K.z) < 95) maws++; }
    let spires = 0; for (let cx = -3; cx <= 3; cx++) for (let cz = -3; cz <= 3; cz++){ const S = G.spireCell(Math.floor(K.x / 48) + cx, Math.floor(K.z / 48) + cz); if (S && Math.hypot(S.x - K.x, S.z - K.z) < 110) spires++; }
    // the rim: a few metres of climb per metre, not a wall
    const rim = []; for (let r = 66; r <= 86; r += 4) rim.push(+G.height(K.x + r, K.z).toFixed(1));
    return { centre: K, dist: +Math.hypot(K.x, K.z).toFixed(0), floor, spike, mats, maws, spires, rim, nmat: C.NMAT, name: C.MAT_NAME[C.MAT.NULLSTONE], hard: C.HARDNESS[C.MAT.NULLSTONE] };
  });
  console.log('0. the centre:', JSON.stringify(r0));
  // to Strata
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'moon', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(2);
  // 1. the objective and Vehl's row, then the walk (a jump) to the centre
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true; g.ui = 'none';
    const obj = api.objectiveSys ? api.objectiveSys.list().map(o => o.label) : null;
    const K = g.gen.centre;
    const before = api.teleportSys.targets().map(t => t.kind);
    g.pos.set(K.x + 24, K.floor + 1.5, K.z + 4); g.vel.set(0, 0, 0); g.forceStream = true; g.holdT = 10; g.spawnT = -1e9;
    return { obj, K, before, planet: g.planet };
  });
  console.log('1. the way   :', JSON.stringify(r1));
  await settle(14);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.terrain.process(200);
    const K = g.gen.centre;
    api.centreSys.accT = 10; api.centreSys.tick(0.1);
    const seal = g.entities.find(e => e.type === 'seal');
    const le = api.nearEdits([K.x - 30, K.floor - 5, K.z - 30, K.x + 30, K.top + 40, K.z + 30]);
    const sd = (x, y, z) => +C.evalSDF(x, y, z, le, g.gen).toFixed(2);
    const world = { floorAir: sd(K.x + 20, K.floor + 0.8, K.z), floorRock: sd(K.x + 20, K.floor - 0.8, K.z), spike: sd(K.x, 0, K.z), overSpike: sd(K.x, K.top + 36, K.z) };
    const targets = api.teleportSys.targets().filter(t => t.kind === 'centre').length;
    const labels = api.teleportSys.targets().filter(t => t.kind === 'centre').map(t => api.teleportSys.label(t));
    // the seal, without cores, in survival
    g.mode = 'survival'; for (let i = 0; i < 40; i++) g.slots[i] = null;
    const r0 = api.centreSys.open(seal);
    const denied = !r0 && !api.bossSys.anyBoss();
    api.addStackItem('nullcore', 7);
    const boss = api.centreSys.open(seal);
    const opened = { boss: !!boss, type: boss && boss.type, state: boss && boss.state, coresLeft: C.countItem(g.slots, 'nullcore'), sealGone: !g.entities.some(e => e.type === 'seal'), sealOpen: g.story.sealOpen };
    return { seal: !!seal, sealAt: seal && [+(seal.x - K.x).toFixed(1), +(seal.y - K.floor).toFixed(2)], seen: g.story.centreSeen, world, targets, labels, denied, opened };
  });
  console.log('2. the seal  :', JSON.stringify(r2));
  // a look at the spike from the floor, the boss waking over it
  await page.evaluate(() => { const g = window.__game; const K = g.gen.centre; g.camView = 0; g.pos.set(K.x + 26, K.floor + 1.6, K.z + 6); g.yaw = Math.atan2(-(K.x - g.pos.x), -(K.z - g.pos.z)); g.pitch = 0.25; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(2); await page.screenshot({ path: __dirname + '/b88_centre.png' });
  // 3. the fight, driven by hand
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, D = api.ENT_DEF;
    const K = g.gen.centre; const B = api.bossSys.anyBoss();
    g.mode = 'survival'; g.hp = 400; g.fly = false; g.ui = 'none';
    g.pos.set(K.x + 22, K.floor + 1.2, K.z); g.vel.set(0, 0, 0);
    let bolts = 0; const ob = api.warSys.bolt; api.warSys.bolt = (e, P, RG) => { bolts++; return ob.call(api.warSys, e, P, RG); };
    let now = performance.now(), minD = 1e9, minDy = 1e9, dived = 0;
    const tick = (n) => { for (let i = 0; i < n; i++){ now += 50; api.updateEntities(0.05, now); const d = Math.hypot(B.x - g.pos.x, B.z - g.pos.z); if (d < minD) minD = d; const dy = B.y - g.pos.y; if (Math.abs(dy) < minDy) minDy = Math.abs(dy); if (d < 6 && Math.abs(dy) < 3) dived++; } };
    tick(70);                                                    // the wake
    const woke = B.state;
    tick(300);                                                   // fifteen seconds of phase one
    const p1 = { bolts, hpLost: 400 - g.hp, minD: +minD.toFixed(1), minDy: +minDy.toFixed(1), dived, phase: B.phase, orbitD: +Math.hypot(B.x - g.pos.x, B.z - g.pos.z).toFixed(1), up: +(B.y - g.pos.y).toFixed(1) };
    // two thirds down: the unmaking and the call
    const edits0 = g.edits.length; g.hp = 400;
    B.hp = D.unmaker.hp * 0.6;
    tick(200);
    const hollows = g.entities.filter(e => e.type === 'hollow').length;
    const p2 = { phase: B.phase, unmade: B.unmade || 0, editsAdded: g.edits.length - edits0, hollows, hpLost: 400 - g.hp, holeAtFeet: +C.evalSDF(g.pos.x, g.pos.y - 1.5, g.pos.z, api.nearEdits([g.pos.x - 4, g.pos.y - 5, g.pos.z - 4, g.pos.x + 4, g.pos.y + 2, g.pos.z + 4]), g.gen).toFixed(2) };
    // a third down: lancers
    B.hp = D.unmaker.hp * 0.3; tick(60);
    const lancers = g.entities.filter(e => e.type === 'lancer').length;
    // out of the bowl: it goes home and mends
    g.pos.set(K.x + 120, g.gen.height(K.x + 120, K.z) + 1, K.z); const hp0 = B.hp; tick(60);
    const home = { mended: +(B.hp - hp0).toFixed(0), towardSpike: +Math.hypot(B.x - K.x, B.z - K.z).toFixed(1) };
    g.pos.set(K.x + 22, K.floor + 1.2, K.z);
    api.warSys.bolt = ob;
    return { woke, p1, p2, lancers, home, bossbar: D.unmaker.boss };
  });
  console.log('3. the fight :', JSON.stringify(r3));
  await page.evaluate(() => { const g = window.__game; const B = window.__api.bossSys.anyBoss(); const K = g.gen.centre; g.fly = true; g.pos.set(B.x + 14, B.y - 2, B.z + 10); g.yaw = Math.atan2(-(B.x - g.pos.x), -(B.z - g.pos.z)); g.pitch = 0.1; B.charge = 1; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await page.waitForTimeout(600); await page.screenshot({ path: __dirname + '/b88_boss.png' });
  // 4. the end
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, D = api.ENT_DEF;
    const B = api.bossSys.anyBoss();
    g.mode = 'survival'; g.ui = 'none'; g.fly = false;
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    const warBefore = g.entities.filter(e => D[e.type] && D[e.type].war).length;
    api.killEntity(B, true);
    const got = { nullheart: g.slots.filter(s => s && s.kind === 'nullheart').length, astrium: C.countItem(g.slots, 'astrium'), diamond: C.countItem(g.slots, 'diamond'), coin: C.countItem(g.slots, 'coin') };
    const warAfter = g.entities.filter(e => D[e.type] && D[e.type].war).length;
    g.timeOfDay = 0.75; api.updateDayNight(0);
    for (let i = 0; i < 80; i++) api.trySpawnEntities();
    const warSpawned = g.entities.filter(e => D[e.type] && D[e.type].war).length;
    g.slots[0] = { kind: 'nullheart' }; g.sel = 0; const tool = (api.activeTool() || {}).kind;
    return { ended: g.story.ended, warBefore, warAfter, warSpawned, got, label: api.itemLabel({ kind: 'nullheart' }), icon: (api.itemIconURL({ kind: 'nullheart' }) || '').length > 100, tool, story7: api.stationOneSys.STORY7.length };
  });
  console.log('4. the end   :', JSON.stringify(r4));
  await page.waitForTimeout(6000);
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.alienSys.accT = 10; api.alienSys.tick(0.1);
    const v = g.entities.find(e => e.type === 'alien' && e.cast === 'leader');
    return { ui: g.ui, screen: !document.getElementById('endscreen').classList.contains('hidden'), lines: document.querySelectorAll('#endlines .endline').length, vehl: !!v, vehlNear: v ? +Math.hypot(v.x - g.pos.x, v.z - g.pos.z).toFixed(1) : null, endVehl: g.story.endVehl };
  });
  console.log('5. the screen:', JSON.stringify(r5));
  await page.waitForTimeout(14500);
  await page.screenshot({ path: __dirname + '/b88_end.png' });
  const r6 = await page.evaluate(() => {
    const on = document.querySelectorAll('#endlines .endline.on').length, fin = !document.getElementById('endfin').classList.contains('hidden'), btn = !document.getElementById('btnEndGo').classList.contains('hidden');
    document.getElementById('btnEndGo').click();
    return { on, fin, btn, uiAfter: window.__game.ui, hidden: document.getElementById('endscreen').classList.contains('hidden') };
  });
  console.log('6. keep going:', JSON.stringify(r6));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
