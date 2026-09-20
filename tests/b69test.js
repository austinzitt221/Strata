const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b69'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshHotbar(); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the materials, the atlas, the recipes, the icons
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const R = C.RECIPES.filter(r => r.kind === 'matout' && (r.matOut === C.MAT.JPLANKS || r.matOut === C.MAT.MPLANKS)).length;
    const S = C.RECIPES.filter(r => r.kind === 'stick').length;
    const icons = [20, 21, 22, 23, 24].map(m => (api.itemIconURL({ kind: 'mat', mat: m, count: 1 }) || '').length > 100);
    const u = g.terrainMat.uniforms;
    return { nmat: C.NMAT, names: C.MAT_NAME.slice(20), planksRecipes: R, stickRecipes: S, icons, logMats: C.LOG_MATS, atlas: u.uNMat.value, logEnds: u.uLogEnds.value.slice(0, 3), hard: C.HARDNESS.length };
  });
  console.log('1. materials :', JSON.stringify(r1));
  // 2. the jungle: dense tall trees, jungle wood when they fall
  const spot = await page.evaluate(() => {
    const g = window.__game;
    const find = (arch) => { for (let r = 200; r < 6000; r += 100) for (let a = 0; a < 6.28; a += 0.3){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; if (g.gen.archAt(x, z) === arch && g.gen.height(x, z) > g.gen.seaLevel + 2) return { x, z, h: g.gen.height(x, z) }; } return null; };
    window.__J = find(9); window.__S = find(5);
    const J = window.__J; g.pos.set(J.x, J.h + 2, J.z); g.forceStream = true;
    return { jungle: J && [J.x | 0, J.z | 0], swamp: window.__S && [window.__S.x | 0, window.__S.z | 0] };
  });
  await settle(7);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.treeSys.refresh();
    const types = {}; for (const [, v] of api.treeSys.visible) types[v.t.type || 'oak'] = (types[v.t.type || 'oak'] || 0) + 1;
    let k = null, best = 1e9; for (const [key, v] of api.treeSys.visible){ if (v.t.type !== 'jungle') continue; const d = Math.hypot(v.t.x - g.pos.x, v.t.z - g.pos.z); if (d < best){ best = d; k = key; } }
    const v = api.treeSys.visible.get(k);
    const trunkH = v ? v.m.userData.trunkH : null;
    const before = C.countMat ? C.countMat(g.slots, C.MAT.JWOOD) : g.slots.filter(s => s && s.kind === 'mat' && s.mat === C.MAT.JWOOD).reduce((a, s) => a + s.count, 0);
    api.treeSys.fell(k, true);
    const after = g.slots.filter(s => s && s.kind === 'mat' && s.mat === C.MAT.JWOOD).reduce((a, s) => a + s.count, 0);
    const arch = g.gen.archAt(g.pos.x, g.pos.z), ground = C.MAT_NAME[g.gen.mat(g.pos.x, g.gen.height(g.pos.x, g.pos.z) - 0.3, g.pos.z)];
    // a look through the trees for the screenshot
    g.yaw = 0.7; g.pitch = -0.05;
    return { arch, ground, types, trunkH: trunkH && +trunkH.toFixed(1), jungleWood: after - before };
  });
  console.log('2. the jungle:', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: __dirname + '/b69_jungle.png' });
  // 3. the swamp: mud underfoot, mangroves in the shallows, mangrove wood
  await page.evaluate(() => { const g = window.__game, Sw = window.__S; g.pos.set(Sw.x, Sw.h + 2, Sw.z); g.forceStream = true; });
  await settle(7);
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.treeSys.refresh();
    const types = {}; for (const [, v] of api.treeSys.visible) types[v.t.type || 'oak'] = (types[v.t.type || 'oak'] || 0) + 1;
    const h = g.gen.height(g.pos.x, g.pos.z);
    const ground = C.MAT_NAME[g.gen.mat(g.pos.x, h - 0.3, g.pos.z)];
    let mudCols = 0; for (let i = 0; i < 40; i++){ const x = g.pos.x + (Math.random() - 0.5) * 80, z = g.pos.z + (Math.random() - 0.5) * 80; if (g.gen.mat(x, g.gen.height(x, z) - 0.3, z) === C.MAT.MUD) mudCols++; }
    let k = null; for (const [key, v] of api.treeSys.visible) if (v.t.type === 'mangrove'){ k = key; break; }
    let mw = 0; if (k){ api.treeSys.fell(k, true); mw = g.slots.filter(s => s && s.kind === 'mat' && s.mat === C.MAT.MWOOD).reduce((a, s) => a + s.count, 0); }
    g.yaw = -0.4; g.pitch = -0.1;
    return { arch: g.gen.archAt(g.pos.x, g.pos.z), ground, mudColumnsOf40: mudCols, types, mangroveWood: mw };
  });
  console.log('3. the swamp :', JSON.stringify(r3));
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: __dirname + '/b69_swamp.png' });
  // 4. build with the new wood: a jungle-planks wall stands and reads as itself
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const e = C.makeEdit(1, 1, g.pos.x + 4, g.pos.y + 1, g.pos.z, 2, C.MAT.JPLANKS, 0); api.applyEdit(e);
    const le = api.nearEdits([g.pos.x + 2, g.pos.y - 1, g.pos.z - 2, g.pos.x + 6, g.pos.y + 3, g.pos.z + 2]);
    return { placed: C.MAT_NAME[C.materialAt(g.pos.x + 4, g.pos.y + 1, g.pos.z, le, g.gen)] };
  });
  console.log('4. built     :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
