# DEVLOG — STRATA

Append decisions, known issues, and playtest feedback here. Newest first.

## Build 13.4 — the flash loop and the grid-line hitch (2026-09-01)

- **The flash between "new LOD" and "old LOD".** Any chunk landing in a
  supertile flips it stale: a frontier tile gaining members as you fly
  toward it, or your own drill edit re-meshing a chunk. The coverage mask
  required `!t.stale` to count a tile as covering, so for the rebuild
  window the whole 64-256m tile's coverage dropped and the heightfield
  skin — no caves, no edits — popped back over it, then vanished when the
  build landed. Flying = a loop of it; drilling = the pre-cut mountain
  flashing before the hole. The old mesh never left the scene during that
  window, so a standing mesh now counts as coverage, stale or not.
  Measured while gliding near a city: truthful coverage held near the
  player rose from 3,957 to 5,889 columns per sample (+49%); the lighting
  flash was the same swap (skin vs LOD shade differently).

- **The hitch on every grid line.** Walk from one cut cube into the
  adjoining one and you felt a bump. Between two adjoining cuts the CSG
  field's nearest "surface" is the zero-thickness membrane where the shared
  face used to be (field = +MINE_EPS on that plane). The foot sphere's
  contact there is rightly rejected as phantom — but the `continue` after
  the rejection also skipped resolving the REAL floor beneath the sphere.
  You sank a hair, crossed the plane, the floor was nearest again and
  pushed you back up. Fix: when a contact is rejected as phantom, resolve
  the floor on its own straight down (a 7-step bisection, foot sphere
  only), and the extra ground probe does the same so `grounded` never
  flickers on the line. Measured walking two adjoining 3m grid cubes:
  vertical jitter 8.96cm -> 0.05cm, grounded flickers 2 -> 0.

## Build 13.3 — the line is gone, and the treeline stops popping (2026-08-31)

- **THE SEAM LINE.** The hairline of sky along the LOD/real boundary was a
  literal see-through crack: the coverage mask discarded LOD *exactly* at
  the column edge, so wherever the coarse and fine surfaces didn't meet to
  the millimetre you looked straight through the join to the background.
  Fix: erode the real-coverage region by two columns. A covered column that
  touches an uncovered one is now a SEAM column — the horizon skin still
  yields there, but the LOD keeps drawing UNDER the real chunk and backs
  the join. Each ring is also sunk 0.18 voxels so its backing tucks beneath
  the real surface instead of poking through as a ledge.

  Measured with a pixel test — stand on flat treeless ground, pitch down at
  the seam ring, and count sky-coloured pixels in the lower band where
  there should be none: **127 -> 0**. (The 27 that still register are
  shallow LOD water, whose tint (183,211,221) is close to sky (143,184,232)
  — verified by averaging the flagged pixels rather than trusting the
  count.) An earlier whole-frame version of this test read ~7900 both
  before and after: it was counting sky through tree canopies, which is why
  it is worth making a measurement specific before believing it.

- **Trees carry into the distance.** treeAt() is a pure function of the
  cell, so distant trees need no chunk data at all — they stand on
  gen.height like the real ones. A new far-tree system draws them as two
  InstancedMeshes (trunk + one canopy blob) out to 460m, skipping any cell
  the near system is already drawing so there is exactly one tree per cell
  on screen. **1399 distant trees for 2 draw calls**; the treeline now runs
  to the horizon instead of materialising in front of you.

- **Vegetation respects the night.** Grass, flowers, shrubs and trees all
  use MeshBasicMaterial, which ignores lighting entirely — so they stayed
  full-bright after dark. They are now tinted by the same day factor the
  terrain shades with (0.20 at midnight, 1.0 at noon).

- **Deeper underground cull.** The near-everything sphere shrinks 64m ->
  48m, and a player whose eye is above ground stops meshing the deep
  entirely past 96m — you cannot see into the dark from up there, however
  far the render distance reaches. It still follows you down a shaft or
  into a cave the moment your eye drops below the surface.

### On the 800m building textures
Now explained without a mesher bug: material assignment measures identical
at every LOD scale over a fixed volume, and the skin only draws where the
LOD has NOT finished. So grass/rock over a distant city is the heightfield
skin showing through while that ring is still filling — which is why it
corrected itself as the player closed to 300-400m. Faster ring drain makes
the window smaller; if it still reads wrong once settled, that is a new
bug and needs a fresh look.

## Build 13.2 — the seams close (2026-08-31)

Playtest of 13.1: cities render whole, structures fixed, performance up.
Three bugs left.

- **Photo mode leaked across worlds.** Quit to title while in photo mode
  and the next world you created opened in photo mode. `game.photo` was
  world state living on a global; it (and `game.scope`) now reset on both
  quit and world start.

- **Holes between LOD and real terrain — the mask was lying, twice.**
  1. The coverage mask marked a column "real geometry covers this" if its
     chunks merely EXISTED in the chunk map. After 13.1 that was wrong:
     chunks deferred by the visibility band exist with no mesh, so the mask
     told the LOD *and* the horizon skin to yield — to nothing. That is the
     empty line at the boundary. A column now counts as covered only when
     its chunks are actually meshed (`done`), empty, or in flight-free
     state; anything deferred, dirty or airborne fails the test.
  2. The mask was recomputed every 20 frames. Fly fast and it described
     where you WERE — cutting holes at stale world positions, which is
     exactly the "fly around and it gets out of sync" report. Now every 4
     frames, and immediately on crossing a chunk. It is a few thousand map
     lookups; it was never worth being stale.

  Audited by walking the live mask against the chunk map: at settle, after
  six long teleports, and after resting, **0 columns out of 177 claimed
  coverage they did not have** (before the fix: 177 of 177 right after a
  jump).

- **Whole LOD chunks vanishing.** Settled tiles shed their source chunk
  data to save memory (the merged mesh is the render copy). When such a
  tile was later asked to rebuild — a new chunk landing in it as you moved
  — it rebuilt from the survivors and silently DROPPED every shed member's
  geometry. Blocks of the world blinking out of the distance. A tile that
  needs a rebuild now re-queues its missing members and keeps its current
  mesh until they come back.

### Not reproduced: distant building textures
Reported as grass/rock on skyscrapers around 800m, correcting by 300-400m.
Histogramming face materials over a FIXED world volume at every LOD scale
shows the same distribution at 1m, 2m, 4m and 8m voxels (id14 48%, id12
37%, id0 14%) — the mesher assigns building materials correctly at every
scale. A first attempt blamed the smeared coarse-voxel normal and probed
deeper for the material; measurement showed that changed nothing, so it
was reverted rather than shipped as an unverified cost. Needs a screenshot
of the 800m case to localise; the likely remaining suspect is the
heightfield skin showing through where a ring is still filling.

## Build 13.1 — the LOD actually gets to run (2026-08-31)

Playtest of Build 13: nothing changed. The F3 overlay handed over the
diagnosis in one line — **tiles 0** at every distance, lod queue pinned at
~4500, chunk queue 37,425 and climbing.

**The bug.** `meshPool.pump()` drained its sources strictly in order, with
full-detail terrain first. Terrain's queue NEVER empties, so the LOD rings
never received a single worker in a real session — the entire Build 13
system was correct and completely starved. My headless test missed it
because the test helper force-pumped the rings by hand; the test proved
the mesher worked and proved nothing about whether the game would ever
call it. Lesson recorded: a test that drives the system under test is not
a test of the system.

**Three fixes, compounding.**

- **Fair dispatch.** Weighted round-robin instead of in-order draining:
  terrain keeps half of every rotation, the rings split the rest, and the
  terrain hot lane still preempts everything so mining feedback stays
  instant.
- **A visibility band on full detail.** A surface player was queueing every
  cave chunk 200m below every column in render distance — tens of
  thousands of chunks that cannot be seen from anywhere. Now: full
  vertical within 64m, and past that a column meshes only its surface band
  plus whatever is BUILT on it (city towers, your base). Deferred chunks
  are marked and queue the instant you come near, so caves still mesh when
  you go down. **Chunk queue 37,425 -> 0.**
- **A third, fine ring at 1m voxels (0-176m).** A ruin wall is ~1m thick;
  at 2m voxels dual contouring misses it entirely and the ruin renders as
  a flat stone floor — exactly the playtest report. At 1m voxels the walls
  stand: vertices above the ruin base went 6 -> 98. Rings are now 1m/2m/4m
  voxels out to 176m / 448m / 1152m.

**No more floating props.** Cities stamp from 1.4km, so their ropes and
street torches were rendering in mid-air over terrain that had not meshed
yet (and eating draw calls). Both systems now cull to 150m and rebuild as
you cross chunks; their geometry is shared instead of rebuilt per prop.
**Draw calls 1900 -> ~260.**

Measured, 280m from a mega-city, standing on the ground at default render
distance, with NO test-side pumping (headless software rendering, so real
hardware is several times faster): chunk queue 0 the whole time; the LOD
horizon drains 3192 -> 0 and the full skyline is standing.

### Known issue (pre-existing, cosmetic)
Worker-meshed chunks match the synchronous mesher bit-for-bit in
GEOMETRY, but a handful of vertices in city-edge chunks differ in baked
**AO** by a shading fraction (~21 of 264 vertices in one chunk). Verified
present on Build 13 and earlier — not introduced here. The pool test now
asserts geometry identity and reports AO drift separately rather than
conflating the two. Worth chasing when the AO edit-set pad is next
touched.

## Build 13 — THE HORIZON: the LOD stops lying (2026-08-31)

The playtest complaint was two things wearing one coat: the world loads
too slowly, AND what you see at distance isn't what's there — flat ground
that splits open into a cave right in your face, a mega-city whose towers
only exist once you fly to each block.

**Why the old LOD lied.** The far rings were a geometry clipmap: a grid
of heights. A heightfield mathematically CANNOT represent a cave, an
overhang, a hole you dug, or a building. It wasn't a detail setting, it
was a representation limit — no amount of resolution would have fixed it.

**The fix: real geometry all the way out.** CORE's dual contourer now
takes an LOD scale — the same mesher, the same edit list, with voxels 4x
and 8x larger (2m voxels in 32m chunks to 448m; 4m voxels in 64m chunks
to 1408m). Coarse chunks are world-anchored (moving only streams the
frontier) and merge into 128m/256m supertiles, so the entire horizon is
a few dozen draw calls. Caves, sinkholes, canyon walls, YOUR tunnels and
YOUR buildings all stand at range with true topology; crossing into full
detail changes crispness only, never what's there.

- **Bit-identical at scale 1.** Every existing chunk still meshes exactly
  as before — verified against the 125-chunk hash oracle after every step.
- **Cities are LOD-native.** Interior detail (hollows, floor slabs, window
  slits, doors, benches) is tagged `noLod` and drops out of coarse
  meshes, so distant towers read as solid mass instead of aliasing into
  swiss cheese. Cities now stamp from **1400m** (was 320m) — the whole
  skyline is there before you arrive; the arrival fanfare waits until
  340m. Measured at 700m: **210k triangles of city** standing in the LOD.
- **Coverage handshake.** A two-level mask (255 = real chunks, 128 = LOD
  geometry) lets the heightfield skin yield to LOD, and the LOD yield
  per-pixel to real chunks. No z-fighting, no double-drawn ground, and
  the water skin still comes from the clipmap where only it has water.
- **Rings overlap 96m** with per-ring depth bias — different voxel sizes
  can't share a watertight seam, so the coarser ring backs the finer one
  instead of cracking against it.

**Streaming that keeps up.** The worker pool became multi-source: full
detail first, then each LOD ring. Chunk priority now weights by where
you're LOOKING (behind-you chunks are deprioritized 6x, periphery 2.2x)
and prefetches along your velocity — nothing should pop in directly in
front of your face. Column band scans are amortized (2.5ms/frame) and
tile merges are budgeted with a guaranteed-progress floor, so a fresh
2,800-column horizon queues without a hitch.

**Memory diet.** LOD vertex data is quantized (normals/axes Int8,
material/sky/AO Uint8 — invisible at 2m+ coarseness), lightless
underground triangles are dropped from merged tiles, and settled tiles
shed their source chunk data. Full horizon load: **JS heap 1020MB ->
527MB, tile geometry 459MB -> 95MB**, 3.3M -> 1.6M triangles resident.

**F3 perf overlay** — chunk queue depth, workers busy/total, LOD queue
and tile count, triangles and draw calls. Regressions become visible
instead of vibes.

Regression: 297 CORE tests, bit-identity oracle, smoke, pool (184
chunks/s, 6/6 identical), city life, car, rails/deed — all green.

## Build 12.2 — the performance build (2026-08-30)

"Chunks that load quick and a game that runs butter smooth." The whole
build is measured, and the graphics are provably untouched: every mesher
change was verified bit-identical against a hash oracle (FNV over every
output buffer of 125 benchmark chunks — 100 in a stamped mega-city, 25
wilderness — recorded before the first change and re-checked after every
step).

- **THE MESHING POOL.** Dual contouring is off the main thread. CORE is
  now a named factory (`CORE_FACTORY`) whose full source stringifies into
  a Web Worker blob; a pool of min(4, cores−1) workers each runs its own
  CORE + world generator and chews the dirty-chunk queue at full
  throughput while the main thread only assembles finished
  BufferGeometry. Measured in the headless harness: **199 chunks/s pooled
  vs 13 chunks/s on the old budgeted sync path (~16×)** — a freshly
  streamed mega-city backlog of ~2,400 chunks fully meshed in under 12
  seconds. Worker output verified bit-identical to the sync mesher.
  Stale results (chunk re-dirtied or scrolled out mid-flight) are
  discarded; a finished worker immediately re-pumps the queue instead of
  waiting for the next frame; no Worker support ⇒ clean fallback to the
  old synchronous path.
- **The hot lane.** Freshly-edited chunks (your mining/placing) go into a
  priority set that jumps the streaming backlog in both the pool and the
  sync fallback — carving feels instant even while a city is pouring in.
- **Mesher surgery (bit-identical, −14% per chunk in node: 6.64 →
  5.70 ms).** Per-chunk spatial bucket index over the edit list so field
  sampling, hermite crossings, and vertex AO only touch edits whose AABBs
  can matter; the terrain height grid is memoized per column footprint
  (all 46 vertical chunks of a column share one build); all per-chunk
  scratch (field lattice, hermite cache, AO cache, output streams) moved
  to reused module-level typed arrays — near-zero allocation per chunk.
- **Render scale option.** Device pixel ratio now caps at 1.5 (was 2 —
  invisible at pixel-art texture density, big fill-rate win on hiDPI),
  and a RENDER SCALE slider (50–150%) in Options scales the internal
  resolution for more fps or extra crispness.
- **Small leaks plugged.** Objective/compass markers rebuilt their
  candidate list every frame with allocations; now cached at 4 Hz with
  only the screen projection per frame.
- Roadmap: the full idea pool (24 ideas) is now in ROADMAP.md under
  "The idea pool", grouped by system, unscheduled.

## Build 12.1 — playtest fixes: real driving, mega cities, scopes (2026-08-30)

Everything from the Cities & vehicles playtest notes.

- **You are IN the car now.** The camera used to freeze where you stood
  (updatePlayer returned before the camera block while driving — you were
  remote-controlling the car). Fixed with a shared vehicle camera: first
  person puts your eyes in the driver's seat behind the wheel with free
  mouse look; F5 gives a smoothed GTA-style chase cam behind the car with
  your third-person model visibly seated at the wheel, knees bent, head
  under the roofline. The rail cart had the same frozen-camera bug and
  got the same treatment.
- **Car detail.** No more solid colors: pixel-textured panels with a
  trim stripe, headlights/taillights, glass canopy you can see through
  from inside, seats, dashboard, steering wheel — and a live gauge
  cluster drawn to a canvas: a real analog speedometer (0–50 km/h with
  a needle) and a battery gauge, both readable from the driver's seat.
  NPC cabs got painted pixel shells, taxi stripes, roof signs, and a
  visible villager driver at the wheel.
- **Mega cities.** Cells shrank 2600m -> 1800m and three quarters of
  cells now hold a city (typical nearest skyline ~1.2-1.7km; several can
  share one view). Cities roll their SIZE: 3x3 (15%), 5x5 (30%), 7x7
  (40% + the rest) blocks — up to ~260m across, 4x+ the old footprint —
  and every block rolls what it is: towers (up to 14 stories now),
  parks (painted lawns + benches), market halls, open lots. Avenues
  between every block row, torch-lit intersections, population and
  traffic scale with size.
- **Headroom fix.** Tower ground floors were 1.78m tall (the hollow
  started 1.2m above the pavement — that's why only SOME towers hit
  your head: it was every ground floor, upper floors were fine).
  Stories are 4m now and the hollow reaches the pavement; the whole
  ground story is verified walkable air to 3.3m.
- **THE TELEPORT DRONE.** The camera drone's expensive sibling (8 iron
  + 4 ruby ingots + 3 diamond + 6 crystal, or 950 coins from the city
  electrician at 25 goodwill). Fly it like the camera drone on a 90m
  tether; landing it BLINKS you to where it was (12% charge per blink,
  never into solid rock — it nudges you up out of anything solid).
