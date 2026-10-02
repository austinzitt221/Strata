const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b108'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, F = api.farmSys, P = api.pnodeSys;
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    const yx = Math.round(p.x) + 12, yz = Math.round(p.z);
    // a grass dome: a slope to farm on
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 30, yz, 40, 0, 0)); api.applyEdit(C.makeEdit(1, 0, yx, gy - 8, yz, 22, 0, C.MAT.GRASS)); g.terrain.process(200);
    const topY = gy - 8 + 11;
    const mats = { n: C.NMAT, names: [C.MAT_NAME[C.MAT.TILLED], C.MAT_NAME[C.MAT.TILLEDWET]] };
    const matAt = (x, y, z) => C.materialAt(x, y, z, api.nearEdits([x - 2, y - 2, z - 2, x + 2, y + 2, z + 2]), g.gen);
    // the hoe on the slope, by the real right click
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'hoe' };
    const sx = yx + 6, sz = yz; const sy = gy - 8 + Math.sqrt(11 * 11 - 36);   // on the dome's flank
    g.pos.set(sx, sy + 0.9, sz + 3); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(sx, sy, sz);
    const before = matAt(sx, sy - 0.2, sz);
    const n0 = g.edits.length; F.rmb(g.slots[0]);
    const plot = F.plots()[0]; const ed = plot && F.paintOf(plot);
    const painted = ed ? { op: ed.op, mat: ed.mat === C.MAT.TILLED, sy: ed.sy, edits: g.edits.length - n0 } : null;
    g.terrain.process(200);
    const after = matAt(plot.x, plot.y - 0.2, plot.z), afterName = C.MAT_NAME[after];
    // the crops stand on the surface: four stems at four heights on the flank
    plot.crop = 'wheat'; plot.stage = 2; P.rebuild();
    const it = P.items.find(q => q.n === plot) || P.items.find(q => q.g && q.g.userData && q.g.userData.n === plot);
    let stems = null;
    for (const q of P.items){ if (q.n === plot || (q.g && q.g.position.x === plot.x && q.g.position.z === plot.z)){ stems = q.g.children.filter(c => c.geometry && c.geometry.parameters && Math.abs(c.geometry.parameters.height - (0.15 + 2 * api.FARM_CROPS.wheat.h)) < 1e-6).map(c => +c.position.y.toFixed(2)); break; } }
    const spread = stems ? +(Math.max(...stems) - Math.min(...stems)).toFixed(2) : null;
    // water: the earth goes dark; dry: light again
    plot.water = 3; F.t = 5; F.tick(0); const wetMat = ed.mat === C.MAT.TILLEDWET;
    plot.water = 0; F.t = 5; F.tick(0); const dryMat = ed.mat === C.MAT.TILLED;
    // an old plot with no paint gets one
    const old = P.add('plot', yx - 6, topY, yz + 4, 0, { crop: null, stage: 0, water: 2, gt: 0 });
    const had = !!F.paintOf(old); F.migrate(); const now = F.paintOf(old); const migrated = now && now.mat === C.MAT.TILLEDWET;
    // rock refuses
    api.applyEdit(C.makeEdit(1, 1, yx + 14, topY - 2, yz + 14, 6, 0, C.MAT.ROCK)); g.terrain.process(100);
    g.pos.set(yx + 14, topY + 2, yz + 14 + 3); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(yx + 14, topY + 1, yz + 14);
    const plotsBefore = F.plots().length; F.rmb(g.slots[0]); const rockRefused = F.plots().length === plotsBefore;
    const icon = (api.itemIconURL({ kind: 'mat', mat: C.MAT.TILLED, count: 1 }) || '').length > 100;
    return { mats, before: C.MAT_NAME[before], painted, afterName, stems, spread, wetMat, dryMat, had, migrated, rockRefused, icon };
  });
  console.log('1. hoed ground:', JSON.stringify(r));
  await page.evaluate(() => { const g = window.__game, api = window.__api, C = window.__CORE, F = api.farmSys, P = api.pnodeSys; const pl = F.plots()[0]; for (const [dx, dz, crop, st] of [[2, 0, 'tomato', 3], [-2, 0, 'lettuce', 1], [0, 2, 'wheat', 3], [0, -2, 'tomato', 2]]){ const x = pl.x + dx, z = pl.z + dz; let y = pl.y + 3; const le = api.nearEdits([x - 2, y - 6, z - 2, x + 2, y + 2, z + 2]); while (y > pl.y - 6 && api.sdfWorld(x, y, z, le) > 0) y -= 0.05; const n = P.add('plot', x, +y.toFixed(2), z, 0, { crop, stage: st, water: dx > 0 ? 3 : 0, gt: 0 }); F.till(n); } pl.crop = 'wheat'; pl.stage = 3; pl.water = 3; F.t = 5; F.tick(0); g.terrain.process(300); P.rebuild(); g.fly = true; g.camView = 0; g.hotSel = 7; g.pos.set(pl.x + 1.5, pl.y + 2.6, pl.z + 6.5); g.yaw = 0.2; g.pitch = -0.35; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(5);
  await page.screenshot({ path: __dirname + '/b108_slope.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
