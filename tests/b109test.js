const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b109'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  // 1. the drill in the sea, from dry land
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys, gen = g.gen;
    window.__p0 = { x: g.pos.x, z: g.pos.z };
    let w = null, bd = 1e9;
    for (let dx = -240; dx <= 240; dx += 4) for (let dz = -240; dz <= 240; dz += 4){
      const x = Math.round(g.pos.x) + dx + 0.5, z = Math.round(g.pos.z) + dz + 0.5, h = gen.height(x, z);
      const wt = api.waterTopAt(x, z, h + 2); if (wt == null || wt - h < 5) continue;
      const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, wt, h }; }
    }
    if (!w) return { water: false };
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0;
    // stand dry, just over the surface
    g.pos.set(w.x, w.wt + 2.5, w.z - 4); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
    const drill = C.makeDrill ? C.makeDrill(4) : { kind: 'drill', tier: 4 }; g.slots[0] = drill;
    const tool = api.activeTool();
    const cy = Math.floor(w.wt) - 1.5;      // a 3 m cube, its top a metre under the surface
    const p = { x: w.x, y: cy, z: w.z };
    const n0 = g.edits.length;
    api.doMine(tool, p, 1, 3);
    const e = g.edits[g.edits.length - 1];
    const gotWater = C.countMat(g.slots, C.MAT.WATER);
    for (let i = 0; i < 40; i++) W.step();
    const centreWet = api.inWater(p.x, p.y, p.z), aboveWet = api.inWater(p.x, cy + 2.2, p.z), besideWet = api.inWater(p.x + 3, p.y, p.z);
    const cell = W.lv(Math.floor(p.x), Math.round(p.y), Math.floor(p.z));
    const sdf = +C.evalSDF(p.x, p.y, p.z, api.nearEdits([p.x - 3, p.y - 3, p.z - 3, p.x + 3, p.y + 3, p.z + 3]), gen).toFixed(2);
    const ser = C.deserializeEdits(C.serializeEdits([e]))[0];
    // undo: the water comes back, the pack gives it up
    api.undoEdit(); for (let i = 0; i < 40; i++) W.step();
    const back = { wet: api.inWater(p.x, p.y, p.z), pack: C.countMat(g.slots, C.MAT.WATER), edits: g.edits.length - n0 };
    return { water: true, depth: +(w.wt - w.h).toFixed(1), edits: g.edits.length, liq: e && e.liq, gotWater, cell, centreWet, aboveWet, besideWet, sdf, ser: ser && [ser.liq, ser.op], back };
  });
  console.log('1. the cut    :', JSON.stringify(r1));
  // 2. a yard high and dry: held water, then a stone in a carved basin
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys, gen = g.gen;
    const p = g.pos; const gy = gen.height(p.x, p.z);
    const yx = Math.round(p.x) + 40, yz = Math.round(p.z) + 40, top = Math.round(gy + 30);
    api.applyEdit(C.makeEdit(1, 1, yx, top - 15, yz, 30, 0, C.MAT.ROCK)); g.terrain.process(300);   // a stone table, top at top
    const disp = { kind: 'disp', tier: 4, mat: C.MAT.WATER, count: 999 };
    g.slots[1] = { kind: 'mat', mat: C.MAT.WATER, count: 200 };
    // held: a 2 m cube of water standing in the air on the table; it never flows
    const hp = { x: yx - 12, y: top + 1, z: yz - 12 };
    api.doPlace(disp, hp, 1, 2);
    const cost = 200 - C.countMat(g.slots, C.MAT.WATER);
    for (let i = 0; i < 60; i++) W.step();
    const held = { in: api.inWater(hp.x, hp.y, hp.z), beside: api.inWater(hp.x + 2, top + 0.3, hp.z), below: W.lv(Math.floor(hp.x + 2), top, Math.floor(hp.z)) };
    // a basin 12 x 12, 4 deep, cut in the table
    const bx = yx - 4, bz = yz + 4;
    const cut = C.makeEdit(0, 1, bx, top - 2, bz, 12, 0, 0); cut.sy = 4; api.applyEdit(cut); g.terrain.process(300);
    // the spring stone at one corner, its top level a metre under the rim
    for (let i = 0; i < 40; i++) if (g.slots[i] && g.slots[i].kind === 'springstone') g.slots[i] = null;
    g.slots[2] = { kind: 'springstone', count: 3 }; g.hotSel = 2;
    const stone = api.activeTool();
    const L = top - 1;           // the cell row whose centre is a metre under the rim
    const sp = { x: bx - 5, y: L, z: bz - 5 };
    api.doPlace(stone, sp, 1, 1);
    const se = g.edits[g.edits.length - 1];
    const F = W.floodOf(se.lid);
    let ticks = 0; const tt0 = performance.now(); while (W.floodPending(W.floodOf(se.lid) || { b: [], park: [], lo: 1e9 }) && ticks < 400){ W.tick(0.13); ticks++; } const fillMs = +((performance.now() - tt0) / Math.max(1, ticks)).toFixed(1), fillTicks = ticks;
    for (let i = 0; i < 30; i++) W.step();
    // count what the basin holds
    const count = (x0, x1, z0, z1, y0, y1) => { let n = 0, t = 0; for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++){ t++; if (W.lv(x, y, z) === 8 && W.linOf(x, y, z) === se.lid) n++; } return [n, t]; };
    const basin = count(bx - 5, bx + 5, bz - 5, bz + 5, top - 3, L);
    const overL = count(bx - 5, bx + 5, bz - 5, bz + 5, L + 1, L + 1);
    const surf = +api.waterTopAt(bx + 0.5, bz + 0.5, L).toFixed(2);
    const stones = g.slots[2] ? g.slots[2].count : 0;
    // a channel dug off the east side: the lake goes on into it
    const ch = C.makeEdit(0, 1, bx + 10, top - 2.5, bz, 10, 0, 0); ch.sy = 3; ch.sz = 2; api.applyEdit(ch); g.terrain.process(200);
    ticks = 0; while (W.floodPending(W.floodOf(se.lid)) && ticks < 400){ W.tick(0.13); ticks++; }
    const chan = count(bx + 7, bx + 13, bz, bz, top - 3, L);
    // the far edge waits for you
    const R0 = W.FLOOD_R; W.FLOOD_R = 3;
    const ch2 = C.makeEdit(0, 1, bx + 14, top - 2.5, bz, 8, 0, 0); ch2.sy = 3; ch2.sz = 2; api.applyEdit(ch2); g.terrain.process(200);
    g.pos.set(bx, top + 2, bz); ticks = 0; while (ticks < 60){ W.tick(0.13); ticks++; }
    const parked = W.floodOf(se.lid).park.length;
    W.FLOOD_R = R0; W.parkT = 5; ticks = 0; while (W.floodPending(W.floodOf(se.lid)) && ticks < 400){ W.tick(0.13); ticks++; }
    const parkedAfter = W.floodOf(se.lid).park.length, stillPending = W.floodPending(W.floodOf(se.lid));
    // save: the edit, the lineage, the fill
    const save = api.buildSaveData();
    const row = save.edits.find(r => r[16] === 2);
    const linRows = save.water.filter(r => r[2]).length;
    const fl = save.floods.length;
    // the terrain never saw the water
    const sdfHeld = +C.evalSDF(hp.x, hp.y, hp.z, api.nearEdits([hp.x - 3, hp.y - 3, hp.z - 3, hp.x + 3, hp.y + 3, hp.z + 3]), gen).toFixed(2);
    // the ichor stone keeps nowhere but Strata
    const e0 = g.edits.length; api.doPlace({ kind: 'disp', tier: 2, mat: C.MAT.ICHOR, count: 1, item: { kind: 'ichorstone', count: 1 }, spring: 'ichorstone' }, { x: bx, y: L, z: bz + 20 }, 1, 1); const ichorRefused = g.edits.length === e0;
    // take the stone back: everything it made drains (the two channels come off first, then the stone)
    api.undoEdit(); api.undoEdit(); api.undoEdit();
    for (let i = 0; i < 80; i++) W.step();
    const drained = count(bx - 5, bx + 5, bz - 5, bz + 5, top - 3, L)[0];
    let wetLeft = 0; for (let y = top - 3; y <= L; y++) for (let z = bz - 5; z <= bz + 5; z++) for (let x = bx - 5; x <= bx + 5; x++) if (W.isWet(W.lv(x, y, z))) wetLeft++;
    const stonesBack = (g.slots.find(q => q && q.kind === 'springstone') || {}).count;
    return { stonesBack, fillMs, fillTicks, cost, held, L, basin, overL, surf, stones, chan, parked, parkedAfter, stillPending, row: row && [row[0], row[16], !!row[17]], linRows, fl, sdfHeld, ichorRefused, drained, wetLeft, heldStill: api.inWater(hp.x, hp.y, hp.z) };
  });
  console.log('2. the basin  :', JSON.stringify(r2));
  // 3. the lineage and the fill survive a save round trip
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys;
    const p = g.pos; const top = Math.round(g.gen.height(p.x, p.z) + 30);
    const bx = Math.round(p.x) - 30, bz = Math.round(p.z) - 30;
    api.applyEdit(C.makeEdit(1, 1, bx, top - 15, bz, 30, 0, C.MAT.ROCK)); const cut = C.makeEdit(0, 1, bx, top - 2, bz, 10, 0, 0); cut.sy = 4; api.applyEdit(cut); g.terrain.process(300);
    g.slots[2] = { kind: 'springstone', count: 1 }; g.hotSel = 2;
    api.doPlace(api.activeTool(), { x: bx, y: top - 1, z: bz }, 1, 1);
    const lid = g.edits[g.edits.length - 1].lid;
    W.FLOOD_STEP = 40; for (let i = 0; i < 3; i++) W.tick(0.13);                 // part-way
    const n1 = W.floodOf(lid).n;
    const ser = W.serialize(), fs = W.saveFloods();
    W.load(ser); W.loadFloods(fs);
    const kept = W.floodOf(lid) && W.floodPending(W.floodOf(lid));
    W.FLOOD_STEP = 1200; let t = 0; while (W.floodPending(W.floodOf(lid)) && t < 400){ W.tick(0.13); t++; }
    let n = 0; for (let y = top - 3; y <= top - 1; y++) for (let z = bz - 4; z <= bz + 4; z++) for (let x = bx - 4; x <= bx + 4; x++) if (W.lv(x, y, z) === 8 && W.linOf(x, y, z) === lid) n++;
    return { n1, kept, filled: n };
  });
  console.log('3. round trip :', JSON.stringify(r3));
  // 4. the real click: the stone's ghost and a left click
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.slots[2] = { kind: 'springstone', count: 2 }; g.hotSel = 2; g.tool.shape = 1;
    const x = window.__p0.x + 6, z = window.__p0.z + 3; const y = g.gen.height(x, z);
    g.pos.set(x, y + 0.2, z - 3); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(x, y + 0.5, z); g.tool.dist = 3;
    api.updateGhost();
    const e0 = g.edits.length; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    const e = g.edits[g.edits.length - 1];
    return { ghost: !!g.ghostPos, placed: g.edits.length - e0, liq: e && e.liq, left: g.slots[2] ? g.slots[2].count : 0 };
  });
  console.log('4. the click  :', JSON.stringify(r4));
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys;
    let x0 = null, z0 = null;
    for (let r = 30; r < 300 && x0 == null; r += 10) for (let a = 0; a < 6.28 && x0 == null; a += 0.4){
      const x = Math.round(window.__p0.x + Math.cos(a) * r), z = Math.round(window.__p0.z + Math.sin(a) * r), h = g.gen.height(x, z);
      let dry = h > g.gen.seaLevel + 4; for (let dx = -12; dx <= 12 && dry; dx += 4) for (let dz = -12; dz <= 12 && dry; dz += 4) if (api.waterTopAt(x + dx, z + dz, g.gen.height(x + dx, z + dz) + 1) != null) dry = false;
      if (dry){ x0 = x; z0 = z; }
    }
    const top = Math.round(g.gen.height(x0, z0) + 6);
    api.applyEdit(C.makeEdit(1, 1, x0, top - 10, z0, 20, 0, C.MAT.STONEBRICK));
    const cut = C.makeEdit(0, 0, x0, top, z0, 13, 0, 0); api.applyEdit(cut);                  // a round bowl
    g.terrain.process(400);
    g.slots[2] = { kind: 'springstone', count: 1 }; g.hotSel = 2;
    api.doPlace(api.activeTool(), { x: x0, y: top - 1, z: z0 }, 1, 1);
    const lid = g.edits[g.edits.length - 1].lid;
    { const F = W.floodOf(lid); const q = (F.b.map((a, i) => a && a.length ? [i - 256, a.length] : null).filter(Boolean)); window.__dbg = { L: F.L, top, lo: F.lo, q, park: F.park.length, R: W.FLOOD_R, step: W.FLOOD_STEP, ms: W.FLOOD_MS, mat: W.FLOOD_MAT, pos: [Math.round(g.pos.x - x0), Math.round(g.pos.z - z0)], running: g.running };
      W.floodTick(0.13); window.__dbg.after = { n: F.n, lo: F.lo, park: F.park.length, q: F.b.map((a, i) => a && a.length ? [i - 256, a.length] : null).filter(Boolean) }; }
    for (let t = 0; t < 200 && W.floodPending(W.floodOf(lid)); t++) W.tick(0.13);
    g.slots[1] = { kind: 'mat', mat: C.MAT.WATER, count: 50 };
    api.doPlace({ kind: 'disp', tier: 4, mat: C.MAT.WATER, count: 50 }, { x: x0 + 8, y: top + 1.5, z: z0 - 3 }, 1, 2);
    for (let i = 0; i < 600 && W.dirtyMesh.size; i++) W.maintain();
    const lay = []; for (let y = top - 7; y <= top; y++){ let air = 0, src = 0, other = {}; for (let z = z0 - 7; z <= z0 + 7; z++) for (let x = x0 - 7; x <= x0 + 7; x++){ const v = W.lv(x, y, z); if (v === 8 && W.linOf(x, y, z) === lid) src++; else if (v !== 255){ other[v] = (other[v] || 0) + 1; } } lay.push([y - top, src, JSON.stringify(other)]); }
    window.__lay = { lay, pending: W.floodPending(W.floodOf(lid)), n: W.floodOf(lid).n, dirty: W.dirtyMesh.size, meshes: W.meshes.size };
    g.fly = true; g.camView = 0; g.hotSel = 7; g.pos.set(x0 - 2, top + 3, z0 - 10); g.yaw = Math.PI - 0.35; g.pitch = -0.45; g.timeOfDay = 0.3; api.updateDayNight(0);
  });
  await settle(5);
  await page.screenshot({ path: __dirname + '/b109_lake.png' });
  console.log('5. the bowl   :', JSON.stringify(await page.evaluate(() => window.__lay)));
  console.log('6. debug      :', JSON.stringify(await page.evaluate(() => window.__dbg)));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