- **Crosshair + scope.** All firearms show a crosshair. The Longeye
  .338: hold right click to glass — cartoon scope reticle with drop
  ticks and a red dot, scroll to zoom 2x-66x, mouse sensitivity scales
  with magnification, release to drop the glass.

## Build 12 — Cities & vehicles (roadmap build 11) (2026-08-30)

Box-CSG makes cities affordable where block games choke. Four phases.

- **MEGA-CITIES.** Rare km-spaced skylines: one candidate per 2.6km cell
  (half the cells roll none; each cell tries five sites and keeps the
  first buildable one, clear of villages and forts). Stamped on approach
  like forts: a deep foundation slab irons the site flat, basalt avenues
  cross it in a 3x3 grid, and eight towers rise from procedural
  floor/facade modules — hollow shells, real floor slabs, window bands
  punched through every story, a street door, a roof rim, and a corner
  rope shaft so every floor is climbable. Torch-lit plaza with an
  obsidian obelisk in the center block. ~190 edits per city; procedural
  names (NOVA REND, EAST HARROW…); the nearest known skyline shows on
  the compass from up to 3km; trees keep off the pavement.
- **City life.** The stamp mints the city's people: five shopkeepers on
  the trade system (the four village trades + a new GROCER dealing in
  food) and the MAYOR at the plaza buying civic works. All give missions
  through the same engine as villages, markers included. Citizens stroll
  the avenues by day and head in at night; two electric cabs work the
  avenues end to end and brake for pedestrians.
- **THE ELECTRIC CAR.** Ships as a kit — 650 coins at the city
  electrician, or craft it (14 iron + 4 ruby ingots + 8 wire). Deploy,
  right-click to drive: W/S throttle, A/D steer, 13.5 m/s, real
  gravity + sphere-vs-SDF ground physics, motor hum, dashboard HUD.
  Full throttle drains ~0.65%/s; a dead battery won't move; parked near
  a powered grid it recharges at drone rate. Crouch+RMB folds it back
  into a kit; wrecks fold into a half-charged kit. Never despawns,
  saves with battery and heading.
- **RAILS & TRAINS.** Rails craft 8-a-batch from iron and sticks (the
  toolsmith sells bundles). Left click plants spikes into a line (1 rail
  per 4m of span, spikes up to 60m apart), right click finishes it —
  twin rails, ties, and a gold post at each end. Power either end (any
  live grid within 8m) and right-clicking an end post boards a cart
  that runs the whole polyline at 16 m/s; space bails out. Fast travel
  you BUILD: string a line from your base to the city and wire one end.
- **Property.** The mayor sells the PROPERTY DEED (900 coins, the coin
  sink). Left click inside a city claims its nearest tower — furnished
  on the spot with a strongbox, a bed (spawn point!) and a light. One
  deed per city.
- **Also:** projectile src fix carried; city folk live on a 180m leash
  instead of the 70m wildlife despawn so cabs survive their own routes.
- **Known issues:** stamping a whole city queues a few hundred chunk
  remeshes — on a mid-range machine it fills in over a couple of
  seconds as you approach; rail lines have no wrench-delete yet.

## Build 11 — Bosses & endgame (roadmap build 10) (2026-08-30)

Four bosses, each built on a verb only a CSG world has. Boss framework:
`e.bossType` entities run their own physics, never despawn by distance,
take no knockback, and the nearest one within 90m owns a boss HP bar at
the top of the screen. First kills pay a unique unlock; repeat kills pay
coins and gems. Kill flags save per world.

- **THE BURROWER** (hp 340, the deep). Go 25m under the surface and it
  can smell you. A chitin worm that swims through solid rock, carving a
  REAL tunnel behind it (subtract spheres, SDF-gated so it only carves
  where there's stone) — burrows under your feet, lunges up through the
  floor, dives, repeats. You hear the rumble grow before it hits. First
  kill: the TUNNELER CORE — with it in your pack, any held drill bores a
  continuous corridor as you walk.
- **THE WARDEN** (hp 520, citadel forts). Every 5th raid fort is a
  citadel: richer vault, and the keeper is a golem of stonebrick, rock
  and obsidian instead of a warlord. Damage blasts mineable boulder
  chunks visibly off its hide (+rock +iron ore); at range it throws a
  rock that craters where it lands; wounded below 65% it EATS the ground
  — carving a real crater — to heal. Drops a vault key every kill; first
  kill drops the WARDEN FIST (swords hit 2x, punches land like hammers).
- **THE MAGMA TYRANT** (hp 650, volcano calderas). Climb into a crater
  and it hauls itself out of the melt. Lava bombs whose blast cup fills
  with a REAL molten pool (union MAT.LAVA); every quarter-health lost it
  rips a magma vent open under your feet. The battlefield floods as the
  fight runs long — you terraform to keep footing. First kill: the MAGMA
  HEART — lava cannot burn you while it rides in your pack.
- **THE ARCHITECT** (hp 620, the endgame — summoned, not found). Craft
  the ARCHITECT SIGIL (4 diamond + 12 obsidian + 6 crystal, station) and
  left-click to call it. A builder-wraith that fights with YOUR verbs:
  stamps stonebrick walls across your line of approach, ERASES the floor
  under you, and replays corrupted obsidian copies of structures you
  actually built in that world (it reads the edit list). Blinks away
  when cornered. First kill: the ARCHITECT'S SEAL — the wrench reaches
  4x as far while it's in your pack.
- **Music.** Tiny procedural scheduler in AudioSys, three moods that
  follow play state: surface (slow major-pentatonic plucks), cave (low
  drones over the depth ambience), boss (driving pulse + minor
  arpeggio). New MUSIC volume slider in options (separate from SFX).
- **Fixes.** Boss projectiles used to spawn inside the thrower's own
  collision radius and detonate on it — projectiles now carry `src` and
  never explode on their thrower. Removed a stale phase-A tyrant stat
  stub that shadowed the real stats.
- **Verification.** All four bosses have headless Playwright suites
  (spawn triggers, every attack verb SDF-verified against the edit list,
  drops, flags, no-respawn rules, seal/heart/core item effects) plus
  screenshot review. 297 CORE tests green; smoke, explosives, Burrower
  and Warden suites re-run green. height() 1.2us/call — no gen
  regression.

## Build 10 — Arms Race (roadmap build 9) (2026-08-29)

Guns, bombs, and reasons to use them. Four phases.

- **The arsenal.** Ten real-model-inspired, renamed firearms in one GUNS
  table — S9 Sidearm, Magnus .50, Hornet SMG, DMR-14, AV-47 Ripper,
  Longeye .338, GAT-900, Photon Lance, Sun Spinner, Boomtube RPG — each a
  personality of rpm / damage / spread / range / recoil / price. One
  firing engine drives all of them: SDF-marched hitscan (walls actually
  stop bullets), semi vs full-auto, gatling spin-up, sniper double-ammo
  cost, laser tracer beams, dry-fire refusal, recoil kick in the
  viewmodel and the camera. Ten parametric viewmodels from one parts kit
  and ten pixel icons.
- **Guns are costly, ammo is cheap.** Rounds, energy cells and rockets
  are stackable items — rounds craft 24-a-pop from an ingot and a coal
  even without a station; the arms dealer sells ammo cheap and three
  starter guns at rep gates. That's the coin loop working as designed.
- **The weapon table.** A craftable gunsmith bench that must be WIRED to
  live power. Dark benches refuse to work; powered ones sell the whole
  arsenal plus ammo and explosives for coin + ingots.
- **Explosives, i.e. CSG subtract as a weapon.** explode() carves a real
  crater and throws falloff damage at everything including you. The
  Boomtube fires a genuine ballistic projectile. TNT (3s fuse) is a
  crater; the shaped mining charge (2s) computes its yield through the
  drill's own mineYield path BEFORE the blast — verified voxel-exact
  against a drill probe — so lighting one is mining. Charges near a
  blast cook off: chains are a feature.
- **Raids.** Your power grid is a beacon: once per night in survival,
  the watts running within 140m of you summon 2 + W/25 raiders (cap 12)
  — bigger, faster, 55hp lurkers that hunt from any distance and pay
  double coin. No watts, no raid. Dawn burns the stragglers.
- **Raid forts.** Generated walled bases on their own 900m grid, stamped
  on approach like villages: stonebrick perimeter with a gate, four
  capped towers, two bunkers with supply chests, and an obsidian VAULT
  whose chest is locked. A day-proof garrison of five holds the yard, a
  260hp WARLORD holds the key. Kill him, take the key, open the vault:
  a coin pile, diamonds, a real mid-tier gun, ammo, mining charges.
  Discovered forts advertise themselves with RAID FORT / VAULT markers
  and a missions-panel entry until looted; the whole record round-trips
  through the save.

Verified end to end in-browser: ripper hits for exactly its 14, burst
drains 4 rounds, sniper takes 2, dry fire refused, laser beam spawns,
RPG carves an air-verified crater; TNT places/consumes/detonates and a
bystander pays for it; the mining charge's payout matched a drill probe
of the same sphere voxel-for-voxel; a 140W grid called a 7-raider raid
that closed distance over live frames; a full fort run — stamp probes
(wall solid, gate open, vault obsidian), garrison + warlord manning,
locked-vault refusal, warlord key drop, no boss respawn, vault loot,
save round-trip. 297 headless tests, smoke, and the B8 suite green.

## Build 9.1 — World Gen 3.1: rivers, ponds, and biomes that hurry up (2026-08-29)

Playtest verdict on 9.0 was blunt and right: still flat, biomes still
too long, worlds still cousins of each other. This pass was tuned
against five reference screenshots until five fresh seeds each read as
their own place.

- **Rivers.** The zero-line of a warped noise field becomes a channel
  carved to just below the water table, so every river actually holds
  water; high ground gets pulled down to a gorge rim first, so a river
  crossing a highland runs at the bottom of a canyon with banks 10m+
  over the water. Density and width jitter per seed. On volcanic ground
  the same channels fill with lava.
- **Ponds.** Lowland ground is pocked with small lakes (a per-seed
  threshold decides how pocked). Between rivers, ponds and the coasts,
  water threads through everything the way the references do.
- **Biomes at reference speed.** Region cells cut 520m -> 260m, climate
  varied at ~600m instead of ~1.6km, the family-clustering that was
  building mega-biomes removed, conquest weights narrowed, borders
  sharpened (90m -> 60m blend). A desert is now a two-minute walk, not
  thirty. Landmarks moved to their own 520m grid so shrinking the biome
  cells didn't quadruple the volcano count (or break the footprint
  bound the chunk quick-reject depends on).
- **Nothing is billiard-flat.** The erosion spline's relief floor came
  up 3x, flat archetypes roll harder, and a universal ~90m rolling
  octave rides under every biome. The bare-rock band moved to 27..33m
  and snow above 33m, and the mountain-family pool triggers only in
  truly low-erosion zones, so snow reads as caps on actual crests
  instead of blankets over whole biomes.
