const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b65'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  await settle(3);
  // 1. every unlaid set-piece in range stands as its shapes
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, F = api.farShapeSys, R = F.RANGE;
    const B = F.shapes();
    const near = (x, z) => B.filter(q => Math.abs(q.x - x) < 40 && Math.abs(q.z - z) < 40).length;
    const kinds = {
      village: api.villageSys.candidatesNear(g.pos.x, g.pos.z, R).map(v => ({ key: v.key, d: Math.hypot(v.x - g.pos.x, v.z - g.pos.z) | 0, boxes: near(v.x, v.z), stamped: !!(g.villages['v' + v.key] || {}).stamped })),
      fort: api.raidBaseSys.candidatesNear(g.pos.x, g.pos.z, R).map(f => ({ key: f.key, d: Math.hypot(f.x - g.pos.x, f.z - g.pos.z) | 0, boxes: near(f.x, f.z), stamped: !!(g.forts[f.key] || {}).stamped })),
      zig: api.zigSys.candidatesNear(g.pos.x, g.pos.z, R).map(f => ({ key: f.key, d: Math.hypot(f.x - g.pos.x, f.z - g.pos.z) | 0, boxes: near(f.x, f.z), stamped: !!((g.zigs || {})['z' + f.key] || {}).stamped })),
      garrison: api.baseSys.candidatesNear(g.pos.x, g.pos.z, R).map(f => ({ key: f.key, d: Math.hypot(f.x - g.pos.x, f.z - g.pos.z) | 0, boxes: near(f.x, f.z), stamped: !!((g.bases || {})[f.key] || {}).stamped })),
    };
    const sum = {};
    for (const k in kinds) sum[k] = { n: kinds[k].length, unlaidWithBoxes: kinds[k].filter(q => !q.stamped && q.boxes > 0).length, unlaidWithout: kinds[k].filter(q => !q.stamped && q.boxes === 0).length, laidWithBoxes: kinds[k].filter(q => q.stamped && q.boxes > 0).length, nearest: kinds[k].length ? Math.min(...kinds[k].map(q => q.d)) : null };
    window.__V = kinds.village.filter(q => !q.stamped).sort((a, c) => a.d - c.d)[0];
    return { total: B.length, drawn: F.boxes, sum, expect: { village: 8, fort: 15, zig: 6, garrison: 14 } };
  });
  console.log('1. at range  :', JSON.stringify(r1));
  // 2. walk up to the nearest unlaid village: it is stamped and its shapes go
  const r2a = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const V = window.__V; if (!V) return { none: true };
    const v = api.villageSys.candidatesNear(g.pos.x, g.pos.z, api.farShapeSys.RANGE).find(q => q.key === V.key);
    window.__VV = v;
    g.pos.set(v.x + 30, g.gen.height(v.x + 30, v.z) + 4, v.z); g.forceStream = true;
    return { before: api.farShapeSys.shapes().filter(q => Math.abs(q.x - v.x) < 40 && Math.abs(q.z - v.z) < 40).length, dirtyBefore: api.farShapeSys.dirty };
  });
  await settle(5);
  const r2b = await page.evaluate(() => {
    const g = window.__game, api = window.__api, v = window.__VV;
    api.villageSys.ensure();
    const rec = g.villages['v' + v.key];
    return { stamped: !!(rec && rec.stamped), dirty: api.farShapeSys.dirty, after: api.farShapeSys.shapes().filter(q => Math.abs(q.x - v.x) < 40 && Math.abs(q.z - v.z) < 40).length };
  });
  console.log('2. laid      :', JSON.stringify(Object.assign(r2a, r2b)));
  // 3. the cartographer's sheet marks garrisons
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const f = api.baseSys.candidatesNear(g.pos.x, g.pos.z, 6000).sort((a, c) => Math.hypot(a.x - g.pos.x, a.z - g.pos.z) - Math.hypot(c.x - g.pos.x, c.z - g.pos.z))[0];
    if (!f) return { none: true };
    const S = { x0: f.x - 400, z0: f.z - 400, x1: f.x + 400, z1: f.z + 400 };
    const marks = api.chartSys.marks(S);
    const ks = {}; for (const m of marks) ks[m.k] = (ks[m.k] || 0) + 1;
    return { marks: ks, garrisonColor: api.CHART_COL.garrison };
  });
  console.log('3. the sheet :', JSON.stringify(r3));
  // a look at an unlaid fort from 300 m
  await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const f = api.raidBaseSys.candidatesNear(g.pos.x, g.pos.z, 3000).filter(q => !(g.forts[q.key] || {}).stamped).sort((a, c) => Math.hypot(a.x - g.pos.x, a.z - g.pos.z) - Math.hypot(c.x - g.pos.x, c.z - g.pos.z))[0];
    if (!f) return;
    const gy = g.gen.height(f.x, f.z);
    g.pos.set(f.x - 220, Math.max(gy, g.gen.height(f.x - 220, f.z - 220)) + 30, f.z - 220); g.yaw = Math.atan2(-(f.x - g.pos.x), -(f.z - g.pos.z)); g.pitch = -0.12; g.forceStream = true;
    window.__FS = f;
  });
  await settle(8);
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: __dirname + '/b65_fort_far.png' });
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
