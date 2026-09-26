// CPU profile of the real frame loop, per scenario. Usage: node prof.js <html> [scenarios]
const { chromium } = require('playwright');
const FILE = process.argv[2] || '/home/user/Strata/strata.html';
const WANT = (process.argv[3] || 'spawn,city,fly,mine').split(',');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 480, height: 270 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file://' + FILE);
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','prof'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(6);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  const run = async (name, secs, setup, perFrame) => {
    if (setup) await page.evaluate(setup);
    if (perFrame) await page.evaluate(perFrame);
    await page.waitForTimeout(1500);
    const f0 = await page.evaluate(() => window.__game.fpsN + (window.__game.__frames || 0));
    await page.evaluate(() => { const g = window.__game; g.__fc = 0; const f = () => { g.__fc++; if (g.__fcOn) requestAnimationFrame(f); }; g.__fcOn = true; requestAnimationFrame(f); });
    await page.evaluate(() => { const P = window.__api.perfSys; if (P){ if (!P.on) P.start(); P.resetReport(); } });
    await cdp.send('Profiler.start');
    await page.waitForTimeout(secs * 1000);
    const { profile } = await cdp.send('Profiler.stop');
    const frames = await page.evaluate(() => { const g = window.__game; g.__fcOn = false; if (g.__stepper) { clearInterval(g.__stepper); g.__stepper = null; } return g.__fc; });
    // self time per function
    const byId = new Map(); for (const n of profile.nodes) byId.set(n.id, n);
    const dts = profile.timeDeltas; const self = new Map();
    for (let i = 0; i < profile.samples.length; i++){ const n = byId.get(profile.samples[i]); const d = dts[i] || 0; const cf = n.callFrame; const key = (cf.functionName || '(anon)') + ':' + (cf.lineNumber + 1) + (cf.url.includes('strata') ? '' : ' [' + cf.url.split('/').pop() + ']'); self.set(key, (self.get(key) || 0) + d); }
    // total (inclusive) time per function
    const parent = new Map(); for (const n of profile.nodes) for (const c of (n.children || [])) parent.set(c, n.id);
    const incl = new Map();
    for (let i = 0; i < profile.samples.length; i++){ const d = dts[i] || 0; const seen = new Set(); let id = profile.samples[i]; while (id != null){ const n = byId.get(id); const cf = n.callFrame; const key = (cf.functionName || '(anon)') + ':' + (cf.lineNumber + 1); if (!seen.has(key)){ seen.add(key); incl.set(key, (incl.get(key) || 0) + d); } id = parent.get(id); } }
    const tot = (profile.endTime - profile.startTime) / 1000;
    const top = [...self.entries()].filter(([k]) => !/^\((idle|program|garbage collector)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 18);
    const gc = [...self.entries()].filter(([k]) => /^\(garbage collector\)/.test(k)).reduce((s, e) => s + e[1], 0);
    const idle = [...self.entries()].filter(([k]) => /^\(idle\)/.test(k)).reduce((s, e) => s + e[1], 0);
    console.log('\n=== ' + name + ' : ' + frames + ' frames in ' + tot.toFixed(0) + 'ms; idle ' + (idle / 1000).toFixed(0) + 'ms gc ' + (gc / 1000).toFixed(0) + 'ms; per frame (ms self):');
    for (const [k, v] of top) console.log('  ' + (v / 1000 / Math.max(1, frames)).toFixed(2).padStart(7) + '  ' + k);
    for (const want of (process.env.CALLERS || '').split(',').filter(Boolean)){
      const agg = new Map();
      for (let i = 0; i < profile.samples.length; i++){ const n0 = byId.get(profile.samples[i]); const cf0 = n0.callFrame; const k0 = (cf0.functionName || '(anon)') + ':' + (cf0.lineNumber + 1); if (!k0.startsWith(want)) continue; let id = parent.get(profile.samples[i]); const chain = []; while (id != null && chain.length < 7){ const n = byId.get(id); chain.push((n.callFrame.functionName || 'anon') + ':' + (n.callFrame.lineNumber + 1)); id = parent.get(id); } const key = chain.join(' < '); agg.set(key, (agg.get(key) || 0) + (dts[i] || 0)); }
      console.log('  -- callers of ' + want + ':');
      for (const [k, v] of [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)) console.log('    ' + (v / 1000 / Math.max(1, frames)).toFixed(2) + '  ' + k);
    }
    const itop = [...incl.entries()].filter(([k]) => /frameBody|tick|update|process|refresh|render|snaps|decide/i.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 25);
    if (process.env.REPORT) console.log(await page.evaluate(() => window.__api.perfSys ? window.__api.perfSys.report() : 'no stopwatch'));
    console.log('  -- inclusive:');
    for (const [k, v] of itop) console.log('  ' + (v / 1000 / Math.max(1, frames)).toFixed(2).padStart(7) + '  ' + k);
  };
  if (WANT.includes('spawn')) await run('spawn, standing', 20);
  if (WANT.includes('progs')){ await page.evaluate(() => { const g = window.__game; let best = null; for (let cz = -2; cz <= 2; cz++) for (let cx = -2; cx <= 2; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; } const c = best.c; g.pos.set(c.x + 10, g.gen.height(c.x + 10, c.z + 10) + 3, c.z + 10); g.vel.set(0, 0, 0); g.fly = true; g.forceStream = true; window.__pl = []; });
    await page.evaluate(() => { window.__seenP = new Set(window.__game.renderer.info.programs.map(p => p.cacheKey)); });
    for (let i = 0; i < 45; i++){ await page.waitForTimeout(1000); const p = await page.evaluate(() => { const g = window.__game, r = g.renderer; const out = []; for (const p of r.info.programs){ if (window.__seenP.has(p.cacheKey)) continue; window.__seenP.add(p.cacheKey); out.push(p.name + ' | ' + p.cacheKey.replace(/\s+/g, ' ') + ' | len ' + p.cacheKey.length); } return out; }); if (p.length) console.log(i, p.join('\n   ')); }
  }
  if (WANT.includes('city')){
    await page.evaluate(() => { const g = window.__game; let best = null; for (let cz = -2; cz <= 2; cz++) for (let cx = -2; cx <= 2; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; } const c = best.c; g.pos.set(c.x + 10, g.gen.height(c.x + 10, c.z + 10) + 3, c.z + 10); g.vel.set(0, 0, 0); g.fly = true; g.forceStream = true; });
    for (let i = 0; i < 40; i++){ await page.waitForTimeout(1000); const p = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(120); return api.loadSys.pending() + g.terrain.dirty.size; }); if (i > 15 && p === 0) break; }
    await run('city, standing', 20);
  }
  if (WANT.includes('fly')){
    await run('flying 40 m/s', 20, () => { const g = window.__game; g.fly = true; g.yaw = 0.3; g.__stepper = setInterval(() => { g.pos.x -= Math.sin(g.yaw) * 8; g.pos.z -= Math.cos(g.yaw) * 8; }, 200); });
  }
  if (WANT.includes('mine')){
    await run('mining every frame', 20, () => { const g = window.__game, api = window.__api; g.fly = true; g.pos.y = g.gen.height(g.pos.x, g.pos.z) + 2; g.pitch = -0.6; let k = 0; g.__stepper = setInterval(() => { k++; const x = g.pos.x + (k % 10) * 1.5, z = g.pos.z - 6 - Math.floor(k / 10) * 1.5; const y = g.gen.height(x, z); api.applyEdit ? api.applyEdit({ op: 0, shape: k & 1, x, y, z, size: 2.5, mat: 0 }) : null; }, 150); });
  }
  console.log('\nerrors:', errs.length ? errs.slice(0, 5).join(' | ') : 'none');
  await b.close();
})();