- Acceptance run (the playtest's own bar): five worlds — seeds 1, 42,
  7, 123, 555 — flown up and screenshotted. Alpine riverlands, a
  lava-veined archipelago, an open sea with basalt headlands, volcano
  country, a desert massif. Ground level: a grassy hill rolling over a
  sand-banked river; a snow slope over a monolith and a lake.

height() costs 1.44us (0.98 in 9.0 — rivers and ponds are two more
field evaluations). 297 headless tests pass; two suites' hardcoded
sample points were updated (the plains-coverage test now samples a
LOW-altitude plain, since high plains wear the rock band by design; the
village suite ring-searches for a candidate instead of assuming one at
a fixed spot). Smoke and the full B8 village/mission/treasure loop are
green on the new terrain, and villages are plentiful (23-54 candidates
per 8.7km square across the five seeds).

## Build 9 — World Gen 3.0: every world its own place (2026-08-29)

The big one. Three phases, all aimed at the same complaint: every world
looked like the same confetti of same-sized biome cells.

- **The terrain backbone.** height() now stacks three world-scale fields
  the way Minecraft 1.18 does it: CONTINENTALNESS (basin, shelf, or
  highland, through a spline), EROSION (a flatness multiplier — where
  it's high the land is flat no matter what else wants to happen), and
  PEAKS & VALLEYS (broad swells plus cubed ridge crest lines). Every
  spline control point, field wavelength, the sea bias and the world's
  ridge amplitude jitter per seed — so one seed is an archipelago,
  another an eroded plain, another a craggy highland. The old archetype
  heightfields survive as half-amplitude local character riding on top;
  mesa quantizes the combined height so backbone relief becomes stacked
  tables instead of a tilted plain.
- **Biomes follow the geography.** Archetype choice is no longer a
  uniform die roll: coasts draw swamps and dunes, high-relief zones draw
  ranges, glaciers and volcanoes, and a very-low-frequency heat field
  pushes hot and cold families to different parts of the world.
  Weighted Voronoi gives each region cell a conquest weight, so one sand
  biome is a pocket and the next is huge, and same-family neighbors
  cluster into mega-biomes.
- **Real oceans.** Low continentalness dips well below sea level, so
  worlds get coastlines, shelves, islands, inland seas — and on volcanic
  coasts, lava shores. Water is depth-aware on both the near chunk
  meshes and the LOD rings (translucent turquoise over a visible shallow
  bed, deepening to near-opaque ocean blue), the LOD ring water no
  longer double-covers its underlap strips (which blended into dark
  bands across open water), and gen.spawn() walks outward from (0,0)
  until it finds dry land — one test seed spawned 20m under the sea
  before that, because createWorld pre-seeded the player at x:0 and the
  spawn finder never ran.
- **Villages worth walking into.** Each house rolls its own footprint
  (small square, classic, big square, or a rectangle either way round)
  and 38% grow a second story: a real slab between floors, a hatch in a
  back corner, a rope dropped through it to climb, upper windows.
  Interiors are furnished by role — every house a bed (upstairs if there
  is one) and a torch; the toolsmith a crafting table and a stove out
  front, the broker a stocked chest, the arms dealer an armor stand, and
  the electrician a hand crank wired to a wall lamp that lights when you
  crank it.
- **You can see your work.** Every active mission and accepted explore
  contract projects a COD-style diamond marker into the world with a
  live meter count; off-screen or behind you it clamps to the screen
  edge as a dot so it always tells you which way to turn. The inventory
  gained a MISSIONS panel on the right listing every active job with its
  giver, village, description and distance.
- **Creative is alive now.** Grazers and sheep spawn and wander in
  creative too (nothing spawns in the sea), villages were already
  streaming in but got a slightly more forgiving flatness check for
  WG3's gentler slopes; free-roaming lurkers stay a survival thing,
  while bounty targets still tick in creative so hunts work.

Verified: aerial biome maps of four seeds old-vs-new (old: identical
texture; new: four different geographies); watertight seam test 0/3503
hole edges on WG3 terrain; height() at 0.98us/call vs 0.79 before;
spawn dry on all four test seeds; two-story probes (slab solid, upper
room open) on two villages; the crank-to-lamp wire carries power ids
correctly; markers tick 18m -> 8m walking toward a hunt; 296 headless
tests, smoke, and the full B8 village/mission/treasure suite green.

Known issue: terrain under OLD saves shifts (the world is (seed, edits)
and the generator changed) — the existing lift-out-of-ground guard
handles the player, but pre-WG3 villages may sit oddly on the new
ground. New worlds are the point of this build.

## Build 8.5 — the twist, a real punch, and hands that hold the sheep up (2026-08-27)

Opus patch pass #5. Three notes from the playtest, and the first one
turned out to be a real bug my last round's verification had missed.

- **The left arm really was twisted.** I checked the mirror last build by
  projecting both hands and confirming they landed at exactly ±0.297 —
  which they did, and which proved nothing, because a roll about the
  arm's own axis does not move the fist. The cause: the viewmodel group
  is yawed 24° inward for one-handed tools, and mirroring a pose's x
  *inside* a yawed space gives you the right position with a residual
  roll of a few degrees. The fix is structural rather than a fudge
  factor: the fists group now cancels the group's offset AND its yaw, so
  fist poses live in plain camera-aligned space and the left arm is the
  right arm's exact mirror by construction. Measured by masking the arm
  silhouettes against a flat sky and comparing the frame with its own
  mirror: **0 of 37,820 silhouette pixels differ.** It was 15.4% before.
- **The guard sits wider.** Both fists moved out; the gap went from 0.462
  to 0.594 in screen units, about 29% further apart, with the arm angle
  unchanged (both fist and shoulder moved by the same amount).
- **A real punch.** The old one faded the guard toward a single extended
  pose, so both arms drifted and neither read as throwing anything. Now
  it is keyframed — guard, chamber down and back, drive up and across to
  the crosshair and *closer* so it lands bigger, then a slower recovery —
  with a small forward shove of the whole viewmodel on the hit. The off
  hand holds its guard: measured across the swing, the right fist travels
  0.53 in screen units and the left 0.017.
  One dead end worth recording: aiming the arm straight down the camera's
  axis at the moment of impact foreshortens beautifully for about one
  frame and then sails the sleeve through the eye, filling the screen
  with a blue wall. The drive sells itself by moving the fist, not by
  pointing the arm away. There is now a test that walks each arm's axis
  and fails if any on-screen point comes within 0.25m of the camera.
- **Carrying an animal is locked to the world, not the view.** The arms
  used to be posed in camera space, so they hung in front of you forever
  and swung around as you looked. Now the pose takes the pitch back out:
  the hands hold a fixed spot relative to *you*, so they stay put while
  you look around and swing into frame when you look up at your
  passenger. Verified by reading the hand's world position at four
  pitches from 0.2 to 1.2 — drift 0.000m. Only upward pitch is cancelled;
  look down and it falls back to view-relative, which is the identical
  pose at level and avoids two forearms sliding past your eyes when you
  stare at your feet.
- **And it is an animation now.** Your arms reach out in front toward the
  animal, it attaches, and then it comes up with your hands to the locked
  overhead hold — the animal rides the same curve the arms do, so it sits
  on them the whole way rather than teleporting overhead the instant you
  grab it. The arms also carry the long shoulder section in every pose
  now, so there is no cut-off edge to find at any angle.

297 headless tests, smoke, and the 8.2/8.3/8.4 suites green.

## Build 8.4 — weapons, clothing, and hands that make a fist (2026-08-27)

Opus patch pass #4. Two more menu categories, and the empty-hand pose
rebuilt from the ground up.

- **WEAPONS and CLOTHING.** Two new tabs carved out of GADGETS, which
  had quietly become a junk drawer of 35 things. Weapons takes every
  sword tier and the blaster (and every gun we add later); clothing
  takes all fifteen armour pieces plus the jetpack. Gadgets is left
  with exactly what the name says: drills, dispensers, wrench, grapple,
  drone. Tab order is material · gadgets · weapons · clothing ·
  electricity · special · items, with the blaster and a diamond helmet
  as the two new tab pictures. One taxonomy still drives both the
  creative catalog and the crafting table.
- **The fists.** They were wrong in a way that was easy to see and hard
  to fix by nudging numbers, because the whole viewmodel group is
  shoved 0.34 to the right and yawed 24° inward — it is built around
  one-handed tools. Mirroring the right arm's x in that space does not
  put the left arm anywhere near the left of the screen; it put it in
  the middle, pointing the wrong way. So poses are now written in plain
  screen terms (x out from the CENTRE of the view, -z straight ahead)
  and converted, and an arm is posed by naming the two points that
  actually matter — where the fist is and where the arm leaves the body
  — with the euler solved from those. The guard is symmetric by
  construction: both fists up in front of the face, knuckles turned in
  toward each other, forearms running down and out to the bottom
  corners so they read as coming out of your shoulders.
- **Arms that end off-screen.** A rigid arm posed by its fist has its
  far end ARM_LEN behind it, and on a punch that end swung into frame
  as a floating cut-off box. Raised fists now carry an extra sleeve
  section on the shoulder end, long enough that the cut face is always
  behind the camera. It is hidden for the reach-and-carry and scoop
  poses, which are close-in and keep exactly the look they had.
- **A jab that reads.** The punch swings the fist in toward the centre
  of the screen and slightly closer to the eye, so it lands bigger
  rather than receding, and the off hand pulls in to cover.

Verified in-browser: seven tabs in both menus in the right order, with
the five sword tiers and blaster under weapons, all fifteen armour
pieces and the jetpack under clothing, and gadgets down to thirteen
entries; both fists project to exactly mirrored screen positions; both
arms' cut ends stay outside the frustum through the whole swing; and
the carry and gather poses are pixel-unchanged. 297 headless tests,
smoke, and the 8.2/8.3 suites green.

## Build 8.3 — food is the health bar now (2026-08-26)

Opus patch pass #3. Survival economy, two texture/animation fixes, and
menus that no longer make you scroll for a lightbulb.

- **Hunger is gone.** No bar, no drain, no starvation damage, no
  `game.food` field anywhere in the file. Sprint is unlimited.
- **Health never regenerates on its own.** Eating is the only way back
  up, and it isn't a potion: a meal banks a *pool* of healing that
  trickles into the bar at a fixed 100 hp / 30 s. So a full bar from
  empty always takes thirty seconds no matter what paid for it —
  4 raw meat (25 each) or 2 cooked (50 each). Overeating is refused
  rather than wasted: if the bank plus current hp would exceed full,
  the meal stays in your hand and you get "already mending".
- **Log end grain, fixed and rotation-aware.** The old end texture drew
  concentric rings centred on the 16×16 tile, so it only ever lined up
  on a one-metre cube and turned into bullseyes at every other size.
  Replaced with pale peeled-back inner wood: straight vertical fibre
  that runs the full height of the tile, so it tiles seamlessly at any
  scale. And which faces are pale now follows the block, not the world
  — the mesher bakes the placing edit's trunk direction into a new
  per-vertex `aAxis`, and the shader picks end grain where the surface
  normal lines up with that axis. Roll a log 90° and the pale ends move
  to its left and right. A wood *sphere* gets a zero axis, which never
  matches, so it stays bark all over.
- **A real sword swing.** It used to just rotate right. Now it's an arc
  — up and back, then a fast diagonal chop across the body on a
  `sin(sqrt(t)·π)` curve so the cut snaps and the recovery drifts, with
  the blade translating as well as rotating.
- **Grapple aiming preview.** Hold the hook and a ghosted claw sits
  wherever a shot would catch, oriented to that surface. No rope — the
  line only exists once you fire. The preview runs the *same* cast the
  trigger runs, so it can't disagree with the shot.
- **Categories in both menus.** One shared taxonomy — material, gadgets,
  electricity, special, items — behind the creative catalog and the
  crafting table, so nothing sorts differently depending on which menu
  you opened. Tabs are picture buttons (rock, drill, lever, bed, stick).
  The catalog grid went from 5 columns to 10; the craft panel widened to
  fit the tab row without cramming.

Verified in-browser: hunger bar absent and the field removed; zero
passive regen across a simulated 10 s; 4 raw and 2 cooked each bank
exactly 100; empty-to-full measured at 30.0 s; log axis reads [0,1,0]
upright, [-1,0,0] rolled, [0,0,0] for a sphere, with the end tile pale
and vertically seamless; swing peaks at -1.9 rad and returns to zero;
preview lands within 0.5 m of the real cast and vanishes the instant
the rope appears; 5 tabs in both menus, 10 grid columns, every category
non-empty. 297 headless tests and the smoke suite green.

## Build 8.2 — logs, empty hands, and a real grappling hook (2026-08-26)

- **Wood is a log now, not a second plank.** The old WOOD tile was a warm
  mid-brown speckle with HORIZONTAL seams — the same recipe as planks, so
  the two were nearly indistinguishable (their average colors sat 65 RGB
  points apart after the rework; before, they read as siblings). It's
  bark now: a much darker, desaturated trunk brown with broken VERTICAL
  furrows of varying width, lighter raised ridges, and the occasional
  knot. The vertical run is what sells it — measured, the tile now varies
  ~1.9× more across columns than down rows, which is the signature of
  vertical grain.
  Better still, a felled log shows **end grain on its cut faces**: pale
  heartwood with concentric rings and a bark rim. The terrain shader
  already picks a texture by dominant axis, so the atlas grew one extra
  column past the materials and the shader swaps to it on top faces
  (`uLogMat` / `uLogEnd`). Cheap — one compare in the fragment shader —
  and it's what makes a trunk read as a trunk from above. The HUD icon
  comes from the same tile, so it fixed itself.
- **Coin and drone raise a hand.** Neither matched any viewmodel branch,
  so selecting them showed literally nothing — no arm, no item. They're
  in the held-item list now, along with the treasure map, ledger,
  pedestal, sign and chest, which had the same gap.
- **The grappling hook is a real gun.** It was borrowing the generic
  icon-in-fist. Now it's a proper prop like the drill: steel receiver,
  raised spine, angled grip, a wide muzzle collar, the wound spool of
  line sitting on top, and three prongs stowed in the barrel.
- **The line is real too.** Fire it and a rope leaves the **actual muzzle**
  — the gun carries an empty marker object that the rope reads its world
  position from, so the line always starts at the barrel rather than a
  guessed offset. It spans to whatever you hooked and ends in a claw:
  a hub with four barbed prongs, oriented to the surface normal captured
  at the moment of impact, so it presses flat against a wall or hangs off
  a ceiling correctly. In third person (or photo mode) the rope switches
  to leaving your hand, since the viewmodel isn't drawn there.
  First attempt buried the claw *inside* the rock — the prongs pointed
  along the normal, which is into the surface — so it now stands off by
  one prong length with only the barbs reaching back in.

Verified in-browser: the atlas carries 18 columns with the log-end
uniforms wired, wood measures 65 RGB points from planks and darker, grain
runs vertical; coin, drone and grapple each raise the right hand; the
gun has its 10 parts plus muzzle marker; and the rope's length matched
the true muzzle-to-anchor span exactly (18.27m), centred on the line,
with the claw on the face, oriented to the normal, and everything hidden
again on release. 297 headless tests, smoke, and the 7.5 suite green.

## Build 8.1 — the grid turns with you (2026-08-26)

Two things that had been quietly wrong, and one that was only half built.

- **The grid rotates with the brush.** Rotate a cube 45° and the placement
  lattice rotates 45° with it — all three axes, yaw, pitch and roll. Any
  two objects placed at the same angle, anywhere in the world, land on the
  same lattice and stack flush, so you can build an entire house on a
  diagonal just by holding one rotation. The snap now quantizes in the
  brush's own rotated frame instead of on world axes; the frame is anchored
  at the world origin rather than at your first placement, which is
  precisely what makes two independent placements at the same angle tile.
  With no rotation the math reduces to the old world-axis snap exactly, so
  ordinary square building is untouched (there's a test pinning that).
- **The grid visualization turns too.** It used to draw a flat, permanently
  world-aligned plane no matter how the brush was turned — so at any angle
  it was actively lying about where the next block could go. It now tilts
  and spins onto the real lattice, anchored on a true lattice point through
  the ghost's bottom face.
- **The wrench outline was mirrored, and nobody could see it.** CORE yaws by
  Ry(−θ) (see `rotToWorld`) but THREE's `rotation.y` is Ry(+θ), so every
  place that mapped an edit's rotation onto a scene object drew it flipped
  about Z. A plain cube is 4-fold symmetric, so +45° and −45° look
  identical and the bug hid — until you stretched a box with the wrench,
  and then the outline sat visibly wrong. Confirmed by probing the SDF: the
  real long axis ran to (0.707, 0, **+**0.707) while the outline drew
  (0.707, 0, **−**0.707). One helper, `applyEditRot`, now owns that
  conversion and all five sites use it — wrench outline, multi-select
  outlines, paste ghost, and both drill/dispenser previews (which had the
  same flip, invisible for a uniform brush but real once pitch or roll was
  involved).
- **Prop selection outlines match their rotation.** Props became rotatable
  in 7.2 but their selection box never turned, so a stove placed at 60° got
  a box at 0°. Bounds now carry the prop's orientation and the outline uses
  it — yaw for machines, tables, beds, beacons, plants and stoves, the real
  surface-normal quaternion for staples, and the door outline now hugs the
  actual panel instead of a rotation-proof square (its pick radius is
  unchanged, so reach is identical).

Note the two conventions are genuinely different and both are correct:
edits store yaw in CORE's convention and get negated on the way to the
scene; props store yaw the way THREE does and don't. That's now stated in
the code at both sites so the next person doesn't 'fix' one into the other.

Verified: 297 headless tests (11 new — the rotation helpers are exact
inverses, they agree with `rotToWorld`/`toLocal` so there's one convention
in the codebase, zero rotation snaps identically to before, and same-angle
placements land integer lattice steps apart at yaw / yaw+roll /
yaw+pitch+roll). In-browser: three separate 45° aim points snapped onto one
shared lattice (integer steps apart), the grid plane read −45° in THREE
terms, a rotated stretched box's outline matched the SDF, a 60° stove's
outline matched, and unrotated placement still landed exactly on the world
lattice. Smoke and the Build 7.2 wrench/prop suite green.

## Build 8 — coins & villages: the world gets people (2026-08-25)

Four phases. The wrench built the houses; the economy moved in.

- **Coins.** Lurkers drop 3–6 (plus scavenged ore); a live counter sits
  in the HUD whenever you're carrying any. No XP bar anywhere — coin IS
  progression, because everything below spends it.
- **Villages.** The world seed decides where they can be: one candidate
  per 512m cell, gentle-land archetypes only, flatness checked across
  the actual building ring. Walk near one and it STAMPS — stonebrick
  houses with buried foundations (each stands on its highest footprint
  corner, so nothing floats or drowns in a dune), hollow interiors,
  doors facing the plaza, plank roofs, torches, a well, a notice board.
  All of it lands in the edit list, so village walls mine, paint and
  wrench like anything else you'd build. Villages get generated names
  (Karan, Belwick, Holfell…) and their records persist in the save.
- **Villagers.** Round-headed neighbors in role-colored coats — the ore
  broker, the arms dealer, the toolsmith, the mad-scientist electrician
  — spawned from village records, tethered to their homes, they stop
  and face you when you walk up. They can't be killed, but hitting one
  costs goodwill, and goodwill is the whole game here.
- **Trading.** Right click a villager: their shop opens over your full
  inventory. Every villager runs a book — the broker BUYS your ore and
  ingots and sells them back at a spread; the arms dealer sells swords
  and eventually the gun; the toolsmith sells drills, dispensers, the
  wrench, the grapple; the electrician sells wire, generators, pads,
  the tesla, and — at partner standing — a jetpack. Offers unlock by
  per-villager goodwill (stranger → regular at 10 → partner at 25), and
  every trade earns one more point.
- **Missions.** Ask any villager for work and they rotate you through
  three jobs: **hunt** (a marked, tougher lurker spawns at the stated
  spot — kill it, collect), **expand their house** (a glowing 3.4m frame
  appears behind it; build solid through the outline and the SDF itself
  is the inspector — five shell samples must come back solid), and
  **steal** (a strongbox appears in a neighbor's house holding a ledger;
  delivering it pays well and earns the giver's trust — and costs you
  six goodwill with the victim. The thief route has a price).
- **The bounty board.** Three rotating contracts per village — cull N
  lurkers (kills near the village count while accepted), deliver goods,
  or reach a marker a couple hundred meters out. Claim pays coins; an
  empty board re-papers itself.
- **Treasure maps.** The broker sells them once he knows you. Hold the
  map and the compass arrow swaps to an ✗ with the distance; at the X,
  DIG — mining there with the map on you surfaces a buried chest of
  coins, ingots and diamond, and consumes the map.

Verified end to end in-browser: village stamped with board and named
villagers, a full sell/buy/locked-offer/rep-gain loop, buying a real
tier-1 drill, the complete hunt/expand/steal cycle (SDF build check
failed empty and passed built; opposed reputations moved -6/+5), all
three board contract types progressing and claiming, and a treasure map
bought 217m from home that dug up coin + ruby + diamond and consumed
itself. Village records, reps, missions and boards all round-trip
through the save. 286 headless tests, smoke and the 7.5 suites green.

## Build 7.5.1 — playtest fixes: third person earns its keep (2026-08-25)

Five bugs from the 7.5 playtest, each with a real root cause:

- **Armor followed you between worlds.** The armor reset on world load
  sat inside the `dispSlot !== undefined` branch — which freshly created
  worlds skip — so gear worn in a creative world walked straight into a
  brand-new survival world. The reset now runs for every load. Verified:
  wear diamond in world A, quit to title, create a survival world —
  empty; return to world A — still wearing it.
- **Signs trapped you.** The sign editor's DOM node was accidentally
  inserted INSIDE the HUD layer, which has `pointer-events:none` — the
  textarea and DONE button were unclickable, E was gated off, and Enter
  just made newlines: a soft-lock. The screen now lives with the other
  menus, **Enter saves and closes** (Shift+Enter for a new line),
  Escape closes too.
- **Couldn't pick up animals in third person.** `entityOnRay` was the
  one ray that never learned about the camera pull-back, so animals
  within arm's reach were beyond its range. Fixed like every other ray.
- **Shift-click in the creative inventory looked dead.** The repaint
  crashed: `refreshAllUI`'s selector matched the CATALOG tiles, which
  have no count element, and the exception killed the repaint mid-loop
  (the item had already moved — hence "it's there after reopening").
  `paintSlot` now skips structureless tiles and the selector names the
  real grids. Live repaint verified with real shift-clicks.
- **Third person got real animations.** Carrying an animal holds both
  arms straight overhead under your passenger; punching jabs, gathering
  scoops with both hands, sword swings arc, and mining/placing pumps
  the tool arm. And the hand now grips a real miniature 3D model of
  whatever you're holding — not a floating icon.
- **Pedestals display the real thing** too: a full miniature model of
  the chosen item (chests, tools, ore chunks, ingots, diamonds as
  octahedra — everything has a 3D form now), auto-scaled to fit and
  slowly rotating on the column.

Full suite green: real-event shift-click repaint, cross-world armor
isolation both directions, the complete sign flow (open via RMB, type,
Enter, DONE button), third-person animal pickup with the overhead carry
pose, hand and pedestal models, plus 286 headless tests, smoke and the
7.5 suite.

## Build 7.5 — the player has a body (2026-08-25)

You exist now. Four phases, one build.

- **The body.** Full player model with a ROUND head — sphere dome, hair
  cap, real eyes and a mouth, our silhouette, not Minecraft's. Pixel-art
  skin from the same speckle language as everything else. It walks (legs
  and arms swing with your actual speed), crouches (whole upper body
  drops, legs fold), tucks its legs mid-air, holds whatever item you're
  holding as its icon in the right hand, and its head follows your
  pitch. **F5** toggles third person: the camera backs off along the
  view ray and the SDF pulls it in so it never clips through terrain —
  and every interaction ray (mining, placing, wiring, wrench, fists)
  now compensates for the pull-back, so aiming works identically in
  both views. Five skins (miner, ranger, ember, midnight, gilded) in
  Options. Photo mode and the drone finally show your body standing
  where you left it.
- **Armor.** Helmet, chestplate and boots for every ore tier — stone to
  diamond, 15 craftable pieces. A new armor row in the inventory
  (helmet · chestplate · boots · back); shift-click any piece to wear
  it, swaps included. Each piece blocks a cut of incoming damage by
  tier, capped at 60% for a full diamond set — verified: 50 damage hit
  for 20. Worn armor renders on the body in its tier color. The **armor
  stand** (4 sticks + 3 planks) opens like any machine, takes exactly a
  helmet/plate/boots, and DISPLAYS whatever it holds on its wooden
  frame.
- **Jetpack** (10 iron + 4 ruby, worn in the back slot): hold SPACE in
  the air for short creative-style flight in survival — real thrust,
  exhaust embers, a live fuel readout in the corner, ~11 seconds of
  burn from full. It recharges on the **charging pad** (6 iron + 2
  ruby): wire the pad into your grid and stand on it — 20W draw, only
  while someone with a hungry jetpack is actually standing there, in
  the best analog-grid tradition. 10%→100% verified against a coal
  generator.
- **Grappling hook** (2 iron + 2 wool — cheap-tier vertical movement):
  left click any surface within 34m and it reels you in at 16 m/s;
  click again to let go, or ride it to the wall.
- **Base decor:** the **pedestal** (6 stonebrick) displays one item of
  your choosing — its menu is a single proud slot; the **sign** (2
  sticks + 2 planks) opens a little editor — four lines, sixteen
  characters, rendered onto the board in pixel type.

Everything rides the existing rails: all seven new items place with
real-model previews, rotate with the scroll wheel, get picked up by
fists, selected/moved/deleted by the wrench, and their state (worn
armor, jetpack fuel, stand contents, pedestal item, sign text) saves
inside the records that already existed.

Verified in-browser: F5 round-trip with viewmodel/body swap, skin
switching, the 60% damage cap, stand dressing with non-armor refused,
jetpack thrust draining fuel mid-air with the HUD live, pad charging
10→100 and idling when you step off, an 18.5m grapple pull, pedestal
display + sign text round-tripping through save/load, plus 286
headless tests and the smoke/7.1/7.2 suites all green.

## Build 7.2 — rotate everything, sized chests, the wrench owns the world (2026-08-25)

Quick-build from playtesting notes; the wrench half turned out to be the
deepest cut of the three.

- **Scroll rotates every placement.** Holding any placeable — stoves,
  crafting tables, beds, beacons, machines, plants — the scroll wheel
  spins the live preview in 15° steps (same rule as the drill's rotate
  mode) and the placed thing keeps that facing. Stoves/machines still
  auto-face you; the scroll adds onto that. Staples rotate too: the
  scroll twists them around their surface normal, so a wall staple can
  run its wire at any angle.
- **Chests come in sizes.** Scroll resizes the chest preview through 6
  steps (0.6m–2.0m); the box's physical size IS its storage — 8 slots
  in the tiny one up to 64 in the crate. Middle click switches the
  scroll between resize and rotate while holding one. The collision
  box, wire terminal and menu grid all track the size, and the wrench
  can resize a placed chest later (it refuses to shrink one whose slots
  are still in use).
- **The wrench selects EVERYTHING now.** Right click any placed thing —
  torches, bulbs, tables, beacons, beds, stoves, doors, ropes, plants,
  every machine, staples, even individual wires and tubes — and it gets
  a highlight box and the gizmo. Shift-drag moves it (wires re-route
  themselves since they follow their endpoints), X deletes with exactly
  the refunds fists would give (machine buffers spill, attached
  wires/tubes refund, caged animals go free), shift+RMB multiselects
  props and terrain edits together. Things that aren't built to resize
  refuse the resize drag and say so; chests resize. Solid machines
  needed a smarter pick ray — their own collision box stops the surface
  ray before it reaches their center, so the wrench now recognizes
  "the surface you hit IS the prop" and selects it anyway. While the
  wrench is in hand, right click always selects (machines don't open
  their menus over it).
- **Copy/paste and blueprints carry props.** Ctrl+C packs selected props
  into the clipboard next to the terrain edits — and any wire or tube
  whose BOTH endpoints were copied rides along for free. The paste ghost
  shows the real prop models, stamping re-creates them with fresh ids
  and re-wires the copies (verified: a pasted generator+bulb pair lit up
  on its own new wire), survival pastes charge one item per prop.
  Blueprints save the props too, so a wired factory module stamps whole.
- Found and fixed a latent paste bug along the way: the paste ghost
  rotated one way and the stamped result the other. Edit shapes are all
  180°-symmetric so it was invisible for terrain — props made it obvious
  in one screenshot. Ghost and stamp now agree.

Verified in-browser: 45° stove/table/staple placements land and save,
chest scroll-resize (48-slot 1.6m chest opened with 48 real slots),
middle-click mode toggle, wrench-selecting a stove/generator/wire/torch,
gizmo-moving a generator 3m with its terminal following, resize refusal
on non-chests, wrench chest-grow 1.6→1.9 (64 slots), stove delete
spilling its coal and refunding the stove, wire delete refunding wire,
the powered-pair copy/paste lighting its clone, blueprint round-trip
with props, and rotated pastes matching the ghost. Plus 286 headless
tests, the smoke suite and the full 7.1 suite still green.

## Build 7.1 — staple wiring, everything-is-a-menu, chests (2026-08-25)

Electricity iteration from playtesting, plus one physics bug that turned
out to be two bugs.

- **The fly-through-thin-floors bug.** Reported: fly + sprint + hold C on
  a wrench-shrunk slab and you phase straight through. Root causes, both
  fixed:
  1. One Euler step at fly-sprint speed (22 m/s) can carry the capsule
     past a thin slab's midplane, and the SDF pushout then ejects it out
     the FAR side. Movement now substeps, capping per-step travel at
     ~0.06m (up to 24 substeps a frame — only ever needed at speed).
  2. Subtler and nastier: `contactReal`, the filter that rejects phantom
     CSG contacts, confirms a surface by probing 0.12m PAST it. On a slab
     thinner than ~0.13m the probe pokes out the far side into air and
     rejects a genuine contact — so the slab never pushed back at all,
     at any speed. A strictly-inside shallow probe (0.03m) now also
     counts as confirmation. Verified: fly-sprint-C onto a 0.1m slab
     stops dead on top; anti-slide, step-up and cave-entry suites
     unchanged.
- **Staple wiring** — wires work like redstone routes now. Holding wire
  you carry a stapler in the left hand and a spool in the right. LEFT
  click staples the route down: a small two-legged clip, oriented to the
  surface like bulbs are (floors, walls, ceilings — it uses the SDF
  gradient), and the staple itself is the placement preview. RIGHT click
  starts a wire from any terminal — machine or staple — and then chains:
  each right click on the next staple/machine commits that leg and
  immediately continues the run from it, so laying a long line is
  click-click-click. Right click on nothing ends the chain and hands the
  preview back to the stapler. Wires between staples are TAUT — dead
  straight when the two anchors face the same way, curving only where
  the route turns (floor to wall, around corners; the bezier's control
  points scale with how much the end normals disagree). Machine-to-machine
  wires with no staples still work exactly as before, sag and all, and
  wires now remember their exact attachment points (pa/pb) across saves.
  Staples cost nothing, pull free with fists, and conduct like any node.
- **Everything opens a menu now** — no more depositing by right-clicking
  props with a stack. Generators, hoppers, chests and auto-crafters all
  open a screen: the machine's own panel floats as a SEPARATE box above a
  full inventory panel (30 main + hotbar), stove and crafting screens
  restructured the same way. Generators got a real fuel slot — drop a
  coal stack in and it ignites the moment something draws power, burning
  through the stack lump by lump. Drag-and-drop works across every slot
  (machine grids, fuel slots, stove, dispenser), and **shift-click quick
  move** does the smart thing everywhere: hotbar↔main in plain screens,
  coal→fuel in generators and stoves, ore→input in stoves, anything→
  buffer in crafters/hoppers/chests, machine-slot→inventory coming back.
- **Chests.** 8 planks. 24 slots, open like anything else, and tubes can
  pipe into them — hopper→chest for automated storage, hopper→generator
  for automated fueling.

Browser-verified end to end: the slab catch, staple normals on
floor/wall/ceiling, the full RMB chain flow (gen → 2 staples → bulb lit
through the staples, chain ended on air click), straight-vs-curved runs,
gen fuel-slot ignition (and a dry gen correctly refusing to power),
tube→chest and tube→gen deliveries, every menu's DOM (1 fuel slot vs 24
grid slots, inventory panels present), shift-click paths including the
non-coal-into-generator refusal, E closing machine screens, and a full
save/reload round-trip of staples, wire attachment points, chest
contents and generator fuel. 286 headless tests + full smoke suite +
the Build 7 machine suite all green.

## Build 7 Phase B+C — machines & exotics (2026-08-24) — BUILD 7 COMPLETE

The grid gets things to power.

- **The elevator platform** — the reason to run wires down a mine shaft.
  Place it, wire it, stand on the deck: space rises, C descends, speed
  scales with your circuit's watt ratio (25W draw, only while moving). It
  refuses to move without power, stops against solid rock in either
  direction, travels ±60m, and glues its rider to the deck (your jump is
  suppressed while riding so space means UP). The platform is a real
  moving collider.
- **The auto-crafter.** Wire it, feed it, right click to open its panel:
  pick ANY recipe from the full catalog (it IS a station), and it crafts
  every 4 seconds — faster circuits craft at full rate, starved ones slow
  down (30W draw, only while it can actually craft). Its buffer is a
  real inventory: `CORE.craft` runs directly against it, so outputs land
  back in the buffer and can feed the next recipe. Deposit by
  right-clicking the machine with a stack held; click a buffer stack to
  take it back.
- **Hoppers + item tubes.** A hopper holds stacks (right click with a
  stack to deposit); rigid steel tubes — placed terminal-to-terminal like
  wires, with the same live preview — push one item every 2 seconds into
  whatever they feed: stove inputs and fuel slots (it knows ore from
  coal), auto-crafter buffers, or other hoppers. Coal hopper → stove and
  ore hopper → crafter chains work today.
- **The animal crank.** Carry an animal (fists) to the wheel and right
  click: it walks forever, ~10W. Right click again to set it free. The
  wheel visibly turns while its watts are being drawn, with the animal
  jogging inside.
- **The tesla coil** (phase C): wireless power. A coil on a live circuit
  reaches every terminal within 8m — no wires — and coils relay to each
  other, so grids can hop gaps. Bulbs caught in the field behave like
  wired ones. The orb glows cyan when humming, and standing within arm's
  reach in survival gets you zapped (4 dmg every half second, with
  sparks). Costs crystal from the caverns — the first crystal sink.
- **Generator mk2**: 100W, coal burns twice as long (60s a lump, 240s
  tank). Ruby-striped, twin exhausts.

Everything rides the existing rails: placement previews are the real
models, fists pick everything back up (wires and tubes refund), all
machine state (buffers, fuel, platform height, caged animals, recipes)
persists in the pnode save records with zero new serialization code.

Verified synchronously in-browser: elevator rode up 7.2m and back down,
dead elevator refused to move, crafter turned 2 planks into 4 sticks
while flagged busy, tube moved 3 coal into a stove's fuel slot, animal
crank lit a bulb with the wheel spinning, tesla bridged an unwired bulb
at 4m (and dropped it when the generator died), the zap took 4hp, and a
gen2+meter circuit read a combined 140W after the tesla merged it with
the neighboring yard — emergent, and exactly how wireless power should
behave. Plus 286 headless tests and the smoke suite green.

## Build 7 Phase A — electricity: the grid is live (2026-08-24)

First: two 6.5 playtest fixes. The dispenser preview's texture no longer
swims while you walk with snap off (the triplanar now samples relative to
the shape's own anchor when free-placing; snapped keeps world anchoring,
which was already still), and the preview is ~30% more transparent.

Then the build: **analog power**. Wattage is continuous, not on/off —
sources sum, consumers share, machines scale with supply, no cap.

- **The graph.** Powered props are nodes, wires are edges. Each connected
  component sums its sources and splits them across its demand; the ratio
  (supply/demand, capped at 1) is what every consumer feels. An OFF lever
  breaks every wire touching it — inline switches, exactly like the spec.
- **Sources**: the *hand crank* (right click winds a spring, ~20W while
  wound — juice you make with your arms), the *water wheel* (place it IN
  water, ~15W forever — it knows if it's dry and says so), and the
  *generator* (feed it coal by right-clicking with coal held, ~40W while
  burning, ember-glow mouth). Sources only drain while something draws.
- **Consumers**: *bulbs* wired into a circuit now live and die by it —
  their light AND glass dim when the juice stops (standalone bulbs stay
  always-on, nothing old breaks). *Stoves* wired to power smelt up to 3×
  faster, scaling with their share of the watts — the first machine.
- **The meter** is a real prop with a live canvas screen: watts on top,
  load below, per circuit. The first debugging tool for your grid.
- **Wires**: craft from iron, click terminal → terminal (power props,
  bulbs AND stoves all have terminals); a pale live preview strand sags
  from your first click to wherever you're aiming — build 6.5 rules.
  Right click cancels. Fists pick wires and props back up, refunding
  attached wires. Everything persists (bulbs and stoves got durable
  terminal ids; old saves mint them on load).
- **The camera drone** (pulled forward from the 7 backlog because it was
  too good to wait): craft it at a station (iron + ruby + diamond), right
  click to launch. It's the photo-mode core with a body and rules —
  45m tether to where you're standing, battery drains in flight, dies →
  auto-lands. It charges at ~4.5%/s while in your inventory NEAR a powered
  circuit with spare watts — the first reason to build a grid at basecamp.
  Works in survival. No time-scrub (that stays photo-mode magic).

Still in the build-7 backlog for after this playtest, per the roadmap
rule: auto-crafting table, hopper + item tubes, the powered elevator,
animal crank, tesla coil, generator 2.0.

Verified: synchronous graph tests (no-fuel dark → fueled lit @40W/5W →
lever-off cut while the meter still reads the source side → crank+gen
summing to 60W → stove boost 1.0 → standalone bulb unaffected), a full
browser pass (wire tool two-click flow with live preview, drone
launch/tether-clamp/drain/land/charge-near-surplus, fists wire pickup
with refund, save round-trip of nodes+wires+ids), 286 headless tests and
the smoke suite green.

## Build 6.5 — what you see is what you place (2026-08-24)

Playtest note: placing anything (the rope especially) was blind — no
preview of where it would land. And the wireframe ghost on the dispenser
told you the shape but not the THING. Both fixed; outlines are gone
everywhere except the drill.

- **Every placeable renders for real at its landing spot.** Torch, bulb,
  bed, stove, crafting table, beacon, rope, door, and plants all show
  their actual model — translucent, live-tracking your aim — posed exactly
  as the click will pose them: the bed and stove snap-yaw with your facing,
  the bulb stands on the surface normal (walls and ceilings included), the
  door shows the real panel at the hinge pose (grid + side alignment
  intact), and the rope probes its true drop length in real time so you
  see the whole line before you commit.
- **Engineering**: each prop system's per-instance construction was
  factored into a `model()` factory used by BOTH the world rebuild and the
  preview, so preview and placed object can never drift apart. A single
  `placePreview` system clones materials (originals untouched), rebuilds
  only when the held thing changes, and hides in menus/photo mode.
- **The dispenser shows the material, not an outline.** Holding a material
  stack now floats a SOLID cube/sphere/cylinder textured with the loaded
  material — world-tiled by the same triplanar rule as the terrain shader
  (same axis pick, same 1m fract), so the preview's texture lines up with
  what the click bakes in. Size, per-axis rotation and grid snap all read
  live on the real shape; it solidifies slightly as the charge completes.
  Paint mode keeps its orange wireframe, and the **drill keeps its
  wireframe** — a hole has no body to show.

Verified: pose-parity test (bed preview yaw/position exactly equals the
placed bed; dispenser preview position/rotation/material exactly equals
the resulting edit), a 12-screenshot matrix across every placeable
(including bulb-on-wall orientation and the drill still wireframed), 286
headless tests and the full smoke suite green.

## Build 6 Phase D — wayfinding (2026-08-24) — BUILD 6 COMPLETE

- **M — the auto-map.** A surface survey with explored-fog: 16m cells mark
  as you walk (or fly low over) ground with less than 3m of rock over your
  head — go underground and NOTHING marks, so caves stay unmapped and
  scary. Cells render colored by their surface (materials, water depth,
  NW-light hillshade), with beacons (cyan), beds (red), your death cache
  (white), a yaw-tracking player arrow, north, and a scale note. Colors are
  computed from the generator on demand and cached; the explored set is
  persisted per world (~2km span on screen at 5px per cell).
- **Depth readout.** The nav bar appends "↓Nm" whenever you're more than
  3m under the surface — you always know how deep you are.
- **Rope anchor.** Craftable (2 wool + 1 stick → 2, no station): aim at a
  ledge, click, and the rope drops until it finds a floor (up to 60m).
  Ladder rules while touching it: space climbs, C slides down, hanging
  holds (grabbing one mid-fall arrests the fall — no damage). Fists-down
  LMB picks it back up. Persisted per world, no shadow casting.

Verified: 286 headless tests + full smoke suite green, plus a dedicated
browser pass — rope place/drop-length/climb/arrest/pickup, depth readout,
caves-don't-map, explored growth on the surface, the map screen render,
and an autosave→reload round-trip of explored cells + ropes.

That closes **Build 6 — World Gen 2.0**: macro-region biomes and landmark
set-pieces (A), the -250 deep world with strata and enriched ore bands (B),
the connected cave-network labyrinth with underground biomes (C), and
wayfinding (D). Existing worlds keep their edits but sit on shifted
terrain (see phase A note).

## Build 6 Phase C — the cave network (2026-08-24)

Caves are now a GRAPH, not just noise. Per 160m cell (`CAVE_CELL`), a
deterministic generator lays out:

- **Chambers** (nodes): 2-4 per cell, sphere pockets r 5-13 with ~9% blown
  up to cathedral size (r 14-20). Chamber 0 stays shallow (-16..-54) to
  anchor breaches; the rest spread down to ~-220 — INTO the sealed deep
  zone, which is how the deep world opens up.
- **Tunnels** (edges): winding 3-segment capsule chains (jittered
  waypoints, r 2.3-3.4) — a chain through the cell's chambers, a 45%-chance
  branch loop, and **guaranteed cross-cell links** east and south to the
  neighbors' first chamber. The whole underworld is one connected labyrinth:
  every cell holds >200m of tunnel and links onward (tested), so you can
  genuinely get lost.
- **Breaches**: half the cells crack the surface open above their shallow
  chamber (skipped underwater) — network entrances on top of the old
  noise-cave mouths.

The primitives are exact capsule/sphere distances (the collider can trust
the field), stored per cell with AABBs. `makeLocal` prefilters the list per
chunk footprint so meshing only pays for primitives it can see;
`gatherPrims` serves collision queries from a per-cell 3×3 merged cache;
`caveInBox` lets both deep-zone quick-rejects (meshChunk + stream-in skip)
yield exactly where the network digs. Noise caves above -84 remain as
filler.

**Underground biomes** (chamber-flagged by depth): glowshroom forests
(above -62), crystal caverns (-62..-165, CRYSTAL walls that shimmer in the
dark), lava galleries (below -165, glowing LAVA floors — contact damage
already works), and flooded galleries (still water up to the chamber
midline: rendered by remeshWater as per-chamber pools, swimmable via a
floodedAt hook in inWater).

Verified: 286 headless tests (determinism, ≥2 chambers + >200m tunnel +
cross-links per cell, all chambers carved open, deep chambers mesh through
the quick-rejects, all four biomes spawn with correct wall materials,
breach mouths open, flooded water level) — plus the smoke suite green and
an underground screenshot pass: cathedral-scale crystal cavern, glowshroom
forest, lava-floored gallery, flooded gallery with its water plane and a
tunnel exit. Note for playtests: black wall patches at low render distance
are dark (non-glowing) rock beyond the headlamp — bring torches.

## Build 6 Phase B — the deep world (2026-08-24)

Bedrock drops from -64 to **-250**; the chunk column is now 46 chunks tall
(-256..+112m).

- **Sealed deep zone**: noise caves pinch closed from -68 and are provably
  sealed by -84. Below `gen.caveFloorY` (-86) the world is solid rock until
  phase C's cave network moves in — which is what makes the depth *cheap*:
  an untouched deep chunk can be rejected without sampling (~1µs vs ~13ms
  for a real chunk, measured).
- **Strata**: basalt takes over below a noisy ~-80 boundary; deep mining
  reads visually different from surface rock.
- **Ore bands stretched and enriched**: iron to -80, coal to -60, ruby
  -20..-140, obsidian -60..-190, diamond -110..-248. Vein radius swells up
  to 1.6× toward the bottom — deeper really is richer.
- **Queue hygiene** (the real work of this phase): provably-empty chunks
  (solid deep zone, sky far above the column) are no longer enqueued at
  stream-in — they used to sit in the dirty queue behind 10ms+ real chunks
  and stall the per-frame mesh budget (8.1k queued → 2.1k, same real
  workload as 5.6.1). They stay in the chunk map so `invalidate()` re-dirties
  them the moment an edit reaches them; a conservative edit y-envelope
  (recomputed whenever `invalidate` runs, since wrench moves mutate edits in
  place) keeps the skip sound for saved deep builds. `heightRange` is also
  memoized per footprint — every chunk in a 46-chunk column asks for the
  same rect.
- **Streaming follows you down**: chunk streaming (and the nearest-first
  sort center) only re-triggered on *horizontal* border crossings — descend
  160m in one column and the mesher kept prioritizing the surface from a
  stale center (latent since forever, fatal at 46-chunk columns). The
  crossing key now includes the vertical chunk.

Verified: 270 headless tests (new deep-world section: sealed zone has zero
air probes, caves live above the seal, basalt strata, deep chunk reject +
edited-deep-chunk meshing, diamond present in its band), full smoke suite
green, and a live browser dig: a 170m shaft from the surface to -158,
standing at the bottom inside meshed basalt walls with an obsidian vein in
view, headlamp lighting it.

## Build 6 Phase A — World Gen 2.0: macro-regions & landmarks (2026-08-23)

The whole surface generator is new. **Old worlds keep their edits but the
terrain under them shifts** — the heightfield formula changed, so existing
saves will see ground move relative to their builds. (Seed + edit list still
round-trip exactly; it's the base world that's different.)

### Macro-regions
`biome()`/`isDesert()` are gone. The world is now warped-Voronoi cells
(~520m, `REGION`), each committed to one of 8 archetypes: plains, hills,
sharp ranges (ridged, snow-capped, to ~60m), mesa badlands (stepped
plateaus cut by slot canyons that drop below sea into rivers), dunes
(anisotropic sand waves with oasis pools), swamp (near-sea flats pocked
with water), glacier (high ice sheet split by crevasses), volcanic (black
basalt fields). Height blends between the two nearest sites over ~90m at
borders; everything discrete (mats, trees, decor, water-vs-lava) reads the
nearest site. Borders are domain-warped ±~80m so they never read straight.

### Landmarks
Up to one set-piece per region, kept ≥132m inside its cell so lookups stay
O(1) and fully heightfield-expressible so the LOD rings carry them at 4km:
- **Volcano** (volcanic only): 110m-radius cone +60m with a crater bowl —
  the crater floor is exposed LAVA, and low spots in the basalt fields pool
  lava instead of water.
- **Sinkhole**: 26m-radius, ~46m-deep shaft. Dry when its surroundings are
  above sea (a hole to the deep — phase C will wire these into the cave
  network); floods into a cenote if the basin was already below sea.
- **Monolith**: 44m rock spire.
- **Crater lake**: 55m ring — raised grass rim, water bowl below sea.
`heightRange` enumerates overlapped region cells and folds in `lm.peak` /
`lm.floor`, so chunk quick-rejects can't skip a spire or a pit.

### New materials + rules
BASALT(15), LAVA(16), CRYSTAL(17) with tiles, hardness, colors, and shader
glow (lava is its own light, crystal shimmers in the dark — terrain AND the
LOD ring shader). Volcanic surface: basalt, obsidian shore band at the
water line, lava pools. Glacier: snow to the water line. Standing on/in
lava in survival ticks ~6 damage per 0.4s.

### The wet question
Water used to be "h < sea". Now `gen.wetAt(x,z[,h])` decides — false on
volcanic ground and in dry sinkhole shafts — and all three water consumers
(chunk water mesher, LOD water overlay flag, swim check) route through it.

### Plumbing
- CY_MAX 5→13: chunks now reach +112m (heights clamp to [-45, 95]).
- Snowline 13.5→26, grass to 20, tree/decor gating by archetype
  (trees: plains/hills/swamp; decor skips ranges/glacier/volcanic; badlands
  + dunes get sparse dry tufts).
- Region cells cached; region query ≈ 2 warp fbm2 + 9 cached cell lookups
  + 1–2 archetype fbm stacks. Meshing budget absorbs it (smoke test clean).

Verified: 262 headless tests (new section: region variety ≥6/8 archetypes,
determinism, clamp, all 4 landmark types + shape promises, crater lava,
wetAt rules, heightRange-sees-landmarks, glacier/volcanic surface mats),
full Playwright smoke suite green, and a 15-screenshot matrix: region
overview, volcano air/rim/crater/profile, sinkhole, monolith-on-glacier,
crater lake ring, ranges, mesa, dunes, glacier crevasses. Lava damage
verified in a live survival session.

## Build 5.6.1 — the hands act the part (2026-08-23)

Playtest notes on the fists: functionality perfect, visuals wrong. Reworked
the whole first-person hand rig as a small state machine (mock quality on
purpose — the full player model in 7.5 will redo these with a body):

- **Fists down = empty screen.** No hands at rest in collect mode.
- **Gather (plants)**: ONE hand sweeps out and down toward the ground in a
  scoop, then withdraws (~0.5s sine arc).
- **Animal pickup**: TWO hands reach forward together, then blend upward
  into an overhead HOLD — look up and both hands are in the air under your
  passenger's belly. Grab→hold is one continuous motion (the blend runs on
  the same timer that starts at pickup).
- **Fists up (fight)**: proper mirrored boxing guard — the left arm was a
  second right arm angled identically; now both forearms rise angled toward
  each other, knuckles in. Jab animation thrusts the right fist. Arms are
  scaled longer (1.6× in the forearm axis) so the sleeve cutoff stays off
  screen.
- Sign lesson learned by screenshot: the arm model points down -z, so
  positive rotation.x raises the hand tip — the first pass had every pose
  upside down (hands drooping in the guard, scoop reaching for the sky).

Roadmap addition (build 7): the **camera drone** — survival photo mode with
a body. Buildable/buyable, grid-charged, held to pilot, range-limited; your
body stays standing while the drone flies. Same photo-mode core, new shell.

Verified with a pose screenshot matrix (idle-empty / guard / scoop mid-frame
/ grab reach / overhead hold looking up) plus the full 5.6 browser flow and
238 headless tests.

## Build 5.6 — hands & a living surface (2026-08-23)

### Surface decor
The ground grows things now: grass tufts (green, or dry in deserts), four
flower colors, and shrubs — up to one per 3m lattice cell, deterministic
per seed (`gen.decorAt`), gated by biome, slope, snowline and waterline.
Rendered as instanced cross-quad pixel billboards (7 InstancedMeshes total,
one per look — `frustumCulled = false`, the classic instancing trap, caught
by screenshot when a fully-populated meadow rendered bare). Streams with
chunks and waits for meshed ground like trees do. Picked-up cells and
hand-placed decor persist in the save.

### Fists
Empty hand shows real fists. Right click toggles the stance:
- **Fists up**: both arms raised in a guard; left click jabs (3 dmg, short
  reach, punch animation).
- **Fists down**: left click gathers — plants become inventory items
  (placeable anywhere later; catalog + icons + HUD included), and friendly
  animals get scooped up. A carried animal rides overhead (slightly
  forward, facing your way) and left click yeets it along your aim.
  Lurkers refuse: "it would eat your face."
The left fist needed a forward bias — the viewmodel group is yawed 0.42,
which pushed -x children behind the camera plane.

### Photo mode (creative)
P toggles: HUD and viewmodel vanish, the player freezes in place, and a
detached fly camera takes over (WASD/Space/C, Shift boost, scroll = speed).
Comma/Period scrub the time of day (auto-advance pauses so the light holds
still), F2 downloads a PNG snapshot straight from the canvas.

### Verification
- 238 headless tests (6 new: decorAt determinism, density over a 720m
  square, tuft>flower>shrub skew, waterline/cell containment).
- b56shot.js: decor instancing + meadow screenshot, fists viewmodel +
  toggle, gather → item → place-back round trip, punch (hp 20→17), carry
  overhead + throw, photo mode enter/scrub/fly/exit.
- Playwright quirk documented: the first page.mouse action fires a huge
  movementX delta that spins the camera — tests park the mouse at center
  before aiming.
- Full smoke green, zero console errors.

## Build 5.5.2 — LOD water matches real water (2026-08-22)

Playtest: LOD water was a flat darker blue — with geometry now seamless,
the water color gap was the one giveaway of where the LOD starts.

Tried approximating the real water's composite color in the LOD shader
(texture × tint × alpha over an assumed seabed) — pixel-probe comparisons
against real water kept missing, because the composite depends on the true
seabed underneath. So the approximation was dropped for construction-level
parity: LOD lakebeds now render as normal LOD land (true bottom heights,
shallow-sampled seabed materials, full lighting), and a separate translucent
water-surface mesh lies on top per ring using the REAL water's exact recipe —
same tiled 16×16 texture (shared texture object), same 0xbcd4e8 tint, same
62% alpha — plus the coverage-mask discard and horizon fog. Identical
texture pattern, identical blend, over an equivalently-shaded bed: the lake
reads as one body across the real/LOD boundary. Per-ring hair offsets on the
surface height kill z-fighting in ring underlaps.

Remaining honest difference: real lakebeds are carved by caves, so real
water over a cave mouth is darker than the heightfield skin predicts —
that's content the LOD can't know, visible only transitionally while
streaming.

Verified with before/after pixel probes of the same lake region and the
full suite (232 tests, smoke green, zero console errors).

## Build 5.5.1 — LOD done right: geometry-clipmap rings (2026-08-22)

Playtest: the single far mesh read as "real render, then boom, lowest LOD."
Replaced it with a proper geometry clipmap.

### Seven LOD rings, detail doubling toward the player
Concentric square rings centered on the player: 1m cells to 64m out, then
2m to 128m, 4m/256m, 8m/512m, 16m/1km, 32m/2km, 64m to the 4km horizon.
Cell size doubles exactly as distance does, so screen-space detail is
roughly constant (~0.9° per cell) — the ring that meets real geometry is
nearly indistinguishable from it, and there is no single "cliff" drop-off.

### Rings render like real terrain
The old vertex-color look is gone: rings use the true shading family —
dominant-axis triplanar pixel-atlas texturing (same atlas), sun diffuse,
REAL shadow-map sampling (same map, same PCF), drifting cloud shade, the
luminance noise, and the sky fog. Grass flows from real chunks into the LOD
without a material seam. Rings are built UNINDEXED with one material per
quad — sharing vertices interpolated material ids and fringed every
shoreline/snow edge with rainbow tiles (caught in screenshots, fixed).

### Always connected — the coverage mask
A 160² chunk-column mask (8m texels, nearest-filtered) marks columns whose
SURFACE-band chunks are actually meshed; the LOD shader discards its skin
over covered columns. So the LOD fills everything real chunks haven't
loaded yet — including inside the render distance while streaming — and
yields column by column as they land. Teleport 600m: the world is complete
scenery instantly, then sharpens in place. Coverage uses only the surface
band per column (cached), not the whole column — deep cave and sky chunks
mesh last and don't matter to a surface skin. First mask version required
whole columns and never covered anything (caught by probe, fixed).

### Seams
Each coarser ring is sunk slightly deeper (0.06m innermost → 1.9m at 64m
cells) and underlaps the finer ring by two cells, so ring boundaries are
tiny backed steps rather than cracks; the innermost ring meets real geometry
at true height. Rebuilds are amortized (~4200 height samples/frame, one
ring at a time, finest first) and each ring recenters after E/8 of travel —
walking never hitches.

### Numbers
~116k grid samples across all rings, ~560k unindexed vertices, 7 draw
calls. Camera far 5200m; surface fog now 3.2km. Rings cast shadows too, so
unloaded columns still shade the world plausibly.

### Verification
- 232 headless tests green.
- lodshot.js: 7 rings built, mask covers spawn columns and recenters after
  teleport, screenshot matrix (ground-level transition, 60m aerial, 600m
  teleport early/late, peak panorama).
- Full smoke green, zero console errors.

## Build 5.5 — the STRATA shader pack (2026-08-22)

Playtest asks: AO banding reads as solid lines; dark creases ignore placed
torches; real cast shadows (trees, mountains, sun direction, shape outlines);
god rays; much bigger render distance; an FPS cap slider.

### Per-vertex AO (banding gone) + light fills creases
AO moved from per-quad to per-DC-VERTEX: sampled at each cell vertex with a
tap direction taken from the mesher's already-computed field grid (free and
seam-consistent), cached by cell index. Every quad corner carries its own
AO, so shading interpolates smoothly instead of stepping in per-quad bands.
Taps trimmed 4→3 to keep meshing throughput. Torch/headlamp light now takes
only 15% of the AO (was 50%) — placing a torch beside a dark crease visibly
floods it (verified by screenshot pair).

### Real sun shadows (the headline)
A directional light drives three.js's shadow-map machinery purely as a
depth-map generator (props are unlit materials, so its intensity is ~0):
4096² map, ortho box that follows the player (texel-snapped so edges don't
shimmer), radius scaling with render distance. Terrain, trees, props, and
entities all cast; the terrain shader samples the map manually (RGBA depth
unpack + 3×3 PCF + slope-scaled bias). Trees throw canopy shadows, builds
throw crisp outlines matching the sun's direction, and shadows track the sun
across the day. Shadowed ground keeps a cool sky-tinted ambient. Shadows
fade out at night (no phantom moon shadows) and can be toggled in Options.
Excluded casters (ghost previews, selection wires, sky, clouds, water, the
first-person rig) are flagged and skipped by a subtree-aware traversal.
Deferred: mountains beyond the ~220m shadow box don't cast; a second cascade
is the next lever if wanted.

### God rays
Screen-space light shafts: a ¼-res occlusion buffer (bright sun disc, world
silhouetted black via override material, overlays hidden) radially blurred
toward the sun's screen position and added over the frame. Day-gated,
skipped underwater/off-screen; Options toggle. Verified by a brightness
probe (+14 avg RGB with rays on) and screenshots.

### Drifting cloud shade
Soft procedural cloud shadows scroll across sunlit ground (value noise in
the terrain shader, ~22m features), scaled by daylight.

### Far terrain — the horizon at last
Render distance slider raised 6→32 chunks (256m of full-detail SDF terrain),
and beyond that a single low-res heightfield mesh (8m grid, ~1.6km radius)
carries the horizon: mountains, snow caps, lakes, beaches, all lit by the
same sun uniforms and fogged into the sky. It sits 0.45m under the true
surface so real chunks always win depth, discards near the player, rebuilds
amortized (5 rows/frame, at most one rebuild per 8s), and recenters after
300m of travel. Camera far plane 400→2600; surface fog now reaches 1.5km
while caves keep their short black fade (fog range scales with skylight)
and underwater keeps its murk.

### FPS cap
Options slider: 30/45/60/90/120/144/180 or MAX. Implemented as a frame
limiter over requestAnimationFrame. Note: browsers vsync rAF to the display,
so MAX equals the monitor's refresh rate (180 on the reporter's screen) —
uncapped-beyond-refresh is not possible in a browser, no setting can change
that.

