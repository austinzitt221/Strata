const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b76'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  // 1. the tiers, headless
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api;
    const caps = [0, 1, 2, 3, 4, 5, 6, 7].map(t => C.tierCap(t));
    const eff = { d20: C.effSize(20, 4), s20: C.effSize(20, 5), l20: C.effSize(20, 6), a20: C.effSize(20, 7), d01: C.effSize(0.1, 4), a01: C.effSize(0.1, 7), obs: C.effSize(20, 3) };
    const scroll = { d8up: C.scrollSize(8, 4, 1), s8up: +C.scrollSize(8, 5, 1).toFixed(2), a15up: C.scrollSize(15, 7, 1), a15up2: C.scrollSize(16, 7, 1) };
    const R = C.RECIPES.filter(r => r.tier >= 5).map(r => r.kind + r.tier + ':' + r.costs.map(c => (c.item || c.mat) + 'x' + c.n).join('+'));
    const icons = [{ kind: 'drill', tier: 7 }, { kind: 'plate', tier: 6 }, { kind: 'selenite', count: 1 }, { kind: 'astrium', count: 1 }].map(it => (api.itemIconURL(it) || '').length > 100);
    const M = C.makeGen(7, 'moon');
    const ores = {};
    for (let x = 0; x < 120; x += 2) for (let z = 0; z < 120; z += 2) for (let y = -240; y < -2; y += 2){ const m = M.mat(x, y, z); if (m >= C.MAT.IRON && (m === C.MAT.IRON || m === C.MAT.DIAMOND || m >= 36)) ores[C.MAT_NAME[m]] = (ores[C.MAT_NAME[m]] || 0) + 1; }
    const cat = api.catalogEntries ? api.catalogEntries().filter(it => it.kind === 'drill').map(it => it.tier) : 'n/a';
    return { names: C.TIER_NAME, caps, eff, scroll, recipes: R.length, sample: R.filter(x => /^(drill|plate)/.test(x)), icons, ores, catDrills: cat, nmat: C.NMAT };
  });
  console.log('1. tiers     :', JSON.stringify(r1));
  // 2. armor and the sword past diamond; a 12 m cut with a lunite drill
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    g.armor.head = { kind: 'helm', tier: 7 }; g.armor.chest = { kind: 'plate', tier: 5 }; g.armor.feet = { kind: 'boots', tier: 6 };
    const red = api.armorRed();
    g.armor.head = null; g.armor.chest = null; g.armor.feet = null;
    g.slots[0] = C.makeDrill(6); g.hotSel = 0; api.refreshHotbar();
    g.tool.size = 12; g.tool.shape = 0;
    const eff = C.effSize(g.tool.size, 6);
    const n0 = g.edits.length;
    api.applyEdit(C.makeEdit(0, 0, g.pos.x, g.gen.height(g.pos.x, g.pos.z), g.pos.z + 20, eff, 0));
    const e = g.edits[g.edits.length - 1];
    const label = api.itemLabel ? api.itemLabel(g.slots[0]) : 'n/a';
    api.refreshToolHUD();
    const hud = document.getElementById('toolhud') ? document.getElementById('toolhud').textContent.slice(0, 80) : '';
    return { red, eff, edits: g.edits.length - n0, size: e.size, label, hud };
  });
  console.log('2. gear      :', JSON.stringify(r2));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
