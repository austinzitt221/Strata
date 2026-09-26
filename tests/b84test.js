const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b84'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  const fly = async (to) => {
    await page.evaluate((to) => { const g = window.__game, api = window.__api; let r = g.driving; if (!r){ r = g.entities.find(e => e.type === 'rocket'); if (!r){ r = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); r.charge = 100; } api.enterCar(r); } const F = { phase: 'fadein', t: 0, e: r, from: g.planet, to, h0: 0, burn: true }; api.spaceSys.flight = F; api.spaceSys.arrive(F); }, to);
    for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.story = { word: 1, stage: 2, translator: 1 }; window.__api.addStackItem('translator', 1); });
  await fly('moon'); await fly('site');
  await page.evaluate(() => { window.__click = (re) => { const row = [...document.querySelectorAll('#tradelist .craftrow')].find(r => re.test(r.textContent)); if (row) row.click(); return !!row; }; });
  // 1. Kro's upgrades
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true; api.siteSys.tick(2);
    for (let i = 0; i < 4; i++) api.siteSys.build(i);
    const K = g.entities.find(e => e.type === 'alien' && e.cast === 'builder');
    api.talkTo(K);
    const rows0 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 24));
    const t0 = game_counts();
    window.__click(/THE WORKSHOP/); window.__click(/THE GRID/); window.__click(/THE PENTHOUSE/);
    const rows1 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 24));
    api.closeOverlay();
    const t1 = game_counts();
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    function game_counts(){ return { tables: g.tables.length, stoves: g.stoves.length, pnodes: (g.pnodes || []).length, bulbs: g.bulbs.length, wires: (g.wires || []).length, beds: g.beds.length, beacons: g.beacons.length }; }
    const gen = (g.pnodes || []).find(n => n.t === 'gen2');
    return { rows0, rows1, before: t0, after: t1, gen: gen && { fuel: gen.fuel && gen.fuel.count }, up: g.story.st2.up, penthouse: { air: sdf(8, 23, 8) > 0, hatch: sdf(8, 20.2, 8) > 0, wall: sdf(8, 23, 2.4) < 0, window: sdf(8.75, 23.4, 13.6) > 0 } };
  });
  console.log('1. Kro       :', JSON.stringify(r1));
  // 2. Sef: a room, a villager and an alien housed
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const S = g.entities.find(e => e.type === 'alien' && e.cast === 'roomer');
    api.talkTo(S);
    const rows0 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 22));
    window.__click(/ROOM on the ring north/); window.__click(/ROOM on the quarters north/);
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    const geo = { roomAir: sdf(33, 8, -10) > 0, door: sdf(29, 7.8, -10) > 0, wall: sdf(33, 8, -13.6) < 0 };
    api.addStackItem('coin', 1);
    const i1 = g.slots.findIndex(q => !q); g.slots[i1] = { kind: 'spawner', ent: 'villager', name: 'Tam', rec: { role: 'walker' } };
    const i2 = g.slots.findIndex((q, i) => !q && i !== i1); g.slots[i2] = { kind: 'spawner', ent: 'alien', name: null, rec: { cast: 'relics' } };
    const i3 = g.slots.findIndex((q, i) => !q && i !== i1 && i !== i2); g.slots[i3] = { kind: 'spawner', ent: 'grazer', rec: {} };
    api.tradeSys.refresh();
    const rows1 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 22));
    window.__click(/PUT TAM HERE/);
    const rows2 = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 22));
    const putAlien = window.__click(/PUT ALIEN HERE/);
    api.closeOverlay();
    const tam = g.entities.find(e => e.st2 === 'r0'), al = g.entities.find(e => e.st2 === 'q0');
    return { rows0, geo, rows1, rows2, putAlien, tam: tam && { type: tam.type, name: tam.sname, roam: tam.roam, post: tam.post && [tam.post.x, tam.post.z] }, alien: al && al.type, spawnersLeft: g.slots.filter(q => q && q.kind === 'spawner').map(q => q.ent), rooms: g.story.st2.rooms };
  });
  console.log('2. Sef       :', JSON.stringify(r2));
  // 3. Umma: a pen and a tank; the right beasts in each; and a second visit
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const U = g.entities.find(e => e.type === 'alien' && e.cast === 'keeper');
    api.talkTo(U);
    window.__click(/PEN on the ring, south/); window.__click(/TANK on the ring, north/);
    const i = g.slots.findIndex(q => !q); g.slots[i] = { kind: 'spawner', ent: 'croc', rec: {} };
    api.tradeSys.refresh();
    const rows = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 26));
    const putGrazer = window.__click(/PUT GRAZER HERE/);
    const putCroc = window.__click(/PUT CROCODILE HERE/);
    api.closeOverlay();
    const sdf = (x, y, z) => C.evalSDF(x, y, z, g.edits, g.gen);
    return { rows, putGrazer, putCroc, pens: g.story.st2.pens, grazer: !!g.entities.find(e => e.type === 'grazer' && e.st2 === 'p0'), croc: !!g.entities.find(e => e.type === 'croc' && e.st2 === 'p1'), penGeo: { air: sdf(22, 8, 21) > 0, bars: sdf(22, 8, 25.6) < 0, gap: sdf(22.6, 8, 25.6) > 0, sill: sdf(22, 6.6, 16.4) < 0, doorway: sdf(22, 8.4, 16) > 0 } };
  });
  console.log('3. Umma      :', JSON.stringify(r3));
  await settle(5);
  await page.evaluate(() => { const g = window.__game; g.pos.set(48, 14, -46); g.yaw = Math.atan2(-(22 - g.pos.x), -(0 - g.pos.z)); g.pitch = -0.05; g.camView = 0; g.forceStream = true; });
  await settle(6); await page.screenshot({ path: __dirname + '/b84_lived.png' });
  await fly('moon'); await fly('site');
  const r4 = await page.evaluate(() => { const g = window.__game, api = window.__api; api.exitCar(); api.siteSys.tick(2); api.siteSys.tick(2); const res = g.entities.filter(e => e.st2).map(e => e.type + '@' + e.st2).sort(); const tam = g.entities.find(e => e.st2 === 'r0'); let title = ''; if (tam){ api.talkTo(tam); title = document.getElementById('tradetitle') ? document.getElementById('tradetitle').textContent : ''; api.closeOverlay(); } return { residents: res, title, up: g.story.st2.up }; });
  console.log('4. again     :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
