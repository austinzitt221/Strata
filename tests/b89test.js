const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b89'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 2 }; });
  // 1. the tables craft as tables
  const r1 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE;
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    const out = {};
    for (const k of ['mtable', 'atable', 'table']){ const r = C.RECIPES.find(r => r.kind === k); const res = C.craft(g.slots, r, true); const it = g.slots.find(s => s && s.kind === k); out[k] = [res, it ? it.count : null, g.slots.some(s => s && s.kind === 'fw')]; }
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    return { out, stackable: ['mtable', 'atable'].map(k => C.STACKABLE_KINDS.includes(k)) };
  });
  console.log('1. the tables:', JSON.stringify(r1));
  // 2. the site: build the hangar, find the door, the steps, the air
  await fly('site');
  await settle(3);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.ui = 'none'; g.mode = 'creative';
    api.siteSys.build(0); g.terrain.process(300);
    const le = api.nearEdits([-20, -5, -30, 20, 25, 20]);
    const sd = (x, y, z) => +C.evalSDF(x, y, z, le, g.gen).toFixed(2);
    const geo = { doorway: sd(0, 6.5, -13), wallBeside: sd(4, 6.5, -13), porch: sd(0, 4.3, -15.4), step1: sd(0, 3.5, -17.8), step2: sd(0, 2.7, -20.2), keelTop: sd(0, 2.3, -24), floorIn: sd(0, 5.0, -8), airIn: sd(0, 7, 0) };
    const door = game_doors();
    function game_doors(){ const d = g.doors.find(d => d.st2); return d ? { x: d.x, y: d.y, z: d.z, w: d.w, h: d.h, n: g.doors.filter(d => d.st2).length } : null; }
    const inside = { hangar: api.siteSys.insideBuilt(0, 8, 0), doorway: api.siteSys.insideBuilt(0, 6.5, -12.5), pad: api.siteSys.insideBuilt(0, 1, -50), ringUnbuilt: api.siteSys.insideBuilt(22, 8, 0), shaft: api.siteSys.insideBuilt(0, 3, 0) };
    // vacuum: survival, no suit, outside on the pad: the breath drains; inside it comes back
    g.mode = 'survival'; g.armor = {}; g.breath = 100; g.hp = 100;
    g.pos.set(0, 0.2, -50); for (let i = 0; i < 20; i++) api.updateSurvival(0.1);
    const outBreath = +g.breath.toFixed(0), warned = g.vacWarned;
    g.pos.set(0, 5.4, 0); for (let i = 0; i < 20; i++) api.updateSurvival(0.1);
    const inBreath = +g.breath.toFixed(0);
    g.pos.set(0, 0.2, -50); g.armor = { head: { kind: 'spacesuit', tier: 0 } }; g.breath = 50; for (let i = 0; i < 10; i++) api.updateSurvival(0.1);
    const suited = +g.breath.toFixed(0);
    g.armor = {}; g.mode = 'creative';
    // the retrofit: an old save (built, no door flag) gets one on arrival
    g.story.st2door = 0; g.doors = g.doors.filter(d => !d.st2); const n0 = g.edits.length;
    api.siteSys.retrofit();
    const retro = { flag: g.story.st2door, doors: g.doors.filter(d => d.st2).length, editsAdded: g.edits.length - n0 };
    api.siteSys.retrofit();
    const again = g.edits.length - n0 - retro.editsAdded;
    return { geo, door, inside, outBreath, warned, inBreath, suited, retro, again };
  });
  console.log('2. the door  :', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game; g.fly = true; g.camView = 0; g.pos.set(4, 5.5, -24); g.yaw = Math.atan2(-(0 - g.pos.x), -(-13 - g.pos.z)); g.pitch = 0.05; });
  await settle(2); await page.screenshot({ path: __dirname + '/b89_door.png' });
  // 3. Strata: the seal is marked and explained
  await page.evaluate(() => { const g = window.__game; g.story = Object.assign(g.story || {}, { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }); });
  await fly('alien');
  await settle(2);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    api.exitCar(); g.fly = true; g.ui = 'none';
    const K = g.gen.centre;
    const far = api.objectiveSys.list().map(o => o.label);
    g.pos.set(K.x + 30, K.floor + 1.5, K.z); g.forceStream = true; g.holdT = 10; g.spawnT = -1e9;
    api.centreSys.accT = 10; api.centreSys.tick(0.1);
    const near = api.objectiveSys.list().map(o => o.label);
    const seal = g.entities.find(e => e.type === 'seal');
    const m = seal && api.entMesh('seal', seal);
    return { far, near, told: api.centreSys.toldSeal, seal: !!seal, halo: !!(m && m.userData.halo), kids: m && m.children.length };
  });
  console.log('3. the seal  :', JSON.stringify(r3));
  await settle(12);
  await page.evaluate(() => { const g = window.__game; const K = g.gen.centre; g.camView = 0; g.pos.set(K.x + 40, K.floor + 30, K.z + 20); g.yaw = Math.atan2(-(K.x + 11 - g.pos.x), -(K.z - g.pos.z)); g.pitch = -0.45; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(2); await page.screenshot({ path: __dirname + '/b89_seal.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
