const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b111'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const T = C.TIER_TIME, even = T.every((v, i) => i === 0 || (T[i - 1] - v) > 0.07 && (T[i - 1] - v) < 0.08);
    const tables = { nmat: C.NMAT, hard: C.HARDNESS ? C.HARDNESS.length : null, name: C.MAT_NAME.length };
    const caps = [4, 7, 8, 9, 10, 11].map(t => C.tierCap(t));
    const steps = [0, 3].map(t => [C.STEPS[C.tierMin(t)], C.tierCap(t)]);
    const rec = ['sword', 'drill', 'disp', 'helm', 'plate', 'boots'].map(k => [8, 9, 10, 11].map(t => { const r = C.RECIPES.find(r => r.kind === k && r.tier === t); return r ? r.world + ':' + (r.costs.find(c => c.item) || {}).item : null; }));
    const items = ['scarcoal', 'ichorite', 'nullite', 'vehlite'].map(k => [api.itemLabel({ kind: k, count: 1 }), (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100, !!api.itemInfoHTML({ kind: k, count: 2 })]);
    const tools = [8, 11].map(t => [api.itemLabel(C.makeDrill(t)), (api.itemIconURL(C.makeDrill(t)) || '').length > 100, api.itemLabel(C.makeSword(t))]);
    const ore = [C.MAT.SCARCOAL, C.MAT.ICHORITE, C.MAT.NULLITE, C.MAT.VEHLITE].map(m => C.ORE_ITEM[m]);
    const fuel = [C.fuelOps({ kind: 'coal', count: 1 }), C.fuelOps({ kind: 'scarcoal', count: 1 })];
    // Strata's ground by depth: which ores, how many, in a column field
    const G = C.makeGen(7, 'alien');
    const bands = [[-3, -25], [-35, -65], [-75, -125], [-135, -230]];
    const found = bands.map(([y0, y1]) => { const n = {}; for (let x = -200; x < 200; x += 1.3) for (let z = -60; z < 60; z += 2.1){ const y = y0 + ((x * 7.13 + z * 3.7) % 1 + 1) % 1 * (y1 - y0); const m = G.mat(x + 3000, y, z + 3000); if (C.ORE_ITEM[m]) n[C.ORE_ITEM[m]] = (n[C.ORE_ITEM[m]] || 0) + 1; } return n; });
    // the Earth: none of Strata's
    const E = g.gen; let earthStrata = 0; for (let x = -100; x < 100; x += 1.7) for (let y = -120; y < 0; y += 3) { const m = E.mat(x, y, 11); if (m >= C.MAT.SCARCOAL && m <= C.MAT.VEHLITE) earthStrata++; }
    return { time: T, even, tables, caps, steps, rec, items, tools, ore, fuel, found, earthStrata };
  });
  console.log('1. the tiers  :', JSON.stringify(r1));
  // 2. the real drill: diamond now takes time; vehlite is instant
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const p = { x: g.pos.x + 3, y: g.gen.height(g.pos.x + 3, g.pos.z) - 1.2, z: g.pos.z };
    const plan = t => api.actionPlan ? api.actionPlan({ kind: 'drill', tier: t }, p, 0, 2).dur : null;
    const durs = [0, 4, 7, 8, 11].map(t => { const d = plan(t); return d == null ? null : +d.toFixed(3); });
    // mine with the vehlite drill through the real click
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.slots[0] = C.makeDrill(11); g.hotSel = 0; g.tool.shape = 0; g.tool.size = 2; g.tool.dist = 3;
    g.pos.set(p.x, p.y + 1.5, p.z - 3); g.camera.position.set(p.x, p.y + 3.1, p.z - 3); g.camera.lookAt(p.x, p.y, p.z); api.updateGhost();
    const e0 = g.edits.length; g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    return { durs, instantCut: g.edits.length - e0, hud: api.itemLabel(g.slots[0]) };
  });
  console.log('2. the drill  :', JSON.stringify(r2));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
