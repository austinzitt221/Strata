// Build 115: THE STOPWATCH -- the frame-rate pass
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b115'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(3);

  // 1. the stopwatch, by its keys: F3 on, shift+F3 the report, F3 off
  await page.keyboard.press('F3');
  await page.waitForTimeout(4500);
  const r1a = await page.evaluate(() => { const P = window.__api.perfSys; return { on: P.on, overlay: document.getElementById('fpsbox').textContent }; });
  await page.keyboard.press('Shift+F3');
  await page.waitForTimeout(300);
  const r1 = await page.evaluate((a) => {
    const g = window.__game, P = window.__api.perfSys, rep = g.perfReport || '';
    const sys = rep.split('\n').filter(l => /^  \S.* +[\d.]+ \/ [\d.]+$/.test(l)).length;
    return { on: a.on, overlayCpu: /cpu [\d.]+ · gpu/.test(a.overlay), overlayWorst: /worst \d+ ms/.test(a.overlay), gpu: /gpu (n\/a|…|[\d.]+ ms)/.test(a.overlay),
             report: /^STRATA perf report/.test(rep), frames: /frames: [\d.]+ fps · frame ms p50/.test(rep), systems: sys, hasRender: /render \(cpu\)/.test(rep), reset: P.repN < 5 };
  }, r1a);
  await page.keyboard.press('F3');
  await page.waitForTimeout(200);
  r1.offAfter = await page.evaluate(() => !window.__api.perfSys.on);
  console.log('1. stopwatch  :', JSON.stringify(r1));

  // 2. the edit index: the same edits, in the same order, as reading the whole list
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const lin = (E, box, pad) => { let sp = 0; for (const e of E) if (e.op === 5 && (e.k || 0.5) > sp && C.aabbOverlap(C.editAABB(e), box, pad)) sp = e.k || 0.5; const p = pad + sp; return E.filter(e => C.aabbOverlap(C.editAABB(e), box, p)); };
    // a long list: 900 edits, some turned, some wide, one smoothing stroke
    const E = []; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++){
      const e = C.makeEdit(rnd() < 0.5 ? 0 : 1, rnd() < 0.3 ? 0 : 1, (rnd() - 0.5) * 600, (rnd() - 0.5) * 60, (rnd() - 0.5) * 600, 1 + rnd() * 12, 0, rnd() < 0.4 ? rnd() * 6 : 0);
      if (rnd() < 0.2){ e.sx = 1 + rnd() * 30; e.sy = 1 + rnd() * 8; e.sz = 1 + rnd() * 30; }
      if (rnd() < 0.1) e.rx = rnd() * 0.5;
      if (i === 400){ e.sx = 900; e.sz = 700; }                                 // wider than the index
      if (i === 500){ e.op = 5; e.k = 3; }
      E.push(e);
    }
    const same = (a, b) => a.length === b.length && a.every((e, i) => e === b[i]);
    let bad = 0, checked = 0, found = 0;
    const probe = () => { for (let q = 0; q < 300; q++){ const x = (rnd() - 0.5) * 640, y = (rnd() - 0.5) * 70, z = (rnd() - 0.5) * 640, s = rnd() < 0.1 ? 200 : 1 + rnd() * 40; const box = [x, y, z, x + s, y + s * 0.5, z + s]; const pad = rnd() * 3; const a = C.cullEdits(E, box, pad), b2 = lin(E, box, pad); checked++; found += a.length; if (!same(a, b2)) bad++; } };
    probe();
    E.push(C.makeEdit(1, 1, 10, 0, 10, 4, 0, 0)); probe();                 // a push extends it
    E.pop(); E.pop(); probe();                                               // an undo rebuilds it
    E.splice(100, 3); probe();                                               // a splice rebuilds it
    E[200].x += 150; C.editMoved(E, E[200]); probe();                        // the wrench moves one in place
    E[201].sx = (E[201].sx || E[201].size) + 40; C.editMoved(E, E[201]); probe();
    // and the world's own list after a city: the mesher and physics agree
    let bad2 = 0;
    for (let q = 0; q < 200; q++){ const x = g.pos.x + (rnd() - 0.5) * 300, z = g.pos.z + (rnd() - 0.5) * 300, y = g.gen.height(x, z); const box = [x - 4, y - 4, z - 4, x + 36, y + 36, z + 36]; if (!same(C.cullEdits(g.edits, box, 0.5), lin(g.edits, box, 0.5))) bad2++; }
    // the time it saves, on the long list
    const box = [0, -5, 0, 40, 35, 40];
    let t = performance.now(); for (let q = 0; q < 2000; q++) C.cullEdits(E, box, 0.5); const tIdx = (performance.now() - t) / 2000;
    t = performance.now(); for (let q = 0; q < 200; q++) lin(E, box, 0.5); const tLin = (performance.now() - t) / 200;
    return { checked, bad, found, worldList: g.edits.length, bad2, usPerQuery: +(tIdx * 1000).toFixed(1), usLinear: +(tLin * 1000).toFixed(1) };
  });
  console.log('2. edit index :', JSON.stringify(r2));

  // 3. the city and its highway: no frame spends seconds laying it; the water meets it later
  const r3a = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const P = api.perfSys; P.start(); P.resetReport();
    let best = null; for (let cz = -2; cz <= 2; cz++) for (let cx = -2; cx <= 2; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; }
    const c = best.c; g.pos.set(c.x + 10, g.gen.height(c.x + 10, c.z + 10) + 3, c.z + 10); g.vel.set(0, 0, 0); g.fly = true; g.forceStream = true;
    window.__roadT = []; const R = api.roadSys, f = R.ensure; R.ensure = function(){ const t = performance.now(); f.apply(this); window.__roadT.push(performance.now() - t); };
    window.__cityT = []; const Cs = api.citySys, fc = Cs.ensure; Cs.ensure = function(){ const t = performance.now(); const v = fc.apply(this); window.__cityT.push(performance.now() - t); return v; };
    return { city: [Math.round(c.x), Math.round(c.z)], d: Math.round(best.d) };
  });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const p = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(60); const rec = Object.values(g.roads || {}); return { laid: rec.reduce((s, r) => s + r.done.length, 0), more: !!api.roadSys.more }; }); if (i > 25 && !p.more && p.laid > 0) break; }
  const r3 = await page.evaluate((a) => {
    const g = window.__game, api = window.__api, W = api.waterSys, P = api.perfSys;
    const rt = window.__roadT, ct = window.__cityT;
    const rec = Object.values(g.roads || {});
    const hitches = P.hitches.filter(h => h.parts.some(p => /^(roads|cities) /.test(p) && +p.split(' ').pop() > 150));
    return Object.assign(a, { roadCalls: rt.length, roadMax: +Math.max(0, ...rt).toFixed(0), roadSum: +rt.reduce((s, v) => s + v, 0).toFixed(0), cityMax: +Math.max(0, ...ct).toFixed(0),
      segsLaid: rec.reduce((s, r) => s + r.done.length, 0), stillLaying: !!api.roadSys.more, waterQueue: W.matQ.length, bigHitches: hitches.length });
  }, r3a);
  console.log('3. the city   :', JSON.stringify(r3));

  // 4. water: a stamp in the frame waits its turn; the player's own edit meets it at once; the save keeps the queue
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, W = api.waterSys, S = api.shoreSys;
    let w = null, bd = 1e9;
    for (let dx = -300; dx <= 300; dx += 4) for (let dz = -300; dz <= 300; dz += 4){ const x = Math.round(g.pos.x) + dx, z = Math.round(g.pos.z) + dz, WW = S.wetAt(x, z); if (!WW || WW.depth < 1.5) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, top: WW.top }; } }
    if (!w) return { err: 'no water near' };
    W.matQ = [];
    const n0 = W.cells.size;
    W.defer = true; api.applyEdit(C.makeEdit(0, 1, w.x + 1, Math.floor(w.top) - 1, w.z, 3, 0, 0)); W.defer = false;
    const queued = W.matQ.length, cellsWhileQueued = W.cells.size - n0;
    const saved = api.buildSaveData().waterQ;
    W.drainMat(3); let rounds = 1; while (W.matQ.length && rounds < 50){ W.drainMat(3); rounds++; }
    const afterDrain = W.cells.size - n0;
    const n1 = W.cells.size;
    api.applyEdit(C.makeEdit(0, 1, w.x - 3, Math.floor(w.top) - 1, w.z + 3, 3, 0, 0));
    return { at: [w.x, w.z], queued, cellsWhileQueued, savedQueue: saved.length, savedKeys: saved[0] && saved[0][0] === null, drained: afterDrain > 0, rounds, playerEditAtOnce: W.cells.size > n1 || W.matQ.length === 0 };
  });
  console.log('4. the water  :', JSON.stringify(r4));

  // 5. flying: a chunk border crossed costs a few milliseconds, not fifty
  const r5 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.fly = true; g.yaw = 0.3;
    const T = [];
    for (let s = 0; s < 24; s++){
      g.pos.x -= Math.sin(g.yaw) * 32; g.pos.z -= Math.cos(g.yaw) * 32;
      const t0 = performance.now();
      g.terrain.update(g.pos.x, g.pos.y, g.pos.z);
      api.treeSys.refresh(); api.farTreeSys.lastCell = null; api.farTreeSys.refresh(); api.decorSys.refresh();
      T.push(performance.now() - t0);
    }
    T.sort((a, b) => a - b);
    const t1 = g.gen.treeAt(12, 40), t2 = g.gen.treeAt(12, 40);
    return { crossings: T.length, median: +T[12].toFixed(1), worst: +T[23].toFixed(1), treeKept: t1 === t2 };
  });
  console.log('5. flying     :', JSON.stringify(r5));

  // 6. the icons come straight off their canvas; the workers send bytes
  const r6 = await page.evaluate(() => {
    const api = window.__api, g = window.__game;
    const m = api.playerBody.iconMat({ kind: 'mat', mat: 3 });
    const cv = api.itemIconURL({ kind: 'coal' }, true), url = api.itemIconURL({ kind: 'coal' });
    let floatIn = 0, calls = 0; const L = api.lodTerrain, q = L.quantize;
    L.quantize = function(d){ calls++; if (d && d.normals instanceof Float32Array) floatIn++; return q.call(this, d); };
    window.__qz = () => { L.quantize = q; return { calls, floatIn }; };
    return { canvasTex: !!(m.map && m.map.isCanvasTexture), canvas: cv instanceof HTMLCanvasElement, url: /^data:image\/png/.test(url), workers: api.meshPool.ok ? api.meshPool.workers.length : 0 };
  });
  await page.evaluate(() => { const g = window.__game; g.pos.x += 400; g.forceStream = true; });
  await settle(6);
  r6.quantize = await page.evaluate(() => window.__qz());
  console.log('6. icons/bytes:', JSON.stringify(r6));

  // the picture: the overlay over the world
  await page.evaluate(() => { const g = window.__game; g.pos.y = g.gen.height(g.pos.x, g.pos.z) + 12; g.pitch = -0.2; g.camView = 0; });
  await page.keyboard.press('F3');
  await settle(12);                                  // the overlay redraws every half second of game time (ten headless frames)
  await page.screenshot({ path: __dirname + '/b115_stopwatch.png' });
  console.log('7. overlay    :', JSON.stringify(await page.evaluate(() => document.getElementById('fpsbox').textContent.split('\n').slice(-4))));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
