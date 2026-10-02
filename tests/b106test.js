const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b106'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, FS = api.fenceSys;
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    const yx = Math.round(p.x / 2) * 2 + 10, yz = Math.round(p.z / 2) * 2 + 1;   // x0 even, z0 odd
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 24, yz, 34, 0, 0)); api.applyEdit(C.makeEdit(1, 1, yx, gy - 6, yz, 34, 0, C.MAT.GRASS)); g.terrain.process(200);
    const top = gy + 11;
    g.fences = [];
    for (const dx of [0, 2, 4, 6]){ FS.add(yx + dx, top, yz, 0, false); FS.add(yx + dx, top, yz + 8, 0, false); }
    for (const dz of [1, 3, 5, 7]){ FS.add(yx - 1, top, yz + dz, Math.PI / 2, false); FS.add(yx + 7, top, yz + dz, Math.PI / 2, false); }
    const pen = g.fences.map(f => [f.x, f.z, +f.yaw.toFixed(2)]);
    const s = api.spawnEntity('sheep', yx + 3, top + 0.7, yz + 4);
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'tomato', count: 10 };
    g.pos.set(yx + 3, top + 0.7, yz - 5); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
    let hops = 0, minZ = 1e9, escapedAt = -1, log = [];
    const inside = () => s.x > yx - 1 && s.x < yx + 7 && s.z > yz && s.z < yz + 8;
    for (let i = 0; i < 900; i++){
      // the lure needs the player within 9 m: move the player round the pen every 300 frames
      if (i === 300){ g.pos.set(yx + 12, top + 0.7, yz + 4); } if (i === 600){ g.pos.set(yx + 3, top + 0.7, yz + 13); }
      g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
      const vy0 = s.vy;
      api.updateEntities(0.05, performance.now());
      if (s.vy > 3 && vy0 <= 3) hops++;
      minZ = Math.min(minZ, s.z);
      if (escapedAt < 0 && !inside()){ escapedAt = i; log.push({ i, x: +s.x.toFixed(2), y: +(s.y - top).toFixed(2), z: +s.z.toFixed(2), vx: +s.vx.toFixed(2), vz: +s.vz.toFixed(2), vy: +s.vy.toFixed(2) }); }
      if (i % 100 === 0) log.push({ i, x: +(s.x - yx).toFixed(2), y: +(s.y - top).toFixed(2), z: +(s.z - yz).toFixed(2), vy: +s.vy.toFixed(1) });
    }
        // the gate lets it out
    FS.remove(g.fences.find(f => f.x === yx + 2 && f.z === yz)); const gate = FS.add(yx + 2, top, yz, 0, true);
    gate.open = 1; g.pos.set(yx + 3, top + 0.7, yz - 5); s.x = yx + 2.2; s.z = yz + 2; s.vx = s.vz = 0;
    let out = -1; for (let i = 0; i < 300; i++){ api.updateEntities(0.05, performance.now()); if (s.z < yz - 0.5){ out = i; break; } }
    // bodies: six husks on one spot fan out; two sheep part; the far plot's stalks stay
    const H = []; for (let i = 0; i < 6; i++){ const h = api.spawnEntity('husk', yx + 3, top + 0.7, yz + 4); h.noburn = 1; H.push(h); }
    g.timeOfDay = 0.6; api.updateDayNight(0);
    for (let i = 0; i < 40; i++) api.updateEntities(0.05, performance.now());
    let minPair = 1e9; for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) if (g.entities.includes(H[i]) && g.entities.includes(H[j])) minPair = Math.min(minPair, Math.hypot(H[i].x - H[j].x, H[i].z - H[j].z));
    const alive = H.filter(h => g.entities.includes(h)).length;
    // the shader cut is a sphere now
    const cut = (document.documentElement.outerHTML.match(/distance\(vPos, uPlayerPos\) < 24.0/g) || []).length;
    // farmhands wait on a ripe plot
    const P = api.pnodeSys; const plot = P.add('plot', yx + 3, top, yz + 20, 0, { crop: 'wheat', stage: 3, water: 1, gt: 0, ripeT: 0 });
    const v = api.spawnEntity('villager', yx + 3, top + 0.7, yz + 18); v.crew = { mode: 'stay', tool: { kind: 'hoe' }, bag: new Array(8).fill(null), arm: {}, pack: {}, home: { x: yx + 3, z: yz + 18 }, r: 3, tasks: [], job: null };
    const early = api.crewSys.farmJob(v); plot.ripeT = 25; const late = api.crewSys.farmJob(v);
    return { pen: pen.length, hops, escapedAt, inside: inside(), out, minPair: +minPair.toFixed(2), alive, cut, early: early && early.kind, late: late && late.kind };
  });
  console.log('1. the pen, the bodies:', JSON.stringify(r));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
