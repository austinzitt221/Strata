// Build 116: THE SHAPES, FIXED -- the wrench, the drill's rooms, clean treads
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b116'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(3);

  // 1. the drill's shapes: the space, with the rock left standing as the thing
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const out = {};
    const s = 10, h = 5;
    const E = (k, neg) => { const e = C.makeEdit(neg ? 0 : 1, k, 0, 0, 0, s, 1, 0); if (neg) e.neg = 1; return e; };
    const air = (k, x, y, z) => C.shapeSDF(x, y, z, E(k, true)) < 0;     // inside the space the drill takes
    // the building: the room, the attic and the door are taken; the walls, the roof and the floor stay
    { const B = C.buildingDims(h, h, h);
      out.building = { room: air(10, 0, 0, 0), attic: air(10, 0, B.yb + 0.3, 0), door: air(10, 0, -h + B.t + 0.8, h - 0.2), wallSide: !air(10, h - 0.2, 0, 0), wallBack: !air(10, 0, 0, -h + 0.2),
                       frontBesideDoor: !air(10, h * 0.7, 0, h - 0.2), roofPeak: !air(10, 0, h - 0.2, 0), floor: !air(10, 0, -h + 0.2, 0) }; }
    // the stairs: air over every tread, rock under it, headroom kept
    { const A = C.stairAirDims(h), n = C.stairN(A.S / 2), dy = A.S / n, dz = s / n; let ok = 0;
      for (let i = 0; i < n; i++){ const z = h - (i + 0.5) * dz, top = -h + (i + 1) * dy; if (!air(3, 0, top - 0.2, z) && air(3, 0, top + 0.3, z) && air(3, 0, top + A.H - 0.3, z) && !air(3, 0, top + A.H + 0.3, z)) ok++; }
      out.stairs = { treads: n, ok, headroom: +A.H.toFixed(2) }; }
    // the spiral: the shaft is air, the treads and the column stay
    out.spiral = { shaft: air(7, h * 0.6, 3.2, h * 0.3) || air(7, h * 0.6, 2.2, h * 0.3), column: !air(7, 0, 0, 0), outside: !air(7, h + 0.3, 0, 0) };
    // the arch: the opening only
    { const A = C.archDims(h, h); out.arch = { opening: air(9, 0, A.cy, 0), pier: !air(9, h - 0.2, 0, 0), over: !air(9, 0, h - 0.2, 0), through: air(9, 0, -h + 0.5, h - 0.1) && air(9, 0, -h + 0.5, -h + 0.1) }; }
    // the tower: its hollow, open to the sky, the stair standing, the door out to the front
    { const T = C.towerDims(h, h, h); out.tower = { hollow: air(11, T.ri * 0.7, h - 0.3, 0), wall: !air(11, (T.R + T.ri) / 2, 0, 0), door: air(11, 0, -h + T.t + 0.8, (T.R + h) / 2), floor: !air(11, 0, -h + 0.2, 0) }; }
    // the others the drill takes whole, as before
    out.coneWhole = C.shapeSDF(0, -h + 0.5, 0, Object.assign(E(5, false), { op: 0, neg: 1 })) < 0;
    // the ghosts lie on the space
    const ghost = {};
    for (const k of [3, 7, 9, 10, 11]){
      const G = api.shapeGhost.build(k, s, true), P = G.fill.attributes.position.array, e = E(k, true);
      let on = 0, n = 0; for (let i = 0; i < P.length; i += 3){ n++; if (Math.abs(C.shapeSDF(P[i], P[i + 1], P[i + 2], e)) < 0.06) on++; }
      ghost[C.SHAPE_NAME[k]] = +(on / n).toFixed(2);
    }
    out.ghostOnSurface = ghost;
    return out;
  });
  console.log('1. drill space:', JSON.stringify(r1));

  // 2. the spiral's treads: every one comes out of the mesher, placed and in a tower
  const r2 = await page.evaluate(() => {
    const C = window.__CORE, g = window.__game;
    const count = (e, R, hy, yOff) => {
      const n = C.stairN(hy), dy = 2 * hy / n, tops = new Set();
      const B = C.editAABB(e), M = C.CHUNK_M;
      for (let cx = Math.floor(B[0] / M); cx <= Math.floor(B[3] / M); cx++) for (let cy = Math.floor(B[1] / M); cy <= Math.floor(B[4] / M); cy++) for (let cz = Math.floor(B[2] / M); cz <= Math.floor(B[5] / M); cz++){
        const d = C.meshChunk(cx, cy, cz, [e], C.FLAT_GEN);
        if (!d) continue;
        const P = d.positions, N = d.normals;
        for (let t = 0; t < P.length; t += 9){
          const nx = N[t], ny = N[t + 1], nz = N[t + 2];
          if (ny < 0.95) continue;                                  // an up face: a tread's top
          const x = (P[t] + P[t + 3] + P[t + 6]) / 3 - e.x, y = (P[t + 1] + P[t + 4] + P[t + 7]) / 3 - e.y - yOff, z = (P[t + 2] + P[t + 5] + P[t + 8]) / 3 - e.z;
          const r = Math.hypot(x, z); if (r > R || r < R * 0.2) continue;
          const i = Math.round((y + hy) / dy) - 1; if (i >= 0 && i < n && Math.abs(-hy + (i + 1) * dy - y) < 0.12) tops.add(i);
        }
      }
      return { treads: n, meshed: tops.size };
    };
    const at = { x: 0.3, y: 60.2, z: 0.1 };                      // high over the flat test world, off the lattice
    const sp = C.makeEdit(1, 7, at.x, at.y, at.z, 10, 1, 0);
    const spiral = count(sp, 5, 5, 0);
    const tw = C.makeEdit(1, 11, at.x, at.y, at.z, 16, 1, 0), T = C.towerDims(8, 8, 8), y0 = -8 + T.t, sh = (T.top - y0) / 2;
    const tower = count(tw, T.ri, sh, y0 + sh);
    const big = count(C.makeEdit(1, 7, at.x, at.y, at.z, 24, 1, 0), 12, 12, 0);
    return { spiral, tower, big };
  });
  console.log('2. treads     :', JSON.stringify(r2));

  // 3. the wrench on every new shape: it selects, it outlines, the frame goes on; H hollows by an offset
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.wrenchSys;
    g.slots[0] = { kind: 'wrench' }; g.hotSel = 0;
    const errs0 = g.frameErrs || 0, out = { outlines: {} };
    const base = { x: g.pos.x + 12, z: g.pos.z };
    for (let k = 3; k < 12; k++){
      const e = C.makeEdit(1, k, base.x + (k - 3) * 11, g.gen.height(base.x, base.z) + 6, base.z, 8, C.MAT.STONEBRICK, 0);
      api.applyEdit(e);
      W.sel = g.edits.length - 1; W.selSet = [];
      W.frame(); W.frame();
      out.outlines[C.SHAPE_NAME[k]] = W.wires[3].visible && W.wires[3].geometry.attributes.position.count > 0;
    }
    // a second selection and a paste ghost of new shapes
    W.selSet = [g.edits.length - 1, g.edits.length - 2]; W.syncSelWires && W.syncSelWires(); W.frame();
    out.errorsWhileSelected = (g.frameErrs || 0) - errs0;
    // H on a pyramid: the inside goes, the outside does not move
    const pyr = C.makeEdit(1, 8, base.x, 40, base.z + 30, 10, C.MAT.STONEBRICK, 0); api.applyEdit(pyr);
    W.sel = g.edits.length - 1; W.hollow();
    const inner = g.edits[g.edits.length - 1];
    const L = [pyr, inner];
    const outside = [[base.x + 3.0, 40 - 0.2, base.z + 30], [base.x, 40 + 5.3, base.z + 30], [base.x - 2.2, 40 + 1.6, base.z + 30 + 2.4], [base.x + 5.2, 40 - 4.9, base.z + 30]];   // just outside the faces
    let faceSame = 0; for (const [x, y, z] of outside){ const a = C.evalSDF(x, y, z, [pyr]), b2 = C.evalSDF(x, y, z, L); if (Math.abs(a - b2) < 1e-6) faceSame++; }
    out.pyramid = { off: inner.off, sameShape: inner.shape === 8 && inner.size === pyr.size, hollowInside: C.evalSDF(base.x, 40 - 2, base.z + 30, L) > 0, faceSame, of: outside.length };
    // the stairs hollow; the tower says it is hollow already
    const st = C.makeEdit(1, 3, base.x + 20, 40, base.z + 30, 8, C.MAT.STONEBRICK, 0); api.applyEdit(st); W.sel = g.edits.length - 1; const n0 = g.edits.length; W.hollow();
    out.stairsHollowed = g.edits.length === n0 + 1 && g.edits[n0].off > 0;
    const tw = C.makeEdit(1, 11, base.x + 40, 40, base.z + 30, 8, C.MAT.STONEBRICK, 0); api.applyEdit(tw); W.sel = g.edits.length - 1; const n1 = g.edits.length; W.hollow();
    out.towerRefused = g.edits.length === n1;
    W.sel = -1; W.selSet = []; g.slots[0] = null;
    return out;
  });
  console.log('3. the wrench :', JSON.stringify(r3));

  // 4. the save keeps a drill's space and a hollow's offset
  const r4 = await page.evaluate(() => {
    const C = window.__CORE;
    const a = C.makeEdit(0, 10, 1, 2, 3, 9, 0, 1.57); a.neg = 1;
    const b2 = C.makeEdit(0, 8, 1, 2, 3, 9, 0, 0); b2.off = 0.9;
    const c = C.makeEdit(0, 3, 1, 2, 3, 9, 0, 0); c.neg = 1; c.liq = 0; c.sx = 12;
    const back = C.deserializeEdits(JSON.parse(JSON.stringify(C.serializeEdits([a, b2, c]))));
    return { neg: back[0].neg === 1, off: back[1].off === 0.9, both: back[2].neg === 1 && back[2].sx === 12, plain: C.serializeEdits([C.makeEdit(1, 1, 0, 0, 0, 2, 1, 0)])[0].length };
  });
  console.log('4. the save   :', JSON.stringify(r4));

  // 5. the drill, by the mouse, into a hill of stone: a house you can walk into
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    for (let i = 0; i < 10; i++) g.slots[i] = null;
    const gx = g.pos.x + 20, gz = g.pos.z - 30, gy = g.gen.height(gx, gz);
    window.__hill = { x: gx, y: gy, z: gz };
    api.applyEdit(C.makeEdit(1, 1, gx, gy + 7, gz, 22, C.MAT.STONEBRICK, 0));      // the hill
    g.slots[0] = C.makeDrill(11); g.hotSel = 0; g.tool.shape = 10; g.tool.size = 12;
    g.fly = true; g.yaw = 0; g.pitch = 0; g.pos.set(gx, gy + 6, gz + 11 + 7);
    g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
    g.snapOn = false;
    api.updateGhost();
    const p = g.ghostPos, eff = g.ghostEff;
    const n0 = g.edits.length;
    g.mouseEdge = true; g.mouseL = true; for (let i = 0; i < 4; i++) api.tryAction(0.05, performance.now()); g.mouseL = false;
    const e = g.edits[g.edits.length - 1];
    return { placed: g.edits.length - n0, neg: !!(e && e.neg), shape: e && C.SHAPE_NAME[e.shape], eff: +eff.toFixed(1), ghostAir: !!(g.ghostSet[10].wire.geometry && g.ghostSet[10].wire.geometry.attributes.position.count) };
  });
  console.log('5. by the drill:', JSON.stringify(r5));
  await page.evaluate(() => {
    // the picture: a house drilled square into the hill's face, seen from outside
    const g = window.__game, api = window.__api, C = window.__CORE, H = window.__hill;
    g.edits.pop(); g.terrain.invalidate(g.edits[g.edits.length - 1]);
    const e = C.makeEdit(0, 10, H.x, H.y + 6, H.z + 5, 12, 0, 0); e.neg = 1; api.applyEdit(e);
    g.slots[0] = null; api.refreshHotbar(); api.refreshToolHUD();
    const apron = C.makeEdit(0, 1, H.x, H.y + 0.75 + 6, H.z + 17, 12, 0, 0); apron.sy = 12; apron.sz = 12.2; api.applyEdit(apron);   // level ground before the face
    const pave = C.makeEdit(1, 1, H.x, H.y + 0.75 - 1, H.z + 17, 12, C.MAT.STONEBRICK, 0); pave.sy = 2; pave.sz = 12.2; api.applyEdit(pave);
    g.pos.set(H.x + 2.5, H.y + 0.8, H.z + 21); g.yaw = 0.12; g.pitch = 0.08; g.timeOfDay = 0.3; g.fly = false;
  });
  await settle(6);
  await page.screenshot({ path: __dirname + '/b116_house.png' });
  // and a placed spiral stair and tower, clean
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, H = window.__hill;
    const x = H.x - 30, z = H.z, y = g.gen.height(x, z);
    api.applyEdit(C.makeEdit(1, 7, x, y + 6, z, 12, C.MAT.STONEBRICK, 0));
    api.applyEdit(C.makeEdit(1, 11, x - 16, g.gen.height(x - 16, z - 8) + 9, z - 8, 18, C.MAT.STONEBRICK, 0));
    g.pos.set(x + 6, y + 15, z + 16); g.yaw = 0.35; g.pitch = -0.45;
  });
  await settle(6);
  await page.screenshot({ path: __dirname + '/b116_spiral.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
