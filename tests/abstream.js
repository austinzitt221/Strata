// the streaming disc on two builds: the same chunks empty, banded and queued
const { chromium } = require('playwright');
const run = async (FILE) => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 320, height: 180 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file://' + FILE); await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','ab'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const g = window.__game, C = window.__CORE, T = g.terrain;
    const gens = { earth: T.gen, alien: C.makeGen(7, 'alien'), moon: C.makeGen(7, 'moon') };
    const out = {};
    for (const pl of ['earth', 'alien', 'moon']){
      T.gen = gens[pl]; T.wInfo = null; T._band = null;
      for (const [k, ch] of T.chunks) if (ch.mesh) T.scene.remove(ch.mesh);
      T.chunks.clear(); T.dirty.clear();
      let h = 0; const cnt = { empty: 0, banded: 0, dirty: 0, other: 0 };
      const P = [[0, 0], [-20, 20], [300, -150], [1300, 1300], [-900, 400]];
      for (const [x, z] of P){
        const y = T.gen.height(x, z);
        for (const dy of [2, 60, -70]){
          T.update(x, y + dy, z);
          const keys = [...T.chunks.keys()].sort();
          for (const k of keys){ const ch = T.chunks.get(k); const st = ch.empty ? 1 : ch.banded ? 2 : T.dirty.has(k) ? 3 : 4; h = (Math.imul(h, 31) + st + k.length * 7 + k.charCodeAt(k.length - 1)) | 0; }
        }
      }
      for (const [k, ch] of T.chunks){ if (ch.empty) cnt.empty++; else if (ch.banded) cnt.banded++; else if (T.dirty.has(k)) cnt.dirty++; else cnt.other++; }
      out[pl] = { h, n: T.chunks.size, cnt };
    }
    T.gen = gens.earth;
    return out;
  });
  await b.close();
  return { r, errs: errs.slice(0, 3) };
};
(async () => {
  const A = await run(process.argv[2]), B = await run(process.argv[3]);
  console.log('A', JSON.stringify(A)); console.log('B', JSON.stringify(B));
  console.log(JSON.stringify(A.r) === JSON.stringify(B.r) ? 'SAME' : 'DIFFERENT');
})();
