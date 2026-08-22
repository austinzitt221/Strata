# ROADMAP — STRATA

## Build 1 — Core carve/place (DONE)
Superflat rock world + bedrock. Drills + dispensers, all 5 tiers, sphere/cube
brushes, grid snap, fly, 40-slot inventory, main menu, world list with seeds,
save/load. See CLAUDE.md "Definition of done."

## Build 2 — World feel (DONE, incl. 2.1 patch)
- Seeded terrain: biomes (plains/hills/mountains/desert), grass/sand/rock.
- Caves: spaghetti tunnels + deep caverns, surface entrances, unique shapes.
- Bedrock at -64; ore veins (iron/ruby/obsidian/diamond) by depth band.
- Mining yields by volume; dispenser consumes; crafting tier progression (Q).
- Tiling grid snap, shared tool shape/size, dispenser slot with auto-equip,
  V/B ghost distance, anti-slide.

## Build 3 — Depth & Feel (DONE)
The world gets dark, loud, and juicy; the tools get their full kit.
- **Lighting**: darkness underground (skylight falls off with depth), player
  headlamp radius, ore shimmer in the dark, fog fades to black at depth.
- **Audio** (procedural Web Audio, no assets): drill hum pitched by tier and
  charge, break crumble, place thunk, footsteps by surface material, UI
  clicks, deep-cave ambience. Volume in Options.
- **Particles**: debris burst on break (colored by removed materials), dust
  on place, chips while drilling.
- **Drill/dispenser kit**:
  - Mine/build time scales with shape volume and material hardness
    (grass fast, obsidian slow); mining nothing-but-air is free and skipped.
  - Paint mode (R with dispenser): repaint existing solid to the held
    material without changing geometry.
  - Pick material (middle click): select whatever material you're looking at.
  - Undo (Ctrl+Z): pop the last edit, refund/return materials.
  - Cylinder brush (third shape in the right-click cycle).
  - Cube yaw rotation (hold G + scroll, 15° steps, free-place mode only —
    grid mode stays axis-aligned so tiling never breaks).
  - Dispenser orb shrinks with the held stack and flashes red when short.
- **Navigation**: coordinates readout + compass arrow to spawn.

## Build 4 — Survival layer (DONE, incl. 4.1–4.3 patches)
- Creative/survival mode toggle at world creation.
- Health, fall damage, hunger or equivalent; death drops your stuff where
  you died (the world's geography starts to matter).
- Day/night cycle (extends the build-3 lighting), darkness as danger.
- Enemies + animals with spawning rules (dark spawns underground); guns.
- Torch/light-source item — doubles as cave breadcrumbs.

## Build 5 — Water & world depth (DONE incl. 5.1–5.3.1, wrench in playtest)
- Water scoped to real lakes; swimming, breath, underwater overlay.
- Ruins + loot, beaches/snow, beacons→beds as spawn anchors, sheep/wool.
- Sky: sun/moon/stars/3D clouds; stove furnace, ores→ingots, coal,
  lightbulbs, meat/eating, lurkers burn in daylight.
- Exact removal (no membranes), per-axis sizes + 3-axis rotation.
- **The Wrench**: select/resize/move/hollow/delete/paint existing edits.
- 5.3.1: phantom collision fix, creative catalog + free crafting.

## Build 5.4 — The editor completed (wrench II)
- Multi-select: shift-click adds edits to the selection (builds or holes).
- Copy / paste / delete / drag-move whole selections; paste shows a ghost
  of the full selection before committing.
- Blueprints: save a copied selection under a name; stamp into any world.
- Whatever the wrench playtest turns up.

## Build 5.5 — The shader pack (DONE)
Real sun shadow-mapping (trees/builds/terrain cast, PCF, day-tracking),
per-vertex SDF ambient occlusion, god rays, drifting cloud shade, far-terrain
horizon to ~1.6km, render distance to 256m full detail, FPS cap slider.

## Build 5.6 — Hands & a living surface
- Surface decor: grass tufts, flowers, shrubs scattered by biome.
- Empty hand = fists. RMB toggles fists up/down. Fists up: LMB punch
  (small damage). Fists down: LMB picks up decor — and animals; carry
  them overhead, LMB throws.
- Photo mode (creative): free camera + time-of-day slider.

## Build 6 — Electricity (analog power, not redstone)
Power is continuous wattage, not on/off — machines scale with supply, no cap.
- **Phase A — the network**: wires, switches (levers), power meters.
  Sources: hand crank, animal/enemy crank (captured mob on a wheel),
  water wheel (needs real water), generator. Bulbs toggle on/off.
- **Phase B — machines**: auto-crafting table (select a recipe, it crafts
  while powered), boosted stove (smelt speed scales with watts), hopper +
  item tubes so materials can flow into machines.
- **Phase C — exotics**: generator 2.0, tesla coil (wireless power in a
  radius, zaps you if you stand too close).

## Build 6.5 — The player has a body
- 3rd-person camera toggle; full player model with a ROUND head (our
  silhouette, not Minecraft's). Skin selection.
- Armor: a set per ore tier, visible on the model, damage reduction.
  Armor stand to display/store sets.
- Jetpack: short creative-style flight in survival; recharges on a
  powered charging pad (plugs into the grid).
- Grappling hook: cheap-tier vertical movement.
- Base decor: item pedestals, signs.

## Build 7 — Arms race
- Weapon table: crafted at a crafting table, requires power to operate.
- Gun arsenal (real-model-inspired, renamed): full-auto AR, SMG, semi-auto
  AR, handgun, heavy pistol, sniper, RPG, laser rifle, gatling, laser
  gatling. Guns costly, ammo cheap.
- Explosives: TNT + shaped mining charges (blast-carve spheres). RPG and
  explosions carve real craters — CSG subtract as a weapon.
- Raids: your power grid attracts enemies at night — more watts, bigger
  raids. Gives guns a target and bases a reason to be defended.

## Build 8 — Content & endgame
- Bosses — incl. the Burrower, a worm that carves tunnels through the map
  as it moves (same subtract edits the player uses).
- Loot structures, endgame progression.
- Music + audio expansion; options menu expansion.
- Perf pass: worker meshing (blob) if continuous mining needs it.

Rule: no phase starts until the previous phase's mechanics feel right in
playtest.
