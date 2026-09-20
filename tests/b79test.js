const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b79'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => {
    window.__api.loadSys.end(); const g = window.__game, api = window.__api; g.debugLock = true; g.ui = 'none'; g.mode = 'creative';
    const e = api.spawnEntity('rocket', g.pos.x + 6, g.gen.height(g.pos.x + 6, g.pos.z) + 0.3, g.pos.z); e.charge = 100; api.enterCar(e);
    const F = { phase: 'fadein', t: 0, e, from: 'earth', to: 'station', h0: 0, burn: true };
    api.spaceSys.flight = F; api.spaceSys.arrive(F);
  });
  for (let i = 0; i < 70; i++){ await page.waitForTimeout(1000); const st = await page.evaluate(() => { const g = window.__game, api = window.__api; g.terrain.process(80); const F = api.spaceSys.flight; if (F && !api.loadSys.on) for (let k = 0; k < 20; k++) api.spaceSys.tick(0.05); return F ? F.phase : null; }); if (!st) break; }
  // 1. the wall of words, then the translator
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.exitCar(); g.fly = true; g.mode = 'survival';
    for (let i = 0; i < 10; i++) g.slots[i] = null; api.refreshHotbar();
    api.stationOneSys.tick(1.1);
    const objs0 = api.objSys ? 'n/a' : null;
    const L = g.entities.find(e => e.type === 'alien' && e.cast === 'leader'), O = g.entities.find(e => e.type === 'alien' && e.cast === 'ores');
    const toastEl = document.getElementById('toast');
    api.talkTo(O); const babble = toastEl.textContent.slice(0, 60);
    const ui0 = g.ui;
    api.talkTo(L); const gift = toastEl.textContent.slice(0, 120);
    const has = C.countItem(g.slots, 'translator');
    api.talkTo(O); const ui1 = g.ui, title = document.getElementById('tradetitle').textContent;
    const rows = document.querySelectorAll('#tradelist .craftrow').length;
    const greet = document.querySelector('#tradelist .craftrow .cname').textContent.slice(0, 40);
    return { babble, ui0, gift, has, ui1, title, rows, greet, role: O.role };
  });
  console.log('1. the words :', JSON.stringify(r1));
  // 2. a sale to Orrun, then the leader's two missions
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    api.addStackItem('lunite', 14); api.addStackItem('astrium', 4);
    const coins0 = C.countItem(g.slots, 'coin');
    const O = api.stationOneSys.offers('ores').find(o => o.sell && o.sell.k === 'lunite');
    api.tradeSys.execute(O);
    const coins1 = C.countItem(g.slots, 'coin'), lun1 = C.countItem(g.slots, 'lunite'), rep1 = api.stationOneSys.rec('ores').rep;
    api.closeOverlay ? api.closeOverlay() : (g.ui = 'none');
    const L = g.entities.find(e => e.type === 'alien' && e.cast === 'leader');
    api.talkTo(L);
    const storyRows0 = document.querySelectorAll('#tradelist .craftrow').length;
    const mrow = [...document.querySelectorAll('#tradelist .craftrow')].find(r => /BLUE STONE/.test(r.textContent));
    const act0 = mrow && mrow.textContent.slice(-12);
    mrow.click();
    const st1 = api.stationOneSys.stage(), coins2 = C.countItem(g.slots, 'coin'), lun2 = C.countItem(g.slots, 'lunite'), repAll = api.stationOneSys.rec('food').rep;
    const mrow2 = [...document.querySelectorAll('#tradelist .craftrow')].find(r => /SHIP'S HEART/.test(r.textContent));
    mrow2.click();
    const st2 = api.stationOneSys.stage(), word = g.story.word, ast = C.countItem(g.slots, 'astrium'), coins3 = C.countItem(g.slots, 'coin');
    const finalRows = [...document.querySelectorAll('#tradelist .craftrow')].map(r => r.textContent.slice(0, 30));
    api.closeOverlay ? api.closeOverlay() : (g.ui = 'none');
    const D = api.buildSaveData();
    return { sale: { coins: coins1 - coins0, lunite: lun1, rep: rep1 }, storyRows0, act0: act0 && act0.trim(), st1, m1: { coins: coins2 - coins1, lunite: lun2, repAll }, st2, word, ast, m2coins: coins3 - coins2, finalRows, saved: { stage: D.story && D.story.stage, castKeys: Object.keys(D.stationCast || {}).length } };
  });
  console.log('2. the story :', JSON.stringify(r2));
  // 3. objectives in their script, and the fruit
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const out = []; api.stationOneSys.objectives(out);
    const withT = out.map(o => o.label);
    for (let i = 0; i < 40; i++) if (g.slots[i] && g.slots[i].kind === 'translator') g.slots[i] = null;
    const out2 = []; api.stationOneSys.objectives(out2);
    api.addStackItem('voidfruit', 2);
    const idx = g.slots.findIndex(s => s && s.kind === 'voidfruit'); g.hotSel = idx; g.hp = 30; g.heal = 0;
    api.tryEat();
    return { withTranslator: withT, without: out2.map(o => o.label), heal: g.heal, buff: g.buff && g.buff.kind, left: C.countItem(g.slots, 'voidfruit') };
  });
  console.log('3. marks+food:', JSON.stringify(r3));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
