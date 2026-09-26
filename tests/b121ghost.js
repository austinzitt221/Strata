// Build 121: the ghost city, as it happens in play -- a second world opened in the same page
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  const open = async (name, seed) => {
    await page.click('#btnWorlds'); await page.fill('#newWorldName', name); await page.fill('#newWorldSeed', seed);
    await page.click('#btnCreateWorld'); await page.waitForTimeout(200);
    await page.evaluate((name) => { const it = [...document.querySelectorAll('.worlditem')].find(w => w.textContent.includes(name)); it.querySelector('.btn').click(); }, name);
    await page.waitForTimeout(3000);
    await page.evaluate(() => { const g = window.__game; window.__api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.timeOfDay = 0.3; g.opts.rd = 7; g.terrain.radius = 8; g.forceStream = true; });
  };
  // the first world: a while in it, then save & quit, as a player would
  await open('b121a', '3');
  await page.waitForTimeout(4000);
  await page.evaluate(() => { window.__game.fly = true; window.__game.pos.x += 300; });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.__api.quitToTitle ? window.__api.quitToTitle() : document.getElementById('btnSaveQuit').click());
  await page.waitForTimeout(1000);
  // the second: the desert city
  await open('b121b', '15');
  await page.evaluate(() => {
    const g = window.__game; let best = null; for (let cz = -4; cz <= 4; cz++) for (let cx = -4; cx <= 4; cx++){ const c = g.gen.cityAt(cx, cz); if (!c) continue; const d = Math.hypot(c.x - g.pos.x, c.z - g.pos.z); if (!best || d < best.d) best = { c, d }; }
    const c = window.__C = best.c; g.fly = true; g.pos.set(c.x + 40, g.gen.height(c.x, c.z) + 20, c.z + 40); g.forceStream = true;
  });
  for (let i = 0; i < 60; i++){ await page.waitForTimeout(1000); const n = await page.evaluate(() => { const g = window.__game, rec = Object.values(g.cities || {}).find(r => r.stamped); if (rec) g.pos.y = rec.gy + 14; g.terrain.process(80); return rec ? g.terrain.dirty.size : -1; }); if (n === 0 && i > 8) break; }
  const r1 = await page.evaluate(() => {
    const api = window.__api, F = api.farShapeSys, S = api.farTerrain, g = window.__game;
    F.update();
    return { maskLive: F.mat.uniforms.uMask.value === S.maskTex, originLive: F.mat.uniforms.uMaskOrigin === S.uMaskOrigin, playerLive: F.mat.uniforms.uPlayerPos === g.terrainMat.uniforms.uPlayerPos, boxes: F.boxes };
  });
  console.log('1. the wiring :', JSON.stringify(r1));
  // 2. the stand-ins alone, looking at the city from 40 m: what they still draw
  const shot = async (file) => {
    await page.evaluate(() => { const g = window.__game, C = window.__C; g.yaw = Math.atan2(g.pos.x - C.x, g.pos.z - C.z); g.pitch = -0.25; });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: __dirname + '/' + file });
    return page.evaluate(() => {
      const g = window.__game, F = window.__api.farShapeSys, r = g.renderer, sc = g.scene;
      // only the stand-ins that stand inside the real world (the loaded disc is 64 m)
      const sh = F.shapes; F.shapes = function(){ return sh.call(this).filter(b => Math.hypot(b.x - g.pos.x, b.z - g.pos.z) < 55); }; F.build(); F.shapes = sh;
      const vis = []; sc.traverse(o => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite){ vis.push([o, o.visible]); o.visible = o === F.mesh; } });
      const bg = sc.background; sc.background = new window.__THREE.Color(0, 0, 0);
      const W = 240, H = 135, rt = new window.__THREE.WebGLRenderTarget(W, H);
      r.setRenderTarget(rt); r.render(sc, g.camera); const px = new Uint8Array(W * H * 4); r.readRenderTargetPixels(rt, 0, 0, W, H, px); r.setRenderTarget(null);
      for (const [o, v] of vis) o.visible = v; sc.background = bg; rt.dispose(); F.build();
      let n = 0; for (let i = 0; i < W * H; i++) if (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2] > 6) n++;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let k = 0; k < 4; k++) im.data[(y * W + x) * 4 + k] = k === 3 ? 255 : px[((H - 1 - y) * W + x) * 4 + k] * 3;
      cx.putImageData(im, 0, 0);
      return { standInPixelsInside: n, of: W * H, png: cv.toDataURL() };
    });
  };
  const r2 = await shot('b121_city.png');
  require('fs').writeFileSync(__dirname + '/b121_standins.png', Buffer.from(r2.png.split(',')[1], 'base64')); delete r2.png;
  console.log('2. stand-ins  :', JSON.stringify(r2));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
