const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b66'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshHotbar(); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  // 1. the plan: five a side, one tower, ten halls, the pit and the casino
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api;
    const cs = api.citySys.candidatesNear(g.pos.x, g.pos.z, 4000).sort((a, c) => Math.hypot(a.x - g.pos.x, a.z - g.pos.z) - Math.hypot(c.x - g.pos.x, c.z - g.pos.z));
    const out = [];
    for (const c of cs.slice(0, 3)){
      const P = api.citySys.plan(c);
      const kinds = {}; for (const t of P.blocks) kinds[t.kind] = (kinds[t.kind] || 0) + 1;
      const roles = P.blocks.filter(t => t.kind === 'hall').map(t => t.role).sort();
      const ring1 = P.blocks.filter(t => Math.max(Math.abs(t.bx), Math.abs(t.bz)) === 1).map(t => t.kind === 'hall' ? t.role : t.kind).sort();
      const v1 = api.citySys.planV1(c), old = api.citySys.plan(c, { stamped: true, towers: [1] });
      out.push({ n: P.n, v2: P.v2, blocks: P.blocks.length, kinds, roles: roles.join(' '), ring1: ring1.join(' '), towerFloors: P.blocks.find(t => t.kind === 'tower').floors, oldN: old.n, v1N: v1.n, oldTowers: old.blocks.filter(t => t.kind === 'tower').length });
    }
    window.__C = cs[0];
    return out;
  });
  console.log('1. the plan  :', JSON.stringify(r1));
  // 2. laid: the halls stand on their blocks, the plaza is clear, the keepers have their posts
  await page.evaluate(() => { const g = window.__game, c = window.__C; g.pos.set(c.x + 40, g.gen.height(c.x + 40, c.z + 40) + 30, c.z + 40); g.forceStream = true; });
  await settle(2);
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, c = window.__C;
    api.citySys.ensure();
    const rec = g.cities['c' + c.key];
    const H = rec.houses || [];
    const roles = {}; for (const h of H) roles[h.role] = (roles[h.role] || 0) + 1;
    const near = (x, z, r) => Math.abs(x - c.x) < r && Math.abs(z - c.z) < r;
    // union edits taller than 4 m inside the plaza block: only the obelisk
    const plazaTall = g.edits.filter(e => e.op === 1 && near(e.x, e.z, 16) && (e.sy || e.size) >= 4).map(e => e.size);
    const counters = game_pn(g).filter(n => n.t === 'counter' && near(n.x, n.z, 120)).length;
    const peds = game_pn(g).filter(n => n.t === 'ped' && n.shop && near(n.x, n.z, 120)).length;
    const signs = game_pn(g).filter(n => n.t === 'sign' && near(n.x, n.z, 120)).map(n => (n.text || '').split('\n')[0]);
    function game_pn(gg){ return gg.pnodes || []; }
    const towers = rec.towers.filter(t => t.kind === 'tower');
    const posts = H.filter(h => h.hall && h.post).map(h => h.role).sort().join(' ');
    const shopsNoPost = H.filter(h => h.hall && !h.post).map(h => h.role).sort().join(' ');
    // a hall's door is on its plaza side: the door cut sits between the block centre and the plaza
    const hall = rec.towers.find(t => t.kind === 'hall' && t.role === 'mayor');
    const hx = c.x + hall.bx * 36, hz = c.z + hall.bz * 36;
    const doorCut = g.edits.find(e => e.op === 0 && (e.sy || e.size) === 3.0 && Math.abs(e.x - hx) <= 8 && Math.abs(e.z - hz) <= 8 && Math.hypot(e.x - c.x, e.z - c.z) < Math.hypot(hx - c.x, hz - c.z));
    window.__HALL = { x: hx, z: hz };
    return { v2: rec.v2, n: rec.n, towers: towers.length, roles, plazaTall, counters, peds, signs: signs.filter(t => /TOWN HALL|HERALD|MAPS|EXCHANGE|BANK|BROKER|ARMS|TOOLSMITH|ELECTRICIAN|GROCER/i.test(t)).length, posts, shopsNoPost, mayorDoorOnPlazaSide: !!doorCut, arcs: [rec.arc7, rec.arc8, rec.arc9, rec.arc10, rec.arc12].join('') };
  });
  console.log('2. laid      :', JSON.stringify(r2));
  // 3. the deed finds the one tower; the far mesh carries the halls
  const r3 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, c = window.__C, rec = g.cities['c' + c.key];
    let bi = -1, bd = 1e9;
    rec.towers.forEach((t2, i) => { if (t2.kind && t2.kind !== 'tower') return; const d = Math.hypot(rec.x + t2.bx * 36 - g.pos.x, rec.z + t2.bz * 36 - g.pos.z); if (d < bd){ bd = d; bi = i; } });
    const shapes = api.farShapeSys.shapes().filter(q => Math.abs(q.x - c.x) < 100 && Math.abs(q.z - c.z) < 100);
    const hallBoxes = shapes.filter(q => q.sy === 5.0).length, towerBoxes = shapes.filter(q => q.sy > 30).length;
    return { deedTower: bi >= 0 && rec.towers[bi].kind === 'tower', hallBoxes, towerBoxes, wallPoint: !!api.siegeSys.wallPoint(rec, c.x + 70, c.z + 70) };
  });
  console.log('3. deed/far  :', JSON.stringify(r3));
  // a look across the plaza at the town hall
  await page.evaluate(() => { const g = window.__game, c = window.__C, Hh = window.__HALL; g.pos.set(c.x - (Hh.x - c.x) * 0.9, g.cities['c' + c.key].gy + 9, c.z - (Hh.z - c.z) * 0.9); g.yaw = Math.atan2(-(Hh.x - g.pos.x), -(Hh.z - g.pos.z)); g.pitch = -0.22; g.forceStream = true; });
  await settle(10);
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: __dirname + '/b66_plaza.png' });
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
