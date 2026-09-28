// Build 124: THE LONG SHOT -- the pit boss sells it; anything in, anything out, odds shown first
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b124'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.timeOfDay = 0.3; window.__api.updateDayNight(0); for (let i = 0; i < 40; i++) g.slots[i] = null; });
  await settle(2);
  // 1. the pit boss: talk to the croupier, buy it
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    g.slots[0] = { kind: 'coin', count: 3000 };
    api.casinoSys.open({ game: 'boss' });
    const title = document.getElementById('casinotitle').textContent;
    const btn = [...document.querySelectorAll('#casinobtns .btn')].find(x => /BUY THE LONG SHOT/.test(x.textContent));
    btn.click();
    const got = g.slots.some(q => q && q.kind === 'longshot');
    api.closeOverlay();
    return { title, got, coins: window.__CORE.countItem(g.slots, 'coin') };
  });
  console.log('1. the pit boss:', JSON.stringify(r1));
  // 2. the odds: the plank for a thousand diamonds, and friends
  const r2 = await page.evaluate(() => {
    const api = window.__api, L = api.lsSys, C = window.__CORE;
    const plank = { kind: 'mat', mat: C.MAT.PLANKS, count: 1 }, dia = { kind: 'diamond', count: 1 };
    const cases = {
      plankFor1000Diamonds: L.fmt(L.odds(plank, dia, 1000)),
      stack64IngotsFor1Diamond: L.fmt(L.odds({ kind: 'ironingot', count: 64 }, dia, 1)),
      diamondForADiamond: L.fmt(L.odds(dia, dia, 1)),
      coalForANullHeart: L.fmt(L.odds({ kind: 'coal', count: 1 }, { kind: 'nullheart', count: 1 }, 1)),
      rockFor9999999Diamonds: L.fmt(L.odds({ kind: 'mat', mat: C.MAT.ROCK, count: 1 }, dia, 9999999)),
    };
    // the house: over 200,000 pulls at 50% nominal, what comes back per coin staked
    let back = 0; const n = 200000, p = L.odds({ kind: 'coin', count: 100 }, { kind: 'coin', count: 1 }, 94.4);
    for (let i = 0; i < n; i++) if (Math.random() < p) back += 94.4;
    cases.returnPerCoin = +(back / (n * 100)).toFixed(3);
    cases.targets = L.targets().length;
    return cases;
  });
  console.log('2. the odds    :', JSON.stringify(r2));
  // 3. the machine: placed, opened, a stake, a target, a pull
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const pn = window.__LS = api.pnodeSys.add('longshot', g.pos.x + 2, g.gen.height(g.pos.x + 2, g.pos.z - 3), g.pos.z - 3, 0);
    api.lsSys.open(pn);
    pn.inv[0] = { kind: 'ironingot', count: 20 };
    const F = document.getElementById('lsfind'); F.value = 'diamond'; F.dispatchEvent(new Event('input'));
    const rows = [...document.querySelectorAll('#lslist div')];
    const row = rows.find(r => /^diamond  ·/.test(r.textContent));
    row.click();
    const A = document.getElementById('lsamt'); A.value = '2'; A.dispatchEvent(new Event('input'));
    return { list: rows.length, target: api.lsSys.target && api.lsSys.target.name, odds: document.getElementById('lsodds').textContent, pull: !document.getElementById('btnPull').disabled };
  });
  console.log('3. the machine :', JSON.stringify(r3));
  await page.screenshot({ path: __dirname + '/b124_longshot.png' });
  // 4. a pull, rigged both ways: the stake always goes; a win pays
  const r4 = {};
  for (const rig of [0.9999, 0]){
    const res = await page.evaluate((rig) => {
      const g = window.__game, api = window.__api, C = window.__CORE, pn = window.__LS;
      pn.inv[0] = { kind: 'ironingot', count: 20 }; api.lsSys.refresh(true);
      const d0 = C.countItem(g.slots, 'diamond');
      const r0 = Math.random; Math.random = () => rig > 0.5 ? 0.00001 : 0.99999;
      try { document.getElementById('btnPull').click(); } finally { Math.random = r0; }
      return { stakeGone: !pn.inv[0], diamonds: C.countItem(g.slots, 'diamond') - d0 };
    }, rig);
    for (let i = 0; i < 30 && await page.evaluate(() => window.__api.lsSys.spinning); i++) await page.waitForTimeout(300);
    res.reels = await page.evaluate(() => document.getElementById('lsreels').textContent);
    r4[rig ? 'won' : 'lost'] = res;
  }
  console.log('4. the pull    :', JSON.stringify(r4));
  // 5. tools are capped at ten a pull; the save keeps the machine and its stake
  const r5 = await page.evaluate(() => {
    const api = window.__api, L = api.lsSys, C = window.__CORE;
    L.target = L.targets().find(t => t.it.kind === 'drill'); L.amt = 50; L.refresh(true);
    const capped = L.amt;
    window.__LS.inv[0] = { kind: 'coal', count: 5 };
    const d = JSON.parse(JSON.stringify(api.buildSaveData()));
    return { toolCap: capped, saved: (d.pnodes || []).some(n => n.t === 'longshot' && n.inv && n.inv[0] && n.inv[0].kind === 'coal') };
  });
  console.log('5. caps & save :', JSON.stringify(r5));
  // the picture: the machine in the world
  await page.evaluate(() => { const api = window.__api, g = window.__game, pn = window.__LS; api.closeOverlay(); g.ui = 'none'; g.pos.set(pn.x - 1.5, pn.y + 0.1, pn.z + 3.2); const dx = pn.x - g.pos.x, dz = pn.z - g.pos.z; g.yaw = Math.atan2(-dx, -dz); g.pitch = -0.1; });
  await settle(2);
  await page.screenshot({ path: __dirname + '/b124_machine.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
