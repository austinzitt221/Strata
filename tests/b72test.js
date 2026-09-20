const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b72'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshHotbar(); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const find = (arch) => { for (let r = 200; r < 9000; r += 80) for (let a = 0; a < 6.28; a += 0.25){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; if (g.gen.archAt(x, z) !== arch) continue; let ok = true; for (let k = 0; k < 6 && ok; k++){ if (g.gen.archAt(x + Math.cos(k) * 45, z + Math.sin(k) * 45) !== arch) ok = false; } if (ok && g.gen.height(x, z) > g.gen.seaLevel + 1) return { x, z }; } return null; };
    const grounds = (S, arch) => { const c = {}; for (let i = 0; i < 80; i++){ const x = S.x + (Math.random() - 0.5) * 60, z = S.z + (Math.random() - 0.5) * 60; if (g.gen.archAt(x, z) !== arch) continue; const m = C.MAT_NAME[g.gen.mat(x, g.gen.height(x, z) - 0.3, z)]; c[m] = (c[m] || 0) + 1; } return c; };
    const sav = find(12), tun = find(11), jun = find(9), swp = find(5);
    let peat = 0, probes = 0;
    if (swp) for (let i = 0; i < 400; i++){ const x = swp.x + (Math.random() - 0.5) * 80, z = swp.z + (Math.random() - 0.5) * 80; if (g.gen.archAt(x, z) !== 5) continue; const h = g.gen.height(x, z); for (let d = 1.2; d < 5.5; d += 0.8){ probes++; if (g.gen.mat(x, h - d, z) === C.MAT.PEAT) peat++; } }
    window.__JUN = jun; window.__TAI = find(10);
    return { nmat: C.NMAT, names: C.MAT_NAME.slice(29), savanna: sav && grounds(sav, 12), tundra: tun && grounds(tun, 11), jungle: jun && grounds(jun, 9), peatPockets: +(100 * peat / Math.max(1, probes)).toFixed(1) + '% of probes under a swamp', peatItem: C.ORE_ITEM[C.MAT.PEAT], peatFuel: C.fuelOps({ kind: 'peat' }), coalFuel: C.fuelOps({ kind: 'coal' }), icons: ['peat', 'amber', 'cocoa'].every(k => (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100), labels: ['peat', 'amber', 'cocoa'].map(k => api.itemLabel({ kind: k, count: 1 })), broker: api.tradeSys.offers('broker').filter(o => o.buy && (o.buy.k === 'amber' || o.buy.k === 'peat')).map(o => o.buy.k + ':' + o.price) };
  });
  console.log('1. grounds   :', JSON.stringify(r1));
  // 2. the finds: cocoa from jungle trees, amber from spruces; cocoa eats
  const fell = async (spot, type, item, n) => {
    await page.evaluate((S) => { const g = window.__game; g.pos.set(S.x, g.gen.height(S.x, S.z) + 2, S.z); g.forceStream = true; }, spot);
    await settle(6);
    return page.evaluate(([type, item, n]) => {
      const g = window.__game, api = window.__api, C = window.__CORE;
      api.treeSys.refresh();
      const keys = [...api.treeSys.visible.entries()].filter(([, v]) => v.t.type === type).map(([k]) => k).slice(0, n);
      const R = Math.random; Math.random = () => 0.01;                       // every find lands
      const before = C.countItem(g.slots, item);
      for (const k of keys) api.treeSys.fell(k, true);
      Math.random = R;
      return { felled: keys.length, got: C.countItem(g.slots, item) - before };
    }, [type, item, n]);
  };
  const jungle = await fell(await page.evaluate(() => window.__JUN), 'jungle', 'cocoa', 3);
  const taiga = await fell(await page.evaluate(() => window.__TAI), 'spruce', 'amber', 3);
  const eat = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.mode = 'survival'; g.hp = 50; g.heal = 0;
    const i = g.slots.findIndex(s => s && s.kind === 'cocoa'); g.hotSel = i; api.refreshHotbar();
    const c0 = g.slots[i].count;
    api.tryEat();
    const r = { heal: +g.heal.toFixed(0), left: g.slots[i] ? g.slots[i].count : 0, was: c0 };
    g.mode = 'creative';
    return r;
  });
  console.log('2. the finds :', JSON.stringify({ jungle, taiga, eat }));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
