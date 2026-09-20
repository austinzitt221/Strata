const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','smoke'); await page.fill('#newWorldSeed', '3');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(4000);
  await page.evaluate(() => { window.__api.loadSys.end(); });
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.debugLock = true; g.ui = 'none';
    const n0 = g.edits.length;
    g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(-0.6, g.yaw, 0, 'YXZ');
    api.updateGhost && api.updateGhost();
    g.mouseL = true; g.mouseEdge = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    const mined = g.edits.length - n0;
    // every vehicle kit has a label, an icon and a hint
    const kinds = ['car', 'sportscar', 'bike', 'boat', 'motorboat', 'plane', 'hover', 'tank', 'heli', 'jet'];
    const labels = kinds.map(k => api.itemLabel({ kind: k, charge: 50 }));
    const icons = kinds.every(k => (api.itemIconURL({ kind: k, charge: 50 }) || '').length > 100);
    api.saveNow();
    return { running: g.running, mined, labels, icons, entities: g.entities.length, chunks: g.terrain.chunks ? g.terrain.chunks.size : null };
  });
  await page.waitForTimeout(3000);
  console.log('smoke:', JSON.stringify(r));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