### Verification
- 232 headless tests green (AO tests unchanged in spirit, thresholds hold).
- Screenshot matrix: morning long shadows, tree canopy shadows, god rays
  past a pillar (+ brightness probe), noon km-horizon, cave (short black
  fog, no phantom shadows), night (stars, no shadows), torch crease fill,
  options menu.
- Full smoke green, zero console errors. Smoke now presets light graphics
  options + half-res rendering (software rasterizer) and polls the two
  wall-clock-sensitive tests instead of fixed waits.

## Build 5.4.1 — depth cues: SDF ambient occlusion + shading gradients (2026-08-22)

Playtest report (second tester): approaching a cube face head-on felt like a
2D square scaling up, not a surface getting closer — motion sickness. Root
cause confirmed by screenshot: lighting was `ambient + sun·diffuse`, both
constant across a face, so a wall filled the screen as one perfectly uniform
sheet. Zero depth gradients of any kind.

Three fixes, all shading:

### Baked SDF ambient occlusion (the big one)
The world IS a distance field, so real AO is nearly free: at mesh time,
each quad marches 4 taps along its normal (0.25–1.8m) and compares the free
space `evalSDF` grants against the march distance. Because the SDF is a
global min-distance, this also darkens floors near walls and wall bases near
floors — contact shadows for free, which grounds every placed cube instead
of leaving it pasted onto the scene. Baked to an `aAO` vertex attribute
(same path as the `aSky` bake); AO multiplies ambient fully, direct sun
~half, point lights (lamp/torch) half. Seam-consistency: taps use a wider
lattice-aligned local gen (never edge-clamped) and a position-culled edit
set, so neighboring chunks bake identical AO at the boundary.

