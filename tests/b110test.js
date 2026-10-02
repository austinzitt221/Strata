const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b110'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  // 1. eight cubes from one shape, through the ghost and the click
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys;
    window.__p0 = { x: g.pos.x, z: g.pos.z };
    let x0 = null, z0 = null;
    for (let r = 20; r < 300 && x0 == null; r += 10) for (let a = 0; a < 6.28 && x0 == null; a += 0.4){
      const x = Math.round(g.pos.x + Math.cos(a) * r), z = Math.round(g.pos.z + Math.sin(a) * r), h = g.gen.height(x, z);
      let dry = h > g.gen.seaLevel + 4; for (let dx = -16; dx <= 16 && dry; dx += 4) for (let dz = -16; dz <= 16 && dry; dz += 4) if (api.waterTopAt(x + dx, z + dz, g.gen.height(x + dx, z + dz) + 1) != null) dry = false;
      if (dry){ x0 = x; z0 = z; }
    }
    window.__site = { x0, z0 };
    const gy = g.gen.height(x0, z0);
    for (let i = 0; i < 40; i++) g.slots[i] = null;
    g.slots[0] = { kind: 'mat', mat: C.MAT.WATER, count: 999 }; g.slots[1] = { kind: 'mat', mat: C.MAT.ROCK, count: 999 };
    g.dispSlot = { kind: 'disp', tier: 4 };
    g.tool.shape = 1; g.tool.size = 2.0; g.tool.rot = 0.4; g.tool.dist = 4;   // a rotation set on the tool: liquids ignore it
    const aimFrom = (px, py, pz, tx, ty, tz) => { g.pos.set(px, py - 1.6, pz); g.camera.position.set(px, py, pz); g.camera.lookAt(tx, ty, tz); };
    const heldBox = (x, y, z) => { let n = 0, bx = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (let gy2 = Math.floor(y) - 4; gy2 <= Math.floor(y) + 4; gy2++) for (let gz = Math.floor(z) - 4; gz <= Math.floor(z) + 4; gz++) for (let gx = Math.floor(x) - 4; gx <= Math.floor(x) + 4; gx++) if (W.lv(gx, gy2, gz) === 253){ n++; bx = [Math.min(bx[0], gx), Math.min(bx[1], gy2 - 0.5), Math.min(bx[2], gz), Math.max(bx[3], gx + 1), Math.max(bx[4], gy2 + 0.5), Math.max(bx[5], gz + 1)]; } return { n, bx }; };
    const out = [];
    const offs = [[0.13, 0.41], [0.77, 0.06], [0.52, 0.93], [0.31, 0.68]];
    offs.forEach(([fx, fz], i) => {
      const tx = x0 - 12 + i * 8 + fx, tz = z0 + fz, ty = gy + 4.37;
      g.hotSel = 0; aimFrom(tx, ty, tz - 4, tx, ty, tz); api.updateGhost();
      const gp = g.ghostPos, ge = g.ghostEff, liq = g.ghostLiq;
      g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
      const H = heldBox(gp.x, gp.y, gp.z);
      const gb = [gp.x - ge / 2, gp.y - ge / 2, gp.z - ge / 2, gp.x + ge / 2, gp.y + ge / 2, gp.z + ge / 2];
      out.push({ liq, eff: ge, cells: H.n, match: H.bx.every((v, k) => Math.abs(v - gb[k]) < 1e-6) });
    });
    // sizes 1 to 5: n cubed every time
    const sizes = [];
    for (let n = 1; n <= 5; n++){
      const sn = api.liqSnap({ x: x0 + 10.37, y: gy + 8.2, z: z0 + n * 7 + 0.61 }, n + 0.2);
      api.doPlace({ kind: 'disp', tier: 4, mat: C.MAT.WATER, count: 999 }, sn.p, 1, sn.eff);
      sizes.push(heldBox(sn.p.x, sn.p.y, sn.p.z).n === n * n * n);
    }
    // a sphere: the preview is its cells and the cells are what fill
    g.tool.shape = 0; const tx = x0 + 3.3, ty = gy + 6.8, tz = z0 - 8.4;
    aimFrom(tx, ty, tz - 4, tx, ty, tz); api.updateGhost();
    const vox = api.liqVox.mesh && api.liqVox.mesh.visible ? api.liqVox.mesh.count : 0;
    const want = api.liqCellsOf(api.liqEdit(1, 0, g.ghostPos, g.ghostEff)).length / 3;
    g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    const sph = heldBox(g.ghostPos.x, g.ghostPos.y, g.ghostPos.z).n;
    g.tool.shape = 1; g.tool.rot = 0;
    return { cubes: out, sizes, sphere: { vox, want, placed: sph } };
  });
  console.log('1. the cubes  :', JSON.stringify(r1));
  // 2. high up: to the ceiling, and refused past it without a charge
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const { x0, z0 } = window.__site;
    const tool = { kind: 'disp', tier: 4, mat: C.MAT.WATER, count: 999 };
    const a = api.liqSnap({ x: x0, y: 108.2, z: z0 }, 2); const w0 = C.countMat(g.slots, C.MAT.WATER);
    g.pos.set(x0, 104, z0 - 6); api.doPlace(tool, a.p, 1, a.eff); const hi = api.inWater(a.p.x, a.p.y, a.p.z), paid = w0 - C.countMat(g.slots, C.MAT.WATER);
    const b2 = api.liqSnap({ x: x0 + 4, y: 114, z: z0 }, 2); const w1 = C.countMat(g.slots, C.MAT.WATER), e1 = g.edits.length;
    api.doPlace(tool, b2.p, 1, b2.eff);
    return { top: api.LIQ_TOP, at108: hi, paid, over: { placed: g.edits.length - e1, charged: w1 - C.countMat(g.slots, C.MAT.WATER) } };
  });
  console.log('2. the ceiling:', JSON.stringify(r2));
  // 3. a stone lake in a cut off the metre grid: the surface meets the walls
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys;
    const { x0, z0 } = window.__site; const bx = x0 + 0.37, bz = z0 - 30.62, top = Math.round(g.gen.height(x0, z0 - 30) + 4);
    api.applyEdit(C.makeEdit(1, 1, bx, top - 8, bz, 16, 0, C.MAT.STONEBRICK));
    const cut = C.makeEdit(0, 1, bx, top - 1.3, bz, 9.4, 0, 0); cut.sy = 3; api.applyEdit(cut); g.terrain.process(300);
    const wall = { x0: bx - 4.7, x1: bx + 4.7, z0: bz - 4.7, z1: bz + 4.7 };
    g.slots[2] = { kind: 'springstone', count: 1 }; g.hotSel = 2; g.pos.set(bx, top + 2, bz - 7);
    const sn = api.liqSnap({ x: bx, y: top - 1.4, z: bz }, 1);
    api.doPlace(api.activeTool(), sn.p, 1, 1);
    const lid = g.edits[g.edits.length - 1].lid;
    for (let t = 0; t < 200 && W.floodPending(W.floodOf(lid)); t++) W.tick(0.13);
    for (let i = 0; i < 400 && W.dirtyMesh.size; i++) W.maintain();
    // the water surface's reach, from the meshes
    let mx = [1e9, 1e9, -1e9, -1e9], surfY = null;
    for (const [key, m] of W.meshes){
      const P = m.geometry.attributes.position.array;
      for (let i = 0; i < P.length; i += 3){ const x = P[i], y = P[i + 1], z = P[i + 2]; if (Math.abs(x - bx) > 8 || Math.abs(z - bz) > 8) continue; if (surfY == null || y > surfY) surfY = y; }
    }
    for (const [key, m] of W.meshes){
      const P = m.geometry.attributes.position.array;
      for (let i = 0; i < P.length; i += 3){ const x = P[i], y = P[i + 1], z = P[i + 2]; if (Math.abs(x - bx) > 8 || Math.abs(z - bz) > 8 || Math.abs(y - surfY) > 0.01) continue; mx = [Math.min(mx[0], x), Math.min(mx[1], z), Math.max(mx[2], x), Math.max(mx[3], z)]; }
    }
    const gap = [mx[0] - wall.x0, mx[1] - wall.z0, wall.x1 - mx[2], wall.z1 - mx[3]].map(v => +v.toFixed(2));
    return { surfY: surfY && +surfY.toFixed(2), wall: [wall.x0, wall.x1].map(v => +v.toFixed(2)), reach: mx.map(v => +v.toFixed(2)), gap };
  });
  console.log('3. the walls  :', JSON.stringify(r3));
  // 4. the drill from the shore: on the lattice, the cut exactly its ghost
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys, gen = g.gen;
    let w = null, bd = 1e9;
    for (let dx = -240; dx <= 240; dx += 4) for (let dz = -240; dz <= 240; dz += 4){
      const x = Math.round(window.__p0.x) + dx + 0.5, z = Math.round(window.__p0.z) + dz + 0.5, h = gen.height(x, z);
      const wt = api.waterTopAt(x, z, h + 2); if (wt == null || wt - h < 6) continue;
      const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, wt }; }
    }
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.slots[0] = { kind: 'drill', tier: 4 }; g.hotSel = 0;
    g.tool.shape = 1; g.tool.size = 3.0; g.tool.dist = 4;
    const tx = w.x + 0.21, ty = w.wt - 2.1, tz = w.z + 0.77;
    g.pos.set(tx, w.wt + 1.5, tz - 4); g.camera.position.set(tx, w.wt + 3.1, tz - 4); g.camera.lookAt(tx, ty, tz); api.updateGhost();
    const gp = g.ghostPos, ge = g.ghostEff, liq = g.ghostLiq;
    g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    let n = 0; for (let y = Math.floor(gp.y) - 4; y <= Math.floor(gp.y) + 4; y++) for (let z = Math.floor(gp.z) - 4; z <= Math.floor(gp.z) + 4; z++) for (let x = Math.floor(gp.x) - 4; x <= Math.floor(gp.x) + 4; x++) if (W.lv(x, y, z) === 254) n++;
    return { liq, eff: ge, lattice: [gp.x % 1, gp.y % 1, gp.z % 1].map(v => +Math.abs(v).toFixed(2)), dry: n, water: C.countMat(g.slots, C.MAT.WATER) };
  });
  console.log('4. the drill  :', JSON.stringify(r4));
  // 5. the LOD rings cast through the same cuts they draw through
  const r5 = await page.evaluate(() => {
    const api = window.__api, L = api.lodTerrain; let casting = 0, masked = 0;
    for (const ring of L.rings || []) for (const [, t] of ring.tiles) if (t.mesh && t.mesh.castShadow){ casting++; if (t.mesh.customDepthMaterial === ring.depthMat && ring.depthMat) masked++; }
    return { casting, masked };
  });
  console.log('5. the rings  :', JSON.stringify(r5));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const { x0, z0 } = window.__site; g.fly = true; g.camView = 0; g.hotSel = 7; g.pos.set(x0 - 2, g.gen.height(x0, z0) + 5, z0 - 12); g.yaw = Math.PI; g.pitch = -0.2; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(4);
  await page.screenshot({ path: __dirname + '/b110_cubes.png' });
  await page.evaluate(() => { const g = window.__game; const { x0, z0 } = window.__site; g.pos.set(x0 - 1.5, g.gen.height(x0, z0 - 30) + 7, z0 - 38); g.yaw = Math.PI - 0.15; g.pitch = -0.75; });
  await settle(3);
  await page.screenshot({ path: __dirname + '/b110_walls.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
