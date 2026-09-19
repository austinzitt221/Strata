const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const cons = []; page.on('console', m => { if (m.type() === 'error') cons.push(m.text().slice(0, 120)); });
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b64'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn');
  // 1. the world opens on the loading screen, and the player is not simulated until it ends
  const t0 = Date.now();
  const r1a = await page.evaluate(() => { const g = window.__game; return { ui: g.ui, shown: !document.getElementById('loadscreen').classList.contains('hidden'), title: document.getElementById('loadtitle').textContent, on: window.__api.loadSys.on, y: +g.pos.y.toFixed(2), pending: window.__api.loadSys.pending() }; });
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true, cancelable: true })));
  const escStill = await page.evaluate(() => window.__game.ui);
  let ready = null, bar = [];
  for (let i = 0; i < 70; i++){
    await page.waitForTimeout(1000);
    const st = await page.evaluate(() => ({ on: window.__api.loadSys.on, ui: window.__game.ui, bar: document.getElementById('loadbar').style.width, text: document.getElementById('loadtext').textContent, y: +window.__game.pos.y.toFixed(2) }));
    bar.push(st.bar);
    if (!st.on){ ready = { after: (Date.now() - t0) / 1000, ui: st.ui, y: st.y, text: st.text }; break; }
  }
  const r1b = await page.evaluate(() => { const g = window.__game, api = window.__api; return { ui: g.ui, hidden: document.getElementById('loadscreen').classList.contains('hidden'), ground: api.groundReadyAt(g.pos.x, g.pos.y, g.pos.z), pending: api.loadSys.pending(), hud: !document.getElementById('hud').classList.contains('hidden') }; });
  console.log('1. loading   :', JSON.stringify({ start: r1a, escStill, ready, bar: bar.filter((v, i) => i % 3 === 0).join(' '), end: r1b }));
  // 2. the hold: teleported onto ground that is not meshed, the player stands still until it is
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.fly = false;
    const x = g.pos.x + 900, z = g.pos.z + 900, y = g.gen.height(x, z) + 6;
    g.pos.set(x, y, z); g.vel.set(0, 0, 0); g.forceStream = true;
    const readyBefore = api.groundReadyAt(x, y, z);
    for (let i = 0; i < 30; i++) api.updatePlayer(1 / 60);
    const held = { y: +(g.pos.y - y).toFixed(3), holdT: +(g.holdT || 0).toFixed(2), toast: document.getElementById('toast').textContent };
    return { readyBefore, held };
  });
  await page.waitForTimeout(200);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  await settle(6);
  const r2b = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const y0 = g.pos.y;
    const ready = api.groundReadyAt(g.pos.x, g.pos.y, g.pos.z);
    for (let i = 0; i < 90; i++) api.updatePlayer(1 / 60);
    return { readyAfter: ready, fell: +(y0 - g.pos.y).toFixed(2), grounded: g.grounded, holdT: +(g.holdT || 0).toFixed(2) };
  });
  console.log('2. the hold  :', JSON.stringify(Object.assign(r2, r2b)));
  // 3. a frame that throws does not stop the loop
  const r3a = await page.evaluate(() => { const g = window.__game; g.testThrow = 1; return g.frameErrs || 0; });
  let r3b = null;
  for (let i = 0; i < 40; i++){ await page.waitForTimeout(250); r3b = await page.evaluate(() => { const g = window.__game; return { frameErrs: g.frameErrs || 0, toast: document.getElementById('toast').textContent }; }); if (r3b.frameErrs) break; }
  const f0 = await page.evaluate(() => window.__game.lastFrameT);
  r3b.looping = false;
  for (let i = 0; i < 40 && !r3b.looping; i++){ await page.waitForTimeout(250); r3b.looping = await page.evaluate(f => window.__game.lastFrameT > f, f0); }
  console.log('3. hiccup    :', JSON.stringify({ before: r3a, after: r3b }));
  // 4. a fresh world, sprinting off the moment it opens: no page errors
  await page.evaluate(() => { window.__api.quitToTitle(); });
  await page.waitForTimeout(500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b64b'); await page.fill('#newWorldSeed', '11');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn');
  await page.waitForTimeout(300);
  const r4 = await page.evaluate(() => { const g = window.__game, api = window.__api; api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.keys['KeyW'] = true; g.keys['ShiftLeft'] = true; g.yaw = 0.7; return { ui: g.ui }; });
  await page.waitForTimeout(12000);
  const r4b = await page.evaluate(() => { const g = window.__game; g.keys['KeyW'] = false; g.keys['ShiftLeft'] = false; return { moved: +Math.hypot(g.pos.x, g.pos.z).toFixed(0), frameErrs: g.frameErrs || 0, holds: +(g.holdT || 0).toFixed(1), y: +g.pos.y.toFixed(1), ground: +g.gen.height(g.pos.x, g.pos.z).toFixed(1) }; });
  console.log('4. early run :', JSON.stringify(Object.assign(r4, r4b)));
  console.log('console errors:', cons.length ? cons.slice(0, 3).join(' | ') : 'none');
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
