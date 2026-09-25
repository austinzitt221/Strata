const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b113'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(120); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  // 1. the shapes: the ghost lies on the surface, the volumes are right
  const r1 = await page.evaluate(() => {
    const api = window.__api, C = window.__CORE;
    const out = {};
    for (let k = 3; k < 12; k++){
      const s = 6, e = C.makeEdit(1, k, 0, 0, 0, s, 1, 0);
      const G = api.shapeGhost.build(k, s), P = G.fill.attributes.position.array;
      let worst = 0; for (let i = 0; i < P.length; i += 3){ const d = Math.abs(C.shapeSDF(P[i], P[i + 1], P[i + 2], e)); if (d > worst) worst = d; }
      let vol = 0; C.sampleShape(e, (x, y, z, v) => { vol += v; });
      out[C.SHAPE_NAME[k]] = { ghostOff: +worst.toFixed(3), vol: +vol.toFixed(1) };
    }
    return { box: 216, out, names: C.SHAPE_NAME.length, unlock: C.SHAPE_UNLOCK };
  });
  console.log('1. the shapes :', JSON.stringify(r1));
  // 2. the tiers: shapes, abilities, right click, middle click, F, K
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0;
    const out = {};
    for (const t of [0, 1, 4, 7, 11]){
      g.slots[0] = C.makeDrill(t);
      out[t] = { shapes: api.toolShapes(api.activeTool()).map(k => C.SHAPE_NAME[k]).join(','), can: ['yaw', 'snap', 'tilt', 'mirror', 'echo'].filter(a => api.toolCan(a)).join(','), modes: api.scrollModesFor(api.activeTool()).join('') };
    }
    // stone: right click keeps the cube, F refuses the grid
    g.slots[0] = C.makeDrill(0); g.tool.shape = 0; api.updateGhost();
    const stoneShape = g.tool.shape;
    document.dispatchEvent(new MouseEvent('mousedown', { button: 2 })); document.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
    const stoneAfter = g.tool.shape;
    g.snapOn = false; document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyF' }));
    const stoneSnap = g.snapOn;
    // vehlite: right click walks all twelve
    g.slots[0] = C.makeDrill(11); g.tool.shape = 1; const seen = [];
    for (let i = 0; i < 12; i++){ document.dispatchEvent(new MouseEvent('mousedown', { button: 2 })); document.dispatchEvent(new MouseEvent('mouseup', { button: 2 })); seen.push(g.tool.shape); }
    return { out, stoneShape, stoneAfter, stoneSnap, seen };
  });
  console.log('2. the tiers  :', JSON.stringify(r2));
  // 3. facing and ECHO in the world
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const face = [];
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]){
      g.yaw = yaw; const rot = api.editRot(3); const e = C.makeEdit(1, 3, 0, 0, 0, 4, 1, rot);
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);   // forward
      const ahead = C.shapeSDF(fx * 1.6, 1.3, fz * 1.6, e), behind = C.shapeSDF(-fx * 1.6, 1.3, -fz * 1.6, e);
      face.push(ahead < 0 && behind > 0);
    }
    // the building's door and the tower's door face you
    g.yaw = 0; const bR = api.editRot(10), bE = C.makeEdit(1, 10, 0, 0, 0, 8, 1, bR);
    const doorNear = C.shapeSDF(0, -2.8, 3.8, bE) > 0, backWall = C.shapeSDF(0, -2.8, -3.8, bE) < 0;
    const tE = C.makeEdit(1, 11, 0, 0, 0, 12, 1, api.editRot(11)); const R = 6 * 0.55;
    const tDoor = C.shapeSDF(0, -6 + 1.4, R - 0.3, tE) > 0, tWall = C.shapeSDF(0, -6 + 1.4, -(R - 0.3), tE) < 0;
    // ECHO: a vehlite drill, four copies half a shape apart, one undo
    const x0 = g.pos.x + 6, z0 = g.pos.z, y0 = g.gen.height(x0, z0) - 2;
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.slots[0] = C.makeDrill(11); g.hotSel = 0;
    g.tool.shape = 1; g.tool.echo = 4; g.tool.echoGap = 0.5; g.snapOn = false; g.yaw = -Math.PI / 2;
    g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(g.pos.x + 10, g.pos.y + 1.6, g.pos.z); g.ghostEff = 2;
    const n0 = g.edits.length;
    api.doMineM(api.activeTool(), { x: x0, y: y0, z: z0 }, 1, 2);
    const E = g.edits.slice(n0).map(e => [+(e.x - x0).toFixed(2), +(e.z - z0).toFixed(2)]);
    api.undoEdit();
    const afterUndo = g.edits.length - n0;
    g.tool.echo = 1;
    return { face, doorNear, backWall, tDoor, tWall, echo: E, afterUndo };
  });
  console.log('3. facing/echo:', JSON.stringify(r3));
  // 4. all twelve in the world, placed with a vehlite dispenser in a row
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    let x0 = null, z0 = null;
    for (let r = 20; r < 300 && x0 == null; r += 10) for (let a = 0; a < 6.28 && x0 == null; a += 0.4){
      const x = Math.round(g.pos.x + Math.cos(a) * r), z = Math.round(g.pos.z + Math.sin(a) * r), h = g.gen.height(x, z);
      let dry = h > g.gen.seaLevel + 4; for (let dx = -40; dx <= 40 && dry; dx += 8) if (api.waterTopAt(x + dx, z, g.gen.height(x + dx, z) + 1) != null) dry = false;
      if (dry){ x0 = x; z0 = z; }
    }
    const gy = Math.round(g.gen.height(x0, z0)) + 1;
    api.applyEdit(C.makeEdit(1, 1, x0, gy - 5, z0, 10, 0, C.MAT.STONEBRICK)); const pad = C.makeEdit(1, 1, x0, gy - 1, z0, 2, 0, C.MAT.STONEBRICK); pad.sx = 100; pad.sz = 14; api.applyEdit(pad);
    g.yaw = 0;                       // facing -z: stairs rise away, doors face +z
    const t0 = performance.now();
    for (let k = 0; k < 12; k++){
      const sh = C.SHAPE_UNLOCK[k], s = sh >= 10 ? 7 : 4.5;
      const e = C.makeEdit(1, sh, x0 - 44 + k * 8, gy + s / 2, z0, s, sh === 10 ? C.MAT.PLANKS : sh === 11 ? C.MAT.STONEBRICK : C.MAT.ROCK, api.editRot(sh));
      api.applyEdit(e);
    }
    g.terrain.process(600);
    window.__row = { x0, z0, gy };
    return { ms: Math.round(performance.now() - t0), dirty: g.terrain.dirty.size };
  });
  console.log('4. the row    :', JSON.stringify(r4));
  await page.evaluate(() => { const g = window.__game, api = window.__api, R = window.__row; g.slots[0] = null; g.fly = true; g.camView = 0; g.pos.set(R.x0 - 12, R.gy + 9, R.z0 + 30); g.yaw = 0.3; g.pitch = -0.28; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(6);
  await page.screenshot({ path: __dirname + '/b113_row.png' });
  await page.evaluate(() => { const g = window.__game, R = window.__row; g.pos.set(R.x0 + 26, R.gy + 8, R.z0 + 18); g.yaw = 0.15; g.pitch = -0.3; });
  await settle(4);
  await page.screenshot({ path: __dirname + '/b113_row2.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
