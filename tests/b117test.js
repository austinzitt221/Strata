// Build 117: THE TOOL WHEEL, and birds and fish in detail
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b117'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(2);
  const rdown = () => page.evaluate(() => document.dispatchEvent(new MouseEvent('mousedown', { button: 2 })));
  const rup = () => page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseup', { button: 2 })));
  // held: wait for the wheel (a headless frame takes a second and can hold the timer back)
  const hold = async () => { await rdown(); for (let i = 0; i < 40; i++){ await page.waitForTimeout(100); if (await page.evaluate(() => window.__game.ui === 'wheel')) break; } await rup(); };

  // 1. a tap still steps the shape; a hold opens the wheel
  const r1 = {};
  await page.evaluate(() => { const g = window.__game, C = window.__CORE; for (let i = 0; i < 10; i++) g.slots[i] = null; g.slots[0] = C.makeDrill(7); g.hotSel = 0; g.tool.shape = 1; window.__api.refreshToolHUD(); });
  await rdown(); await rup();
  r1.tap = await page.evaluate(() => ({ shape: window.__CORE.SHAPE_NAME[window.__game.tool.shape], ui: window.__game.ui }));
  await rdown(); for (let i = 0; i < 40; i++){ await page.waitForTimeout(100); if (await page.evaluate(() => window.__game.ui === 'wheel')) break; }
  r1.hold = await page.evaluate(() => ({ ui: window.__game.ui, shown: !document.getElementById('wheelscreen').classList.contains('hidden'), shapes: document.querySelectorAll('#wheelscreen .wshape').length, locked: document.querySelectorAll('#wheelscreen .wshape.locked').length, title: document.getElementById('wheeltitle').textContent }));
  await rup();
  r1.afterRelease = await page.evaluate(() => ({ ui: window.__game.ui, shape: window.__CORE.SHAPE_NAME[window.__game.tool.shape] }));
  console.log('1. the button :', JSON.stringify(r1));

  // 2. by the mouse: a shape, a locked shape, the size, the turn, the grid, the mirror
  await page.click('#wheelscreen .wshape[data-shape="7"]');
  await page.click('#wheelscreen .wshape[data-shape="10"]', { force: true });   // astrium has no building: nothing happens
  const r2 = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, set = (i, v) => { i.value = v; i.dispatchEvent(new Event('input')); };
    const out = { shape: C.SHAPE_NAME[g.tool.shape] };
    const sl = [...document.querySelectorAll('#wheelscreen input[type=range]')];
    out.sliders = sl.length;
    set(sl[0], 1000); out.sizeMax = +C.effSize(g.tool.size, 7).toFixed(2); out.cap = C.tierCap(7);
    set(sl[0], 0); out.sizeMin = +C.effSize(g.tool.size, 7).toFixed(3);
    set(sl[0], 600); out.sizeMid = +C.effSize(g.tool.size, 7).toFixed(2);
    set(sl[2], 90); out.yawDeg = Math.round(g.tool.rot * 180 / Math.PI);
    const btns = [...document.querySelectorAll('#wheelscreen .wbtn')];
    btns.find(b => b.textContent === '4m').click(); out.grid = { on: g.snapOn, size: C.GRID_SIZES[g.gridIdx] };
    return out;
  });
  await page.evaluate(() => { const g = window.__game; g.ghostPos = { x: g.pos.x, y: g.pos.y, z: g.pos.z - 5 }; [...document.querySelectorAll('#wheelscreen .wbtn')].find(b => b.textContent === 'OFF' && b.parentElement.parentElement.firstChild.textContent === 'plane').click(); });
  r2.mirror = await page.evaluate(() => !!window.__game.tool.mirror);
  await page.evaluate(() => [...document.querySelectorAll('#wheelscreen .wbtn')].find(b => b.textContent === '×6').click());
  r2.radial = await page.evaluate(() => window.__game.tool.radial && window.__game.tool.radial.n);
  r2.echoLocked = await page.evaluate(() => /vehlite/.test(document.getElementById('wheelbody').textContent));
  console.log('2. the choices:', JSON.stringify(r2));
  await page.screenshot({ path: __dirname + '/b117_wheel.png' });

  // 3. closing: E, Esc, and a right click in the wheel
  await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
  const r3 = { e: await page.evaluate(() => window.__game.ui) };
  await hold();
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  r3.esc = await page.evaluate(() => window.__game.ui);
  await hold();
  await page.evaluate(() => document.getElementById('wheelscreen').dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })));
  r3.rmb = await page.evaluate(() => window.__game.ui);
  // vehlite: echo; a dispenser: its mode; a stone drill: the size in steps
  await page.evaluate(() => { const g = window.__game, C = window.__CORE; g.tool.mirror = null; g.tool.radial = null; g.dispSlot = C.makeDispenser(11); g.slots[0] = C.makeStack(C.MAT.STONEBRICK, 200); });
  await hold();
  r3.vehlite = await page.evaluate(() => {
    const g = window.__game, set = (i, v) => { i.value = v; i.dispatchEvent(new Event('input')); };
    const labels = [...document.querySelectorAll('#wheelscreen .wrow label')].map(l => l.textContent);
    const sl = [...document.querySelectorAll('#wheelscreen .wrow')].find(r => r.firstChild.textContent === 'copies').querySelector('input');
    set(sl, 5);
    [...document.querySelectorAll('#wheelscreen .wbtn')].find(b => b.textContent === 'PAINT').click();
    return { echo: g.tool.echo, mode: g.tool.mode, hasGap: labels.includes('gap'), locked: document.querySelectorAll('#wheelscreen .wshape.locked').length };
  });
  await page.keyboard.press('KeyE');
  await page.evaluate(() => { const g = window.__game, C = window.__CORE; g.tool.mode = 'build'; g.tool.echo = 1; g.slots[0] = C.makeDrill(0); });
  await hold();
  r3.stone = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, set = (i, v) => { i.value = v; i.dispatchEvent(new Event('input')); };
    const sl = document.querySelector('#wheelscreen input[type=range]'); set(sl, sl.max);
    return { max: +sl.max, size: C.effSize(g.tool.size, 0), cap: C.tierCap(0), text: document.getElementById('wheelbody').textContent.includes('iron tools and up turn the shape'), shapes: document.querySelectorAll('#wheelscreen .wshape:not(.locked)').length };
  });
  await page.keyboard.press('KeyE');
  console.log('3. closing    :', JSON.stringify(r3));

  // 4. the birds and the fish: as built as the animals, the birds bigger
  const r4 = await page.evaluate(() => {
    const S = window.__api.shoreSys; S.ensure();
    const tri = m => m.geometry.attributes.position.count / 3;
    return { parts: Object.fromEntries(['gull', 'finch', 'heron'].map(k => [k, S.MODELS[k].body.length + S.MODELS[k].wing.length * 2])), fishParts: S.MODELS.fish.length,
             gullTris: tri(S.meshes.gullB) + 2 * tri(S.meshes.gullL), fishTris: tri(S.meshes.fish), sizes: [S.KINDS.gull.size, S.KINDS.finch.size, S.KINDS.heron.size], draws: Object.keys(S.meshes).length };
  });
  console.log('4. the models :', JSON.stringify(r4));
  // the picture: a landed flock at the water and a school below, close to
  await page.evaluate(() => {
    const g = window.__game, api = window.__api, S = api.shoreSys;
    for (let i = 0; i < 10; i++) g.slots[i] = null; api.refreshToolHUD();
    let w = null, bd = 1e9;
    for (let dx = -200; dx <= 200; dx += 4) for (let dz = -200; dz <= 200; dz += 4){ const x = g.pos.x + dx, z = g.pos.z + dz, W = S.wetAt(x, z); if (!W || W.depth < 1 || W.depth > 3) continue; const d = Math.hypot(dx, dz); if (d < bd){ bd = d; w = { x, z, W }; } }
    S.hide(); S.spawnT = 99;
    g.fly = true; g.pos.set(w.x - 3, w.W.top + 1.4, w.z + 3); g.yaw = Math.PI / 4; g.pitch = -0.55;
    const fx = -Math.sin(g.yaw), fz = -Math.cos(g.yaw);
    const sc = { x: w.x + fx * 1, z: w.z + fz * 1, hd: 0, dart: 0, fish: [] };
    for (let i = 0; i < 7; i++) sc.fish.push({ a: i * 0.9, r: 0.5 + (i % 3) * 0.5, sp: 0.4, fy: 0.5 + (i % 2) * 0.3, dark: i % 3 === 0 });
    S.schools.push(sc);
    for (const kind of ['gull', 'heron', 'finch']){
      const F = S.spawnFlock() || { birds: [] };
      F.kind = kind; F.state = kind === 'finch' ? 'fly' : 'land'; F.landT = 999;
      const off = kind === 'gull' ? 6 : kind === 'heron' ? 8.5 : 5;
      F.x = g.pos.x + fx * off + (kind === 'heron' ? 2.5 : kind === 'finch' ? -1.5 : 0); F.z = g.pos.z + fz * off; F.hx = F.x; F.hz = F.z; F.y = w.W.top + 2.3; F.hd = 1.1;
      F.birds = F.birds.slice(0, kind === 'heron' ? 1 : 4);
      F.birds.forEach((B, i) => { B.lx = (i % 2) * 1.2 - 0.6; B.lz = Math.floor(i / 2) * 1.1 - 0.5; B.ph = 0.4 + i; B.r = 1 + i * 0.4; });
    }
    for (let i = 0; i < 2; i++) S.tick(0.05);
    window.__drawn = { birds: S.birdCount(), fish: S.meshes.fish.count };
  });
  await settle(3);
  await page.evaluate(() => { const S = window.__api.shoreSys; S.spawnT = 99; for (const F of S.flocks) F.landT = 999; });
  await page.screenshot({ path: __dirname + '/b117_fish.png' });
  await page.evaluate(() => { const g = window.__game; g.pitch = -0.12; g.pos.y += 0.6; const S = window.__api.shoreSys; for (let i = 0; i < 2; i++) S.tick(0.05); });
  await settle(2);
  await page.screenshot({ path: __dirname + '/b117_birds.png' });
  console.log('5. the shot   :', JSON.stringify(await page.evaluate(() => window.__drawn)));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
