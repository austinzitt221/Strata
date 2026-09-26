const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b97'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, B = api.breedSys, D = api.ENT_DEF;
    const p = g.pos, gy = g.gen.height(p.x, p.z);
    for (const e of [...g.entities]) if (B.passive(e)) api.killEntity(e, false);
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'tomato', count: 3 }; api.refreshHotbar();
    const a = api.spawnEntity('sheep', p.x + 7, gy + 0.5, p.z), c = api.spawnEntity('sheep', p.x + 8, gy + 0.5, p.z + 1.5);
    const holding = B.holding();
    // the lure: with the tomatoes in hand it comes
    let now = performance.now(); const d0 = Math.hypot(a.x - p.x, a.z - p.z);
    for (let i = 0; i < 100; i++){ now += 50; api.updateEntities(0.05, now); }
    const d1 = Math.hypot(a.x - p.x, a.z - p.z);
    // meat in hand: it does not
    g.slots[0] = { kind: 'meat', count: 3 }; const meat = B.holding(); a.x = p.x + 7; a.z = p.z; a.vx = a.vz = 0;
    for (let i = 0; i < 60; i++){ now += 50; api.updateEntities(0.05, now); }
    const d2 = Math.hypot(a.x - p.x, a.z - p.z);
    g.slots[0] = { kind: 'tomato', count: 3 };
    // feed one, then the other, by hand and by click
    const f1 = B.feed(a), left1 = g.slots[0].count;
    const notTwice = B.feed(a);
    g.yaw = Math.atan2(-(c.x - p.x), -(c.z - p.z)); g.pitch = 0; c.x = p.x - Math.sin(g.yaw) * 2.5; c.z = p.z - Math.cos(g.yaw) * 2.5; c.y = gy + 0.5;
    return { holding, meat, d0: +d0.toFixed(1), d1: +d1.toFixed(1), d2: +d2.toFixed(1), f1, left1, notTwice, fedA: a.fedT };
  });
  console.log('1. the lure  :', JSON.stringify(r1));
  await page.waitForTimeout(300);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, B = api.breedSys, D = api.ENT_DEF;
    const p = g.pos;
    const sheep = g.entities.filter(e => e.type === 'sheep');
    const c = sheep[1], a = sheep[0];
    const clicked = { canFeed: B.canFeed(c), fedC: B.feed(c) && c.fedT, left: g.slots[0] ? g.slots[0].count : 0 };   // (the click path is one line: canFeed, then feed)
    // together: a baby
    a.x = c.x + 1.5; a.z = c.z; a.fedT = 30; c.fedT = 30;
    const n0 = g.entities.filter(e => e.type === 'sheep').length;
    B.accT = 5; B.tick(0.1);
    const babies = g.entities.filter(e => e.type === 'sheep' && e.grow > 0);
    const baby = babies[0];
    const born = { sheep: g.entities.filter(e => e.type === 'sheep').length - n0, grow: baby && baby.grow, big: baby && +baby.big.toFixed(2), hp: baby && baby.hp, rest: [a.bredT, c.bredT], fedCleared: [a.fedT, c.fedT] };
    const resting = B.feed(a);
    const babyFeed = B.feed(baby);
    // it grows
    for (let k = 0; k < 60; k++){ B.accT = 5; B.tick(4.2); }
    const grown = { grow: baby.grow, big: baby.big, hp: baby.hp };
    // the save carries the growing
    baby.grow = 100; const sv = api.buildSaveData().entities.find(r => r[0] === 'sheep' && r[10] === 100);
    return { clicked, born, resting, babyFeed, grown, saved: !!sv };
  });
  console.log('2. the baby  :', JSON.stringify(r2));
  await page.evaluate(() => { const g = window.__game; const p = g.pos; const sheep = g.entities.filter(e => e.type === 'sheep'); const gy = g.gen.height(p.x, p.z); sheep.forEach((e, i) => { e.x = p.x + 3 + i * 1.6; e.z = p.z - 4 + i * 1.2; e.y = gy + 0.5; e.vx = e.vz = 0; e.fedT = i < 2 ? 30 : 0; }); if (sheep[2]){ sheep[2].grow = 200; sheep[2].big = 0.5; } g.camView = 0; g.fly = true; g.pos.y = gy + 1.8; g.yaw = Math.atan2(-(sheep[1].x - p.x), -(sheep[1].z - p.z)); g.pitch = 0.05; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await page.waitForTimeout(1500); await page.screenshot({ path: __dirname + '/b97_sheep.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
