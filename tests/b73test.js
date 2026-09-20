const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b73'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; });
  await page.waitForTimeout(1500);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const R0 = g.gen.regionAt(g.pos.x, g.pos.z), R1 = g.gen.regionAt(g.pos.x + 3, g.pos.z - 2);
    const names = {}; let ok = true;
    for (let r = 0; r < 6000 && Object.keys(names).length < 8; r += 150) for (let a = 0; a < 6.28; a += 0.5){
      const R = g.gen.regionAt(g.pos.x + Math.cos(a) * r, g.pos.z + Math.sin(a) * r);
      const nm = api.regionNameOf(R);
      names[R.arch] = nm;
      // the word is the archetype's own
      const W = api.REGION_WORDS[R.arch].map(w => w.replace('{}', ''));
      if (!W.some(w => nm.startsWith(w.split(' ')[0]) || nm.endsWith(w.trim().split(' ').pop()))) ok = false;
    }
    return { same: R0.key === R1.key && api.regionNameOf(R0) === api.regionNameOf(R1), here: api.regionNameAt(g.pos.x, g.pos.z), byArch: names, wordsFit: ok, distinct: new Set(Object.values(names)).size === Object.keys(names).length };
  });
  console.log('1. names     :', JSON.stringify(r1));
  await page.waitForTimeout(1500);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const hud = document.getElementById('navpos').textContent;
    // the map: explored cells round the spawn get a name once
    for (let dx = -8; dx <= 8; dx++) for (let dz = -8; dz <= 8; dz++) g.explored.add((Math.floor(g.pos.x / 16) + dx) + ',' + (Math.floor(g.pos.z / 16) + dz));
    api.openMap(); api.drawMap();
    const cached = g.mapRegionCache ? g.mapRegionCache.size : 0;
    api.closeOverlay();
    return { hud, hudHasName: hud.includes(api.regionNameAt(g.pos.x, g.pos.z)), cached };
  });
  console.log('2. hud & map :', JSON.stringify(r2));
  const r3 = await page.evaluate(() => {
    const A = window.__api.AudioSys, C = window.__CORE; A.init();
    const tried = [];
    for (const m of ['SNOW', 'PLANKS', 'SWOOD', 'MUD', 'PEAT', 'GRASS', 'DRYGRASS', 'SAND', 'ROCK', 'STONEBRICK', 'BASALT']){ try { A.sfx('step', C.MAT[m]); tried.push(m); } catch (e){ tried.push(m + '!'); } }
    return { steps: tried.join(' ') };
  });
  console.log('3. steps     :', JSON.stringify(r3));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
