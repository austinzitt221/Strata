const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b71'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'creative'; g.fly = true; g.timeOfDay = 0.35; window.__api.updateDayNight(0); for (let i = 0; i < 10; i++) g.slots[i] = null; window.__api.refreshHotbar(); });
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(60); }); } };
  await settle(3);
  // 1. ten creatures, each with a body, on a pad
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    const px = Math.round(g.pos.x), pz = Math.round(g.pos.z), gy = Math.round(g.gen.height(px, pz)) + 3;
    api.applyEdit(C.makeEdit(1, 1, px, gy - 20, pz, 40, C.MAT.STONE, 0)); api.applyEdit(C.makeEdit(0, 1, px, gy + 20, pz, 40, 0, 0));   // a 40 m pad whose top is exactly gy
    for (const e of [...g.entities]) if (api.ENT_DEF && api.ENT_DEF[e.type] && !window.__api.VEH) api.killEntity(e, false);
    const types = ['monkey', 'croc', 'elk', 'hare', 'zebra', 'crawler', 'bogwight', 'wolf', 'frostwisp', 'hyena'];
    const out = {};
    types.forEach((t, i) => {
      const e = api.spawnEntity(t, px - 13 + i * 2.8, gy + 0.6, pz - 4); e.heading = 0.4;
      api.updateEntities(0.05, performance.now());
      let meshes = 0; if (e.mesh) e.mesh.traverse(o => { if (o.isMesh) meshes++; });
      out[t] = meshes;
    });
    window.__PAD = { px, pz, gy };
    g.pos.set(px, gy + 3.5, pz + 9); g.yaw = Math.PI; g.pitch = -0.28; g.forceStream = true;
    return { meshes: out, spawners: window.__api.MENAGERIE_TYPES.length, menagerieHas: types.every(t => window.__api.MENAGERIE_TYPES.includes(t)) };
  });
  console.log('1. bodies    :', JSON.stringify(r1));
  await settle(3);
  await page.evaluate(() => { const g = window.__game; g.camera.position.copy(g.pos); g.camera.position.y += 1.6; g.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); });
  await page.waitForTimeout(700);
  await page.screenshot({ path: __dirname + '/b71_beasts.png' });
  // 2. behaviours: the wolf hunts at night, the croc lunges by day and does not burn, the bogwight burns, the hare flees
  const r2 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, P = window.__PAD;
    for (const e of [...g.entities]) api.killEntity(e, false);
    g.mode = 'survival'; g.fly = false; g.hp = 100; g.ui = 'none';
    g.pos.set(P.px, P.gy + 0.05, P.pz); g.vel.set(0, 0, 0);
    let dmg = 0;
    const run = (n, dt) => { let t = performance.now(); for (let i = 0; i < n; i++){ t += dt * 1000; if (g.hp <= 0 || g.ui === 'dead'){ g.hp = 100; g.ui = 'none'; document.getElementById('deathscreen').classList.add('hidden'); } g.pos.set(P.px, P.gy + 0.05, P.pz); const h0 = g.hp; api.updateEntities(dt, t); if (g.hp < h0) dmg += h0 - g.hp; } };
    // night
    g.timeOfDay = 0.95; api.updateDayNight(0);
    const W = api.spawnEntity('wolf', P.px + 14, P.gy + 0.4, P.pz);
    let hits = 0; const oh = api.crewSys.hitPrey; api.crewSys.hitPrey = function(Pp, d, kx, kz){ hits++; return oh.call(this, Pp, d, kx, kz); };
    dmg = 0; run(90, 0.1);
    api.crewSys.hitPrey = oh;
    const Pw = api.crewSys.prey(W, 30);
    const dbg = { hits, prey: Pw && +Pw.d.toFixed(2), preyEnt: Pw && Pw.ent && Pw.ent.type, atkT: W.atkT, wy: +(W.y - P.gy).toFixed(2), py: +(g.pos.y - P.gy).toFixed(2), light: +api.nearestLightDist(W.x, W.y, W.z).toFixed(1), invisible: api.farmSys.invisible(), ui: g.ui, mode: g.mode, hp: g.hp };
    const wolf = { night: g.dayF < 0.25, dist: +Math.hypot(W.x - P.px, W.z - P.pz).toFixed(1), bit: dmg, alive: g.entities.includes(W), dbg };
    api.killEntity(W, false);
    // day
    g.timeOfDay = 0.4; api.updateDayNight(0); g.hp = 100;
    const Cc = api.spawnEntity('croc', P.px + 5, P.gy + 0.4, P.pz);
    dmg = 0; run(60, 0.1);
    const croc = { day: g.dayF > 0.45, dist: +Math.hypot(Cc.x - P.px, Cc.z - P.pz).toFixed(1), bit: dmg, burnT: Cc.burnT || 0, hp: Cc.hp, alive: g.entities.includes(Cc) };
    api.killEntity(Cc, false);
    const Bw = api.spawnEntity('bogwight', P.px - 10, P.gy + 0.4, P.pz); const bh0 = Bw.hp;
    run(40, 0.1);
    const bog = { burnT: +(Bw.burnT || 0).toFixed(2), hpLost: bh0 - Bw.hp };
    api.killEntity(Bw, false);
    const H = api.spawnEntity('hare', P.px + 3, P.gy + 0.4, P.pz);
    api.hurtEntity(H, 1, 0, 0);
    run(40, 0.1);
    const hare = { dist: +Math.hypot(H.x - P.px, H.z - P.pz).toFixed(1), fled: Math.hypot(H.x - P.px, H.z - P.pz) > 6 || !g.entities.includes(H) };
    if (g.entities.includes(H)) api.killEntity(H, false);
    return { wolf, croc, bog, hare };
  });
  console.log('2. behaviour :', JSON.stringify(r2));
  // 3. spawning by biome: monkeys by day and crawlers by night in the jungle; wolves in packs in the taiga
  const find = `(arch) => { const g = window.__game; for (let r = 200; r < 9000; r += 80) for (let a = 0; a < 6.28; a += 0.25){ const x = g.pos.x + Math.cos(a) * r, z = g.pos.z + Math.sin(a) * r; if (g.gen.archAt(x, z) !== arch) continue; let ok = true; for (let k = 0; k < 6 && ok; k++){ if (g.gen.archAt(x + Math.cos(k) * 45, z + Math.sin(k) * 45) !== arch) ok = false; } if (ok && g.gen.height(x, z) > g.gen.seaLevel + 2) return { x, z, h: g.gen.height(x, z) }; } return null; }`;
  const spawnIn = async (arch, tod) => {
    await page.evaluate(([f, arch, tod]) => { const g = window.__game, api = window.__api; const Sp = eval(f)(arch); g.mode = 'creative'; g.fly = true; g.pos.set(Sp.x, Sp.h + 2, Sp.z); g.forceStream = true; g.timeOfDay = tod; api.updateDayNight(0); for (const e of [...g.entities]) api.killEntity(e, false); }, [find, arch, tod]);
    await settle(3);
    return page.evaluate(() => { const g = window.__game, api = window.__api; let t = performance.now(); for (let i = 0; i < 60; i++){ t += 100; g.spawnT = 4; api.updateEntities(0.1, t); } const c = {}; for (const e of g.entities) c[e.type] = (c[e.type] || 0) + 1; return Object.assign({ dayF: +g.dayF.toFixed(2) }, c); });
  };
  const r3 = { jungleDay: await spawnIn(9, 0.4), jungleNight: await spawnIn(9, 0.95), taigaNight: await spawnIn(10, 0.95), savannaDay: await spawnIn(12, 0.4) };
  console.log('3. by biome  :', JSON.stringify(r3));
  // 4. drops
  const r4 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE;
    for (const e of [...g.entities]) api.killEntity(e, false);
    const n = k => C.countItem(g.slots, k);
    const m0 = n('meat'), f0 = n('fang');
    api.killEntity(api.spawnEntity('zebra', g.pos.x + 3, g.pos.y, g.pos.z), true);
    const m1 = n('meat');
    api.killEntity(api.spawnEntity('wolf', g.pos.x + 3, g.pos.y, g.pos.z), true);
    return { zebraMeat: m1 - m0, wolfFang: n('fang') - f0, wolfMeat: n('meat') - m1 };
  });
  console.log('4. drops     :', JSON.stringify(r4));
  console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await b.close();
})();
