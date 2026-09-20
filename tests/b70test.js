const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b70'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshHotbar(); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, u = g.terrainMat.uniforms;
    return { nmat: C.NMAT, names: C.MAT_NAME.slice(25), logs: C.LOG_MATS, atlas: u.uNMat.value, logMats: u.uLogMats.value, logEnds: u.uLogEnds.value, planks: C.RECIPES.filter(r => r.kind === 'matout').length, sticks: C.RECIPES.filter(r => r.kind === 'stick').length, icons: [25, 26, 27, 28].every(m => (api.itemIconURL({ kind: 'mat', mat: m, count: 1 }) || '').length > 100), hard: C.HARDNESS.length };
  });
  console.log('1. materials :', JSON.stringify(r1));
  const find = `(arch) => { const g = window.__game; for (let r = 200; r < 9000; r += 80) for (let a = 0; a < 6.28; a += 0.25){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; if (g.gen.archAt(x, z) !== arch) continue; let ok = true; for (let k = 0; k < 6 && ok; k++){ if (g.gen.archAt(x + Math.cos(k) * 50, z + Math.sin(k) * 50) !== arch) ok = false; } if (ok && g.gen.height(x, z) > g.gen.seaLevel + 2) return { x, z, h: g.gen.height(x, z) }; } return null; }`;
  const visit = async (arch, name, treeType, wood, look) => {
    const spot = await page.evaluate(([f, arch]) => { const S = eval(f)(arch); if (S){ const g = window.__game; g.pos.set(S.x, S.h + 2, S.z); g.forceStream = true; g.yaw = 0.9; g.pitch = -0.08; } return S && [S.x | 0, S.z | 0, +S.h.toFixed(1)]; }, [find, arch]);
    if (!spot){ console.log(name + ': no spot'); return; }
    await settle(7);
    const r = await page.evaluate(([treeType, wood, arch]) => {
      const g = window.__game, api = window.__api, C = window.__CORE;
      api.treeSys.refresh();
      const types = {}; for (const [, v] of api.treeSys.visible) types[v.t.type || 'oak'] = (types[v.t.type || 'oak'] || 0) + 1;
      const grounds = {}; for (let i = 0; i < 60; i++){ const x = g.pos.x + (Math.random() - 0.5) * 60, z = g.pos.z + (Math.random() - 0.5) * 60; if (g.gen.archAt(x, z) !== arch) continue; const m = C.MAT_NAME[g.gen.mat(x, g.gen.height(x, z) - 0.3, z)]; grounds[m] = (grounds[m] || 0) + 1; }
      let got = 0, trunkH = null;
      if (treeType){ let k = null; for (const [key, v] of api.treeSys.visible) if (v.t.type === treeType){ k = key; trunkH = v.m.userData.trunkH; break; } if (k){ api.treeSys.fell(k, true); got = g.slots.filter(s => s && s.kind === 'mat' && s.mat === C.MAT[wood]).reduce((a, s) => a + s.count, 0); } }
      return { types, grounds, trunkH: trunkH && +trunkH.toFixed(1), wood: treeType ? got : 'n/a' };
    }, [treeType, wood, arch]);
    console.log(name + ':', JSON.stringify(Object.assign({ spot }, r)));
    if (look){ await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); }); await page.waitForTimeout(700); await page.screenshot({ path: __dirname + '/b70_' + look + '.png' }); }
  };
  await visit(10, '2. the taiga ', 'spruce', 'SWOOD', 'taiga');
  await visit(11, '3. the tundra', null, null, null);
  await visit(12, '4. savanna   ', 'acacia', 'AWOOD', 'savanna');
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
