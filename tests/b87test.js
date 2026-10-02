const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b87'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  // 0. on Earth: the spawner still knows nothing of the war; the defs, the drops and the item
  const r0 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const D = api.ENT_DEF;
    const defs = ['thrall', 'gnasher', 'lancer', 'hollow'].map(t => [t, D[t].hp, D[t].cap, !!D[t].ranged, !!D[t].dayOk, !!D[t].night]);
    const meshes = ['thrall', 'gnasher', 'lancer', 'hollow'].map(t => { const m = api.entMesh(t, { type: t }); return [t, m.children.length, !!m.userData.tip, !!m.userData.core, (m.userData.legs || []).length]; });
    const icon = (api.itemIconURL({ kind: 'nullcore', count: 1 }) || '').length > 100;
    const sova = api.stationOneSys.offers('relics').some(o => o.sell && o.sell.k === 'nullcore');
    g.timeOfDay = 0.75; api.updateDayNight(0);
    const n0 = g.entities.length; for (let i = 0; i < 40; i++) api.trySpawnEntities();
    const earthNight = g.entities.filter(e => D[e.type] && D[e.type].war).length;
    g.timeOfDay = 0.25; api.updateDayNight(0);
    return { defs, meshes, icon, sova, earthNight, spawnedOnEarth: g.entities.length - n0, story6: api.stationOneSys.STORY6.length };
  });
  console.log('0. the defs  :', JSON.stringify(r0));
  // to Strata
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'moon', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(3);
  // 1. the spawner by day and by night
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, D = api.ENT_DEF;
    api.exitCar(); g.fly = false; g.ui = 'none'; g.holdT = 10;
    const p = g.pos; p.y = g.gen.height(p.x, p.z) + 0.5;
    const cull = () => { for (const e of [...g.entities]) if (D[e.type] && D[e.type].war) api.killEntity(e, false); };
    const tally = () => { const t = {}; for (const e of g.entities) if (D[e.type] && D[e.type].war) t[e.type] = (t[e.type] || 0) + 1; return t; };
    g.timeOfDay = 0.25; api.updateDayNight(0);
    for (let i = 0; i < 120; i++) api.trySpawnEntities();
    const day = tally(); const dayF1 = +g.dayF.toFixed(2);
    const first = g.entities.find(e => D[e.type] && D[e.type].war);
    const ground = first ? +(first.y - g.gen.height(first.x, first.z)).toFixed(1) : null;
    cull();
    g.timeOfDay = 0.75; api.updateDayNight(0);
    for (let i = 0; i < 120; i++) api.trySpawnEntities();
    const night = tally(); const dayF2 = +g.dayF.toFixed(2);
    // a torch at the spot: nothing spawns within ten metres of it at night
    cull();
    g.torches.push([p.x, p.y, p.z]);
    let near = 0; for (let i = 0; i < 120; i++){ api.trySpawnEntities(); } for (const e of g.entities) if (D[e.type] && D[e.type].war && Math.hypot(e.x - p.x, e.z - p.z) < 10) near++;
    g.torches.pop(); cull();
    // dug in: six metres under the ground nothing comes
    p.y = g.gen.height(p.x, p.z) - 8; for (let i = 0; i < 60; i++) api.trySpawnEntities(); const dug = Object.keys(tally()).length; p.y = g.gen.height(p.x, p.z) + 0.5;
    cull();
    return { arch: g.gen.archAt(p.x, p.z), day, dayF1, ground, night, dayF2, near, dug, caps: { thrall: D.thrall.cap, gnasher: D.gnasher.cap, lancer: D.lancer.cap, hollow: D.hollow.cap } };
  });
  console.log('1. the spawns:', JSON.stringify(r1));
  // 2. a lancer holds off and fires; a thrall walks in and hits; a hollow hangs in the air
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, D = api.ENT_DEF;
    g.mode = 'survival'; g.hp = 400; g.fly = false;
    g.spawnT = -1e9;                                   // no reinforcements during the duels
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    g.timeOfDay = 0.75; api.updateDayNight(0);
    // flat ground for the duel: a slab under both of us
    // (air from a metre over the ground up sixty; a floor of ash under it, to a metre over the ground)
    api.applyEdit(window.__CORE.makeEdit(0, 1, +p.x.toFixed(2), +(gy + 31).toFixed(2), +p.z.toFixed(2), 60, 0, 0));
    api.applyEdit(window.__CORE.makeEdit(1, 1, +p.x.toFixed(2), +(gy - 29).toFixed(2), +p.z.toFixed(2), 60, 0, window.__CORE.MAT.ASH));
    g.terrain.process(200);
    p.y = gy + 1.2;
    const floor = { under: +window.__CORE.evalSDF(p.x, gy + 0.5, p.z, api.nearEdits([p.x - 1, gy - 1, p.z - 1, p.x + 1, gy + 2, p.z + 1]), g.gen).toFixed(2), over: +window.__CORE.evalSDF(p.x, gy + 2, p.z, api.nearEdits([p.x - 1, gy - 1, p.z - 1, p.x + 1, gy + 3, p.z + 1]), g.gen).toFixed(2) };
    const L = api.spawnEntity('lancer', p.x + 12, gy + 1.4, p.z);
    let bolts = 0, hits = 0; const ob = api.warSys.bolt; api.warSys.bolt = (e, P, RG) => { bolts++; const w = ob.call(api.warSys, e, P, RG); if (w) hits++; return w; };
    const hp0 = 400; let now = performance.now();
    const dists = [];
    for (let i = 0; i < 240; i++){ now += 50; api.updateEntities(0.05, now); if (i % 40 === 0) dists.push(+Math.hypot(L.x - p.x, L.z - p.z).toFixed(1)); }
    const lancer = { bolts, hits, hpLost: hp0 - g.hp, face: L.face != null, dists, alive: g.entities.includes(L) };
    api.warSys.bolt = ob;
    // straight bolts, no scatter: they land
    g.hp = 400; const RG0 = Object.assign({}, D.lancer.ranged, { spread: 0 }); let sure = 0; for (let i = 0; i < 5; i++) if (api.warSys.bolt(L, { x: p.x, y: p.y, z: p.z, d: 12, ent: null }, RG0) === 'you') sure++;
    const sureLost = 400 - g.hp;
    // the aim lock: no scatter, a player who stands still takes every bolt; one who
    // sidesteps two metres whenever the core brightens takes none
    const sp0 = D.lancer.ranged.spread; D.lancer.ranged.spread = 0;
    const duel = (dodge) => {
      const L1 = api.spawnEntity('lancer', p.x + 12, gy + 1.4, p.z); L1.orbit = 1;
      let nb = 0, nh = 0; const o = api.warSys.bolt; api.warSys.bolt = (e, P, RG) => { nb++; const w = o.call(api.warSys, e, P, RG); if (w) nh++; return w; };
      g.hp = 400; const z0 = p.z; let stepped = 0;
      for (let i = 0; i < 200; i++){ now += 50; if (dodge && L1.charge && p.z === z0){ p.z = z0 + 2.2; stepped++; } if (!L1.charge) p.z = z0; api.updateEntities(0.05, now); }
      api.warSys.bolt = o; p.z = z0; api.killEntity(L1, false);
      return { bolts: nb, hits: nh, stepped };
    };
    const still = duel(false), dodged = duel(true);
    D.lancer.ranged.spread = sp0;
    api.killEntity(L, false);
    // the thrall
    g.hp = 400;
    const T = api.spawnEntity('thrall', p.x + 8, gy + 1.4, p.z);
    for (let i = 0; i < 160; i++){ now += 50; api.updateEntities(0.05, now); }
    const thrall = { d: +Math.hypot(T.x - p.x, T.z - p.z).toFixed(1), dy: +(T.y - p.y).toFixed(1), hpLost: 400 - g.hp, alive: g.entities.includes(T) };
    api.killEntity(T, false);
    // the hollow: it hangs three metres up and fires down
    g.hp = 400;
    const H = api.spawnEntity('hollow', p.x + 9, gy + 4, p.z);
    let hb = 0; const ob2 = api.warSys.bolt; api.warSys.bolt = (e, P, RG) => { hb++; return ob2.call(api.warSys, e, P, RG); };
    const hs = [];
    for (let i = 0; i < 160; i++){ now += 50; api.updateEntities(0.05, now); if (i % 40 === 39) hs.push(+(H.y - g.gen.height(H.x, H.z)).toFixed(1)); }
    api.warSys.bolt = ob2;
    const hollow = { bolts: hb, hpLost: 400 - g.hp, heights: hs, d: +Math.hypot(H.x - p.x, H.z - p.z).toFixed(1), face: H.face != null };
    api.killEntity(H, false);
    g.hp = 100;
    return { floor, lancer, sure, sureLost, still, dodged, thrall, hollow };
  });
  console.log('2. the fights:', JSON.stringify(r2));
  // 3. dawn: the night's things walk off and go; the day's stay; the drops
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, D = api.ENT_DEF, C = window.__CORE;
    const p = g.pos, gy = g.gen.height(p.x, p.z);
    g.hp = 400;                                        // the dawn walk takes thirteen seconds under fire
    const L = api.spawnEntity('lancer', p.x + 10, gy + 1.4, p.z), H = api.spawnEntity('hollow', p.x - 10, gy + 4, p.z);
    const T = api.spawnEntity('thrall', p.x + 6, gy + 1.4, p.z + 6), G = api.spawnEntity('gnasher', p.x - 6, gy + 1.4, p.z - 6);
    g.timeOfDay = 0.25; api.updateDayNight(0);
    let now = performance.now();
    for (let i = 0; i < 260; i++){ now += 50; api.updateEntities(0.05, now); }
    const after = { lancer: g.entities.includes(L), hollow: g.entities.includes(H), thrall: g.entities.includes(T), gnasher: g.entities.includes(G), thrallHp: T.hp, gnasherHp: G.hp, gnasherD: +Math.hypot(G.x - p.x, G.z - p.z).toFixed(1) };
    // the drops, in survival, from an empty bag
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    const L2 = api.spawnEntity('lancer', p.x + 10, gy + 1.4, p.z);
    api.killEntity(L2, true);
    const count = k => C.countItem(g.slots, k);
    const lancerDrop = { nullcore: count('nullcore'), voidore: count('voidore'), coin: count('coin'), astrium: count('astrium') };
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    let vf = 0, vo = 0; for (let k = 0; k < 20; k++){ const G2 = api.spawnEntity('gnasher', p.x + 5, gy + 1.4, p.z); api.killEntity(G2, true); } vf = count('voidfruit'); vo = count('voidore');
    const gnasherDrops = { voidfruitOf20: vf, voidore: vo };
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    api.addStackItem('nullcore', 2); api.addStackItem('nullcore', 3);
    const stacks = g.slots.filter(s => s && s.kind === 'nullcore').map(s => s.count);
    const label = api.itemLabel ? api.itemLabel({ kind: 'nullcore', count: 5 }) : null;
    for (const e of [...g.entities]) if (D[e.type] && D[e.type].war) api.killEntity(e, false);
    g.mode = 'creative'; g.hp = 100;
    return { after, hpLeft: g.hp, ui: g.ui, lancerDrop, gnasherDrops, stacks, label };
  });
  console.log('3. dawn+drops:', JSON.stringify(r3));
  // the night line-up: a lancer, a hollow, a thrall and a gnasher in front of the camera
  await page.evaluate(() => {
    const g = window.__game, api = window.__api; const p = g.pos, gy = g.gen.height(p.x, p.z);
    g.timeOfDay = 0.78; api.updateDayNight(0); g.camView = 0; g.fly = true;
    for (const k of ['lancer', 'hollow', 'thrall', 'gnasher']) api.ENT_DEF[k].speed = 0;   // hold still for the picture
    p.set(p.x, gy + 2.6, p.z); g.yaw = 0; g.pitch = -0.06;
    const zf = p.z - 6.5;
    const L = api.spawnEntity('lancer', p.x - 3.2, gy + 1.4, zf), H = api.spawnEntity('hollow', p.x - 1, gy + 4.2, zf - 1.5), T = api.spawnEntity('thrall', p.x + 1.2, gy + 1.4, zf), G = api.spawnEntity('gnasher', p.x + 3.2, gy + 1.4, zf + 1.5);
    for (const e of [L, H, T, G]){ e.face = Math.atan2(-(p.x - e.x), -(p.z - e.z)); e.noburn = true; }
    L.charge = 1; H.charge = 1;
    let now = performance.now(); for (let i = 0; i < 4; i++){ now += 50; api.updateEntities(0.05, now); }
    for (const e of [L, H, T, G]){ e.vx = e.vz = 0; e.face = Math.atan2(-(p.x - e.x), -(p.z - e.z)); e.aimT = 0; e.charge = 1; }
    g.torches.push([p.x, gy + 1.6, p.z - 3]);
    api.warSys.bolt(L, { x: p.x, y: p.y - 1, z: p.z, d: 8, ent: null }, Object.assign({}, api.ENT_DEF.lancer.ranged, { spread: 0, dmg: 0 }));
  });
  await page.waitForTimeout(400); await page.screenshot({ path: __dirname + '/b87_night.png' });
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.timeOfDay = 0.25; api.updateDayNight(0); for (const e of g.entities) if (api.ENT_DEF[e.type] && api.ENT_DEF[e.type].war){ e.dawnT = 0; } });
  await page.waitForTimeout(400); await page.screenshot({ path: __dirname + '/b87_day.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
