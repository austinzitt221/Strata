const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b101'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, F = api.farmSys, P = api.pnodeSys, PW = api.powerSys, W = api.waterSys;
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    const yx = Math.round(p.x) + 10, yz = Math.round(p.z);
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 24, yz, 34, 0, 0)); api.applyEdit(C.makeEdit(1, 1, yx, gy - 6, yz, 34, 0, C.MAT.GRASS)); g.terrain.process(200);
    const top = gy + 11;
    g.pnodes = g.pnodes || []; g.wires = g.wires || []; g.tubes = g.tubes || [];
    // plots: three in the ring (dry, planted), one at the rim beyond it
    const plots = [[yx - 4, yz - 3], [yx + 3, yz + 4], [yx + 8, yz - 6], [yx + 20, yz]].map(([x, z]) => P.add('plot', x, top, z, 0, { crop: 'wheat', stage: 0, water: 0, gt: 0 }));
    const spr = P.add('sprinkler', yx, top, yz, 0);
    const crank = P.add('crank', yx - 3, top, yz + 3, 0); crank.wound = 40;
    g.wires.push({ a: 'n' + crank.id, b: 'n' + spr.id });
    PW.evaluate(0.3);
    const powered0 = PW.sprinklerMap.get(spr.id);
    // dry tank: nothing sprays, no water moves
    for (let i = 0; i < 8; i++) F.sprinklerTick(spr, 1, PW.sprinklerMap.get(spr.id) || 0);
    const dryTank = { spraying: spr.spraying, water: plots.map(q => q.water) };
    // pour a can in
    g.slots[0] = { kind: 'can', water: 6 }; g.hotSel = 0;
    F.sprinklerClick(spr, g.slots[0]);
    const poured = { tank: spr.tank, can: g.slots[0].water };
    // six seconds of spraying: one burst, the ring is wet, the far plot is not
    let sprayedFrames = 0;
    for (let i = 0; i < 7; i++){ F.sprinklerTick(spr, 1, PW.sprinklerMap.get(spr.id) || 0); if (spr.spraying) sprayedFrames++; }
    const burst = { tank: spr.tank, water: plots.map(q => q.water), sprayedFrames, spinning: spr.spin > 0 };
    // all wet: it idles, the tank holds
    for (let i = 0; i < 10; i++) F.sprinklerTick(spr, 1, PW.sprinklerMap.get(spr.id) || 0);
    const idle = { tank: spr.tank, spraying: spr.spraying };
    // no power: a thirsty plot waits
    plots[0].water = 0; g.wires.length = 0; PW.evaluate(0.3);
    for (let i = 0; i < 8; i++) F.sprinklerTick(spr, 1, PW.sprinklerMap.get(spr.id) || 0);
    const unpowered = { map: PW.sprinklerMap.get(spr.id), spraying: spr.spraying, water: plots[0].water, tank: spr.tank };
    g.wires.push({ a: 'n' + crank.id, b: 'n' + spr.id }); PW.evaluate(0.3);
    // an intake in a spring, tubed to the sprinkler: the tank rises a unit a beat
    const sp = api.springSys.add('springstone', yx - 8, top, yz + 8);
    for (let i = 0; i < 30; i++) W.step(); W.maintain();
    const intake = P.add('intake', sp.x + 0.5, sp.y - 0.6, sp.z + 0.5, 0);
    const wet = F.intakeWet(intake);
    const dryIntake = P.add('intake', yx + 6, top, yz + 6, 0);
    g.tubes.push({ a: 'n' + intake.id, b: 'n' + spr.id }); g.tubes.push({ a: 'n' + dryIntake.id, b: 'n' + spr.id });
    const t0 = spr.tank; PW.tubeTick(); const t1 = spr.tank; PW.tubeTick(); PW.tubeTick(); const t3 = spr.tank;
    for (let i = 0; i < 20; i++) PW.tubeTick();
    const capped = spr.tank;
    // save carries the tank; the icons and recipes exist
    const save = api.buildSaveData();
    const saved = save.pnodes.find(n => n.id === spr.id).tank;
    const craft = ['sprinkler', 'intake'].map(k => { const r = C.RECIPES.find(r => r.kind === k); const sl = new Array(40).fill(null); return r ? C.craft(sl, r, true) : 'norecipe'; });
    const icons = ['sprinkler', 'intake'].map(k => (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100);
    const term = [P.terminal('n' + spr.id), P.terminal('n' + intake.id)].map(t => t && +(t[1] - top).toFixed(2));
    const labels = [api.itemLabel({ kind: 'sprinkler' }), api.itemLabel({ kind: 'intake' })];
    return { powered0, dryTank, poured, burst, idle, unpowered, wet, dryIntakeWet: F.intakeWet(dryIntake), t0, t1, t3, capped, saved, craft, icons, term, labels };
  });
  console.log('1. the sprinkler:', JSON.stringify(r1));
  // the tube tool's rules, through its own gate
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, P = api.pnodeSys;
    const spr = g.pnodes.find(n => n.t === 'sprinkler'), inn = g.pnodes.filter(n => n.t === 'intake')[1], hop = P.add('hopper', spr.x + 2, spr.y, spr.z + 2, 0);
    // aim helper: stand 2 m from a node's terminal and look at it
    const aim = (n) => { const t = P.terminal('n' + n.id); g.pos.set(t[0], t[1] - 1.2, t[2] + 2.2); g.camera.position.set(t[0], t[1], t[2] + 2.2); g.camera.lookAt(t[0], t[1], t[2]); g.yaw = 0; g.pitch = 0; };
    g.slots[0] = { kind: 'tube', count: 10 }; g.hotSel = 0; g.mode = 'creative'; g.ui = 'none';
    const out = {};
    const clickAt = (n) => { aim(n); const before = (g.tubes || []).length; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false; return { pending: game_pending(), tubes: (g.tubes || []).length - before }; };
    const game_pending = () => g.tubePending;
    g.tubes.length = 0; g.tubePending = null;
    out.hopToSpr = [clickAt(hop), clickAt(spr)];           // a hopper into a sprinkler: refused (one of each)
    g.tubePending = null;
    out.inToSpr = [clickAt(inn), clickAt(spr)];            // intake to sprinkler: made
    g.tubePending = null;
    out.inToHop = [clickAt(inn), clickAt(hop)];            // intake to hopper: refused
    g.tubePending = null;
    return out;
  });
  console.log('2. the tube rules:', JSON.stringify(r2));
  // the picture: noon, a full tank, thirsty plots, the head spinning
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.mode = 'survival'; const spr = g.pnodes.find(n => n.t === 'sprinkler'); spr.tank = 12; for (const p of g.pnodes) if (p.t === 'plot') p.water = 0; g.wires.length = 0; const crank = g.pnodes.find(n => n.t === 'crank'); crank.wound = 40; g.wires.push({ a: 'n' + crank.id, b: 'n' + spr.id }); api.powerSys.evaluate(0.3); g.fly = true; g.camView = 0; g.pos.set(spr.x + 1.5, spr.y + 1.2, spr.z + 6.5); g.yaw = 0.2; g.pitch = -0.15; g.timeOfDay = 0.3; api.updateDayNight(0); api.pnodeSys.rebuild(); for (let i = 0; i < 40; i++) api.farmSys.sprinklerTick(spr, 0.05, 1); });
  await settle(4);
  await page.evaluate(() => { const g = window.__game, api = window.__api; const spr = g.pnodes.find(n => n.t === 'sprinkler'); spr.sprayT = 0; for (const p of g.pnodes) if (p.t === 'plot') p.water = 0; for (let i = 0; i < 60; i++) api.farmSys.sprinklerTick(spr, 0.05, 1); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/b101_spray.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
