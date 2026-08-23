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
5.5.1: far terrain rebuilt as 7-level geometry-clipmap LOD rings (1m→64m
cells, 4km horizon), triplanar-textured + shadowed like real terrain, with a
chunk-coverage mask so the LOD always meets loaded geometry exactly.

## Build 5.6 — Hands & a living surface (DONE)
- Surface decor: grass tufts, flowers, shrubs scattered by biome.
- Empty hand = fists. RMB toggles fists up/down. Fists up: LMB punch
  (small damage). Fists down: LMB picks up decor — and animals; carry
  them overhead, LMB throws.
- Photo mode (creative): free camera + time-of-day slider.

## Build 6 — World Gen 2.0 (the world gets deep and different)
Playtest verdict: at 4km visibility the terrain pattern visibly loops, and
caves die out before they get interesting. This build jumps the queue —
villages, raids, and bosses all need a world worth putting them in.
- **Macro-regions**: big biome cells (~400–800m, warped borders), each
  committing to an archetype — plains, sharp ranges, mesa/canyon badlands,
  dunes, swamp, glacier, volcanic fields. Region borders become landmarks.
- **Landmarks**: rare one-per-region set-pieces — volcano cones with lava
  craters, giant sinkholes into the cave layer, box canyons, crater lakes,
  monolith spires. Heightfield-expressible so the LOD rings carry them.
- **Lava**: new material — emits light, burns, and forms obsidian where it
  meets water. Volcano craters and the deep world both use it.
- **Cave networks**: per-region graph generator — chambers as nodes (pockets
  to cathedral caverns), winding tunnels as edges, vertical shafts and
  spiral chimneys for fast descent. Guaranteed length, intersections,
  branches, and multi-exit rooms; noise caves stay as filler. You should be
  able to get properly lost.
- **Deep world**: bedrock drops far lower (~-250); new strata by depth,
  richer ore lower, lava galleries near the bottom.
- **Underground biomes**: glowshroom forests, crystal caverns (light-emitting
  crystal), flooded galleries, the lava zone — depth readable at a glance.
- **Wayfinding**: surface auto-map screen (explored-fog); caves stay
  unmapped and scary. Depth readout. Rope anchor for early descent.

## Build 7 — Electricity (analog power, not redstone)
Power is continuous wattage, not on/off — machines scale with supply, no cap.
- **Phase A — the network**: wires, switches (levers), power meters.
  Sources: hand crank, animal/enemy crank (captured mob on a wheel),
  water wheel (needs real water), generator. Bulbs toggle on/off.
- **Phase B — machines**: auto-crafting table (select a recipe, it crafts
  while powered), boosted stove (smelt speed scales with watts), hopper +
  item tubes so materials can flow into machines. Powered elevator platform
  — a real reason to run wires down a mine shaft.
- **Phase C — exotics**: generator 2.0, tesla coil (wireless power in a
  radius, zaps you if you stand too close).
- **Camera drone**: photo mode for survival, with a body — a buildable or
  buyable drone you charge on the grid, keep in your inventory, and hold to
  pilot. Range-limited; your body stays standing while the drone flies.
  Under the hood it's the existing photo mode with a new shell and rules.

## Build 7.5 — The player has a body
- 3rd-person camera toggle; full player model with a ROUND head (our
  silhouette, not Minecraft's). Skin selection.
- Armor: a set per ore tier, visible on the model, damage reduction.
  Armor stand to display/store sets.
- Jetpack: short creative-style flight in survival; recharges on a
  powered charging pad (plugs into the grid).
- Grappling hook: cheap-tier vertical movement.
- Base decor: item pedestals, signs.

## Build 8 — Coins & villages (the world gets people)
- **Coins**: enemies drop coin instead of materials (mining stays the
  material economy); bosses drop piles; quests and treasure pay out. Coin
  is the invisible XP — no bar, progression IS purchasing power. Coin
  sinks must scale (tier-5 gear, houses, eventually the car).
- **Chests**: container prop (villages, loot, player storage).
- **Villages**: generated settlements (structure stamps via the blueprint
  engine) with traders — arms dealer, toolsmith, mad-scientist electrician,
  ore broker (buys/sells ore at a spread, converting mining into money).
- **Goodwill & missions**: per-villager reputation gates trade tiers.
  Mission types: hunt a target, steal from a neighbor (opposed reputations
  — thief route vs upstanding route), and EXPAND THEIR HOUSE from a
  schematic — a paste-ghost outline showing material costs, verified
  against the SDF when built. The wrench engine becomes quest
  infrastructure.
- **Bounty board**: rotating kill/explore/deliver contracts — repeatable
  coin income, a reason to revisit every village.
- **Treasure maps**: bought from villagers; X marks buried loot via the
  compass.

## Build 9 — Arms race
- Weapon table: crafted at a crafting table, requires power to operate.
- Gun arsenal (real-model-inspired, renamed): full-auto AR, SMG, semi-auto
  AR, handgun, heavy pistol, sniper, RPG, laser rifle, gatling, laser
  gatling. Guns costly, ammo cheap (coins make the economy work).
- Explosives: TNT + shaped mining charges (blast-carve spheres). RPG and
  explosions carve real craters — CSG subtract as a weapon.
- Raids: your power grid attracts enemies at night — more watts, bigger
  raids. Gives guns a target and bases a reason to be defended.
- **Raid bases**: walled forts and whole enemy towns to clear — better loot
  behind higher difficulty, a miniboss holding the vault key.

## Build 10 — Bosses & endgame
Every STRATA boss does something only a CSG world allows. Unique unlock
drops, not just loot.
- **The Burrower**: a worm that carves real tunnels as it hunts you, deep
  in the cave layer. You hear it before you see it; the arena is destroyed
  as you fight. Drop unlocks the jetpack core / auto-tunneling drill mod.
- **The Warden**: raid-town vault golem built from terrain materials —
  damage blasts mineable chunks off it; it heals by eating the ground,
  carving craters around itself.
- **The Magma Tyrant**: volcano crater arena; lava bombs union actual lava
  onto the battlefield, flooding your footing as you terraform to survive.
- **The Architect** (endgame): fights with your own verbs — stamps walls,
  carves pits under you, and replays corrupted copies of structures YOU
  built in that world (it reads the edit list). A mirror match against the
  editor itself.
- Music + audio expansion; options expansion; perf pass (worker meshing
  via blob if continuous mining needs it).

## Build 11 — Cities & vehicles (the far future, but a real one)
STRATA buildings are box CSG, so distant skylines LOD almost perfectly —
cities are feasible where block games choke.
- **Tier 1**: rare mega-cities (one per several km) — road grids, towers
  from procedural floor/facade modules, explorable interiors, shops on the
  village trade system, quest givers, places to buy food.
- **Tier 2**: pedestrians with simple schedules, light traffic.
- **Tier 3**: ownable property (the ultimate coin sink) and the ELECTRIC
  CAR — buyable in the city or buildable at home, charges on your grid.
- **Rails & trains**: powered lines between settlements and bases — fast
  travel you BUILD, not teleports.

Rule: no phase starts until the previous phase's mechanics feel right in
playtest.
