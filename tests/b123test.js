// Build 123: THE OVERFORGE, slice 2 -- the grapple, the rod, wings, jetpack, boots, the car, the jet, the drones
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b123'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.timeOfDay = 0.9; window.__api.updateDayNight(0); g.hp = 100; });
  await settle(3);
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const X = Math.round(g.pos.x) + 0.5, Z = Math.round(g.pos.z) + 0.5, Y = Math.round(g.gen.height(X, Z));
    api.applyEdit(C.makeEdit(1, 1, X, Y - 20, Z, 40, C.MAT.STONEBRICK, 0));   // a pad (box of size S centred at top - S/2)
    api.applyEdit(C.makeEdit(0, 1, X, Y + 20, Z, 40, 0, 0));
    window.__P = { X, Y, Z };
    g.pos.set(X, Y + 0.1, Z + 8); g.yaw = 0; g.pitch = 0; g.vel.set(0, 0, 0);
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    window.__hold = (it) => { g.slots[0] = it; g.hotSel = 0; api.refreshHotbar(); api.refreshToolHUD(); };
    window.__aim = (x, y, z) => { const c = g.camera.position; c.set(g.pos.x, g.pos.y + 1.62, g.pos.z); const dx = x - c.x, dy = y - c.y, dz = z - c.z; g.yaw = Math.atan2(-dx, -dz); g.pitch = Math.atan2(dy, Math.hypot(dx, dz)); g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); g.camera.updateMatrixWorld(); };
    window.__foe = (type, x, z, hp, y) => { const e = api.spawnEntity(type, x, y != null ? y : window.__P.Y + 0.05, z); e.hp = hp; e.vx = e.vz = 0; e.noburn = true; return e; };
    window.__click = () => { g.ui = 'none'; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseEdge = false; g.mouseL = false; };
    window.__step = (n, dt) => { for (let i = 0; i < n; i++){ api.updatePlayer(dt || 0.05); api.ovSys.tick(dt || 0.05); } };
    window.__clear = () => { for (const e of [...g.entities]) if (e.type !== 'drop') api.killEntity(e, false); };
  });
  await settle(3);

  // 0. the machine takes them all
  const r0 = await page.evaluate(() => {
    const api = window.__api, O = api.ovSys, C = window.__CORE;
    const items = { grapple: { kind: 'grapple' }, rod: { kind: 'rod' }, wings: { kind: 'wings' }, jetpack: { kind: 'jetpack', fuel: 100 }, boots: { kind: 'boots', tier: 3 }, sportscar: { kind: 'sportscar', charge: 100 }, jet: { kind: 'jet', charge: 0 }, drone: { kind: 'drone', charge: 100 }, tdrone: { kind: 'tdrone', charge: 100 } };
    const out = {}; for (const k in items) out[k] = { can: O.can(items[k]), pool: O.pool(items[k]).map(q => api.OV[q].name), cost: O.cost(items[k]) };
    out.wreck = O.can({ kind: 'sportscar', wrecked: 1 });
    return out;
  });
  console.log('0. the machine:', JSON.stringify(r0));

  // 1. SCORPION and PENDULUM
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    window.__hold({ kind: 'grapple', ov: 'scorpion' });
    const f = window.__foe('stalker', g.pos.x, g.pos.z - 20, 500);
    window.__aim(f.x, f.y + 0.7, f.z); window.__click();
    const hooked = !!(g.grapple && g.grapple.haul === f), p0 = { x: g.pos.x, z: g.pos.z };
    window.__step(40);
    out.scorpion = { hooked, dist: +Math.hypot(f.x - g.pos.x, f.z - g.pos.z).toFixed(2), playerMoved: +Math.hypot(g.pos.x - p0.x, g.pos.z - p0.z).toFixed(2), stunned: f.ovStun > 0, released: !g.grapple };
    api.killEntity(f, false);
    // PENDULUM: a beam 14 m up; hook it, run sideways, the rope never lengthens
    api.applyEdit(C.makeEdit(1, 1, P.X, P.Y + 16, P.Z - 4, 4, C.MAT.STONEBRICK, 0));
    g.pos.set(P.X, P.Y + 5, P.Z + 6); g.vel.set(0, 0, 0); g.grounded = false;
    window.__hold({ kind: 'grapple', ov: 'swing' });
    window.__aim(P.X, P.Y + 14.05, P.Z - 4); window.__click();
    const gp = g.grapple, L0 = gp && gp.L;
    g.vel.set(9, 0, 0); let dmax = 0, xs = [];
    for (let i = 0; i < 60; i++){ window.__step(1); const d = Math.hypot(gp.x - g.pos.x, gp.y - (g.pos.y + 1.8 * 0.6), gp.z - g.pos.z); dmax = Math.max(dmax, d); xs.push(g.pos.x); }
    out.swing = { L: L0 && +L0.toFixed(2), maxDist: +dmax.toFixed(2), swungX: +(Math.max(...xs) - Math.min(...xs)).toFixed(2), stillHooked: !!g.grapple };
    g.grapple = null;
    return out;
  });
  console.log('1. the grapple:', JSON.stringify(r1));

  // 2. GRAB-BAG and EMBERLINE
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, W = api.worthSys, out = {};
    const probe = ['coal', 'ironingot', 'diamond', 'nullheart'].map(k => [k, +W.of({ kind: k }).toFixed(1)]);
    out.worth = Object.fromEntries(probe.concat([['iron drill', +W.of(C.makeDrill(1)).toFixed(1)], ['stonebrick', +W.of({ kind: 'mat', mat: C.MAT.STONEBRICK }).toFixed(2)], ['Longeye', W.of(C.makeFirearm(5))]]));
    let cheap = 0, dear = 0, n = 4000; for (let i = 0; i < n; i++){ const e = W.roll(); if (e.worth < 20) cheap++; if (e.worth >= 500) dear++; }
    out.rolls = { pool: W.pool().length, under20: +(cheap / n).toFixed(3), over500: +(dear / n).toFixed(4) };
    // EMBERLINE: a lava pool at your feet
    api.applyEdit(C.makeEdit(0, 1, P.X, P.Y - 0.5, P.Z - 3, 3, 0, 0));
    api.applyEdit(C.makeEdit(1, 1, P.X, P.Y - 1.6, P.Z - 3, 3, C.MAT.LAVA, 0));
    g.pos.set(P.X, P.Y + 0.1, P.Z + 1.5); window.__hold({ kind: 'rod', ov: 'ember' });
    window.__aim(P.X, P.Y - 0.1, P.Z - 3); window.__click();
    const F = g.fishing; out.ember = { cast: !!F, lava: !!(F && F.lava) };
    if (F){ const before = JSON.stringify(g.slots.filter(Boolean).map(q => q.kind + (q.mat || '') + ':' + q.count)); F.bit = true; window.__click(); out.ember.got = JSON.stringify(g.slots.filter(Boolean).map(q => q.kind + (q.mat || '') + ':' + q.count)) !== before; }
    return out;
  });
  console.log('2. the rods   :', JSON.stringify(r2));

  // 3. wings, jetpack, boots
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    const up = (h) => { g.pos.set(P.X, P.Y + h, P.Z); g.vel.set(0, 0, 0); g.grounded = false; g.fly = false; };
    window.__hold(null);
    // SKYLARK: six beats up, then no more
    g.armor.back = { kind: 'wings', ov: 'skylark' }; up(30);
    const y0 = g.pos.y; let peak = y0;
    for (let i = 0; i < 16; i++){ g.keys.Space = true; window.__step(1); g.keys.Space = false; window.__step(5); peak = Math.max(peak, g.pos.y); }
    out.skylark = { climbed: +(peak - y0).toFixed(1), beats: g.flaps };
    // ALBATROSS: a dive, then a pull-up
    g.armor.back = { kind: 'wings', ov: 'albatross' }; up(220); g.keys.Space = true; g.keys.KeyW = true;
    g.pitch = -0.35; let vmax = 0; for (let i = 0; i < 60; i++){ window.__step(1); vmax = Math.max(vmax, Math.hypot(g.vel.x, g.vel.z)); }
    const yLow = g.pos.y; g.pitch = 0.45; let yHigh = yLow; for (let i = 0; i < 30; i++){ window.__step(1); yHigh = Math.max(yHigh, g.pos.y); }
    g.armor.back = { kind: 'wings' }; up(220); g.pitch = -0.35; let vPlain = 0; for (let i = 0; i < 60; i++){ window.__step(1); vPlain = Math.max(vPlain, Math.hypot(g.vel.x, g.vel.z)); }
    out.albatross = { topSpeed: +vmax.toFixed(1), plainWings: +vPlain.toFixed(1), climbOnPullUp: +(yHigh - yLow).toFixed(1) };
    g.keys.KeyW = false; g.pitch = 0;
    // AFTERBURNER and HOVERPACK
    const jet = (ov, shift) => { g.armor.back = { kind: 'jetpack', fuel: 100, ov }; up(40); g.keys.Space = true; g.keys.ShiftLeft = shift; const y1 = g.pos.y; window.__step(20); const r = { h: +Math.hypot(g.vel.x, g.vel.z).toFixed(1), dy: +(g.pos.y - y1).toFixed(2), fuel: +(100 - g.armor.back.fuel).toFixed(2) }; g.keys.ShiftLeft = false; return r; };
    out.jetpack = { plain: jet(null, false), afterburn: jet('afterburn', true), hover: jet('hover', false) };
    g.keys.Space = false; g.armor.back = null;
    // SPRINGHEEL: the jump, and a 30 m fall
    const jump = (ov) => { g.armor.feet = { kind: 'boots', tier: 2, ov }; g.pos.set(P.X, P.Y + 0.05, P.Z); g.vel.set(0, 0, 0); g.grounded = true; g.keys.Space = true; window.__step(1); g.keys.Space = false; let top = g.pos.y; for (let i = 0; i < 40; i++){ window.__step(1); top = Math.max(top, g.pos.y); } return +(top - P.Y).toFixed(2); };
    out.spring = { plain: jump(null), spring: jump('spring') };
    g.hp = 100; g.armor.feet = { kind: 'boots', tier: 2, ov: 'spring' }; up(30); for (let i = 0; i < 80 && !g.grounded; i++) window.__step(1); out.spring.fallHp = g.hp;
    g.hp = 100; g.armor.feet = null;
    return out;
  });
  console.log('3. the gear   :', JSON.stringify(r3));

  // 4. WATERWALKER on the nearest lake
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, S = api.shoreSys;
    let w = null, bd = 1e9;
    for (let dx = -300; dx <= 300; dx += 6) for (let dz = -300; dz <= 300; dz += 6){ const x = g.pos.x + dx, z = g.pos.z + dz, W = S.wetAt(x, z); if (!W || W.depth < 2.5) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, top: W.top }; } }
    if (!w) return { lake: false };
    window.__L = w;
    return { lake: true, at: [w.x, w.z] };
  });
  if (r4.lake){
    await page.evaluate(() => { const g = window.__game, L = window.__L; g.pos.set(L.x, L.top + 3, L.z); g.fly = false; });
    await settle(4);
    Object.assign(r4, await page.evaluate(() => {
      const g = window.__game, L = window.__L, api = window.__api, out = {};
      const walk = (ov) => { g.armor.feet = { kind: 'boots', tier: 2, ov }; g.pos.set(L.x, L.top + 0.3, L.z); g.vel.set(0, 0, 0); g.keys.KeyW = true; window.__step(30); g.keys.KeyW = false; return { below: +(L.top - g.pos.y).toFixed(2), swim: !!g.swim, moved: +Math.hypot(g.pos.x - L.x, g.pos.z - L.z).toFixed(1) }; };
      out.walker = walk('wwalk'); out.plain = walk(null);
      g.armor.feet = { kind: 'boots', tier: 2, ov: 'wwalk' }; g.pos.set(L.x, L.top + 0.3, L.z); g.keys.KeyC = true; window.__step(20); g.keys.KeyC = false; out.crouchSinks = g.pos.y < L.top - 0.3;
      g.armor.feet = null;
      return out;
    }));
    await page.evaluate(() => { const g = window.__game, P = window.__P; g.pos.set(P.X, P.Y + 0.1, P.Z + 8); g.vel.set(0, 0, 0); });
    await settle(3);
  }
  console.log('4. waterwalker:', JSON.stringify(r4));

  // 5. the sports car and the jet
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    window.__clear(); window.__hold(null);
    const car = api.spawnEntity('sportscar', P.X, P.Y + 0.6, P.Z + 6); car.charge = 100; car.heading = 0; car.ov = 'turret';
    api.enterCar(car); g.ui = 'none';
    const f = window.__foe('stalker', P.X, P.Z - 12, 500);
    for (let i = 0; i < 20; i++){ window.__aim(f.x, f.y + 0.7, f.z); g.mouseL = true; api.driveCar(0.05); }
    g.mouseL = false;
    out.gunner = { hurt: 500 - Math.round(f.hp), carHp: car.hp };
    api.killEntity(f, false);
    // NITRO against plain, on the flat
    const run = (ov, shift) => { car.ov = ov; car.x = P.X; car.z = P.Z + 6; car.y = P.Y + 0.6; car.speed = 0; car.heading = Math.PI / 2; car.nitroT = 3; g.keys.KeyW = true; g.keys.ShiftLeft = shift; let v = 0; for (let i = 0; i < 40; i++){ api.driveCar(0.05); v = Math.max(v, car.speed); } g.keys.KeyW = false; g.keys.ShiftLeft = false; return +v.toFixed(1); };
    out.nitro = { plain: run(null, true), nitro: run('nitro', true) };
    api.exitCar();
    // the kit keeps it: fold, and the save row
    const row = JSON.parse(JSON.stringify(api.buildSaveData())).entities.find(r => r[0] === 'sportscar');
    out.saved = row ? row[13] : null;
    // BOMBARDIER: a jet overhead, R
    const jet = api.spawnEntity('jet', P.X, P.Y + 40, P.Z); jet.charge = 100; jet.ov = 'bomber'; jet.heading = 0; jet.speed = 30; jet.pitch = 0;
    g.slots[3] = { kind: 'rockets', count: 3 };
    api.enterCar(jet); g.ui = 'none'; g.keys.KeyR = true; api.driveCar(0.05); g.keys.KeyR = false;
    const bombs = (g.projectiles || []).filter(p => p.g === 20).length;
    const e0 = g.edits.length; for (let i = 0; i < 200 && (g.projectiles || []).some(p => p.g === 20); i++) api.updateProjectiles(0.05);
    out.bomber = { bombs, rocketsLeft: C.countItem(g.slots, 'rockets'), craters: g.edits.length - e0 };
    api.exitCar(); api.killEntity(jet, false); api.killEntity(car, false);
    return out;
  });
  console.log('5. vehicles   :', JSON.stringify(r5));

  // 6. the drones
  const r6 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    window.__clear(); g.pos.set(P.X, P.Y + 0.1, P.Z + 8); g.vel.set(0, 0, 0); g.pitch = 0; g.yaw = 0; g.camera.position.set(g.pos.x, g.pos.y + 1.62, g.pos.z);
    // SPOTTER
    const d1 = { kind: 'drone', charge: 100, ov: 'spotter' }; window.__hold(d1);
    const pack = [0, 1, 2].map(i => window.__foe(i ? 'grazer' : 'stalker', P.X + (i - 1) * 4, P.Z - 40, 500));
    api.enterPhoto(d1); for (let i = 0; i < 10; i++) api.updatePhoto(0.1); api.exitPhoto();
    api.ovSys.tick(0.05);
    out.spotter = { marked: pack.filter(e => e.ovSpot > performance.now() + 20000).length, drawn: api.ovSys.spotMarks ? api.ovSys.spotMarks.count : 0 };
    // STRIKER: the drone shoots what it looks at
    const d2 = { kind: 'drone', charge: 100, ov: 'striker' }; window.__hold(d2);
    const f = pack[0]; const hp0 = f.hp;
    api.enterPhoto(d2); const ph = g.photo; ph.pos.set(f.x, f.y + 6, f.z + 8); const dx = f.x - ph.pos.x, dy = f.y + 0.7 - ph.pos.y, dz = f.z - ph.pos.z; ph.yaw = Math.atan2(-dx, -dz); ph.pitch = Math.atan2(dy, Math.hypot(dx, dz));
    ph.home = { x: ph.pos.x, y: ph.pos.y, z: ph.pos.z };
    g.mouseL = true; for (let i = 0; i < 20; i++) api.updatePhoto(0.1); g.mouseL = false; api.exitPhoto();
    out.striker = { hurt: hp0 - f.hp };
    window.__clear();
    // FARLIGHT and HOMEWARD
    const t1 = { kind: 'tdrone', charge: 100, ov: 'farlight' }; window.__hold(t1); api.enterPhoto(t1); out.farlight = { range: g.photo.range, speed: g.photo.speed }; api.exitPhoto();
    g.pos.set(P.X, P.Y + 0.1, P.Z + 8); const home = { x: g.pos.x, z: g.pos.z };
    const t2 = { kind: 'tdrone', charge: 100, ov: 'homeward' }; window.__hold(t2); api.enterPhoto(t2); g.photo.pos.set(P.X + 30, P.Y + 3, P.Z - 30); api.exitPhoto();
    const away = +Math.hypot(g.pos.x - home.x, g.pos.z - home.z).toFixed(1);
    api.ovSys.goHome();
    out.homeward = { blinkedAway: away, back: +Math.hypot(g.pos.x - home.x, g.pos.z - home.z).toFixed(2) };
    return out;
  });
  console.log('6. the drones :', JSON.stringify(r6));
  // a picture: an albatross dive over the land at dusk
  await page.evaluate(() => { const g = window.__game, api = window.__api, P = window.__P; g.timeOfDay = 0.7; api.updateDayNight(0); g.armor.back = { kind: 'wings', ov: 'albatross' }; g.pos.set(P.X, P.Y + 60, P.Z); g.pitch = -0.35; g.yaw = 0.6; g.grounded = false; g.keys.Space = true; g.keys.KeyW = true; window.__step(20); });
  await settle(3);
  await page.screenshot({ path: __dirname + '/b123_albatross.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
