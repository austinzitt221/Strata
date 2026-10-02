const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b105'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; });
  await settle(2);
  // the Earth: a worm on the hook halves the wait
  const r0 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, gen = g.gen;
    let w = null, bd = 1e9;
    for (let dx = -200; dx <= 200; dx += 4) for (let dz = -200; dz <= 200; dz += 4){ const x = g.pos.x + dx, z = g.pos.z + dz; const wt = api.waterTopAt(x, z, gen.height(x, z) + 1); if (wt != null && wt > gen.height(x, z) && Math.hypot(dx, dz) < bd){ bd = Math.hypot(dx, dz); w = { x, z, wt }; } }
    if (!w) return { water: false };
    const cast = (bait) => {
      for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'rod' }; if (bait) g.slots[1] = { kind: 'ichorworm', count: 2 };
      g.fishing = null; g.pos.set(w.x, w.wt + 0.6, w.z - 3); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(w.x, w.wt, w.z);
      const R = Math.random; Math.random = () => 0.5; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false; Math.random = R;
      const F = g.fishing; const out = F ? { bite: +F.bite.toFixed(2), ichor: F.ichor, bait: F.bait, worms: g.slots[1] ? g.slots[1].count : 0 } : null; if (F) api.endFishing(); return out;
    };
    return { water: true, plain: cast(false), baited: cast(true) };
  });
  console.log('0. the Earth :', JSON.stringify(r0));
  await page.evaluate(() => { const g = window.__game, api = window.__api; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'earth', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(3);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, gen = g.gen, C = window.__CORE;
    api.loadSys.end(); api.exitCar();
    let w = null, bd = 1e9;
    for (let dx = -300; dx <= 300; dx += 6) for (let dz = -300; dz <= 300; dz += 6){ const x = g.pos.x + dx, z = g.pos.z + dz, wy = gen.waterYAt(x, z); if (wy == null || wy < gen.height(x, z) - 0.2) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, wt: wy }; } }
    if (!w) return { river: false };
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'rod' };
    const stand = () => { g.pos.set(w.x, w.wt + 0.6, w.z - 3); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(w.x, w.wt, w.z); };
    const click = (roll) => { const R = Math.random; Math.random = () => roll; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false; Math.random = R; };
    stand(); g.fishing = null; click(0.5);
    const F = g.fishing;
    const cast = F ? { ichor: F.ichor, bite: +F.bite.toFixed(1), top: F.mesh.children[0].material.color.getHex() } : null;
    const got = {};
    for (const roll of [0.02, 0.1, 0.3, 0.8]){
      if (!g.fishing){ stand(); click(0.5); }
      g.fishing.bit = true; click(roll);
      const last = g.slots.filter(Boolean).map(q => q.kind).filter(k => k !== 'rod');
      got[roll] = last[last.length - 1]; for (let i = 1; i < 40; i++) g.slots[i] = null;
    }
    const sova = api.stationOneSys.offers('relics').filter(o => o.sell && ['ichorworm', 'veillamp', 'ichorcrown'].includes(o.sell.k)).map(o => [o.sell.k, o.sell.n, o.price]);
    const icons = ['ichorworm', 'veillamp', 'ichorcrown'].map(k => (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100);
    const labels = ['ichorworm', 'veillamp', 'ichorcrown'].map(k => api.itemLabel({ kind: k, count: 1 }));
    const tip = api.itemInfoHTML({ kind: 'rod' }).includes('not fish');
    // leave a cast in for the picture
    stand(); g.fishing = null; click(0.5);
    return { river: true, cast, got, sova, icons, labels, tip };
  });
  console.log('1. the ichor :', JSON.stringify(r1));
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.timeOfDay = 0.3; api.updateDayNight(0); g.pitch = -0.35; });
  await settle(3);
  await page.screenshot({ path: __dirname + '/b105_cast.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
