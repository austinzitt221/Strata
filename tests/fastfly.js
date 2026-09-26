// Build 121: the frame loop at full speed (the renderer stubbed out, so headless runs the JS as a real machine would), flying through a city; the game's own perf report
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader', '--js-flags=--expose-gc'] });
  const page = await b.newPage({ viewport: { width: 480, height: 270 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','fast'); await page.fill('#newWorldSeed', process.argv[2] || '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate((lake) => { window.__lake = lake; }, process.argv[4] === 'lake');
  await page.evaluate(() => {
    const g = window.__game, api = window.__api; api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.opts.rd = 7; g.terrain.radius = 8; g.fly = true; g.opts.fpsCap = 0;
    g.renderer.render = function(){}; g.renderer.shadowMap.enabled = false;
    let best = null; for (let cz = -4; cz <= 4; cz++) for (let cx = -4; cx <= 4; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; }
    let c = window.__C = best.c; g.pos.y = g.gen.height(g.pos.x, g.pos.z) + 30;
    if (window.__lake){ const S = api.shoreSys; let w = null, bd = 1e9; for (let dx = -600; dx <= 600; dx += 12) for (let dz = -600; dz <= 600; dz += 12){ const x = g.pos.x + dx, z = g.pos.z + dz, W = S.wetAt(x, z); if (!W || W.depth < 2) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z }; } } if (w) c = { x: w.x, z: w.z }; }
    // to the city, then round its blocks, as Austin flew
    const pts = [[c.x, c.z]]; for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2; pts.push([c.x + Math.cos(a) * 70, c.z + Math.sin(a) * 70]); }
    let k = 0, last = performance.now();
    window.__fly = setInterval(() => { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; const p = pts[k % pts.length], dx = p[0] - g.pos.x, dz = p[1] - g.pos.z, d = Math.hypot(dx, dz); if (d < 5){ k++; return; } const v = 22; g.pos.x += dx / d * v * dt; g.pos.z += dz / d * v * dt; g.yaw = Math.atan2(-dx, -dz); g.forceStream = true; }, 16);
    const L = api.lodTerrain, T = window.__T = {}, big = window.__big = [];
    const wrap = (o, name, lab) => { const f = o[name]; o[name] = function(...a){ const t = performance.now(); const h0 = performance.memory ? performance.memory.usedJSHeapSize : 0; const r = f.apply(this, a); const d = performance.now() - t; const s = T[lab] || (T[lab] = { n: 0, sum: 0, max: 0 }); s.n++; s.sum += d; if (d > s.max) s.max = d; if (d > 40) big.push(lab + ' ' + d.toFixed(0) + ' ms heap ' + ((performance.memory ? performance.memory.usedJSHeapSize : 0) - h0) / 1e6 + ' MB'); return r; }; };
    wrap(L, 'update', 'update'); wrap(L, 'scanCols', 'scanCols'); wrap(L, 'buildTile', 'buildTile'); wrap(L, 'frame', 'frame(all)'); wrap(api.meshPool, 'pump', 'pump');
    const G = g.gen; for (const nm of ['heightRange', 'skyNear']){ const f = G[nm]; G[nm] = function(...a){ const t = performance.now(); const r = f.apply(this, a); const d = performance.now() - t; if (d > 30) big.push(nm + ' ' + d.toFixed(0) + ' ms ' + JSON.stringify(a.map(v => +(+v).toFixed(0)))); return r; }; }
    const W = api.waterSys, WS = window.__W = { pushed: 0, wet: 0, mat: 0, matMs: 0, reseed: 0, reseedMs: 0, reseedMax: 0, matMax: 0, qMax: 0, keys: 0 };
    const qp = W.matQ.push.bind(W.matQ); W.matQ.push = function(...a){ WS.pushed += a.length; const r = qp(...a); if (W.matQ.length > WS.qMax) WS.qMax = W.matQ.length; return r; };
    const mz = W.materialize; W.materialize = function(...a){ const t = performance.now(); const r = mz.apply(this, a); const d = performance.now() - t; WS.mat++; WS.matMs += d; if (d > WS.matMax) WS.matMax = d; return r; };
    const rs = W.reseed; W.reseed = function(...a){ const t = performance.now(); const r = rs.apply(this, a); const d = performance.now() - t; WS.reseed++; WS.reseedMs += d; if (d > WS.reseedMax) WS.reseedMax = d; if (d > 30) big.push('reseed ' + d.toFixed(0) + ' ' + JSON.stringify(a[0].map(v => +v.toFixed(0)))); return r; };
    const dm = W.drainMat; WS.inDrain = 0; WS.drainMat = 0; W.drainMat = function(...a){ const m0 = WS.mat; const r = dm.apply(this, a); WS.drainMat += WS.mat - m0; return r; };
    WS.callers = {}; const mz2 = W.materialize; W.materialize = function(...a){ const st = new Error().stack.split('\n')[2].trim().split(' ')[1]; WS.callers[st] = (WS.callers[st] || 0) + 1; return mz2.apply(this, a); };
    for (const nm of ['drainMat', 'editKeys', 'hasWater', 'statArr', 'lazyArr', 'reseed']){ const f = W[nm]; W[nm] = function(...a){ const t = performance.now(); const r = f.apply(this, a); const d = performance.now() - t; if (d > 25) big.push(nm + ' ' + d.toFixed(0) + ' ms ' + (typeof a[0] === 'string' ? a[0] : '') + ' q' + W.matQ.length); return r; }; }
    const P = api.perfSys; if (!P.on) P.start(); P.resetReport();
  });
  await page.waitForTimeout(+(process.argv[3] || 90) * 1000);
  const r = await page.evaluate(() => { clearInterval(window.__fly); return window.__api.perfSys.report(); });
  console.log(r.split('\n').slice(0, 60).join('\n'));
  console.log(JSON.stringify(await page.evaluate(() => { const o = {}; for (const k in window.__T){ const s = window.__T[k]; o[k] = [s.n, +(s.sum / s.n).toFixed(2), +s.max.toFixed(1)]; } return { steps: o, big: window.__big.slice(0, 12), water: window.__W, qNow: window.__api.waterSys.matQ.length }; })));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
