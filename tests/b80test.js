const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b80'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  // 1. the site, headless; the route needs the word
  const r1 = await page.evaluate(() => {
    const C = window.__CORE, api = window.__api, g = window.__game;
    api.loadSys.end(); g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    const S = C.makeGen(7, 'site');
    const plating = C.RECIPES.find(r => r.kind === 'matout' && r.matOut === C.MAT.PLATING);
    g.planet = 'moon'; const r0 = api.spaceSys.routes().slice(); g.story = { word: 1 }; const r1 = api.spaceSys.routes().slice(); g.planet = 'earth';
    return { keel: +S.sdf(0, 0, 0).toFixed(1), padTop: S.height(0, -53), padSolid: +S.sdf(0, -1, -53).toFixed(1), space: S.sdf(50, 50, 50), frames: S.frames.length, hr: S.heightRange(-4, -4, 4, 4), plating: plating && plating.costs.map(c => (c.item || c.mat) + 'x' + c.n).join('+') + '=' + plating.yields, moonNoWord: r0, moonWord: r1 };
  });
  console.log('1. the site  :', JSON.stringify(r1));
  // 2. to the site; the frames drawn; Kro builds the hangar for its price (creative pays nothing)
  await fly('moon'); await fly('site');
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const r = g.driving; const landed = r && [+r.x.toFixed(1), +r.y.toFixed(1), +r.z.toFixed(1)];
    api.exitCar(); g.fly = true;
    const wires = api.siteSys.group ? api.siteSys.group.children.length : -1;
    const out0 = []; api.siteSys.objectives(out0);
    api.siteSys.build(0);
    const wires1 = api.siteSys.group ? api.siteSys.group.children.length : -1;
    const out1 = []; api.siteSys.objectives(out1);
    return { planet: g.planet, landed, wires, obj0: out0.map(o => o.label), stage: api.siteSys.stage(), wires1, obj1: out1.map(o => o.label), moonUp: api.skySys.moon.visible, alienUp: api.skySys.alien.visible, hud: document.getElementById('navpos').textContent };
  });
  console.log('2. the build :', JSON.stringify(r2));
  await settle(5);
  await page.evaluate(() => { const g = window.__game; g.pos.set(-30, 14, -40); g.yaw = Math.atan2(-(0 - g.pos.x), -(0 - g.pos.z)); g.pitch = -0.05; g.camView = 0; g.forceStream = true; });
  await settle(5); await page.screenshot({ path: __dirname + '/b80_site.png' });
  // 3. the other three; the station stands; Vehl gives the ship for eight astrium
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    for (let i = 1; i < g.gen.frames.length; i++) api.siteSys.build(i);
    const D = api.buildSaveData();
    return { stage: api.siteSys.stage(), built: g.story.built, wires: api.siteSys.group ? api.siteSys.group.children.length : -1, savedSite: D.story.site, savedBuilt: D.story.built };
  });
  console.log('3. it stands :', JSON.stringify(r3));
  await fly('moon'); await fly('station');
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true; g.story.stage = 2; api.addStackItem('translator', 1); api.addStackItem('astrium', 8);
    api.stationOneSys.tick(1.1);
    const L = g.entities.find(e => e.type === 'alien' && e.cast === 'leader');
    api.talkTo(L);
    const rows0 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 26));
    const mrow = [...document.querySelectorAll('#tradelist .craftrow')].find(r => /SHIP'S HEART/.test(r.textContent));
    mrow.click();
    const ship = g.slots.find(s => s && s.kind === 'rocket2');
    const rows1 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 26));
    const icon = (api.itemIconURL({ kind: 'rocket2', charge: 100 }) || '').length > 100;
    const label = api.itemLabel({ kind: 'rocket2' });
    api.closeOverlay();
    // the blueprint page reads
    let page13 = ''; try { page13 = api.expeditionSys.text(13).slice(0, 40); } catch (e){ page13 = 'ERR ' + e.message; }
    return { rows0, ship: !!ship, stage: api.stationOneSys.stage(), rows1, icon, label, page13, astriumLeft: C.countItem(g.slots, 'astrium') };
  });
  console.log('4. the ship  :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
