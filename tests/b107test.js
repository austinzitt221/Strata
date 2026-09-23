const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/three@0.164.1/build/three.module.js', r => r.fulfill({ contentType: 'application/javascript; charset=utf-8', body: require('fs').readFileSync(__dirname + '/three.module.js', 'utf8') }));
  await page.goto('file:///home/user/Strata/strata.html');
  await page.waitForTimeout(1500);
  await page.click('#btnWorlds'); await page.fill('#newWorldName','b107'); await page.fill('#newWorldSeed', '7');
  await page.click('#btnCreateWorld'); await page.waitForTimeout(200); await page.click('.worlditem .btn'); await page.waitForTimeout(3000);
  const settle = async (n) => { for (let i = 0; i < n; i++){ await page.waitForTimeout(1000); await page.evaluate(() => { window.__game.terrain.process(80); }); } };
  await page.evaluate(() => { window.__api.loadSys.end(); const g = window.__game; g.debugLock = true; g.ui = 'none'; g.mode = 'survival'; g.spawnT = -1e9; });
  await settle(2);
  const r = await page.evaluate(() => {
    const g = window.__game, api = window.__api, C = window.__CORE, FS = api.fenceSys;
    const p = g.pos; const gy = g.gen.height(p.x, p.z);
    const yx = Math.round(p.x) + 10, yz = Math.round(p.z);
    api.applyEdit(C.makeEdit(0, 1, yx, gy + 24, yz, 34, 0, 0)); api.applyEdit(C.makeEdit(1, 1, yx, gy - 6, yz, 34, 0, C.MAT.GRASS)); g.terrain.process(200);
    const top = gy + 11;
    g.fences = []; g.tool.pYaw = 0;
    const A = FS.add(yx, top, yz, 0.3, false);
    const E = FS.ends(A);
    // the plan: near the far end it continues straight; the wheel turns it about the joint; near the other end it runs the other way; far off it is free
    const r2 = (v) => +v.toFixed(3);
    const p1 = FS.plan([E[2] + 0.4, top, E[3] - 0.3]);
    g.tool.pYaw = Math.PI / 6; const p2 = FS.plan([E[2] + 0.4, top, E[3] - 0.3]); g.tool.pYaw = 0;
    const p0 = FS.plan([E[0] - 0.3, top, E[1] + 0.2]);
    g.yaw = 1.0; const pf = FS.plan([yx + 9, top, yz + 9]);
    const jointOk = (P, ex, ez) => { const En = FS.ends({ x: P.x, z: P.z, yaw: P.yaw }); return Math.min(Math.hypot(En[0] - ex, En[1] - ez), Math.hypot(En[2] - ex, En[3] - ez)) < 1e-3; };
    const plans = { straight: [r2(p1.yaw), jointOk(p1, E[2], E[3])], turned: [r2(p2.yaw), jointOk(p2, E[2], E[3])], back: [r2(((p0.yaw % 6.2832) + 6.2832) % 6.2832), jointOk(p0, E[0], E[1])], free: [r2(pf.yaw), !pf.joint, r2(pf.x - (yx + 9))] };
    // through the real click, with the ghost showing: the piece lands where the ghost stood
    for (let i = 0; i < 40; i++) g.slots[i] = null; g.hotSel = 0; g.slots[0] = { kind: 'fence', count: 20 };
    const aimAt = (x, z) => { g.pos.set(x, top + 0.7, z + 2.5); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.camera.lookAt(x, top, z); };
    aimAt(E[2] + 0.4, E[3] - 0.3); api.placePreview.update(performance.now());
    const ghost = { on: api.placePreview.root.visible, joined: api.placePreview.fenceJoined, at: [r2(api.placePreview.root.position.x - p1.x), r2(api.placePreview.root.position.z - p1.z)] };
    g.mouseEdge = true; g.mouseL = true; api.tryAction(0.016, performance.now()); g.mouseL = false;
    const B = g.fences[1]; const placed = B ? { yaw: r2(B.yaw), joined: jointOk(B, E[2], E[3]), count: g.slots[0].count } : null;
    // a pen at thirty degrees, six pieces a side by chaining the plan: three corners of 90 by the wheel
    g.fences = []; g.tool.pYaw = 0;
    let cur = FS.add(yx - 8, top, yz - 8, Math.PI / 6, false);
    const chain = (turn) => { g.tool.pYaw = turn; const En = FS.ends(cur); const P = FS.plan([En[2] + 0.2, top, En[3] + 0.2]); cur = FS.add(P.x, P.y, P.z, P.yaw, false); g.tool.pYaw = 0; return cur; };
    for (let side = 0; side < 4; side++){ for (let i = 0; i < 3; i++) chain(0); if (side < 3) chain(Math.PI / 2); }
    const poly = g.fences.map(f => { const En = FS.ends(f); return [En[0], En[1]]; });
    const inside = (x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){ const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
    const cx = poly.reduce((a, q) => a + q[0], 0) / poly.length, cz = poly.reduce((a, q) => a + q[1], 0) / poly.length;
    const closed = Math.hypot(FS.ends(cur)[2] - poly[0][0], FS.ends(cur)[3] - poly[0][1]) < 0.01;
    const s = api.spawnEntity('sheep', cx, top + 0.7, cz);
    g.slots[0] = { kind: 'tomato', count: 10 };
    let escaped = -1;
    for (let i = 0; i < 900; i++){
      const a = (i / 300 | 0) * 2.1 + 0.4; g.pos.set(cx + Math.cos(a) * 7.5, top + 0.7, cz + Math.sin(a) * 7.5); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z);
      api.updateEntities(0.05, performance.now());
      if (escaped < 0 && !inside(s.x, s.z)) escaped = i;
    }
    return { plans, ghost, placed, pen: g.fences.length, closed, escaped, sheepIn: inside(s.x, s.z) };
  });
  console.log('1. the joints:', JSON.stringify(r));
  await page.evaluate(() => { const g = window.__game, api = window.__api; g.slots[0] = { kind: 'fence', count: 20 }; const f = g.fences[3]; const E = api.fenceSys.ends(f); g.fly = true; g.camView = 0; g.pos.set(E[2] + 1.5, f.y + 1.3, E[3] + 2.6); g.camera.position.set(g.pos.x, g.pos.y + 1.6, g.pos.z); g.yaw = Math.atan2(-(E[2] - g.pos.x), -(E[3] - g.pos.z)); g.pitch = -0.45; g.timeOfDay = 0.3; api.updateDayNight(0); });
  await settle(3);
  await page.screenshot({ path: __dirname + '/b107_ghost.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
