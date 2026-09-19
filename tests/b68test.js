const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b68'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshHotbar(); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  await settle(3);
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    // a level pad, the three machines in a row
    const C = window.__CORE, px = Math.round(g.pos.x), pz = Math.round(g.pos.z), gy = Math.round(g.gen.height(px, pz)) + 3;
    api.applyEdit(C.makeEdit(1, 1, px, gy - 10, pz, 30, C.MAT.STONE, 0)); api.applyEdit(C.makeEdit(0, 1, px, gy + 10, pz, 30, 0, 0));
    const out = {};
    let i = -1;
    for (const k of ['tank', 'heli', 'jet']){
      i++;
      const e = api.spawnEntity(k, px + (i - 1) * 9, gy + 0.05, pz); e.heading = 0.6; e.charge = 100;
      api.updateEntities(0.05, performance.now());
      let mapped = 0, total = 0; e.mesh.traverse(o => { if (o.isMesh){ total++; if (o.material && o.material.map) mapped++; } });
      out[k] = { meshes: total, textured: mapped };
    }
    g.pos.set(px + 2, gy + 5, pz + 13); g.yaw = Math.atan2(-(px - g.pos.x), -(pz - g.pos.z)); g.pitch = -0.32; g.forceStream = true;
    return out;
  });
  console.log('skins:', JSON.stringify(r));
  await settle(4);
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: __dirname + '/b68_skins.png' });
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
