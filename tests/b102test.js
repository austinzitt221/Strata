const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b102'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, F = api.farmSys, P = api.pnodeSys, K = api.crewSys, W = api.waterSys;
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    const yx = Math.round(p.x) + 10, yz = Math.round(p.z);
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 24, yz, 34, 0, 0)); api.applyEdit(C.makeEdit(1, 1, yx, gy - 6, yz, 34, 0, C.MAT.GRASS)); g.terrain.process(200);
    const top = gy + 11;
    g.pnodes = g.pnodes || [];
    const dryA = P.add('plot', yx - 4, top, yz - 2, 0, { crop: 'wheat', stage: 1, water: 0, gt: 0 });
    const dryB = P.add('plot', yx + 4, top, yz - 2, 0, { crop: 'tomato', stage: 0, water: 0, gt: 0 });
    const bare = P.add('plot', yx, top, yz + 4, 0, { crop: null, stage: 0, water: 2, gt: 0 });
    const ripe = P.add('plot', yx - 2, top, yz + 8, 0, { crop: 'lettuce', stage: 3, water: 1, gt: 0 });
    const sp = api.springSys.add('springstone', yx + 9, top, yz + 9);
    for (let i = 0; i < 30; i++) W.step(); W.maintain();
    // the hand: posted at the yard with one splash left in the can, seeds and a hoe in the pack
    const e = api.spawnEntity('villager', yx, top + 0.7, yz);
    e.crew = { mode: 'stay', tool: null, mat: null, pack: {}, bag: new Array(8).fill(null), arm: { head: null, chest: null, feet: null }, pos: [e.x, e.y, e.z], home: { x: yx, z: yz }, r: 3, tasks: [], job: null, bp: 0, hired: 0 };
    const took = [K.take(e, { kind: 'can', water: 1 }), K.take(e, { kind: 'wheatseed', count: 1 }), K.take(e, { kind: 'hoe' })];
    const hands0 = e.crew.tool && e.crew.tool.kind;
    const mesh = api.entMesh(e); const meshOk = !!mesh;
    // run their rounds: the steer moves them by hand here (the loop is a frame a second headless)
    const log = []; let steps = 0;
    const state = () => [dryA.water, dryB.water, bare.crop, ripe.crop, e.crew.tool && e.crew.tool.kind, (K.canOf(e.crew) || {}).water];
    for (let i = 0; i < 900; i++){
      const st = K.steer(e, 0.1, performance.now(), 6);
      const L = Math.hypot(st[0], st[1]) || 1;
      if (L > 0.01 && st[2] > 0){ e.x += st[0] / L * st[2] * 0.1; e.z += st[1] / L * st[2] * 0.1; }
      e.y = top + 0.7;
      const s = JSON.stringify(state()); if (log[log.length - 1] !== s) log.push(s);
      steps++;
      if (dryA.water > 0 && dryB.water > 0 && bare.crop && !ripe.crop) break;
    }
    const bag = e.crew.bag.filter(Boolean).map(s => s.kind + (s.count != null ? 'x' + s.count : ''));
    const dist = (o) => +Math.hypot(o.x - e.x, o.z - e.z).toFixed(1);
    return { took, hands0, meshOk, steps, log, bag, hands: e.crew.tool && e.crew.tool.kind, can: (K.canOf(e.crew) || {}).water, reaped: e.crew.reaped, dSpring: dist({ x: sp.x + 0.5, z: sp.z + 0.5 }), planted: bare.crop, ripeNow: ripe.crop, dry: [dryA.water, dryB.water] };
  });
  console.log('1. the farmhand:', JSON.stringify(r1));
  // 2. no water anywhere: they say so once, and do not wander off looking
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = api.pnodeSys, K = api.crewSys;
    const e = g.entities.find(o => o.type === 'villager' && o.crew);
    const far = P.add('plot', e.x + 400, e.y - 0.7, e.z, 0, { crop: 'wheat', stage: 0, water: 0, gt: 0 });
    // a yard in the sky, forty metres over any water, and the can dry
    const hy = e.y + 40, hx = e.x + 30, hz = e.z + 30;
    api.applyEdit(C.makeEdit(1, 1, hx, hy - 4, hz, 24, 0, C.MAT.GRASS)); g.terrain.process(200);
    e.x = hx; e.z = hz; e.y = hy + 0.7; e.crew.home = { x: hx, z: hz };
    const near = P.add('plot', hx + 3, hy, hz, 0, { crop: 'wheat', stage: 0, water: 0, gt: 0 });
    const can = K.canOf(e.crew); can.water = 0;
    e.crew.farm = null; e.saidDry = 0;
    const job = K.farmJob(e);
    const wat = K.farmWater(e);
    let steps = 0; for (let i = 0; i < 60; i++){ K.steer(e, 0.1, performance.now(), 6); steps++; }
    return { farOut: !job || job.p !== far, jobKind: job && job.kind, wat, saidDry: e.saidDry, farm: e.crew.farm, stillDry: near.water };
  });
  console.log('2. dry yard   :', JSON.stringify(r2));
  // the picture: the hand at a plot with the can
  await page.evaluate(() => { const g = window.__game, api = window.__api, K = api.crewSys; const e = g.entities.find(o => o.type === 'villager' && o.crew); const pl = g.pnodes.find(n => n.t === 'plot'); const can = K.canOf(e.crew); can.water = 6; e.crew.tool = can; K.remesh(e); e.x = pl.x + 1.6; e.z = pl.z + 1.2; e.y = pl.y + 0.7; e.vx = e.vy = e.vz = 0; g.hotSel = 7; g.fly = true; g.camView = 0; g.pos.set(pl.x + 1.5, pl.y + 1.4, pl.z + 6.5); g.yaw = 0.1; g.pitch = -0.2; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(4);
  await page.screenshot({ path: __dirname + '/b102_hand.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
