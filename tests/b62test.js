const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b62'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); });   // the tests drive the world themselves; skip the loading gate
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the gunship sits on the pad at peace
  await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.3; api.updateDayNight(0); g.opts.rd = 6;
    const cands = api.baseSys.candidatesNear(g.pos.x, g.pos.z, 6000);
    cands.sort((a, b2) => Math.hypot(a.x - g.pos.x, a.z - g.pos.z) - Math.hypot(b2.x - g.pos.x, b2.z - g.pos.z));
    const f = cands[0]; window.__F = f;
    g.pos.set(f.x + f.gx * 70, g.gen.height(f.x + f.gx * 70, f.z + f.gz * 70) + 3, f.z + f.gz * 70); g.forceStream = true;
  });
  await settle(8);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, f = window.__F;
    for (let i = 0; i < 6; i++) api.baseSys.tick(0.6);
    const rec = g.bases[f.key];
    let t = performance.now(); for (let i = 0; i < 30; i++){ t += 100; api.updateEntities(0.1, t); api.baseSys.tick(0.1); }
    const H = g.entities.filter(e => e.type === 'heli' && e.crewed && e.bkey === rec.key);
    const pad = api.baseSys.padOf(rec);
    return { helis: H.length, onPad: H.map(e => !!e.onPad), dy: H.map(e => +(e.y - pad.y).toFixed(2)), rotor: H.filter(e => e.mesh && e.mesh.userData.rotor && e.mesh.userData.gun).length, spool: H.map(e => +e.spool.toFixed(2)), hostile: H.every(e => api.crewSys.hostile(e)), alert: H.filter(e => e.alert).length, hp: H.map(e => e.hp) };
  });
  console.log('1. on the pad:', JSON.stringify(r1));
  // 2. the alarm: it lifts, circles you, and the door gun talks
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, f = window.__F, rec = g.bases[f.key];
    const H = g.entities.find(e => e.type === 'heli' && e.crewed && e.bkey === rec.key);
    const pad = api.baseSys.padOf(rec);
    g.mode = 'survival'; g.fly = false; g.hp = 100;
    const px = f.x + f.gx * 70, pz = f.z + f.gz * 70, py = g.gen.height(px, pz) + 0.3;
    g.pos.set(px, py, pz);
    api.baseSys.raise(rec, 'test');
    let t = performance.now(), maxDy = 0, minD = 1e9, maxD = 0, hits = 0, lastHp = 100, liftAt = null;
    for (let i = 0; i < 500; i++){
      t += 100; g.pos.set(px, py, pz);
      if (g.hp < lastHp) hits++;
      if (g.hp <= 0 || g.ui === 'dead'){ g.hp = 100; g.ui = 'none'; document.getElementById('deathscreen').classList.add('hidden'); }
      lastHp = g.hp;
      api.updateEntities(0.1, t); api.baseSys.tick(0.1);
      const dy = H.y - pad.y; maxDy = Math.max(maxDy, dy);
      if (liftAt == null && dy > 6) liftAt = i / 10;
      if (i > 250){ const d = Math.hypot(H.x - px, H.z - pz); minD = Math.min(minD, d); maxD = Math.max(maxD, d); }
    }
    return { alert: H.alert, spool: +H.spool.toFixed(2), liftAt, maxDy: +maxDy.toFixed(1), heightOverYou: +(H.y - py).toFixed(1), minD: +minD.toFixed(0), maxD: +maxD.toFixed(0), shots: H.shots || 0, hits, alarm: +rec.alarm.toFixed(0), radar: api.baseSys.radarOk(rec), moving: +(H.speed || 0).toFixed(1) };
  });
  console.log('2. the alarm :', JSON.stringify(r2));
  // 3. it comes home when the alarm ends
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, f = window.__F, rec = g.bases[f.key];
    const H = g.entities.find(e => e.type === 'heli' && e.crewed && e.bkey === rec.key);
    const pad = api.baseSys.padOf(rec);
    rec.alarm = 0; H.alert = false;
    g.pos.set(f.x + f.gx * 140, g.gen.height(f.x + f.gx * 140, f.z + f.gz * 140) + 0.3, f.z + f.gz * 140);
    let t = performance.now();
    for (let i = 0; i < 600; i++){ t += 100; api.updateEntities(0.1, t); }
    return { onPad: !!H.onPad, dy: +(H.y - pad.y).toFixed(2), dh: +Math.hypot(H.x - pad.x, H.z - pad.z).toFixed(1), spool: +H.spool.toFixed(2) };
  });
  console.log('3. home      :', JSON.stringify(r3));
  // 4. it dies: a gunship part, and no replacement
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, f = window.__F, rec = g.bases[f.key];
    const H = g.entities.find(e => e.type === 'heli' && e.crewed && e.bkey === rec.key);
    const p0 = C.countItem(g.slots, 'gunpart'), c0 = C.countItem(g.slots, 'coin');
    api.killEntity(H, true);
    const p1 = C.countItem(g.slots, 'gunpart'), c1 = C.countItem(g.slots, 'coin');
    g.pos.set(f.x + f.gx * 70, g.gen.height(f.x + f.gx * 70, f.z + f.gz * 70) + 0.3, f.z + f.gz * 70);
    for (let i = 0; i < 6; i++) api.baseSys.tick(0.6);
    const again = g.entities.filter(e => e.type === 'heli' && e.crewed && e.bkey === rec.key).length;
    return { part: p1 - p0, coins: c1 - c0, recHelis: rec.helis, again, kits: g.slots.filter(s => s && s.kind === 'heli').length };
  });
  console.log('4. shot down :', JSON.stringify(r4));
  // 5. the taking, the quartermaster, the fuel
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, f = window.__F, rec = g.bases[f.key];
    g.hp = 100; g.ui = 'none'; document.getElementById('deathscreen').classList.add('hidden');
    for (const e of [...g.entities]) if (e.type === 'soldier' && e.bkey === rec.key) api.killEntity(e, false);
    for (const e of [...g.entities]) if (e.type === 'tank' && e.crewed && e.bkey === rec.key){ e.noDrop = true; api.killEntity(e, false); }
    rec.commanderDead = true; rec.men = 0; rec.reinf = 0; rec.alarm = 0;
    g.pos.set(rec.x, (rec.gy || g.gen.height(rec.x, rec.z)) + 1, rec.z);
    for (let i = 0; i < 4; i++) api.baseSys.tick(0.6);
    const taken = rec.taken;
    let t = performance.now();
    for (let i = 0; i < 12; i++){ t += 600; api.baseSys.tick(0.6); api.updateEntities(0.1, t); }
    const Q = g.entities.find(e => e.type === 'soldier' && e.quarter && e.bkey === rec.key);
    const guards = g.entities.filter(e => e.type === 'soldier' && e.friendly && !e.quarter && e.bkey === rec.key).length;
    for (let i = 0; i < g.slots.length; i++) if (g.slots[i] && (g.slots[i].kind === 'coin' || g.slots[i].kind === 'jetfuel')) g.slots[i] = null;
    api.addStackItem('coin', 30);
    const no = api.baseSys.quarterTalk(Q);
    api.addStackItem('coin', 40);
    const yes = api.baseSys.quarterTalk(Q);
    return { taken, quarter: !!Q, role: Q && Q.role, friendly: Q && Q.friendly, atPost: Q ? +Math.hypot(Q.x - rec.cmdPost.x, Q.z - rec.cmdPost.z).toFixed(1) : null, guards, no, yes, fuel: C.countItem(g.slots, 'jetfuel'), coins: C.countItem(g.slots, 'coin'), label: api.itemLabel({ kind: 'jetfuel' }), quarterLabel: api.itemLabel({ kind: 'gunpart' }) };
  });
  console.log('5. the taking:', JSON.stringify(r5));
  // 6. the jet: empty it goes nowhere; a can is half a tank; the run, the climb
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, f = window.__F, rec = g.bases[f.key], L = api.baseSys.linkOf(rec);
    g.mode = 'creative'; g.fly = false; g.hp = 100; g.ui = 'none';
    const s0 = (rec.x - L.sx) * L.ux + (rec.z - L.sz) * L.uz;
    const s = Math.max(30, Math.min(L.len - 30, s0));
    g.pos.set(L.sx + L.ux * s, api.baseSys.roadY(L, s) + 1.5, L.sz + L.uz * s); g.forceStream = true;
    api.roadSys.tick(7); api.roadSys.tick(2);          // the road scan, now rather than on its six-second clock
  });
  await settle(6);
  const r6 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, f = window.__F, rec = g.bases[f.key], L = api.baseSys.linkOf(rec);
    const R = C.RECIPES.find(r => r.kind === 'jet'), RH = C.RECIPES.find(r => r.kind === 'heli');
    const s0 = (rec.x - L.sx) * L.ux + (rec.z - L.sz) * L.uz;
    const dir = s0 < L.len / 2 ? 1 : -1;
    const s = Math.max(30, Math.min(L.len - 30, s0));
    const J = api.spawnEntity('jet', L.sx + L.ux * s, api.baseSys.roadY(L, s) + 0.3, L.sz + L.uz * s);
    J.charge = 0; J.heading = Math.atan2(-L.ux * dir, -L.uz * dir);
    g.pos.set(J.x, J.y + 1, J.z); g.yaw = J.heading; g.pitch = 0;
    api.updateEntities(0.05, performance.now());
    api.enterCar(J);
    const driving = g.driving === J;
    g.keys['KeyW'] = true;
    for (let i = 0; i < 30; i++) api.driveCar(0.1);
    const deadSpd = +J.speed.toFixed(1);
    g.slots[3] = { kind: 'jetfuel', count: 2 };
    const filled = api.baseSys.refuel(J, g.slots[3]);
    const fuel = J.charge, cans = g.slots[3] ? g.slots[3].count : 0;
    for (let i = 0; i < 40; i++) api.driveCar(0.1);
    const runSpd = +J.speed.toFixed(1), onRoadStill = !!J.onGround;
    g.keys['Space'] = true;
    let airAt = null;
    for (let i = 0; i < 40; i++){ api.driveCar(0.1); if (airAt == null && !J.onGround && J.airT > 0.5) airAt = i / 10; }
    g.keys['Space'] = false;
    const alt = +(J.y - g.gen.height(J.x, J.z)).toFixed(1);
    window.__J = J;
    return { onRoad: api.roadSys.onRoad(J.x, J.y, J.z), recipe: R && R.costs.map(c => c.item + ':' + c.n), heliRecipe: RH && RH.costs.length, driving, deadSpd, filled, fuel, cans, runSpd, onRoadStill, airAt, alt, alive: g.driving === J, gauge: !!(J.mesh && J.mesh.userData.gauge), flame: !!(J.mesh && J.mesh.userData.flame && J.mesh.userData.flame.visible) };
  });
  console.log('6. the jet   :', JSON.stringify(r6));
  // 7. high up: the loop, the roll, the cannon, the missiles
  const r7 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, J = window.__J;
    if (g.driving !== J){ g.entities.push(J); api.enterCar(J); }
    J.y = g.gen.height(J.x, J.z) + 160; J.onGround = false; J.airT = 5; J.speed = 55; J.pitch = 0; J.roll = 0; J.vy = 0; J.charge = 50;
    g.keys['KeyW'] = true; g.keys['Space'] = true;
    let loopStarted = null, loopDone = null, topPitch = 0;
    for (let i = 0; i < 120; i++){ api.driveCar(0.1); topPitch = Math.max(topPitch, J.pitch); if (loopStarted == null && J.loop) loopStarted = i / 10; if ((J.loops || 0) >= 1){ loopDone = i / 10; break; } }
    g.keys['Space'] = false;
    for (let i = 0; i < 10; i++) api.driveCar(0.1);
    const loops = J.loops || 0, pitchAfter = +J.pitch.toFixed(2), stillLooping = !!J.loop;
    g.keys['ShiftLeft'] = true; g.keys['KeyA'] = true;
    let rollPeak = 0, rollDone = null;
    for (let i = 0; i < 30; i++){ api.driveCar(0.1); rollPeak = Math.max(rollPeak, Math.abs(J.roll)); if ((J.rolls || 0) >= 1){ rollDone = i / 10; break; } }
    g.keys['ShiftLeft'] = false; g.keys['KeyA'] = false;
    for (let i = 0; i < 5; i++) api.driveCar(0.1);
    const rolls = J.rolls || 0, rollAfter = +J.roll.toFixed(2);
    // the cannon: a grazer forty metres off the nose takes it
    const fx = -Math.sin(J.heading) * Math.cos(J.pitch), fz = -Math.cos(J.heading) * Math.cos(J.pitch), fy = Math.sin(J.pitch);
    const G = api.spawnEntity('grazer', J.x + fx * 40, J.y + 1.2 + fy * 40 - 0.35, J.z + fz * 40);
    const hp0 = G.hp;
    g.mouseL = true; for (let i = 0; i < 6; i++) api.driveCar(0.05); g.mouseL = false;
    const shots = J.shots || 0, hurt = hp0 - G.hp;
    // the missiles: rockets from the pack
    for (let i = 0; i < g.slots.length; i++) if (g.slots[i] && g.slots[i].kind === 'rockets') g.slots[i] = null;
    g.keys['KeyR'] = true; api.driveCar(0.1); g.keys['KeyR'] = false;
    const noRocket = J.missiles || 0;
    api.addStackItem('rockets', 3);
    J.misT = 0;
    const n0 = g.edits.length;
    g.keys['KeyR'] = true; api.driveCar(0.1); g.keys['KeyR'] = false;
    window.__N0 = n0;
    return { loopStarted, loopDone, topPitch: +topPitch.toFixed(2), loops, pitchAfter, stillLooping, rollPeak: +rollPeak.toFixed(2), rollDone, rolls, rollAfter, shots, hurt, noRocket, missiles: J.missiles || 0, rockets: C.countItem(g.slots, 'rockets'), fuel: +J.charge.toFixed(1), alive: g.driving === J, alt: +(J.y - g.gen.height(J.x, J.z)).toFixed(0) };
  });
  await page.waitForTimeout(1200);
  const r7b = await page.evaluate(() => { const g = window.__game, api = window.__api; g.keys['KeyW'] = false; const craters = g.edits.slice(window.__N0).filter(e => e.op === 0).length; api.exitCar(); return { craters, parked: !g.driving }; });
  console.log('7. aerobatics:', JSON.stringify(Object.assign(r7, r7b)));
  // 8. your own gunship: spool, lift, hold, fly, the door gun; the strafe both ways
  const r8 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, f = window.__F, rec = g.bases[f.key];
    const pad = api.baseSys.padOf(rec);
    const H = api.spawnEntity('heli', pad.x, pad.y, pad.z); H.charge = 100; H.heading = 0;
    g.pos.set(H.x, H.y + 1, H.z); g.yaw = 0; g.pitch = 0;
    api.updateEntities(0.05, performance.now());
    api.enterCar(H);
    const driving = g.driving === H;
    g.keys['Space'] = true;
    for (let i = 0; i < 60; i++) api.driveCar(0.1);
    g.keys['Space'] = false;
    const lifted = +(H.y - pad.y).toFixed(1), spool = +H.spool.toFixed(2);
    const y0 = H.y;
    for (let i = 0; i < 30; i++) api.driveCar(0.1);
    const held = +(H.y - y0).toFixed(2);
    g.keys['KeyW'] = true; for (let i = 0; i < 20; i++) api.driveCar(0.1); g.keys['KeyW'] = false;
    const spd = +H.speed.toFixed(1);
    g.keys['KeyA'] = true; const h0 = H.heading; for (let i = 0; i < 10; i++) api.driveCar(0.1); g.keys['KeyA'] = false;
    const turned = +(H.heading - h0).toFixed(2);
    // the door gun down the line of sight
    g.pitch = 0; api.driveCar(0.05);
    const dir = new (g.camera.position.constructor)(); g.camera.getWorldDirection(dir);
    const cp = g.camera.position;
    const G = api.spawnEntity('grazer', cp.x + dir.x * 30, cp.y + dir.y * 30 - 0.35, cp.z + dir.z * 30);
    const hp0 = G.hp;
    g.mouseL = true; for (let i = 0; i < 6; i++) api.driveCar(0.05); g.mouseL = false;
    const shots = H.shots || 0, hurt = hp0 - G.hp, rotor = !!(H.mesh && H.mesh.userData.rotor && H.mesh.userData.rotor.rotation.y > 1);
    api.exitCar();
    // the strafe, forty metres from the gunship: theirs finds you, yours does not
    g.mode = 'survival'; g.hp = 100;
    g.pos.set(pad.x - 40, g.gen.height(pad.x - 40, pad.z - 40) + 0.3, pad.z - 40);
    const from = { x: g.pos.x + 20, y: g.pos.y + 12, z: g.pos.z };
    const to = { x: g.pos.x - from.x, y: g.pos.y + 0.9 - from.y, z: g.pos.z - from.z };
    const theirs = api.baseSys.strafe(from, to, 7, false);
    const hpAfter = g.hp;
    const mine = api.baseSys.strafe(from, to, 7, true);
    const ground = api.baseSys.strafe({ x: g.pos.x, y: g.pos.y + 30, z: g.pos.z }, { x: 0, y: -1, z: 0 }, 7, true);
    g.mode = 'creative'; g.hp = 100;
    return { driving, lifted, spool, held, spd, turned, shots, hurt, rotor, theirs: theirs.hit, hpAfter, mine: mine.hit && mine.hit.type, groundHit: ground.hit && ground.hit.type, groundY: +(ground.at.y - g.pos.y).toFixed(1) };
  });
  console.log('8. gunship   :', JSON.stringify(r8));
  // 9. the save keeps the crewed gunship, the jet's fuel, the catalog and the icons
  const r9 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, f = window.__F, rec = g.bases[f.key];
    rec.taken = false; rec.helis = 1; rec.alarm = 0;
    for (const e of [...g.entities]) if (e.type === 'soldier' && e.bkey === rec.key) api.killEntity(e, false);
    const H = api.baseSys.spawnHeli(rec);
    api.saveNow();
    const back = JSON.parse(localStorage.getItem('strata:world:' + g.worldId) || '{}');
    const helis = (back.entities || []).filter(r => r[0] === 'heli');
    const jets = (back.entities || []).filter(r => r[0] === 'jet');
    const cat = api.catalogEntries().map(e => e.kind);
    return { savedHelis: helis.length, crewed: helis.filter(r => r[8] === f.key).length, jets: jets.length, jetFuel: jets.map(r => r[5]), recHelis: back.bases[f.key].helis, catalog: ['heli', 'jet', 'jetfuel'].map(k => cat.includes(k)), icons: ['heli', 'jet', 'jetfuel'].map(k => (api.itemIconURL({ kind: k, count: 1, charge: 50 }) || '').length > 100) };
  });
  console.log('9. saved     :', JSON.stringify(r9));
  // screenshot: the gunship over the base
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, f = window.__F, rec = g.bases[f.key];
    const H = g.entities.find(e => e.type === 'heli' && e.crewed);
    const pad = api.baseSys.padOf(rec);
    if (H){ H.y = pad.y + 14; H.spool = 1; H.alert = true; }
    g.fly = true; g.mode = 'creative';
    g.pos.set(pad.x + 22, pad.y + 6, pad.z + 22); g.yaw = Math.atan2(-(pad.x - g.pos.x), -(pad.z - g.pos.z)); g.pitch = -0.28; g.forceStream = true;
  });
  await settle(6);
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(700);
  await page.screenshot({ path: __dirname + '/b62_gunship.png' });
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