### World-anchored luminance variation
Value noise at ~3m scale (±5%) multiplied into the final color. Big
single-material faces get gentle landmarks that slide with parallax instead
of reading as one flat poster. The hash lattice wraps mod 64 so sin() stays
precise far from the origin without seams.

### Near-field radial gradient
Fragments inside ~5.5m get a soft brightness lift that peaks at the player
(+10%, quadratic falloff). Head-on approach now produces a continuously
growing radial hotspot — a "you are getting closer" signal that pure
texture scaling never provides.

Deferred: true sun shadow-mapping (needs manual shadow sampling in the
custom shader — revisit if AO isn't enough in playtest).

### Verification
- 232 headless tests (6 new: aos attribute shape, flat ground unoccluded,
  contact shadow at a cube base, bright ground away from it, mined-interior
  corner darkening, deterministic bake).
- Before/after screenshot sequences head-on and at an angle.
- Full smoke green (incl. cave entries, night, purity), zero console errors.

## Build 5.4 — the editor completed: multi-select, copy/paste, blueprints (2026-08-22)

### Multi-select (shift + right click)
- Shift+RMB with the wrench adds/removes edits from a selection set; plain
  RMB still single-selects. Primary selection keeps the orange wireframe +
  gizmo arrows; every other selected edit gets a cyan wireframe.
- Shift-dragging any gizmo arrow now moves the WHOLE selection together
  (resize stays primary-only — multi-resize is ambiguous). Grid snap still
  quantizes the drag steps.
- X deletes the entire selection, back-to-front so every prefix stays
  intact — each edit refunds against the exact world state it was made in,
  same as single delete. Refunds are aggregated into one toast.
- Selection indices are per-world state: cleared on world load, revalidated
  after undo.

### Copy / paste (Ctrl+C / Ctrl+V)
- CORE gained `copySelection` / `pasteSelection`: a clipboard stores edits
  relative to the bottom-center of the selection's AABB, in edit-list
  order — so a paste replays the original CSG sequence (a hollowed tower
  pastes hollow, interior holes included). No block game can do this; the
  edit list is the superpower.
- Ctrl+V enters paste mode with a full ghost preview of the selection
  (green = builds, red = carves, orange = paint) anchored at the crosshair.
  Works while holding ANY tool. Scroll rotates the whole selection in 90°
  steps around the anchor — 90° keeps grid alignment exact, and yaw
  composes onto each edit's own rotation. LMB stamps (repeatable), RMB or
  Ctrl+V cancels. F-grid snaps the anchor to the lattice.
- Survival economy: a stamp pre-checks affordability (sum of place/paint
  costs, computed sequentially against the growing edit list), consumes
  materials, and credits mine yields — identical to doing the ops by hand.
  Creative stamps free. Each stamped edit lands on the undo stack.

### Blueprints (N)
- N opens the blueprint library. Save the current clipboard under a name;
  blueprints persist in localStorage across ALL worlds (rows use the same
  serializer as the save format). STAMP enters paste mode with that
  blueprint; DELETE removes it. Build a house once, stamp a village.

### Plumbing
- Ctrl+C/Ctrl+V are intercepted before key-state booking (so C doesn't
  crouch and V doesn't nudge ghost distance mid-chord); typing in the
  blueprint name field is guarded from game keybinds.

### Verification
- 226 headless tests (10 new: clipboard order from unsorted indices,
  bottom-center anchor, identity paste, shifted-SDF equivalence, 90°
  offset rotation + selective rot application, blueprint row round-trip).
- b54shot.js browser flow: shift-click multi-select with cyan secondary
  wire, whole-selection drag-move, rotated stamp lands solid, multi-delete,
  blueprint save/stamp round-trip through the real panel, undo revalidation.
- Full smoke green, zero console errors.

## Build 5.3.1 — creative mode overhaul + phantom collision fix (2026-08-22)

### Phantom collision after exact removal (the big one)
Place a cube, remove the exact same cube: the geometry disappeared (5.3's
exact-removal fix) but the player still collided with the empty space.
Root cause: the CSG field is a **lower bound**, not a true distance. After
union-then-subtract, the union's exterior distance keeps field values small
near the phantom faces, and the interior of the removed volume sits at
+MINE_EPS with near-zero gradient — so raw `d < r` collision reported
contacts on surfaces that no longer exist. Fix: `contactReal()` — before
accepting a claimed contact, march from the query point along −gradient by
the claimed distance (+0.12 slack) and require the field to actually reach
< 0.015 there. Real surfaces pass; phantom faces never do. Applied in
`capsuleFree`, the player collide loop, the grounded probe, and entity
collision. Verified: probe + physical walk straight through a removed cube
(scratchpad/ghostcol.js), and no regression on real contacts — cave-floor
rest gap, wall contact distances, grounded detection all unchanged
(scratchpad/collide_check.js).

### Creative mode is now actually creative
- **Loadout:** creative worlds start with just a diamond drill (slot 1) and
  a diamond dispenser in the dispenser slot. No pre-seeded material stacks.
- **Catalog panel:** with inventory open in creative, a CATALOG panel sits
  to the left listing everything in the game — all materials, all 5 tiers
  of drill/dispenser/sword, blaster, wrench, and every placeable/item
  (torch, bulb, stick, wool, door, table, stove, bed, beacon, meats, ores,
  ingots, diamond). Click to take: materials +500, stackables +10, tools 1.
- **No consumption:** placing torches, bulbs, doors, tables, stoves, beds,
  beacons in creative no longer decrements the stack.
- **Free crafting:** the crafting menu in creative shows every recipe
  (station recipes included, no table needed), costs read "free", and
  crafting consumes nothing.

### Fixes
- Crafting a wrench gave a blaster: `craft()`'s output ternary had no
  wrench case and fell through to `makeGun()`. Added `makeWrench()`.
- Exported `STACKABLE_KINDS` from CORE (catalog uses it).
- Inventory + catalog row wraps/scrolls instead of clipping on narrow
  viewports.

### Verification
- 216 headless CORE tests green (incl. collision fix regression checks).
- b531shot.js: creative loadout, catalog visible + click-to-take, torch
  place keeps count, craft menu all-free, wrench crafts a wrench, and a
  physical walk through a placed-then-removed cube (ends 5m past it).
- Full smoke.js green, zero console errors.

## Build 5.3 — precision editing & the wrench (2026-08-21)

### Exact removal (the "bits remaining" bug) — FIXED
Union-then-subtract of the exact same shape left a zero-thickness
membrane: zeros count as solid (needed so mine-then-place restores
ground), so the re-mined cube's faces stayed "solid" at d=0. Subtracts
are now applied 2cm larger than they store (MINE_EPS) — invisible at
0.5m voxels, but the old faces land strictly in air. Placing a cube on
the grid and mining it with the same grid + size removes every last bit.
Regression tests: cube and sphere place-then-mine leave zero solid
samples and zero stray triangles; mine-then-place still restores solid.

### THE WRENCH — a material editor over the edit list
The edit list has always been the memory of how the world was built;
the wrench (station recipe: 3 iron ingots + 2 sticks) turns it into an
editor. Steel wrench viewmodel, pixel icon, full HUD cheat-sheet.
- **Right click** selects the build (or mined hole) under the crosshair —
  the exact cube/sphere/cylinder you placed or carved, latest first —
  outlined in an orange wireframe.
- **Gizmo**: six axis arrows (X red, Y green, Z blue) float on the
  selection's faces, rotated with it. Aim at an arrow and hold left
  click: mouse movement along the arrow extends/shrinks that face
  (center compensates, so the far side stays put). **Shift-drag moves**
  the whole edit instead. F toggles grid snapping for drags — snapped
  drags apply in exact grid-cell steps. Everything re-meshes live.
- **H hollows** a selected build: appends an interior subtract with
  0.3-0.5m walls, matching the build's shape, size and rotation. Place a
  massive cube, hollow it, cut a doorway, hang a door: instant house.
- **X deletes** the selected edit outright. Placed builds refund their
  FULL original cost (recomputed against the exact edit-list prefix from
  when they were placed); deleting a mine op takes its yield back.
- **Paint mode (R)** moved here from the dispenser: scroll cycles a
  9-material palette, left click recolors the aimed build in place (or
  stamps a brush-shaped repaint on bare terrain). Free — it's an editor.

### Per-axis size + full rotation on edits (CORE)
Edits now carry optional sx/sy/sz (per-axis sizes) and rx/rz (pitch and
roll on top of yaw). Box SDFs stay exact under stretch+rotation; spheres
become ellipsoids and cylinders elliptical (good approximations);
analytic mesher normals, AABBs (|R|·h bound) and the save format all
round-trip the extras — legacy 8-field edit rows still load. Meshing a
stretched, 3-axis-rotated cube is watertight (tested).

### Scroll modes: middle click cycles resize → rotate
Middle click on drill/dispenser/wrench cycles what the scroll wheel
does: resize → rotate Y (yaw) → rotate X (pitch) → rotate Z (roll) →
back. One button, mode always shown in the HUD; 15° steps. Rotation now
works WITH grid snap: the lattice itself stays world-aligned, so a
rotated cube still snaps its center to the same grid as an unrotated one
and the two line up flush. G+scroll rotation is gone; **G now picks the
material you're looking at** (middle click's old job).

### Quality-of-life
- **Eating is right click** while holding food (was H).
- **Stoves face you** when placed — the mouth points back at the placer.
- **Bulbs mount anywhere**: walls (sideways) and ceilings (upside down),
  oriented along the surface normal; their light offsets along it. Old
  saves default to upright.

### Verification
216 headless tests (exact removal, transform math, serialization,
watertight stretched+rotated meshing). Browser: RMB eat, stove yaw = π
toward placer, wall bulb normal (-1,0,0), in-game place+mine leaves 0
solid, MMB cycle 0→1→…→0 with 15° wheel steps, wrench select → gizmo
render (screenshot) → drag grows + shifts center → grid drag exact
0.75m multiples → hollow (air inside, wall solid) → paint recolors →
delete with cleanup. Full smoke green, zero console errors.

## Build 5.2 — food, coal & the stove (2026-08-20)

### Meat & food
- Every passive animal drops **Meat**: grazers 2, sheep 1 (plus wool).
- H eats it: raw meat +20 food, **Cooked Meat +45** (cook it in a stove).
  Glowshroom stays edible (8 -> +30) and is now the lightbulb ingredient.

### The stove (furnace)
- Crafted from 12 rock + 4 wood at a table. Textured prop: stone-brick
  body, steel top, chimney, and a mouth that glows with embers while
  burning.
- Right click opens the furnace menu: INPUT / FUEL -> OUTPUT slots on
  top, your full storage + hotbar below, all drag-and-drop. Output slot
  only gives; input only takes smeltables; fuel only takes coal (8
  smelts) or wood (2).
- Smelting takes 2s per item and keeps running while the menu is closed
  (and across save/load — stove contents and burn state persist).

### Coal + the ore -> ingot economy
- **Coal** is a new cave ore, more common than glowshroom. Torches now
  cost 2 sticks + 2 coal (glowshroom freed up for bulbs).
- Mining iron/ruby now yields **iron ore / ruby ore** items; smelt them
  into **iron ingot / ruby ingot** bars. Diamond mines directly as a cut
  gem item; obsidian is unchanged (mines and builds as material).
- All ingot-tier recipes updated: drills/dispensers/swords t1-t2 cost
  ingots, t4 costs diamond gems, blaster and beacon cost ingots.
- Undo of a mine refunds the ore items correctly.

### Textures
- In-world ore tiles are now stone with embedded chunks of the ore
  (minecraft style) for iron, ruby, coal and diamond. Obsidian untouched.
- New item icons: rectangular stacked ingot bars (iron/ruby), a faceted
  diamond gem, raw/cooked steaks, coal lumps, ore chunks, a lightbulb,
  and the stove.
- Held items without a bespoke prop now show their pixel icon seated in
  the fist (meat, ores, ingots, gems, coal, bulbs, stoves).

### Lightbulbs
2 glowshroom-heavy craft (4 shroom + 1 iron ingot -> 2 bulbs). Placeable
like torches; real bulb shape (screw base, neck, glass globe, filament);
**twice the torch light radius** (19.6m vs 9.8m). Mining pops them back.

### Lurkers burn at dawn
Night hunters caught on the surface in daylight ignite — flame
particles, 5 hp per 0.4s — and are gone in a few seconds, so they never
linger into the day. Underground lurkers are safe in the dark.

### Verification
201 headless tests (coal commoner than glowshroom, ore->item mapping,
smelt table, fuel values, ingot recipe costs, bulb/stove recipes).
Browser: mined iron lands as 12 ore items (no mat stack), stove smelts
3 ore -> 2 ingots in 4.7s with burn state ticking, furnace menu opens
with live status, bulb light registers at 19.6m beside a 9.8m torch,
eating 40->60->100 food, lurker at 30hp burns to 5hp in 4s (dies ~5s).
Full smoke green, zero console errors.

## Build 5.1 — water scoping, beds & sheep, real sky (2026-08-20)

### Water is lakes now, not a blanket table
- **Mechanics**: a point is water only if it's below sea level AND its
  terrain column is (y < sea && height(x,z) < sea). Lakes and the caves
  under them flood; dry caves under normal land stay dry; inland mined
  pits stay dry. Verified: swim=true in the lake, swim=false at the same
  depth under high ground.
- **Rendering**: the 600m follow-plane is gone. Water surface quads are
  built per terrain chunk (1m cells over columns whose ground dips below
  sea), created/disposed with the chunk — so water can never appear
  beyond meshed terrain, killing the fake ocean horizon.

### Beds (respawn moves here from beacons)
- Sheep-drop wool + 6 planks -> bed (station recipe). Textured prop:
  plank frame + headboard, wool mattress and pillow, stitched red
  blanket; solid to walk on; mining pops it back.
- Right click a placed bed: **sets your spawn point** always, and at
  night also **sleeps to dawn** (screen fade, time jumps to morning).
  Survival respawn uses the bed spawn point; world spawn if none.
- Beacons are pure waypoints now, and the compass points to the
  **closest** beacon, not the latest.

### Sheep
New passive surface animal (day spawns, alternates with grazers, cap 4):
woolly white body with fluffy back/tufts, faced head (eyes with glints,
nostrils, mouth, ears), animated legs. Killing one drops 2-3 wool.

### Sky
- **Sun and moon** discs travel a fixed arc tied to timeOfDay — their
  height in the sky reads as the day/night progress bar. Sun has a soft
  glow; moon is a cratered pixel disc; each fades out below the horizon.
- **Stars**: 420-point field, fading in as dayF drops.
- **Clouds**: twelve rounded blob-cluster clouds (flattened spheres, not
  boxes) drifting slowly at 58-80m, wrapping around the player, fading
  and darkening at night.

### Other playtest fixes
- Ruin loot pillar is now **ruby over iron** (was diamond/obsidian).
- Torch embers are slower and subtler: smaller points, ~1/3 the spawn
  rate, low drift velocity, gentle gravity, longer soft fade.
- Trees no longer float over unmeshed ground: a tree only appears once
  its ground chunk has meshed (pending trees retry as chunks land).

### Verification
190 headless tests (ruby/iron pillar, bed recipe consuming wool items).
Browser: lake swim true / under-land swim false, horizon clean of fake
water, bed sleep (time 0.75 -> 0.03, spawn set, respawn lands at bed),
sheep kill -> +3 wool, compass picks the 7m beacon over the 670m one,
morning sun / moonrise / star field / cloud screenshots. Full smoke
green, zero console errors.

## Build 5 — water & world depth (2026-08-20)

### Water
- **Global water table at y = -1.5** (gen.seaLevel): valleys flood into
  lakes, mined pits below sea level fill, and cave sections under it are
  flooded — one consistent rule, no simulation. The flat build-1 world has
  no sea (seaLevel null), so all legacy behavior holds.
- Rendering: one big translucent pixel-textured plane that follows the
  player (position snapped to the 4m texture period so texels stay
  world-anchored). The depth test hides it behind terrain, which makes it
  correct inside flooded caves for free. Underwater: blue screen tint +
  fog/sky shift to deep blue.
- **Swimming**: waist below the table = buoyant movement (slow sink at
  rest, Space swims up hard enough to climb out, C dives, ~half walk
  speed). Water breaks falls (no fall damage into water).
- **Breath** (survival): 12.5s of air, refills fast at the surface; blue
  breath bar appears when it's not full; drowning deals 6 hp/s at zero.

### World depth
- **Beaches**: sand rings every waterline (h < sea+1.6). Trees no longer
  spawn there (density retuned so overall tree count holds).
- **Snow**: new SNOW material caps terrain above h≈13.5, with sparkle
  texture; buildable/minable like any material.
- **Ruins**: broken stonebrick shells (one candidate per 72m cell, ~40%
  occupancy, flat-ground/altitude gated) baked directly into the
  generator's field + material functions — so seams, collision, mining
  and chunk skipping (heightRange sees the walls) all just work. Jagged
  broken wall tops, a doorway, a floor slab, and a center loot pillar:
  obsidian with a **diamond cap** — surface-findable diamond, worth
  breaking open. New STONEBRICK material; 4 rock -> 4 stonebrick (basic
  recipe) so ruins are also a building-block source.

### Beacons
Station recipe (8 iron + 4 ruby + 4 planks) -> beacon item. Place it to
set **home**: the compass arrow and distance now point at the latest
beacon (spawn if none), and survival respawn lands beside it. Placed
beacons are steel-based glowing pillars that light their surroundings
like oversized torches (16-light budget shared, nearest win). Mining
near one pops it back into inventory, like tables/doors.

### Fixes riding along
- Door sizes (w/h) now survive save/load — the v4 serializer dropped
  them, so every door reloaded at default size. Save format is v5
  (beacons added; old saves load fine with defaults).

### Verification
187 headless tests (new: sea level, beaches/snow coverage, ruin
determinism + solidity + materials + local/global agreement + watertight
meshing, stonebrick/beacon recipes). Browser: swim/overlay/breath/
swim-up verified numerically; beacon place -> compass 2m -> respawn
beside home; screenshots of lake, lakebed dive, ruin, snow peak, placed
beacon. Full smoke green, zero console errors.

### Known issues
- Entities ignore water (walk on lakebeds). Water is invisible at long
  range where the 600m plane ends.
- Distant trees can float briefly over unmeshed shore chunks.

## Build 4.3 — hole fix, freeze fix, viewmodel & texture overhaul (2026-08-20)

### Bug: holes in geo when building/mining (see under the map) — FIXED
Root cause pinned by A/B headless scans: 4.2's dual-vertex cells. Splitting
a cell into two sheet vertices needs full manifold-DC face bookkeeping to
stay watertight; the per-cell-edge stitching left slit holes — worst at
small brush sizes where thin features put two-sheet cells everywhere (up
to 24 open edges in a 6-carve cluster; the playtest's "pretty big holes").
Fix: thin-gap cells now solve ONE vertex on the DOMINANT sheet only. The
vertex lies on a real surface (no mid-gap QEF spike, so the 4.2 shard fix
holds — placed-cube quality test still passes) and topology stays standard
one-vertex DC, so holes are impossible by construction. Watertight bound
tightened back to ZERO and 7 new small-brush regression tests added
(spheres/cubes/mixed at 0.5–1.5m). 171 headless tests green.

### Bug: game freezes holding a dispenser item in the hotbar — FIXED
updateViewmodel derived the held kind from the ITEM ('disp') but the
tier-color path dereferenced activeTool(), which is null for a bare
dispenser in hand (only drills activate from the hotbar) — a TypeError
every frame killed the loop. Guarded; regression-checked in the browser.

### Viewmodel overhaul
- **Minecraft arm**: rectangular arm from the bottom-right — blue
  pixel-textured sleeve up the arm, pale skin hand, chunky MC proportions.
  Every held item (torch, stick, sword, door, table, material chunk) sits
  in/on the fist — nothing floats in front of the camera. Loose material
  stacks show a textured chunk of that material in the hand.
- **Drill redesign**: big industrial driver — armored body with panel-seam
  and rivet textures, side/rear vents, light steel spine, energy core
  stripe and spiral-fluted bit both tinted by tier; the whole head spins
  while mining.
- **Dispenser redesign**: armored emitter — textured body, crown plate,
  side plates, tier-tinted energy core + front ring, three claw prongs
  cradling the loaded-material orb (still the ammo gauge, still flashes
  red when short).
- All 16x16 canvas pixel textures (NearestFilter), grayscale where
  tier-tinted, built once and cached (PixTex/PROP_TEX).

### Prop texture rework
Torch (bark stick + ember-pixel tip), door (vertical plank texture with
grooves + panel lines), crafting table (plank top with painted saw,
hammer and nails; bark legs, plank sides). Held versions match.

### Torch feel
Light flicker removed — torch light is steady now (held tip no longer
pulses either). Instead torches shed small ember particles: placed
torches within ~28m emit rising sparks (dedicated small-point particle
system so close embers don't render as giant squares), and the held torch
sheds embers from its tip.

### Verification
171 headless tests; full browser smoke green (4/4 cave mouths on foot,
wood chain, sized doors, purity 900/0); wall forensic re-run: 845 pixels,
zero shard triangles — the dominant-sheet change keeps 4.2's fixes.

## Build 4.2 — playtest fixes: shards, floating, doors, hands (2026-08-20)

### Bug: triangle shards on placed cubes — FIXED (three layers deep)
The "shards of geo sticking out where cubes meet ground / each other":
1. **Corner gradient poisoning.** Hermite crossings landing exactly on
   lattice corners sampled tetra gradients (h=0.1) that wrap around cube
   corners, feeding the QEF planes that exist on neither face. Crossings
   on an edit's surface now get the primitive's **analytic normal**
   (cube face argmax, sphere radial, cylinder side/cap) instead of a
   numeric gradient.
2. **Opposing sheets in one cell.** Where a thin gap separates a placed
   cube's bottom from the ground, one DC cell holds two opposite-facing
   surfaces; a single QEF vertex averages them into a spike. Cells now
   split into **two vertices** when opposing-normal crossings separate by
   >0.3m along the normal; quads pick the right sheet per cell-edge slot.
3. **Material bleed.** Quad material sampled at solid grid corners lying
   exactly on a snapped cube's face plane got claimed by the cube's union
   — ground triangles at the wall base rendered obsidian (the visible
   dark "fins"). Material is now sampled at the crossing point nudged
   0.06m into the solid side. Verified by raycasting 845 screen pixels
   across a 5-cube wall scene: zero mismatched triangles.

### Bug: floating over curved cave floors — FIXED
The combined field is not a true SDF: the heightfield is scaled 0.65 and
carve noise flattens |∇f| further, so raw d under-states real gaps ~2.4x
near cave walls — capsules "collided" with air and hovered. All collision
paths (player, entities, capsuleFree) now divide the field value by the
local gradient magnitude (clamped [0.25, 1]) — a first-order true-distance
estimate. Measured: resting gap on a curved carved floor 0.021m (was
0.3-0.5m); walking contact stays 0.36-0.43m against a 0.42m radius.
Smoke: still 4/4 cave mouths entered on foot.

### Bug: held door/table showed a torch, named "stone dispenser (undefined)" — FIXED
refreshToolHUD's tool branch matched ANY active tool and rendered the
drill/dispenser ternary for torches/doors/tables. Branch now gated to
drill/disp; every item kind has its own HUD text.

### Planks & sticks rework
- MAT 11 is now **planks** (buildable, board texture): 1 wood log -> 4.
- **Sticks are an item**, not a material (stick icon, held-in-hand prop,
  can't be built with): 2 planks -> 4 sticks.
- Torch (2 sticks + 2 glowshroom), door (6 sticks), swords (2 sticks +
  12 material) now consume stick items; crafting supports item costs.

### Trees v2
Tapered cylinder trunks + clustered sphere-blob canopies (deterministic
per tree), 16x16 bark/leaf canvas textures (NearestFilter), ~7-11m tall,
day/night tinted. Trunk collision, chop rays, and felling track the new
sizes; bigger trees yield more wood (6 + 4x scale).

### First-person hands
Articulated right hand — palm, heel, four 3-segment tapering fingers,
opposing thumb, sleeve cuff — gripping every held non-drill/dispenser
item: torch, stick, door, table, sword, blaster, and loose material
stacks (textured chunk resting in the hand). Grip pivots so the knuckle
row and finger curl stay camera-visible.

### Doors v2
Holding a door shows a **door-shaped ghost panel** (green, skinny) with
the dispenser's placement kit: scroll resizes (0.7-2.4m wide, height
1.85x), F toggles grid snap, V/B distance in free mode. With snap on the
ghost sits on a grid-square edge and **right click cycles which side**
(N/E/S/W); with snap off right click rotates 90 deg. Doors store their
size (w/h) — collision, open/close rays, and removal all honor it. Old
saves default to 1.2x2.2m.

### Crafting table right click
Right-clicking a placed table within 3.5m opens the crafting menu,
overriding whatever's held. (Q still works anywhere; table proximity
still gates the full catalog.)

### Entity faces
Grazer: eyes with glints, nostrils, mouth line. Lurker: angry brows over
the red eyes, open maw with teeth.

### Tuning
All drill/dispenser tiers 30% faster: TIER_TIME [1.1, 0.8, 0.55, 0.32, 0]
-> [0.85, 0.62, 0.42, 0.25, 0].

### Known issues
- Adjacent-sphere carves can leave rim slits where thin carve roofs meet
  single-vertex ground cells (dual-vertex DC limit, <=1% of edge pairs,
  bounded by test). Revisit if visible in play.
- Doors/tables/entities are still untinted at night (trees now tint).

## Build 4.1 — playtest fixes + wood age (2026-08-20)

### Bug 1: grass specks in placed material — FIXED
materialAt used `shapeSDF < 0` (strictly inside) while the mesher counts
boundary samples as solid (`<= 0`). Grid-snapped faces land exactly on
sample points, so a placed cube's own faces weren't claimed by its union
and fell through to the terrain generator — which calls anything above
ground level "grass". Now `<= 0`; regression test asserts a snapped
obsidian cube meshes with zero stray-material vertices (900/900 pure).

### Bug 2: collision — three separate causes, all fixed
1. **Invisible floor over every cave entrance.** The above-ground fast
   path returned the heightfield distance "(y-h)*0.65" — which claims
   solid ground d below you even where that ground is carved away. Fall
   into a mouth: gravity pulls you a hair below the phantom surface, the
   heightfield gradient shoves you back up. Torches raymarch to d<0.02 so
   they threaded straight through it, exactly as reported. The field now
   keeps taking max() with the carve above ground near entrance zones, so
   air over a hole honestly reports the rim as nearest solid. Regression
   test + browser harness: walked into 4/4 wide cave mouths on foot.
2. **Cave field magnitude compression.** The carve scale reported ~1/13th
   of true wall distance (measured), so a 2m tunnel read as 0.3m and the
   0.35m-radius capsule "collided" with the entire tunnel volume.
   Recalibrated against measured true distances (tunnel x22, room x34 —
   the zero set, i.e. all visible geometry, is unchanged). Entrance
   throats also flare open near the skin now (they tapered to sub-player
   width right at the surface). 81% of cave air has capsule clearance.
3. **Stuck on ankle-high ledges / unjumpable lips.** No step-up existed;
   any lip ate all horizontal velocity. Added step-up assist: when
   grounded (or rising in a jump) and horizontal progress is blocked, try
   the same motion up to 0.55m higher. It refuses to fire when there's a
   clear descent ahead, so it can't hoist you out of cave mouths.

### The wood age
- **Trees** dot grassy terrain (deterministic per seed, none in deserts
  or high mountains). Hold LMB with a drill to chop (faster per tier);
  ~5-6 wood each. Carving away the ground under a tree fells it too.
  Trunks are solid.
- **Materials**: wood (10) and sticks (11) — both real materials, so the
  dispenser can build with them. 1 wood -> 4 sticks (basic craft).
- **Crafting table**: 8 wood, basic craft, placeable prop. Q anywhere =
  basic recipes only (sticks, torches, table). Standing within 4m of a
  table unlocks the full catalog (drills, dispensers, swords, blaster,
  doors). Mining near one pops it back into inventory.
- **Torch recipe reworked**: 2 sticks + 2 glowshroom (was rock).
- **Swords** (station, 5 tiers): 2 sticks + 12 of rock/iron/ruby/
  obsidian/diamond. 10+4/tier damage, 380ms swing with viewmodel
  animation. The sword is now THE melee weapon — the drill no longer
  damages creatures (it chops and mines).
- **Doors** (station): 6 sticks each. Click ground to place (snaps
  upright, faces you in 90° steps); right-click any door to open/close.
  Closed doors are solid to the player AND to lurkers — light plus a
  door makes a real shelter. Mining nearby pops them back.
- Creative kit includes sword/doors/tables/wood/sticks.

### Creature detail pass
Grazer: body, furred back, head with snout and ears, tail, four animated
legs. Lurker: hunched torso, shoulder ridge, spiked back, glowing eyes,
long clawed arms and legs, all swinging with movement speed.

### Save v5
doors, tables, felled trees persist. Physics props (doors/tables/trunks)
join the collision field via a combined-gradient query; meshing is
untouched by props.

### Validation
154 headless tests; browser harness walks into 4/4 cave mouths on foot,
mounts a 0.5m ledge mid-stride, verifies door open/shut collision, the
full wood->sticks->table->sword->door chain with station gating, placed-
material purity, and the whole build-4 survival loop. Meshing ~3.3ms/chunk
pristine (was 1.9; the honest above-ground field costs one 2D noise on
skin samples — worth it).

## Build 4 — Survival layer (2026-08-20)

### Modes
World creation now picks **survival** (default) or **creative**. Creative =
build 1-3 feel: everything pre-loaded (all drills, blaster, torches, big
stacks, diamond dispenser slotted), instant mine/place, free placement, fly,
no hunger/damage/enemies. Survival = stone drill + stone dispenser, real
costs and timings, no fly. Pre-build-4 saves load as creative.

### Day/night
10-minute cycle. Sun direction/color, ambient, sky, and fog all follow it;
the headlamp automatically matters on the surface at night. Time advances
only while actually playing (menus pause it).

### Health / hunger / death
- HP + food bars above the hotbar. Fall damage from impact speed (>~7m
  hurts). Food drains slowly (faster sprinting); at 0 it eats HP; above 60
  it regenerates HP.
- **Glowshroom** (new material 9): glowing purple veins in the top 20m of
  ground and cave walls — the food source. Hold a stack and press **H** to
  eat 8 units for +30 food. It glows in the dark and grazers drop it.
- **Death drops everything** where you fell (pulsing marker, skull distance
  in the compass bar). You respawn at spawn with a mercy stone drill; walk
  within 2.5m of the cache to recover it all.

### Creatures
- **Grazer** (passive, surface, daytime): wanders, flees when hit, drops
  8 glowshroom.
- **Lurker** (hostile): spawns in darkness — night surface or underground
  air pockets, never within 12m of a torch. Chases within 15m, hits for 8
  with knockback, hops obstacles. Drops 4 iron. Caps: 6 lurkers, 5
  grazers, despawn beyond 70m. Entities persist in the save.
- The drill is the melee weapon (6 + 3/tier damage, entities take priority
  over terrain when in your crosshair). The **blaster** (craft: 20 iron +
  12 ruby) fires hitscan for 18 at 2/s with recoil.

### Torches
Craft 6 from 6 rock + 2 glowshroom. Left click places one on any surface;
up to 16 nearest torches light the terrain shader with warm flicker.
Mining near a torch pops it back into your inventory. Torches suppress
lurker spawns — light as territory.

### Validation
138 headless tests (multi-cost recipes, torch stack merging, glowshroom
band) plus the browser run: torch shader lights, lurker chase/attack/
kill/drop, eating, and the full death -> cache -> respawn -> recovery loop
verified end-to-end; night screenshot shows the headlamp pool and lurker
eyes in the dark. No errors.

### Notes / deferred
- Entity AI is deliberately simple (no pathfinding — steer + hop). Fine
  for open terrain and caves; revisit if tunnels confuse them.
- One ambient track and music are still build 6. Water is build 5.
- Ore layout shifted slightly vs build 3 (vein type hash now mod-5 to
  include glowshroom) — existing worlds keep their edits, veins move.

## Build 3 — Depth & Feel (2026-08-20)
Roadmap restructured first (see ROADMAP.md): darkness, audio, and the full
tool kit land BEFORE survival, since enemies need darkness to matter and
combat will lean on finished tools.

### Lighting
- Per-vertex **skylight** attribute computed at meshing time from the same
  chunk-local height grid DC uses (depth below the heightfield, full light
  to ~1m, black by ~10m of overburden) — seam-consistent by construction.
- **Headlamp**: warm point light around the player in the terrain shader,
  smooth falloff over 13m, faded out where skylight already lights things.
- **Ore shimmer**: iron/ruby/obsidian/diamond stay faintly self-lit in the
  dark so veins catch the eye at lamp range.
- Fog fades to black at depth, and the sky background itself darkens as the
  player descends (also stops unmeshed frontier chunks flashing blue).
- Known limitation: skylight is vertical-only — a horizontal tunnel mouth
  under a hill reads dark until the lamp hits it. Real light propagation is
  a later-build item if it bothers in playtest.

### Audio (procedural, zero assets)
Web Audio built on first pointer-lock gesture: drill hum (pitch by tier +
charge progress), break crumble (filtered noise, pitched by hardness),
place thunk, paint hiss, deny buzz, footsteps by surface material, UI
clicks, crafting chime, undo blip, looping low ambience that fades in with
depth. Volume slider in Options.

### Particles
One pooled Points cloud (800): debris burst on break colored by the
yielded materials, dust on place, chips trickling while the drill charges.
Ghost fill opacity also ramps with charge progress.

### Tool kit
- **Mine/build time scales** with tier x volume x hardness (grass 0.6,
  rock 1.0, iron 1.35, ruby 1.7, obsidian 2.2, diamond ore 2.6; volume
  factor cbrt-clamped 0.6-2.2). Diamond stays instant. Aiming at pure air
  is a no-op (no empty edits, no charge).
- **Paint mode** (R with dispenser out): op 2 in the edit list — recolors
  existing solid inside the shape without touching geometry, charged only
  for the volume actually changing material, fully ordered with unions
  (later edit wins) and undoable. Ghost turns orange.
- **Pick material** (middle click): grabs the material you're looking at
  into your hand (swaps from storage if needed).
- **Undo** (Ctrl+Z): pops the last edit and reverses its economy (mine
  yields taken back, place/paint costs refunded). Session-only, 64 deep.
  Plain Z is still fly.
- **Cylinder brush**: third shape in the right-click cycle (y-axis, height
  = diameter). Sharp rims via the same QEF path.
- **Cube yaw rotation**: hold G + scroll, 15° steps, free-place only —
  grid mode forces 0° so the tiling lattice guarantee holds. `rot` is the
  8th edit field; old 7-field saves load fine.
- **Dispenser orb** doubles as the ammo gauge (shrinks with the held
  stack, flashes red on refusal).

### Navigation
Compass bar top-center: arrow + distance to spawn, live coordinates.

### Validation
129 headless tests (new: cylinder/rotated-cube SDFs + manifold meshing,
paint semantics/costs/ordering, duration scaling, skylight attribute,
legacy save compat) and the Playwright run (paint+undo end-to-end with
exact refunds, dark cavern + headlamp screenshots). Perf unchanged:
~1.9ms/chunk pristine, ~7ms hot remesh.

## Build 2.1 — cave overhaul + build/tool UX rework (2026-08-19)
Playtest-driven patch before build 3.

### Caves (why none were findable)
Build 2's near-surface fade suppressed caves within 5m of the ground with no
exceptions — every cave system was sealed; there were literally zero
entrances. Reworked:
- **Entrance zones**: a 2D noise mask disables the surface fade in patches,
  so tunnels climb out and visibly breach the ground (verified: dozens of
  breach columns per 480m² in every test seed; smoke test screenshots one).
- **Unique shapes**: tunnel threshold varies with a low-frequency 3D noise
  (regional wide/tight systems) and widens with depth; a second blobby
  "cavern" field adds large rooms, bigger and more common deeper. ~9% of
  underground volume is air (5-7% shallow, 11-12% deep).
- **Bedrock moved to y=-64** (was -16): stone layer is 4× deeper, meshed
  world now y -64..+48. Ore bands respread: iron -4..-30, ruby -16..-45,
  obsidian -30..-58, diamond -46..-63.5. Chunk streaming prioritizes by 3D
  distance and the mesh budget doubles while a big backlog exists.

### Building / tools
- **Grid snap is now a tiling lattice.** The shape's FACES snap to a
  lattice whose spacing is the shape size (or the grid cell when that's
  larger). Adjacent snapped placements always connect flush — full-size,
  face-to-face, nothing eaten inside the previous shape. Grid viz draws
  the actual lattice anchored on the ghost's bottom face.
- **Shape + size are shared tool state** (the player's, not the item's).
  Swap drill↔dispenser↔any tier and the sphere/cube and size carry over;
  non-diamond tiers clamp to their nearest unlocked step at use time
  without losing the shared value.
- **Dispenser slot**: one special inventory slot only a dispenser fits.
  No more loading — holding any material stack in the hotbar auto-equips
  the slotted dispenser loaded with that material (swap hotbar slot =
  swap loaded material). Crafted dispensers go to inventory; drag into
  the slot to upgrade. New worlds start stone drill in hotbar + stone
  dispenser already slotted.
- **Consumption verified end-to-end in the browser harness**: a 2m cube
  costs 64 units, a 4m cube 512 (exactly 8×), and placement is refused
  when the held stack is short. (The build-2 "didn't consume" report:
  consumption existed but gave no feedback and counts sat in unopened
  inventory; there's now a "-N material" toast and live hotbar counts.)
- **V/B moves the ghost** closer/farther (1m..reach) in free-place mode;
  distance shown in the HUD and saved.

### Player
- **No more sliding down inclines.** Penetration from gravity was resolved
  along the slope normal every frame (horizontal component = downhill
  drift). When standing still on walkable ground (normal.y > 0.6) the
  pushout is now resolved straight up and horizontal velocity is zeroed;
  moving/jumping keeps the normal-based resolve. Verified: 0.000m drift
  over 2.5s on a 0.65-gradient slope.

### Save format v3
Adds shared tool state + dispenser slot. Older saves migrate: first
dispenser found in the inventory moves into the dispenser slot.

## Build 2 — terrain, ores, economy + build-1 playtest fixes (2026-08-19)

### Playtest fixes (from first build-1 session)
- **See-through gaps near adjacent sphere carves — fixed.** Root cause:
  triangle winding was chosen by dotting against the SDF gradient at the edge
  crossing; on the crease where two carves meet the gradient degenerates and
  triangles randomly flipped (backface-culled = hole). Winding is now
  canonical from the edge's solid/air sign configuration — deterministic,
  gradient-free — and the terrain material renders double-sided as a second
  line of defense. New regression test: every interior mesh edge shared by 2
  triangles must be traversed in opposite directions.
- **Ghost preview now floats at a fixed distance** (3.2m + 0.55×size) when
  snap is off. Grid mode still raymarches onto the surface and snaps.
- **Mine/build speed redefined** as time-to-break/build ONE shape (Minecraft
  block feel): 1.1 / 0.8 / 0.55 / 0.32 s by tier, with a progress bar above
  the hotbar. Drill keeps cycling while held; dispenser is strictly one
  placement per click (hold to charge, release cancels, no auto-repeat).
  Diamond = whole shape instantly on click; diamond drill held repeats at
  most 4/s, diamond dispenser never auto-repeats.

### Build 2 features
- **Seeded terrain**: value-noise fbm heightfield with biome blending
  (plains / hills / ridged mountains via a low-frequency biome field, plus
  desert patches), heights clamped to [-6, +30], world meshes y -16..+48.
  Grass tops (below h=12), sand in deserts, bare rock on mountains.
- **Caves**: intersection band of two 3D noises ("spaghetti"), faded out
  within 5m of the surface so the ground isn't pitted. Cave eval is skipped
  entirely for points clearly above ground (sign-exact shortcut).
- **Ore veins**: deterministic per 4m lattice cell from the seed — hash
  picks type, center, radius (flattened ellipsoids). Depth bands: iron
  -3..-11, ruby -6..-14, obsidian -9..-15.5, diamond -12.5..-15.8.
- **Mining yields by volume removed**: the drill samples what its shape
  intersects (pre-edit solid, per material) at 1 unit = 0.125 m³ (one 0.5m
  voxel). Bedrock yields nothing. Placing consumes the loaded material by
  the same accounting (air volume filled); placement is refused if short.
- **Crafting (Q)**: tier progression — 24 ore per drill, 18 per dispenser
  of the matching ore (iron/ruby/obsidian/diamond). New worlds start with
  stone drill + stone dispenser only.
- **Meshing perf**: per-edge hermite cache (each crossing's bisection +
  gradient computed once, shared by the 4 adjacent cells and quad emission);
  chunk-local heightfield grid with bilinear interpolation (exact at shared
  sample columns → seams stay watertight, verified by test); tetrahedral
  4-eval gradients; 5 bisection iterations (Newton projection along the
  cell's average crossing normal tightens the vertex afterwards).
  ~2ms/chunk pristine, ~7-14ms under heavy local edit load, amortized
  6ms/frame nearest-first.
- Fog now ends exactly at the streamed-terrain radius (world edge is never
  visible); default render distance bumped to 4.

### Compatibility
- Build-1 worlds load (edits, inventory, position preserved) but the flat
  terrain regenerates as build-2 terrain from their seed — the ground will
  move under old edits. Players inside terrain are auto-lifted on load.

### Known issues / deferred
- No lighting attenuation underground — caves are as bright as the surface
  (light/AO pass is a future-build item).
- Worker meshing still the next perf lever if continuous mining lags on
  mid-range hardware.
- materialAt scans the whole culled edit list per query; fine now, spatial
  index later.

## Build 1 — first playable (2026-08-19)
Everything in `strata.html`. Three.js 0.164.1 via import map; the game code
dynamic-imports it inside try/catch and shows a fatal-error overlay with a
retry button if the CDN fails — the old load-order crash can't silently recur.

### Architecture decisions
- **Dual contouring**: per-cell QEF (regularized 3x3 solve toward the mass
  point) + 2 Newton projection steps onto the SDF zero set. QEF gives sharp
  cube corners; projection tightens spheres to <0.01m error at 0.5m voxels.
- **Zeros are solid** (`d <= 0`). Grid-snapped cube faces land exactly on
  sample points; with `d < 0` a subtract-then-union of the same cube left a
  zero-thickness membrane. Verified by headless test.
- **Seams**: chunk owns edges whose local coords are all in [0..N-1]; it
  samples one cell beyond its bounds so boundary cell vertices are computed
  identically on both sides (sample coords derived from global integer
  indices, so the floats match exactly). Watertightness is unit-tested by
  edge-counting across a 8-chunk carve.
- **Field build is per-edit, not per-sample**: base plane filled first, then
  each edit min/max-applied over only its own AABB sample range (sign-exact;
  outside its AABB an edit can't flip a sign), bedrock clamp last. Plus
  per-crossing local edit culling. ~2-4ms per 16³ chunk remesh under heavy
  edit load; remeshing is amortized 6ms/frame, nearest chunk first.
- **Raw color pipeline**: `THREE.ColorManagement.enabled = false` and
  `outputColorSpace = LinearSRGBColorSpace`. One custom terrain shader
  (dominant-axis triplanar over a 16px-per-material atlas, NearestFilter) —
  linear-workflow re-encoding was darkening/washing colors inconsistently
  between the custom shader and built-in materials. WYSIWYG everywhere.
- Surface at y=0.01 and bedrock clamp at y=-15.99 (off-grid on purpose so the
  base planes never coincide with sample points). World meshes y -16..+16.

### Gameplay decisions (build 1 scope)
- Loading a dispenser does NOT consume the material stack, and mining yields
  nothing — resource economy arrives with ores in build 2.
- Size steps `STEPS[13]`, stone = middle 5, each tier +1 step both ways,
  diamond continuous ×1.13 per scroll notch. Cooldowns 500/380/280/190/110ms;
  diamond dispenser effectively instant (40ms).
- Hold-F grid sizes: 0.25 0.5 0.75 1 1.5 2 3 4 6 8 (keys 1-0).

### Testing
- `node --check` on the extracted module script.
- 48 headless tests against the extracted CORE block (SDF/CSG order, bedrock
  unminability, snapping, tier ranges, inventory ops, save round-trip, DC:
  winding, seam watertightness, sharp corners, sphere accuracy, bedrock floor
  material, cavity refill).
- Playwright smoke test in headless Chromium (menu → create world → play →
  carve/place → autosave round-trip → screenshots), three.js served locally.

### Known issues / deferred
- Meshing runs on the main thread (time-budgeted). Worker-via-blob is the
  next perf lever if continuous diamond-tier mining dips below 60fps.
- Placement above y=+16 doesn't mesh (vertical chunk range is fixed).
- Physics/ghost SDF queries cull the whole edit list per query (AABB tests);
  fine for thousands of edits, will want a spatial index eventually.
- Chunk remesh rebuilds geometry buffers each time (no pooling).

## Pre-history (carried in from earlier prototyping)
Three bugs already hit and fixed once in an earlier STRATA prototype — do not reintroduce:
1. **CDN load-order crash** — game code ran before Three.js finished loading.
2. **Black world** — render pass misconfiguration; keep the render pipeline minimal.
3. **World-axis WASD** — movement ignored camera yaw; must be camera-relative.
