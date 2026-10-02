// Build 126: one recipe, any kind -- any planks, any stone, any wood
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const C = window.__CORE, M = C.MAT, R = C.RECIPES, out = {};
    const count = k => R.filter(x => x.kind === k).length;
    out.recipes = { stick: count('stick'), stove: count('stove'), chest: count('chest'), stonebrick: R.filter(x => x.kind === 'matout' && x.matOut === M.STONEBRICK).length, planks: R.filter(x => x.kind === 'matout' && C.MAT_GROUPS.planks.includes(x.matOut)).length };
    const slots = () => new Array(40).fill(null);
    const find = (k, mo) => R.find(x => x.kind === k && (mo == null || x.matOut === mo));
    // sticks from jungle planks
    let s = slots(); s[0] = C.makeStack(M.JPLANKS, 2); out.sticks = { res: C.craft(s, find('stick')), sticks: C.countItem(s, 'stick'), jplanksLeft: C.countMat(s, M.JPLANKS) };
    // a stove: 12 stone as 6 granite + 6 sandstone, 4 wood as spruce logs
    s = slots(); s[0] = C.makeStack(M.GRANITE, 6); s[1] = C.makeStack(M.SANDSTONE, 6); s[2] = C.makeStack(M.SWOOD, 4);
    out.stove = { can: C.canCraft(s, find('stove')), res: C.craft(s, find('stove')), stove: C.countItem(s, 'stove'), stoneLeft: C.countMat(s, M.GRANITE) + C.countMat(s, M.SANDSTONE), woodLeft: C.countMat(s, M.SWOOD) };
    // one short: 11 stone
    s = slots(); s[0] = C.makeStack(M.SHALE, 11); s[1] = C.makeStack(M.WOOD, 4); out.short = C.canCraft(s, find('stove'));
    // stone bricks from shale; it takes rock first when you hold both
    s = slots(); s[0] = C.makeStack(M.SHALE, 10); s[1] = C.makeStack(M.ROCK, 2); C.craft(s, find('matout', M.STONEBRICK));
    out.bricks = { bricks: C.countMat(s, M.STONEBRICK), rockLeft: C.countMat(s, M.ROCK), shaleLeft: C.countMat(s, M.SHALE) };
    // sawing a log still makes its own planks, and only from that log
    s = slots(); s[0] = C.makeStack(M.JWOOD, 1); out.saw = { oakFromJungle: C.canCraft(s, find('matout', M.PLANKS)), jungle: C.canCraft(s, find('matout', M.JPLANKS)) };
    out.names = find('stove').costs.map(c => C.costName(c));
    return out;
  });
  console.log('1. recipes:', JSON.stringify(r));
  // the craft screen shows the group
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b126'); await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const t = await page.evaluate(() => { const g = window.__game, api = window.__api, C = window.__CORE; api.loadSys.end(); g.debugLock = true; g.mode = 'survival'; for (let i = 0; i < 40; i++) g.slots[i] = null; g.slots[0] = C.makeStack(C.MAT.LIMESTONE, 30); g.ui = 'none'; api.openCraft(); const txt = [...document.querySelectorAll('.ccost')].map(e => e.textContent).find(x => /stone \(any\)/.test(x)); return txt || null; });
  console.log('2. the screen:', JSON.stringify(t));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
