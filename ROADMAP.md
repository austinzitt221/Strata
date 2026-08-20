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

## Build 5 — Water & world depth (IN PLAYTEST)
- Water: sea level filling valleys, swimming, flooded cave sections.
- More biomes/environments; structures and cave features worth finding.
- Waypoint/beacon items and a base anchor (compass targets, fast travel or
  respawn point — decide in playtest).
- More materials/textures as the palette needs them.

## Build 6 — Content & endgame
- Bosses, loot structures, endgame progression.
- Music + audio expansion; options menu expansion.
- Perf pass: worker meshing (blob) if continuous mining needs it.

Rule: no phase starts until the previous phase's mechanics feel right in
playtest.
