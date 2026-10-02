const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b99'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  const r1 = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, F = api.fenceSys, B = api.breedSys;
    for (const e of [...g.entities]) if (B.passive(e)) api.killEntity(e, false);
    // a flat yard, then a pen four by four metres round (px, pz)
    const p = g.pos; const gy = g.gen.height(p.x, p.z); const px = Math.round(p.x) + 8, pz = Math.round(p.z);
    api.applyEdit(C.makeEdit(0, 1, px, gy + 14, pz, 30, 0, 0)); api.applyEdit(C.makeEdit(1, 1, px, gy - 16, pz, 30, 0, C.MAT.GRASS)); g.terrain.process(200);
    const y = gy + 0.02;
    const before = g.fences.length;
    const pieces = [F.add(px - 2, y, pz - 2, 0, false), F.add(px, y, pz - 2, 0, false), F.add(px + 2, y, pz - 2, 0, false),
                    F.add(px - 2, y, pz + 2, 0, false), F.add(px, y, pz + 2, 0, false), F.add(px + 2, y, pz + 2, 0, false),
                    F.add(px - 3, y, pz - 2, Math.PI / 2, false), F.add(px - 3, y, pz, Math.PI / 2, false), F.add(px - 3, y, pz + 2, Math.PI / 2, false),
                    F.add(px + 3, y, pz - 2, Math.PI / 2, false), F.add(px + 3, y, pz + 2, Math.PI / 2, false), F.add(px + 3, y, pz, Math.PI / 2, true)];
    const dup = F.add(px, y, pz - 2, 0.1, false);
    const snapped = pieces.every(f => f && Number.isInteger(f.x) && Number.isInteger(f.z));
    const gate = pieces[11];
    const blocks = { across: F.blocks(px, pz, px, pz - 3, y + 0.3), inside: F.blocks(px - 1, pz, px + 1, pz, y + 0.3), high: F.blocks(px, pz, px, pz - 3, y + 4), gateShut: F.blocks(px + 2.5, pz, px + 4, pz, y + 0.3), onLine: F.blocks(px + 3, pz, px + 4, pz, y + 0.3), along: F.blocks(px + 3, pz - 0.5, px + 3, pz + 0.5, y + 0.3) };
    gate.open = 1; const gateOpen = F.blocks(px + 2.5, pz, px + 4, pz, y + 0.3); gate.open = 0; F.rebuild();
    // a sheep in the pen, the food outside: it stays in
    const s = api.spawnEntity('sheep', px, y + 0.4, pz);
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'tomato', count: 5 };
    g.pos.set(px, y + 0.2, pz - 7); g.vel.set(0, 0, 0);
    let now = performance.now(); let maxOut = 0;
    for (let i = 0; i < 160; i++){ now += 50; api.updateEntities(0.05, now); const d = Math.max(Math.abs(s.x - px), Math.abs(s.z - pz)); if (d > maxOut) maxOut = d; }
    const kept = { maxOut: +maxOut.toFixed(2), dToFood: +Math.hypot(s.x - g.pos.x, s.z - g.pos.z).toFixed(1) };
    // the gate opens, the food waits beyond it: out it comes
    g.pos.set(px + 8, y + 0.2, pz); F.toggle(gate);
    for (let i = 0; i < 200; i++){ now += 50; api.updateEntities(0.05, now); }
    const out = { sx: +(s.x - px).toFixed(1), sz: +(s.z - pz).toFixed(1), open: gate.open };
    // back in, the gate shut behind it; then the fence comes up
    s.x = px; s.z = pz; F.toggle(gate);
    const saved = api.buildSaveData().fences.length;
    F.remove(pieces[0]); const removed = g.fences.length;
    const craft = (() => { for (let i = 0; i < 40; i++) g.slots[i] = null; const r = C.RECIPES.find(r => r.kind === 'fence'); const res = C.craft(g.slots, r, true); const it = g.slots.find(x => x && x.kind === 'fence'); return [res, it && it.count]; })();
    const icons = ['fence', 'fencegate'].map(k => (api.itemIconURL({ kind: k, count: 1 }) || '').length > 100);
    g.slots[0] = { kind: 'tomato', count: 5 };
    return { before, placed: g.fences.length - before + 1, n: pieces.length, dup, snapped, blocks, gateOpen, kept, out, saved, removed, craft, icons, label: api.itemLabel({ kind: 'fencegate', count: 1 }) };
  });
  console.log('1. the pen   :', JSON.stringify(r1));
  await page.evaluate(() => { const g = window.__game; const s = g.entities.find(e => e.type === 'sheep'); g.fly = true; g.camView = 0; g.pos.set(s.x + 6, s.y + 3.5, s.z + 5); g.yaw = Math.atan2(-(s.x - g.pos.x), -(s.z - g.pos.z)); g.pitch = -0.35; g.timeOfDay = 0.3; window.__api.updateDayNight(0); });
  await settle(3); await page.screenshot({ path: __dirname + '/b99_pen.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
