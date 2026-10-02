// Build 120: THE CREW AT HOME -- a stove kept, a turret manned, a bed, a chest, a meal a day
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

  // 1. the stove: ore and coal from the pack, the ingots into the chest
  const r1a = await page.evaluate(() => { const api = window.__api, e = window.__E; api.crewSys.assign(e, 'chest'); api.crewSys.assign(e, 'stove'); return { mode: e.crew.mode, post: !!e.crew.post, chest: e.crew.chest === window.__chest.id }; });
  await run(12);
  const r1b = await page.evaluate(() => { const g = window.__game, e = window.__E, st = g.stoves[g.stoves.length - 1]; return { atPost: +Math.hypot(e.x - (st.x + e.crew.post.ox), e.z - (st.z + e.crew.post.oz)).toFixed(2), stoveIn: st.in && st.in.count, fuel: st.fuel && st.fuel.count, bagOre: (e.crew.bag.find(q => q && q.kind === 'ironore') || { count: 0 }).count }; });
  await run(60);
  const r1c = await page.evaluate(() => { const g = window.__game, e = window.__E, st = g.stoves[g.stoves.length - 1], K = window.__chest; const ing = K.inv.filter(q => q && q.kind === 'ironingot').reduce((s, q) => s + q.count, 0); return { ingotsInChest: ing, stoveOut: st.out ? st.out.count : 0, stoveIn: st.in ? st.in.count : 0 }; });
  console.log('1. the stove  :', JSON.stringify(Object.assign(r1a, r1b, r1c)));

  // 2. a meal: the bread in their chest; fed, they work a fifth faster
  const r2 = await page.evaluate(() => { const api = window.__api, e = window.__E, K = window.__chest; const before = K.inv[0] ? K.inv[0].count : 0; e.eatT = 0; e.crew.fedDay = -1; api.crewSys.homeStep(e, 0.1, null); return { fed: api.crewSys.fed(e.crew), bread: [before, K.inv[0] ? K.inv[0].count : 0], pace: api.crewSys.pace(e.crew) }; });
  console.log('2. a meal     :', JSON.stringify(r2));

  // 3. the turret: manned, it fires with no power, and farther
  await page.evaluate(() => { const api = window.__api, e = window.__E; api.crewSys.assign(e, 'turret'); });
  await run(8);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, T = window.__tur, e = window.__E;
    api.crewSys.tick(1.1);
    const manned = !!(api.crewSys.manned && api.crewSys.manned.has(T.id));
    const foe = api.spawnEntity('stalker', T.x + 30, T.y + 9, T.z); foe.hp = 999;   // in the open, where the muzzle can see it
    const hp0 = foe.hp;
    for (let i = 0; i < 40; i++) api.powerSys.turretTick(T, 0.1);
    const hitManned = hp0 - foe.hp;
    // nobody at it and no power: nothing
    const keep = api.crewSys.manned; api.crewSys.manned = new Set(); const hp1 = foe.hp; T.target = null; T.scanT = 0;
    for (let i = 0; i < 40; i++) api.powerSys.turretTick(T, 0.1);
    api.crewSys.manned = keep; api.killEntity(foe, false);
    return { manned, dist: 30, hitManned, hitEmpty: hp1 - foe.hp, target: !!T.target, ratio: api.powerSys.turretMap ? (api.powerSys.turretMap.get(T.id) || 0) : 'none' };
  });
  console.log('3. the turret :', JSON.stringify(r3));

  // 4. night: to bed, mended by morning
  await page.evaluate(() => { const api = window.__api, e = window.__E; api.crewSys.assign(e, 'bed'); api.crewSys.assign(e, 'stove'); e.hp = 20; const g = window.__game; g.timeOfDay = 0.75; api.updateDayNight(0); });
  await run(20);
  const r4 = await page.evaluate(() => { const g = window.__game, e = window.__E, b = g.beds[g.beds.length - 1]; return { dayF: +g.dayF.toFixed(2), atBed: +Math.hypot(e.x - b[0], e.z - b[2]).toFixed(2), asleep: !!e.asleep, hp: Math.round(e.hp) }; });
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await run(10);
  r4.morning = await page.evaluate(() => { const e = window.__E, g = window.__game, st = g.stoves[g.stoves.length - 1]; return { asleep: !!e.asleep, backAtStove: +Math.hypot(e.x - (st.x + e.crew.post.ox), e.z - (st.z + e.crew.post.oz)).toFixed(2) }; });
  console.log('4. the bed    :', JSON.stringify(r4));

  // 5. the dig into the chest; the save keeps it all
  const r5 = await page.evaluate(() => {
    const api = window.__api, e = window.__E, K = window.__chest, C = e.crew;
    C.pack = { 3: 150, ironore: 4 }; C.mode = 'stay'; e.depositT = 0;
    for (let i = 0; i < 200; i++){ api.updateEntities(0.1, performance.now()); if (!api.crewSys.packSum(C)) break; }
    const rock = K.inv.filter(q => q && q.kind === 'mat' && q.mat === 3).reduce((s, q) => s + q.count, 0);
    const saved = JSON.parse(JSON.stringify(C));
    return { left: api.crewSys.packSum(C), rockInChest: rock, saved: { bed: !!saved.bed, chest: saved.chest === K.id, fedDay: saved.fedDay != null, post: !!saved.post } };
  });
  console.log('5. the chest  :', JSON.stringify(r5));
  // the picture: the crew member at the stove, at dusk
  await page.evaluate(() => { const g = window.__game, api = window.__api, e = window.__E, Y = window.__Y; api.crewSys.assign(e, 'stove'); g.timeOfDay = 0.4; api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; api.refreshHotbar(); api.refreshToolHUD(); g.pos.set(Y.X + 1, Y.y + 0.2, Y.Z + 5); g.yaw = 0.35; g.pitch = -0.25; });
  await run(6);
  await settle(4);
  await page.screenshot({ path: __dirname + '/b120_stove.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
