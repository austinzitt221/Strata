# DEVLOG — STRATA

Append decisions, known issues, and playtest feedback here. Newest first.

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
