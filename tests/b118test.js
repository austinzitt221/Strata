// Build 118: the city ghost, and what Austin's perf report pointed at
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b118'); await page.fill('#newWorldSeed', '15');   // a desert city, like the report's
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { const g = window.__game; window.__api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.timeOfDay = 0.3; g.opts.rd = 7; g.terrain.radius = 8; g.forceStream = true; });
  await page.waitForTimeout(1500);
  // fly in to the nearest city
  await page.evaluate(() => {
    const g = window.__game; let best = null; for (let cz = -4; cz <= 4; cz++) for (let cx = -4; cx <= 4; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; }
    const c = window.__C = best.c; g.fly = true;
    const a = Math.atan2(g.pos.z - c.z, g.pos.x - c.x);
    g.pos.set(c.x + Math.cos(a) * 500, g.gen.height(c.x, c.z) + 30, c.z + Math.sin(a) * 500); g.forceStream = true;
    window.__fly = setInterval(() => { const dx = c.x - g.pos.x, dz = c.z - g.pos.z, d = Math.hypot(dx, dz); if (d < 60){ clearInterval(window.__fly); return; } g.pos.x += dx / d * 8; g.pos.z += dz / d * 8; g.yaw = Math.atan2(-dx, -dz); }, 200);
  });
  for (let i = 0; i < 60; i++){ await page.waitForTimeout(1000); const s = await page.evaluate(() => { const g = window.__game; return { d: Math.hypot(window.__C.x - g.pos.x, window.__C.z - g.pos.z), st: !!Object.values(g.cities || {}).find(r => r.stamped) }; }); if (s.d < 61 && s.st) break; }
  for (let i = 0; i < 40; i++){ await page.waitForTimeout(1000); const n = await page.evaluate(() => { const g = window.__game, rec = Object.values(g.cities || {}).find(r => r.stamped); if (rec) g.pos.y = rec.gy + 2.5; g.terrain.process(80); return g.terrain.dirty.size; }); if (n === 0 && i > 5) break; }

  // 1. the ghost: every stand-in box within 60 m that the shader would still draw
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, F = api.farShapeSys, S = api.farTerrain;
    S.updateMask(); F.ensureMat();
    const fs = F.mat.fragmentShader, nearCut = fs.includes('distance(vPos, uPlayerPos) < 24.0'), seam = fs.includes('r > 0.76');
    const B = F.shapes(), n = S.maskN, D = S.maskData, ox = S.uMaskOrigin.value.x / 8, oz = S.uMaskOrigin.value.y / 8;
    const drawn = (v, d) => !(d < 24 || (v > 0.47 && v < 0.75) || v > 0.76);
    const drawnOld = (v) => !((v > 0.47 && v < 0.75) || v > 0.95);
    let pts = 0, ghost = 0, ghostOld = 0;
    for (const bx of B){
      if (Math.hypot(bx.x - g.pos.x, bx.z - g.pos.z) > 75) continue;
      for (let x = bx.x - bx.sx / 2 + 1; x < bx.x + bx.sx / 2; x += 2) for (let z = bx.z - bx.sz / 2 + 1; z < bx.z + bx.sz / 2; z += 2){
        const d = Math.hypot(x - g.pos.x, z - g.pos.z); if (d > 60) continue;
        pts++;
        const v = D[(Math.floor(z / 8) - oz) * n + Math.floor(x / 8) - ox] / 255;
        if (drawn(v, d)) ghost++;
        if (drawnOld(v)) ghostOld++;
      }
    }
    return { nearCut, seam, boxesNear: pts, ghostPoints: ghost, before118: ghostOld };
  });
  console.log('1. the ghost  :', JSON.stringify(r1));

  // 2. a chunk crossing in the city: the disc by column, the torches kept
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, T = g.terrain, C = window.__C;
    const tm = (f) => { const t = performance.now(); f(); return performance.now() - t; };
    let tu = 0, tt = 0; const n = 30;
    for (let s = 0; s < n; s++){ const a = s * 0.13; g.pos.x = C.x + Math.cos(a) * 55; g.pos.z = C.z + Math.sin(a) * 55; tu += tm(() => T.update(g.pos.x, g.pos.y, g.pos.z)); tt += tm(() => api.torchSys.rebuild()); }
    const kids = api.torchSys.group ? api.torchSys.group.children.length : 0;
    return { terrainUpdate: +(tu / n).toFixed(2), torchRebuild: +(tt / n).toFixed(2), torchesDrawn: kids, torches: g.torches.length, cols: T.cols ? T.cols.size : 0 };
  });
  console.log('2. a crossing :', JSON.stringify(r2));

  // 3. the props in columns: the same answer as the whole list (to the 8 m cap)
  const r3 = await page.evaluate(() => {
    const g = window.__game, P = g.solidProps, api = window.__api;
    const lin = (x, y, z) => { let d = 1e9; for (const p of P){ let pd; if (p.t === 'box'){ let dx = x - p.x, dz = z - p.z; if (p.yaw){ const c = Math.cos(-p.yaw), s = Math.sin(-p.yaw); const rx = dx * c - dz * s; dz = dx * s + dz * c; dx = rx; } const qx = Math.abs(dx) - p.hx, qy = Math.abs(y - p.y) - p.hy, qz = Math.abs(dz) - p.hz; pd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, Math.max(qy, qz)), 0); } else { const d2 = Math.hypot(x - p.x, z - p.z) - p.r, dy = Math.abs(y - (p.y + p.h * 0.5)) - p.h * 0.5; pd = Math.hypot(Math.max(d2, 0), Math.max(dy, 0)) + Math.min(Math.max(d2, dy), 0); } if (pd < d) d = pd; } return d; };
    let bad = 0, near = 0, n = 0;
    for (let i = 0; i < 4000; i++){
      const p = P[i % P.length], x = p.x + (Math.random() - 0.5) * 30, z = p.z + (Math.random() - 0.5) * 30, y = p.y + (Math.random() - 0.5) * 6;
      const want = P.length > 24 ? Math.min(lin(x, y, z), 8) : lin(x, y, z), got = api.propSDF(x, y, z);
      n++; if (want < 8) near++; if (Math.abs(want - got) > 1e-9) bad++;
    }
    const t0 = performance.now(); for (let i = 0; i < 20000; i++){ const p = P[i % P.length]; api.propSDF(p.x + 1, p.y, p.z + 1); } const tGrid = (performance.now() - t0) / 20;
    const t1 = performance.now(); for (let i = 0; i < 2000; i++){ const p = P[i % P.length]; lin(p.x + 1, p.y, p.z + 1); } const tLin = (performance.now() - t1) / 2;
    return { props: P.length, n, near, bad, usGrid: +tGrid.toFixed(2), usList: +tLin.toFixed(2) };
  });
  console.log('3. the props  :', JSON.stringify(r3));

  // 4. the dispenser: nothing is costed until you click
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.mode = 'survival'; g.dispSlot = C.makeDispenser(4); g.slots[0] = C.makeStack(C.MAT.STONEBRICK, 500); g.hotSel = 0; g.tool.shape = 1; g.tool.size = 8;
    let calls = 0; const pc = C.placeCost; C.placeCost = function(...a){ calls++; return pc.apply(this, a); };
    g.mouseL = false;
    for (let i = 0; i < 20; i++){ g.yaw += 0.05; api.updateGhost(); api.tryAction(0.016, performance.now()); }
    const idle = calls;
    g.mouseEdge = true; g.mouseL = true; api.updateGhost(); api.tryAction(0.016, performance.now()); g.mouseL = false;
    C.placeCost = pc; g.mode = 'creative'; g.slots[0] = null;
    return { idleCosts: idle, clickCosts: calls - idle };
  });
  console.log('4. dispenser  :', JSON.stringify(r4));

  // 5. the stopwatch names the parts
  await page.evaluate(() => { const P = window.__api.perfSys; P.start(); P.resetReport(); });
  await page.waitForTimeout(6000);
  console.log('5. the parts  :', JSON.stringify(await page.evaluate(() => { const r = window.__api.perfSys.report(); return ['player', 'ghost', 'tool action', 'water · flow', 'water · stamps', 'water · meshes'].filter(k => r.includes(k)); })));
  await page.evaluate(() => { const g = window.__game, C = window.__C, rec = Object.values(g.cities).find(r => r.stamped); g.pos.set(C.x + 30, rec.gy + 1.7, C.z + 30); g.yaw = Math.PI * 0.25; g.pitch = 0.05; });
  for (let i = 0; i < 12; i++){ await page.waitForTimeout(1000); await page.evaluate(() => window.__game.terrain.process(80)); }
  await page.screenshot({ path: __dirname + '/b118_city.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
