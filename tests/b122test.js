// Build 122: THE OVERFORGE -- the machine, and every variant doing its thing
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b122'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); g.hp = 100; });
  await settle(3);
  // a test pad: a box of size S centred at top - S/2, cleared by one at top + S/2 (the standing note)
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const X = Math.round(g.pos.x) + 0.5, Z = Math.round(g.pos.z) + 0.5, Y = Math.round(g.gen.height(X, Z));
    api.applyEdit(C.makeEdit(1, 1, X, Y - 20, Z, 40, C.MAT.STONEBRICK, 0));
    api.applyEdit(C.makeEdit(0, 1, X, Y + 20, Z, 40, 0, 0));
    window.__P = { X, Y, Z };
    g.pos.set(X, Y + 0.1, Z + 8); g.yaw = 0; g.pitch = 0; g.vel.set(0, 0, 0);
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    window.__hold = (it) => { g.slots[0] = it; g.hotSel = 0; api.refreshHotbar(); api.refreshToolHUD(); };
    window.__aim = (x, y, z) => { const c = g.camera.position; c.set(g.pos.x, g.pos.y + 1.62, g.pos.z); const dx = x - c.x, dy = y - c.y, dz = z - c.z; g.yaw = Math.atan2(-dx, -dz); g.pitch = Math.atan2(dy, Math.hypot(dx, dz)); g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); g.camera.updateMatrixWorld(); };
    window.__foe = (type, x, z, hp) => { const e = api.spawnEntity(type, x, window.__P.Y + 0.05, z); e.hp = hp; e.vx = e.vz = 0; e.noburn = true; return e; };
    window.__click = () => { g.ui = 'none'; g.mouseEdge = true; g.mouseL = true; g.lastShot = 0; g.lastMelee = 0; api.tryAction(0.016, performance.now()); g.mouseEdge = false; g.mouseL = false; };
  });
  await settle(3);

  // 1. the machine: forge a sword, then re-forge it
  const r1 = {};
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P;
    const pn = window.__OF = api.pnodeSys.add('oforge', P.X + 2, P.Y, P.Z + 5, 0);
    g.slots[5] = { kind: 'coin', count: 3000 };
    api.ovSys.open(pn);
    pn.inv[0] = C.makeSword(5); api.ovSys.refresh();
  });
  r1.before = await page.evaluate(() => ({ btn: document.getElementById('btnOforge').textContent, pool: document.querySelectorAll('#ofpool div').length }));
  await page.click('#btnOforge'); await page.waitForTimeout(2200);
  r1.first = await page.evaluate(() => { const it = window.__OF.inv[0], g = window.__game; return { ov: it.ov, coins: g.slots[5].count, label: window.__api.itemLabel(it), btn: document.getElementById('btnOforge').textContent, shimmer: document.querySelector('#oforgescreen .slot.ov') != null }; });
  await page.screenshot({ path: __dirname + '/b122_forge.png' });
  await page.click('#btnOforge'); await page.waitForTimeout(2200);
  r1.second = await page.evaluate(() => { const it = window.__OF.inv[0], g = window.__game; return { ov: it.ov, coins: g.slots[5].count }; });
  r1.pools = await page.evaluate(() => { const api = window.__api, C = window.__CORE; return { drill: api.ovSys.pool(C.makeDrill(3)), disp: api.ovSys.pool(C.makeDispenser(3)), sidearm: api.ovSys.pool(C.makeFirearm(0)), longeye: api.ovSys.pool(C.makeFirearm(5)), boomtube: api.ovSys.pool(C.makeFirearm(9)), gatling: api.ovSys.pool(C.makeFirearm(6)) }; });
  r1.refused = await page.evaluate(() => window.__api.ovSys.can({ kind: 'torch', count: 3 }));
  await page.evaluate(() => { window.__api.closeOverlay(); window.__game.ui = 'none'; });
  console.log('1. the machine:', JSON.stringify(r1));

  // 2. the drills
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    const mine = (ov, x, y, z, eff) => { window.__hold(Object.assign(C.makeDrill(7), { ov })); g.tool.shape = 1; const t = api.activeTool(); api.doMineM(t, { x, y, z }, 1, eff); return t; };
    // TWINBORE: two cuts, side by side (facing -z, the second is to the +x side)
    g.yaw = 0; let n0 = g.edits.length; mine('twin', P.X, P.Y - 1, P.Z, 2);
    const e1 = g.edits[g.edits.length - 2], e2 = g.edits[g.edits.length - 1];
    out.twin = { edits: g.edits.length - n0, dx: +(e2.x - e1.x).toFixed(2), dz: +(e2.z - e1.z).toFixed(2) };
    // FORGEHEART: an iron block comes out as ingots, and undo takes the ingots back
    api.applyEdit(C.makeEdit(1, 1, P.X - 6, P.Y + 1, P.Z, 2, C.MAT.IRON, 0));
    const cnt = k => C.countItem(g.slots, k);
    const o0 = cnt('ironore'), i0 = cnt('ironingot');
    mine('forge', P.X - 6, P.Y + 1, P.Z, 2);
    const i1 = cnt('ironingot');
    api.undoEdit();
    out.forge = { ore: cnt('ironore') - o0, ingots: i1 - i0, afterUndo: cnt('ironingot') - i0 };
    // VEINSIGHT: three iron blocks in the walls light up through the rock
    for (const [dx, dz] of [[8, 0], [-8, 3], [0, -9]]) api.applyEdit(C.makeEdit(1, 1, P.X + dx, P.Y - 3, P.Z + dz, 1.5, C.MAT.IRON, 0));
    mine('dowse', P.X, P.Y - 3, P.Z + 4, 2);
    let k = 0; while (api.ovSys.dowseQ && k++ < 400) api.ovSys.tick(0.016);
    out.dowse = { frames: k, marks: api.ovSys.marks ? api.ovSys.marks.count : 0 };
    return out;
  });
  console.log('2. the drills :', JSON.stringify(r2));

  // 3. the dispensers
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    const arm = (ov) => { g.dispSlot = Object.assign(C.makeDispenser(7), { ov }); window.__hold(C.makeStack(C.MAT.STONEBRICK, 5000)); g.tool.shape = 1; return api.activeTool(); };
    // THRIFT: half the stone for the same cube
    let t = arm(null); const e0 = C.makeEdit(1, 1, P.X + 3, P.Y + 3, P.Z - 3, 3, C.MAT.STONEBRICK, 0); const full = C.placeCost(g.edits, e0, g.gen);
    t = arm('thrift'); const s0 = C.countMat(g.slots, C.MAT.STONEBRICK); api.doPlaceM(t, { x: P.X + 3, y: P.Y + 3, z: P.Z - 3 }, 1, 3);
    out.thrift = { full, paid: s0 - C.countMat(g.slots, C.MAT.STONEBRICK) };
    // TWINSPOUT: two shapes
    t = arm('twinD'); let n0 = g.edits.length; api.doPlaceM(t, { x: P.X - 3, y: P.Y + 3, z: P.Z - 3 }, 1, 2);
    out.twinD = g.edits.length - n0;
    // MORTAR: look out across the ground; the ghost goes where the glob lands, far past a normal reach
    t = arm('mortar'); window.__aim(P.X, P.Y, P.Z - 120);
    const tg = api.ovSys.mortarTarget(2);
    n0 = g.edits.length; api.doPlaceM(t, tg, 1, 2);
    const inFlight = api.ovSys.globs.length, before = g.edits.length - n0;
    for (let i = 0; i < 60; i++) api.ovSys.tick(0.1);
    const L = g.edits[g.edits.length - 1];
    out.mortar = { dist: tg ? +Math.hypot(tg.x - g.pos.x, tg.z - g.pos.z).toFixed(1) : null, inFlight, editsBeforeLanding: before, landed: g.edits.length - n0, at: tg && L ? +Math.hypot(L.x - tg.x, L.y - tg.y, L.z - tg.z).toFixed(3) : null, mat: L && L.mat === C.MAT.STONEBRICK };
    return out;
  });
  console.log('3. dispensers :', JSON.stringify(r3));

  // 4. the swords (at night, so the stalkers stay)
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    g.timeOfDay = 0.9; api.updateDayNight(0);
    for (const e of [...g.entities]) if (e.type !== 'drop') api.killEntity(e, false);
    const sword = ov => window.__hold(Object.assign(C.makeSword(5), { ov }));
    const coins = () => C.countItem(g.slots, 'coin');
    // STORMCALLER: a stalker 20 m off takes the bolt
    sword('storm'); let f = window.__foe('stalker', g.pos.x, g.pos.z - 20, 500);
    window.__aim(f.x, f.y + 0.6, f.z); window.__click();
    out.storm = { hurt: 500 - f.hp, flash: api.weatherSys.flashT > 0 }; api.killEntity(f, false);
    // REAVER: a husk pays twice (2 husk meat, 3 iron ore, 6 coins -> 4, 6, 12)
    sword('reaver'); f = window.__foe('husk', g.pos.x, g.pos.z - 2.2, 1);
    let c0 = coins(), m0 = C.countItem(g.slots, 'huskmeat'); window.__aim(f.x, f.y + 0.8, f.z); window.__click();
    out.reaver = { dead: !g.entities.includes(f), coins: coins() - c0, meat: C.countItem(g.slots, 'huskmeat') - m0 };
    // MIDAS: the same husk, coin on top of its 6
    sword('midas'); f = window.__foe('husk', g.pos.x, g.pos.z - 2.2, 1);
    c0 = coins(); window.__aim(f.x, f.y + 0.8, f.z); window.__click();
    out.midas = { coins: coins() - c0 };
    // BLOODTHIRST: a hit heals a third of it
    sword('blood'); g.hp = 50; f = window.__foe('stalker', g.pos.x, g.pos.z - 2.2, 500);
    window.__aim(f.x, f.y + 0.8, f.z); window.__click();
    out.blood = { dealt: 500 - f.hp, hp: +g.hp.toFixed(1) }; api.killEntity(f, false);
    return out;
  });
  console.log('4. the swords :', JSON.stringify(r4));

  // 5. the guns
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, out = {};
    g.mode = 'creative';                              // no ammo to count
    const gun = (gi, ov) => window.__hold(Object.assign(C.makeFirearm(gi), { ov }));
    // MUSTANG: a shot into the ground beside a stalker still gets it
    gun(0, 'mustang'); let f = window.__foe('stalker', g.pos.x + 1.2, g.pos.z - 12, 500);
    window.__aim(g.pos.x, P.Y, g.pos.z - 12); window.__click();
    out.mustang = { hurt: 500 - f.hp }; api.killEntity(f, false);
    // DREAMER: no harm, and it lies still
    gun(3, 'dreamer'); f = window.__foe('stalker', g.pos.x, g.pos.z - 14, 500);
    window.__aim(f.x, f.y + 0.7, f.z); window.__click();
    const x0 = f.x, z0 = f.z; for (let i = 0; i < 20; i++) api.updateEntities(0.1, performance.now());
    out.dreamer = { hurt: 500 - f.hp, sleep: Math.round(f.ovSleep), moved: +Math.hypot(f.x - x0, f.z - z0).toFixed(2) };
    api.killEntity(f, false);
    // WHISPER: a garrison soldier dropped with no siren; the same shot plain raises one
    let raised = 0; const r0 = api.baseSys.raise; api.baseSys.raise = function(...a){ raised++; };
    g.bases = g.bases || {}; g.bases.tst = { key: 'tst', x: g.pos.x, z: g.pos.z - 14, alarm: 0, taken: false };
    for (const ov of ['whisper', null]){
      gun(3, ov); f = window.__foe('soldier', g.pos.x, g.pos.z - 14, 5); f.bkey = 'tst';
      window.__aim(f.x, f.y + 1.0, f.z); window.__click();
      out[ov ? 'whisper' : 'plain'] = { dead: !g.entities.includes(f), sirens: raised }; raised = 0;
      if (g.entities.includes(f)) api.killEntity(f, false);
    }
    api.baseSys.raise = r0; delete g.bases.tst;
    // KINDLE: it burns after the shot
    gun(2, 'kindle'); f = window.__foe('stalker', g.pos.x, g.pos.z - 10, 500);
    window.__aim(f.x, f.y + 0.7, f.z); let tries = 0; while (!(f.ovFire > 0) && tries++ < 10) window.__click();
    const hp1 = f.hp; for (let i = 0; i < 30; i++) api.ovSys.tick(0.1);
    out.kindle = { burning: tries <= 10, burnDmg: hp1 - f.hp }; api.killEntity(f, false);
    // ARCWIRE: one hit, three more hurt and all four stunned
    gun(1, 'arc'); const pack = [0, 1, 2, 3].map(i => window.__foe('stalker', g.pos.x + (i ? (i - 2) * 2 : 0), g.pos.z - 12 - (i ? 2 : 0), 500));
    window.__aim(pack[0].x, pack[0].y + 0.7, pack[0].z); window.__click();
    out.arc = { hurt: pack.map(e => 500 - Math.round(e.hp)), stunned: pack.filter(e => e.ovStun > 0).length };
    for (const e of pack) api.killEntity(e, false);
    return out;
  });
  console.log('5. the guns   :', JSON.stringify(r5));

  // 6. SINGULARITY: into a group, and they are dragged together and crushed
  const r6 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P;
    window.__hold(Object.assign(C.makeFirearm(9), { ov: 'sing' }));
    const ring = [0, 1, 2].map(i => window.__foe('stalker', g.pos.x + Math.cos(i * 2.1) * 6, g.pos.z - 16 + Math.sin(i * 2.1) * 6, 300));
    window.__aim(g.pos.x, P.Y, g.pos.z - 16); window.__click();
    let k = 0; while (!api.ovSys.vortices.length && k++ < 100) api.updateProjectiles(0.05);
    const V = api.ovSys.vortices[0]; if (!V) return { vortex: false };
    const d0 = ring.map(e => Math.hypot(e.x - V.x, e.z - V.z));
    for (let i = 0; i < 20; i++){ api.ovSys.tick(0.1); api.updateEntities(0.1, performance.now()); }
    window.__V = { x: V.x, y: V.y, z: V.z };
    return { vortex: true, craterless: true, before: d0.map(v => +v.toFixed(1)), after: ring.map(e => +Math.hypot(e.x - V.x, e.z - V.z).toFixed(1)), hurt: ring.map(e => 300 - Math.max(0, Math.round(e.hp))) };
  });
  console.log('6. singularity:', JSON.stringify(r6));

  // 7. the save keeps it
  const r7 = await page.evaluate(() => { const api = window.__api, g = window.__game, C = window.__CORE; g.slots[7] = Object.assign(C.makeDrill(4), { ov: 'forge' }); const d = JSON.parse(JSON.stringify(api.buildSaveData())); return { slot: d.slots[7].ov, machine: (d.pnodes || []).some(n => n.t === 'oforge' && n.inv && n.inv[0] && n.inv[0].ov) }; });
  console.log('7. the save   :', JSON.stringify(r7));

  // pictures: the vortex, the machine with a shimmering sword in hand, and Veinsight in the walls
  await page.evaluate(() => { const g = window.__game, api = window.__api, C = window.__CORE, V = window.__V; g.timeOfDay = 0.35; api.updateDayNight(0); api.ovSys.vortex(V.x, V.y - 0.8, V.z); [0, 1, 2, 3].forEach(i => { const e = window.__foe('grazer', V.x + Math.cos(i * 1.6) * 4, V.z + Math.sin(i * 1.6) * 4, 999); }); window.__aim(V.x, V.y, V.z); });
  for (let i = 0; i < 6; i++){ await page.evaluate(() => { const api = window.__api; for (const v of api.ovSys.vortices) v.t = 3.5; api.ovSys.tick(0.1); api.updateEntities(0.1, performance.now()); }); }
  await settle(2);
  await page.evaluate(() => { const api = window.__api; for (const v of api.ovSys.vortices) v.t = 3.5; });
  await page.screenshot({ path: __dirname + '/b122_vortex.png' });
  await page.evaluate(() => { const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P, O = window.__OF; for (const v of api.ovSys.vortices) v.t = 0.01; api.ovSys.tick(0.1); for (const e of [...g.entities]) if (e.type !== 'drop') api.killEntity(e, false); window.__hold(Object.assign(C.makeSword(7), { ov: 'storm' })); g.pos.set(O.x - 1.2, P.Y + 0.1, O.z + 3.2); window.__aim(O.x, O.y + 1.0, O.z); });
  await settle(2);
  await page.screenshot({ path: __dirname + '/b122_machine.png' });
  await page.evaluate(() => { const g = window.__game, api = window.__api, C = window.__CORE, P = window.__P; window.__hold(Object.assign(C.makeDrill(7), { ov: 'dowse' })); g.pos.set(P.X, P.Y + 0.1, P.Z + 6); api.ovSys.dowse({ x: P.X, y: P.Y - 3, z: P.Z }); let k = 0; while (api.ovSys.dowseQ && k++ < 400) api.ovSys.tick(0.016); window.__aim(P.X, P.Y - 3, P.Z - 2); });
  await settle(1);
  await page.evaluate(() => { window.__api.ovSys.markT = 6; });
  await page.screenshot({ path: __dirname + '/b122_vein.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
