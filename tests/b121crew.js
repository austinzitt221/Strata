// Build 121: the crew's chest, in the order Austin did it -- the stove first, the chest after
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b120'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); g.hp = 100; });
  await settle(3);
  // a crew member, a stove, a chest, a turret and a bed in a yard beside you
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const X = g.pos.x + 6, Z = g.pos.z + 6, Y = g.gen.height(X, Z);
    // a test pad: a box of size S centred at top - S/2, cleared by one at top + S/2
    api.applyEdit(C.makeEdit(1, 1, X, Y - 8, Z, 16, C.MAT.STONEBRICK, 0));   // a stone floor, its top at Y
    api.applyEdit(C.makeEdit(0, 1, X, Y + 8, Z, 16, 0, 0));                  // the air over it
    window.__Y = { X, Z, y: Y };
    const fy = Y;
    api.stoveSys.add(X - 3, fy, Z - 3, 0);
    const chest = api.pnodeSys.add('chest', X + 3, fy, Z - 3, 0, { sc: 1 }); chest.inv = new Array(20).fill(null); chest.inv[0] = { kind: 'bread', count: 3 };
    const tur = api.pnodeSys.add('turret', X + 3, fy, Z + 3, 0);
    api.bedSys.add(X - 3, fy, Z + 3, 0);
    const e = api.spawnEntity('villager', X, fy + 0.3, Z);
    e.crew = { mode: 'stay', tool: null, mat: null, pack: {}, bag: new Array(8).fill(null), arm: { head: null, chest: null, feet: null }, pos: [e.x, e.y, e.z], home: { x: X, z: Z }, r: 1.5, tasks: [], job: null, bp: 0, hired: 0 };
    e.crew.bag[0] = { kind: 'ironore', count: 12 }; e.crew.bag[1] = { kind: 'coal', count: 6 };
    window.__E = e; window.__chest = chest; window.__tur = tur;
    g.pos.set(X, fy + 0.2, Z + 12); g.yaw = 0; g.pitch = -0.2;
  });
  const run = (secs) => page.evaluate((secs) => { const g = window.__game, api = window.__api; g.ui = 'none'; for (let i = 0; i < secs * 10; i++){ const t = performance.now(); api.updateEntities(0.1, t); api.crewSys.tick(0.1); api.stoveSys.update(0.1); } }, secs);

  const r = {};
  await page.evaluate(() => { const api = window.__api, e = window.__E; api.crewSys.assign(e, 'stove'); });
  await run(70);
  r.noChest = await page.evaluate(() => { const e = window.__E; return { bag: e.crew.bag.filter(Boolean).map(q => q.kind + ':' + q.count) }; });
  await page.evaluate(() => { const api = window.__api, e = window.__E; api.crewSys.assign(e, 'chest'); e.crew.bag[5] = { kind: 'ironore', count: 5 }; });
  await run(40);
  r.afterChest = await page.evaluate(() => { const e = window.__E, K = window.__chest; return { chestId: e.crew.chest, bag: e.crew.bag.filter(Boolean).map(q => q.kind + ':' + q.count), chest: K.inv.filter(Boolean).map(q => q.kind + ':' + q.count) }; });
  console.log('1. stove then chest:', JSON.stringify(r));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
