const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b86'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the tables: which recipes each shows
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.mode = 'survival';
    const p = g.pos;
    const listAt = (kind) => { g.tables = kind ? [[p.x + 1, p.y, p.z, 0].concat(kind === 'earth' ? [] : [kind])] : []; api.buildCraftUI(); const rows = [...document.querySelectorAll('#craftlist .craftrow')].map(r => r.textContent.slice(0, 22)); return rows; };
    const tabs = {};
    const kinds = [null, 'earth', 'moon', 'alien'];
    for (const k of kinds){ let all = []; for (let t = 0; t < 8; t++){ g.craftTab = t; all = all.concat(listAt(k)); } tabs[k || 'none'] = { n: all.length, sample: all.filter(x => /drill|table|planks|stick|mech|plating/i.test(x)).slice(0, 8) }; }
    const nk = { earth: (() => { g.tables = [[p.x + 1, p.y, p.z, 0]]; return api.nearTableKind(); })(), moon: (() => { g.tables = [[p.x + 1, p.y, p.z, 0, 'moon']]; return api.nearTableKind(); })(), far: (() => { g.tables = [[p.x + 30, p.y, p.z, 0, 'moon']]; return api.nearTableKind(); })() };
    const rec = { mtable: C.RECIPES.find(r => r.kind === 'mtable'), atable: C.RECIPES.find(r => r.kind === 'atable'), glow: C.RECIPES.find(r => r.kind === 'matout' && r.matOut === C.MAT.GLOWPLANK), drill7: C.RECIPES.find(r => r.kind === 'drill' && r.tier === 7) };
    g.tables = []; g.craftTab = 0;
    return { tabs, nk, worlds: Object.fromEntries(Object.entries(rec).map(([k, r]) => [k, r && (r.world || 'earth')])), logMats: C.LOG_MATS.length, nmat: C.NMAT, icons: ['mtable', 'atable'].map(k => (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100) };
  });
  console.log('1. tables    :', JSON.stringify(r1));
  // 2. to Strata: the maws stand, take hits, bite, and fall into stalks
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.mode = 'creative'; g.story = { word: 1, stage: 3, ship: 1, ambushed: 1, band: 1 }; const r = api.spawnEntity('rocket2', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; api.enterCar(r); const F = { phase: 'fadein', t: 0, e: r, from: 'moon', to: 'alien', h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  await settle(3);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true;
    api.treeSys.refresh();
    const types = {}; for (const [, v] of api.treeSys.visible) types[v.t.type] = (types[v.t.type] || 0) + 1;
    let k = null, best = 1e9; for (const [key, v] of api.treeSys.visible){ const d = Math.hypot(v.t.x - g.pos.x, v.t.z - g.pos.z); if (api.treeSys.MAW[v.t.type] && d < best){ best = d; k = key; } }
    const v = api.treeSys.visible.get(k), t = v.t;
    const hp = api.treeSys.mawHp(t), wm = api.treeSys.woodOf(t);
    // stand close, in survival, and mine it: it bites
    g.mode = 'survival'; g.hp = 100; g.fly = false;
    g.pos.set(t.x + 1.6, t.y + 0.2, t.z + 1.6);
    let bit = 0; for (let i = 0; i < 12 && !bit; i++){ if (api.treeSys.bite(k, 1)) bit = 100 - g.hp; }
    const snap = !!(v.m.userData.snapT);
    api.treeSys.snaps();
    const jaw = +v.m.userData.jawU.rotation.x.toFixed(2);
    // then from range, hits until it falls
    g.pos.set(t.x + 6, t.y + 0.2, t.z);
    const before = C.countMat(g.slots, wm);
    let hits = 0, fell = false; while (!fell && hits < 20){ hits++; fell = api.treeSys.hitMaw(k, 20); }
    const gone = !api.treeSys.visible.has(k);
    const got = C.countMat(g.slots, wm) - before;
    g.mode = 'creative'; g.fly = true;
    return { visible: api.treeSys.visible.size, types, maw: { type: t.type, s: +t.s.toFixed(2), hp, wood: C.MAT_NAME[wm], trunkH: +v.m.userData.trunkH.toFixed(1) }, bit, snap, jaw, hits, fell, gone, got, far: api.farTreeSys.KIND[t.type] ? 'kind' : 'nokind' };
  });
  console.log('2. the maws  :', JSON.stringify(r2));
  // a maw up close
  await page.evaluate(() => { const g = window.__game, api = window.__api; let k = null, best = 1e9; for (const [key, v] of api.treeSys.visible){ const d = Math.hypot(v.t.x - g.pos.x, v.t.z - g.pos.z); if (api.treeSys.MAW[v.t.type] && d < best){ best = d; k = key; } } const t = api.treeSys.visible.get(k).t; const H = api.treeSys.visible.get(k).m.userData.trunkH * t.s; g.pos.set(t.x + 5, t.y + H - 0.8, t.z + 3); g.yaw = Math.atan2(-(t.x - g.pos.x), -(t.z - g.pos.z)); g.pitch = 0.05; g.camView = 0; api.treeSys.visible.get(k).m.userData.snapT = performance.now() + 100; });
  await settle(3); await page.screenshot({ path: __dirname + '/b86_maw.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
