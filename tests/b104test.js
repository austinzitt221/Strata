const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b104'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  await settle(2);
  const r0 = await page.evaluate(() => { const A = window.__api.AudioSys; const ok = A.init(); const S = A.strata(0.2); return { ctx: ok, on: S.on, mode: A.musicMode }; });
  console.log('0. the Earth :', JSON.stringify(r0));
  // to Strata
  await page.evaluate(() => { const g = window.__game, api = window.__api; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'earth', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(3);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, A = api.AudioSys, T = api.treeSys;
    api.loadSys.end(); api.exitCar();
    const gen = g.gen, p0 = { x: g.pos.x, z: g.pos.z };
    const at = (x, z, dy) => { g.pos.set(x, gen.height(x, z) + (dy || 0.7), z); g.underwater = false; return Object.assign({}, A.strata(0.2)); };
    // an ichor river: the nearest surface water on a grid out to 300 m
    let river = null, bd = 1e9;
    for (let dx = -300; dx <= 300; dx += 6) for (let dz = -300; dz <= 300; dz += 6){
      const x = p0.x + dx, z = p0.z + dz, wy = gen.waterYAt(x, z);
      if (wy == null || wy < gen.height(x, z) - 0.2) continue;
      const d = Math.hypot(dx, dz); if (d < bd){ bd = d; river = { x, z, wy }; }
    }
    const bank = river ? at(river.x + 2, river.z + 2) : null;
    const bankHiss = bank && bank.hiss;
    const under = (() => { if (!river) return null; g.pos.set(river.x, river.wy - 1, river.z); g.underwater = true; const S = A.strata(0.2); g.underwater = false; return S.hiss; })();
    // dry ground: the first grid point where the probe finds no ichor
    let dry = null;
    for (let dx = 0; dx <= 400 && !dry; dx += 20) for (let dz = 0; dz <= 400 && !dry; dz += 20){ const S = at(p0.x + dx, p0.z + dz); if (S.hiss === 0) dry = { x: p0.x + dx, z: p0.z + dz, wind: S.wind, hiss: S.hiss }; }
    // underground: no wind
    const deep = dry ? at(dry.x, dry.z, -12) : null;
    // up in the air: more wind
    const high = dry ? at(dry.x, dry.z, 12) : null;
    // the maws: three within reach, one very near
    const inj = ['m1', 'm2', 'm3'].map((k, i) => { T.visible.set('inj' + k, { t: { x: (dry || p0).x + 3 + i * 8, z: (dry || p0).z, type: ['maw', 'ashmaw', 'bonemaw'][i] }, m: null }); return k; });
    const withMaws = at((dry || p0).x, (dry || p0).z);
    let creaks = 0; const oldCreak = A.creak; A.creak = () => { creaks++; }; for (let i = 0; i < 400; i++) A.strata(0.2); A.creak = oldCreak;
    for (const k of inj) T.visible.delete('inj' + k);
    const noMaws = at((dry || p0).x, (dry || p0).z);
    // the centre: hush total inside the rim, none thirty metres past it
    const C = gen.centre;
    const centre = at(C.x, C.z), rim = at(C.x + C.r + 10, C.z), outside = at(C.x + C.r + 40, C.z);
    const hushNow = A.hush;
    // the tracks play through without error
    let tracks = 'ok'; try { const t = A.ctx ? A.ctx.currentTime : 0; for (const n of ['veil', 'stalk']) for (let i = 0; i < 40; i++) A.stepTrack(n, i, t + i * 0.3); A.creak(1); } catch (e){ tracks = e.message; }
    g.pos.set(p0.x, gen.height(p0.x, p0.z) + 0.7, p0.z);
    return { river: !!river, bankHiss, under, dry: dry && { wind: dry.wind, hiss: dry.hiss }, deepWind: deep && deep.wind, highWind: high && high.wind, maws: withMaws.maws, creaks, noMaws: noMaws.maws, hush: [centre.hush, rim.hush, outside.hush], hushNow, tracks, nodes: !!A.strataNodes };
  });
  console.log('1. Strata    :', JSON.stringify(r1));
  await settle(3);
  const r2 = await page.evaluate(() => { const A = window.__api.AudioSys; return { mode: A.musicMode, track: A.track, state: A.strataState }; });
  console.log('2. the music :', JSON.stringify(r2));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
