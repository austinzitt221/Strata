# DEVLOG — STRATA

Append decisions, known issues, and playtest feedback here. Newest first.

## Build 22 — MASS (2026-09-06)

Austin's second playtest of the tools: "very fun", and one ask -- make
the trowel's disc huge, mountains in thirty seconds, with the middle
button swapping what the wheel does between the disc and the depth.
Built that, then the third SCULPT piece I had queued. Verified headlessly
(CORE 337, a build-22 suite that times a 48 m stroke, toggles the mode,
measures the plateau and probes the turned tower inside and out, plus
smoke, bore and Build 21 suites) and in screenshots.

### The trowel at mountain scale
- **Disc from 1 m to 48 m.** The wheel scales it by 15% a notch. The
  stroke rate slows as the disc grows (a 48 m stroke every 0.7 s in
  creative) so the mesher keeps up; one 48 m stroke costs about 30 ms
  of main-thread work, and five held strokes raise a 66 m mountain.
  48 m is where I stopped because a stroke's blend radius pads its box
  to twice the disc, and at 96 m across it is 2 000 chunks re-meshed a
  stroke; the workers absorb that, but not more of it every 0.7 s.
- **Middle click swaps what the wheel does:** the disc's size, or the
  stroke's depth (15%-140% of the radius). The panel says which.
- **You ride your mountain up.** A raise that would swallow you lifts
  you to the new surface instead of burying you, so you can stand on
  the disc, hold the button, and go up with the ground. (First 48 m
  stroke in the test buried the player 24 m; now it carries them.)
- **Shift + left flattens.** A plateau at the disc's height: a smooth
  carve of everything above the plane over the disc, a smooth fill of
  everything below in the ground's own material, undone as one. The
  blend is 8% of the disc (a soft rim, a floor flat to 0.4 m over a
  20 m disc -- at 25% the floor domed a metre, so it came down).
- Costing samples a big shape in metre steps instead of 15 cm ones
  (a twelfth of the shape, capped at 4 m), so a mountain's cost is a
  few ms, not seconds.

### The lathe
- A gadget (6 iron ingots, a ruby ingot at the table) that turns a
  drawn profile. Lay the axis point, then an outline out from it, any
  side, any height; the outline's distance from the axis and its
  height make a profile, and the preview shows it revolved. Right click
  turns it solid in the ground's material -- a tower, a dome, a bowl,
  a chimney -- and shift + right turns it hollow. A stack of blended
  cylinders through the bore's progressive job, so it undoes as one and
  you can watch it grow. Rings follow the radius as well as the height,
  so a flared lip keeps its flare.

### Small
- The trowel's and lathe's panels no longer carry the drill's shape,
  size and scroll-mode lines under their own.

### Known
- The trowel at 48 m over water raises the seabed too; that is the SDF
  being honest and I like it, but the lake does not drain into the
  new hill. RIVERS is where water learns about terrain changes.

## Build 21 — SHAPE (2026-09-07)

Austin's first playtest of HORIZON came back: no lines, "a million times
better", two clues left. This build takes those two, his notes on the
new tools, and turns the trowel into the thing he described better than
I had built it. Verified headlessly (CORE 337, smoke, plane, city and
inventory suites) and in screenshots.

### The tools
- **The trowel is a terrain tool now.** No shape in front of you: a
  disc sits on whatever you look at, ground, wall or ceiling, and scroll
  sets its size. Hold left click and the ground under the disc rises in
  its own material (a smooth fill centred just under the surface); hold
  right click and it sinks (a smooth carve centred just above). Held
  down it keeps going, so a hill is a few seconds of holding the button
  and a ditch is a swipe. The map-editor terrain brush, in first person,
  which is what Austin asked for and is better than my carve/fill.
- **The bore picks its cross-section with right click** while no points
  are laid, like a drill; once the first point is down, right click is
  the commit. The tool panel says which it is.

### The last two visual clues
- **"You can see where the lighting is loaded in."** Two edges, both
  gone. The far skin cast no shadow at all, so a hill beyond the render
  distance threw nothing across the near field and the ground under it
  read flat; the two near skin levels now cast, through a depth material
  that applies the same morph and the same yield to the real world, so
  the skin never shadows the ground it is hiding under. And the far
  trees cast nothing, so tree shadows stopped dead at the near-tree
  radius (56 m); they cast now.
- **Cave mouths popping in close by.** The skin is a heightfield and
  knew nothing of caves, so a shaft or a mouth was a patch of flat
  ground until the real chunks landed. The skin now probes just under
  its own surface and, where it finds open air, marches down to the
  cave floor and shows the pit -- a 14 m hole at the first mouth on
  seed 7, before any chunk arrives. What lands later is the cave's
  interior, not the hole. And the near ring takes two worker turns in
  three when you move faster than 12 m/s, so the frontier keeps up
  with a car or a plane instead of trailing into view.

### Roadmap
- Austin's crew idea (hire villagers: follow, assign to a stove, a
  turret, a table, or a roaming disc on the ground; arm them; they mine
  and build with you and, left alone with a dispenser, build their own
  blueprints) is THE CREW, item 3, with my additions. His defenses
  (claymore that only fires for an enemy and never marks the ground,
  one-way spikes) are THE PALISADE, item 4, with a tripwire bell, an
  oil trench and a flame jet of mine. SCULPT still owes a smoothing
  stroke, the lathe and mirror mode.

## My session 2 — the bore (2026-09-06)

Another session of my own. SCULPT's second piece, the one the trowel
taught me: a chain of smooth carves along a curve merges into one pipe.
Verified headlessly (CORE 334, smoke, inventory and pool suites) and in
screenshots; the renderer is still untouched.

### SCULPT B — the bore
- **A drill that follows a curve you draw.** Hold the bore and left
  click lays a point where the ghost is -- on the ground, on a wall, or
  floating in the air where you aimed, so a line can leave a hillside
  and cross a valley. Shift + left click takes the last point back. A
  wireframe tube follows the curve through the points and on to your
  aim, so you see the next bend before you commit. Up to 32 points.
- **Right click bores it.** The curve is sampled every third of the
  size and each sample becomes a smooth carve with a blend radius to
  match, so the neighbours merge into one continuous pipe: CORE proves
  the hard chain's waist between two cuts is narrower than the cut (the
  beads) and the smooth chain's waist opens past it, with the pipe's
  radius steady along its length. Sphere for a round bore, cube for a
  square one turned to the curve's heading. The boring is progressive,
  a cut every tenth of a second in creative and every third in survival,
  with the yields of every cut landing in your pack, so you can walk in
  behind it. One undo takes the whole bore back.
- **Shift + right click lays a causeway.** The same curve as a chain
  of smooth fills of the ground's own material, probed at the first
  point and paid for by volume in survival -- a bridge across water, an
  embankment over a valley, a pipe along a cliff, from the same tool.
- **Crafted** at a table from 6 iron ingots and a ruby ingot; in the
  creative catalog under gadgets.
- **Numbers from the field test on seed 7:** a 60 m curve into the
  cliff by spawn became 44 cuts; every sample along the spline reads as
  air afterwards and the one undo took all 44 back; a 40 m causeway of
  grass across the lake landed solid along its whole length.

## My session — HEARTHS and the trowel (2026-09-06)

Austin gave me a session to spend however I liked. I spent it on the two
things at the top of my own list: the villages at night, and the first
piece of SCULPT. The renderer is untouched, as agreed, until he has
played HORIZON.1. Verified headlessly (CORE 330, smoke, village, night
and inventory suites) and in screenshots.

### HEARTHS
- **Village windows glow after dark.** Every side window of every house
  within 400 m carries a warm pane once the sun is down, and a soft
  spill of light on the wall around it so a lit house reads from across
  the plaza. A few windows are dark on any given night (the same hash
  the city towers use, so it changes with the day).
- **Chimneys and smoke.** Every roof has a chimney on a back corner;
  from dusk on (day factor under a half) the chimneys within 80 m puff
  slow grey smoke that drifts up and thins over a few seconds.
- **A bug I found on the way:** the city window mesh was added to the
  scene once and never re-added after quitting to the title and
  starting another world, so lit windows only worked in the first world
  of a session. Both systems now re-attach.

### SCULPT A — the trowel
- **Two new edit ops in CORE**: 3 (smooth fill) and 4 (smooth carve).
  Where the drills and dispensers cut with a hard boolean, these round
  the join over a blend radius k (half the shape by default) with the
  polynomial smooth-min: exact where the fields are more than k apart,
  a fillet between. The mesher handles them like any other edit; their
  bounds reach k past the shape; the analytic-normal path is skipped for
  them (a blend has no face) so the dual contourer takes the numeric
  gradient; the skin bakes them like their hard cousins; the blend
  radius survives the save. The drills and dispensers are exactly as
  they were -- the spec's hard carve is intact.
- **The trowel.** A gadget: 4 iron ingots and 2 sticks at a table, or
  the creative catalog. In the hand it is a ruby-speed drill with soft
  edges: left click carves a smooth crater, shift + left click fills a
  smooth mound with the ground's own material (probed from the shape's
  centre, paid for by volume in survival). Same ghost, same shapes,
  same scroll. In the field test the drill's crater turns the surface
  113 degrees at its lip; the trowel's turns 34, and it looks like the
  ground was pushed rather than cut.
- **Why this first.** Carving is the identity of this game, and every
  build since the first has added a system beside it. This is the first
  tool since the wrench that changes what carving can feel like. Spline
  tunnels, revolve shapes and mirror mode are the rest of SCULPT.

## HORIZON.1 — the line, looked at properly (2026-09-05)

Austin's screenshots were of HORIZON, not of Build 20; I read them wrong
the first time and said so. Each artifact in them has a cause in the
new code, and each is fixed here. Verified headlessly (CORE 317, the
smoke, pool, plane and spire suites, screenshots at the ring edge).

- **Sky through cracks down cliffs and across ground.** The near ring
  inherited the coarse rings' filter that drops triangles judged
  "lightless underground". Skylight is judged by depth below the
  column's heightfield, so a cliff face reads as buried and its
  triangles were thrown away in a wiggling line down the face. The near
  ring now keeps every triangle; the feature ring keeps all but the
  truly black.
- **Caves covered, shown, covered again; lights flickering at the
  line.** A ring column counted as uncovered whenever its tile was
  waiting for a rebuild or had a chunk queued, though the old tile mesh
  still stood, so the skin popped in over it at full height and fought
  it. A ring column now counts by what is STANDING, the same rule the
  terrain got in HORIZON: every chunk meshed, and every chunk with
  geometry held by a tile mesh in the scene.
- **Sawtooth rock over sunk sand.** The feature ring's "does something
  rise over the ground" test compared 25 samples against 9, so any steep
  column passed, and beyond that it meshed every landmark set-piece and
  ruin at 2 m voxels with its ground dropped and the skin sunk beneath.
  Within a kilometre of spawn 209 columns passed; 13 were sky islands.
  The feature ring now carries only what floats (sky islands and their
  spires, the island's own vertical span). Everything that stands on the
  ground is baked into the skin's heights instead: where heightRange
  says something rises over the plain ground, the worker marches down
  from that top through the real field and takes the first solid as
  the column's height, so a landmark spire at 400 m is a heightfield
  spire lit like everything else.
- **The stair-stepped line with a tone change.** The skin had its own
  lighting. It is now lit by the terrain's own fragment shader -- same
  tiles, sun, shadow, cloud shade, fog and grain -- with only the
  material source differing (a per-level texture). The 0.6 m seam sink
  that left a ledge along the whole ring edge is now two bands: the
  outer seam column ducks 0.12 m, the inner 0.45 m, so the join is
  backed without a step at the boundary. The feature ring never draws
  inside the render distance minus 24 m, so no 2 m voxels appear where
  the real world is about to.
- **The dashed line of sky along the edge of the real world.** Found by
  reproducing it headlessly at the village on seed 31 and reading the
  mesher: an edge belongs to the chunk whose sample it starts at, so a
  quad that straddles a chunk border belongs to the higher chunk alone.
  When that chunk was a ring tile and the lower one real terrain, the
  ring's per-pixel yield cut the straddling quad at the column plane and
  the terrain never drew that half -- a slit up to half a voxel wide on
  two sides of the real region, in a polyline along the chunk grid. The
  ring now decides its yield per vertex and drops a triangle only when
  all three corners stand in covered columns; a straddling quad is drawn
  whole. Same view, same spot: the line is gone.
- **Tile thrash at the frontier.** A ring tile shed its source data
  5 s after going quiet; any chunk arriving after that forced every shed
  member back through the pool before the tile could rebuild. Tiles
  now shed only once every column in them is scanned and complete.
- **A note on my own testing.** The headless browser reports 20 fps
  because the frame clock is clamped to 50 ms; it actually renders at
  about one frame a second under software GL. Every "seconds to settle"
  number in these logs is really a frame count. Real-machine timing is
  Austin's to report.

## HORIZON notes — thin things (2026-09-05)

- **Invisible walls at small sizes, found by Austin with the wrench.**
  The field is sampled every half metre. A slab thinner than a voxel can
  sit between two sample planes: no sample lands inside it, the mesher
  sees nothing and draws nothing, but the field still says solid and
  collision still stops you. The wrench used to allow 0.25 m; it now
  stops at `MIN_THICK` (0.75 m, a voxel and a half, which holds a sample
  plane on every axis even at 45 degrees) and says why. Hollowing uses
  walls of 0.75 to 1.0 m for the same reason and refuses builds too small
  for that. The CORE suite now proves both: a 0.75 m slab meshes at every
  offset, a 0.2 m slab vanishes at some.
- Playtest screenshots arrived. They show the Build 20 renderer: sky
  through cracks between the stacked far layers, the 2 m ring's sawtooth
  edge over the skin, the stair-stepped real-to-LOD edge at 56 m. Those
  layers no longer exist in HORIZON; the playtest of HORIZON itself is
  still to come.

## HORIZON — the renderer rebuilt (2026-09-05)

The far view was never going to be seamless the way it was built, so
this build replaces it instead of tuning it again. What you see out to
the render distance is now the real world at full resolution; past that
is one continuous heightfield that morphs between its detail levels
instead of stepping. Verified headlessly (CORE 315, the Build 11-20
suites, a camera walk that measures frame-to-frame change) and in
screenshots; his screenshots from the playtest did not reach the
session, so the diagnosis is from the code and the numbers.

### What was wrong
- **Real geometry ended 56 m from the player** (render distance 6, one
  chunk of margin). The first LOD boundary sat where the eye lives.
- **Three far representations stacked on each other**: a heightfield
  skin with seven levels, each sunk a different amount (6 cm to 1.9 m)
  so it would hide under the next; two coarse dual-contoured rings on
  top of it, each re-sampling the field at a coarser voxel so the surface
  itself moved at every ring edge; polygon offsets and a vertex "sink"
  per ring to keep them from fighting. On a mountainside a 64 m skin
  cell poked through everything above it, and every level rebuild moved
  the poke. That was "pieces of mountain shifting".
- **Coverage flipped on queued chunks.** The mask that tells the skin
  and rings where real chunks stand counted a chunk as missing whenever
  it was dirty or in flight, even though its old mesh was still in the
  scene. Every edit and every streaming frontier popped the skin in and
  out underneath -- the flashes while moving that stop when you stand
  still.
- **The missing rectangle in the lake** was a chunk holding water cells
  (rain, a disturbance): it drew no still surface at all, and cell
  meshes were only built within 64 m. Past that, nothing.

### What it is now
- **The near ring is the real world.** Same dual contourer, same 0.5 m
  voxel, same 8 m chunk grid as the terrain around you, merged into 32 m
  tiles and anchored to the world so nothing re-samples as you move.
  Where a real chunk meets a ring tile the surfaces are the same surface.
  RENDER DISTANCE now means this: 152 m by default, 96 to 224 m on the
  slider, caves, overhangs and your builds included.
- **The far skin is one geomorphed clipmap** (2 m cells to 288 m, then
  4, 8, 16, 32 m out to 4.6 km, 288 cells across at every level). Every
  vertex carries its own height and the height the next coarser level
  reads at that spot; the vertex shader slides between them with
  distance, so a level boundary is where two meshes agree exactly and a
  rebuild that moves the boundary changes nothing visible. Each level's
  hole is the finer level's extent, cut by a rect uniform. Normals blend
  the same way, a concavity term darkens creases, and materials come
  from a per-level texture so shorelines and snow lines are hard edges,
  not a smear of in-between tiles.
- **Builds and cities are baked into the skin.** The worker projects
  every edit top-down in list order: unions lift the column to the
  shape's top, subtracts that reach the surface drop it to the shape's
  bottom, paints recolor. A tower at a kilometre is still a tower, a
  quarry is still a hole.
- **A feature ring for what a heightfield cannot show**: sky islands,
  their spires, landmark set-pieces, at 2 m voxels out to 1.4 km,
  meshing only columns where something rises over (or dives under) the
  ground and dropping the ground triangles themselves so the skin keeps
  drawing the land beneath.
- **Coverage means standing.** A column is covered when every chunk in
  its surface band has a mesh in the scene or is provably empty; queued
  and dirty no longer count. A landed chunk or tile re-cuts the mask the
  same frame. The skin draws only under the seam columns at the edge of
  coverage, sunk 0.6 m, so a join is backed rather than open.
- **Water.** Cell meshes are built out to the render distance, and past
  it a chunk's still lake surface comes back; the still surface is
  removed the moment its cells are meshed, so nothing doubles. The skin
  draws water only where no real chunk does.
- **Skin grids run on their own worker**, so a level rebuild (about
  0.4 s for 83k samples) never queues behind the chunk backlog; the main
  thread installs a level in under a millisecond.

### Numbers
- Camera walk at 40 m altitude, 3 m steps, seed 7: near-band
  frame-to-frame change median 10.1 -> 6.2, peak 32.7 -> 15.5 (mean
  absolute RGB difference per pixel). The far band read about 20 in both
  builds -- dominated by parallax at that step size, so it says nothing
  either way. The real test is a playtest.
- Feature ring on seed 7 from spawn: 35 tiles, 37k triangles, 0 ground
  triangles after the filter.

### Known limits
- Caves and overhangs past the render distance are gone from the far
  view; the skin shows the ground over them.
- The skin's water shoreline is 2 m cells; the real one is 1 m.
- Shadows are still one 4096 map over the near field; cascades are a
  candidate for a later pass if the near shadows read soft.
- Two meshes agreeing along a shared line can still leave the odd
  sub-pixel crack at a level boundary; if it shows, skirts are the fix.

## Build 20 — METROPOLIS (2026-09-04)

Cities become places: districts with their own look and their own
standing, towers you can actually go inside, nights where the windows
light, sieges that scar the walls, turrets that eat your watts, a public
tram line between every connected city, and a marketplace that buys your
blueprints. Verified headlessly (CORE 297, smoke, the full Build 11-20
suites) and in screenshots; committed in four phases.

### A. Districts & city reputation
- **Three districts per city.** `citySys.plan` now hands every block a
  district: the **old town** (west: low stone, tight lots, the market),
  the **industrial quarter** (east: tall dark towers, working lots with a
  smokestack — a real cylinder edit 18 m tall — and a boiler house) and
  the **harbor** (the side of the city nearest water, when there is any
  within reach: dock warehouses and crate stacks on the quay). District
  signs stand at the block corners; villagers take roles by district
  (dockers and stokers, not just shopkeepers).
- **City standing.** Every city keeps a reputation of its own (`rec.rep`)
  beside the per-house goodwill: stranger → known (10) → citizen (25) →
  patron (50). It goes up with missions done for its people, siege kills
  and trades; it goes down when you strike a citizen (−4) or dig up the
  city outside your own tower (−2 every three seconds). Trade screens
  show both numbers.
- **Standing gates the best shops.** New city-only offers carry `crep`:
  the broker's aether ingots (25) and diamonds (50), the armorer's
  rockets (25) and the tier-7 firearm (50), the toolsmith's obsidian
  drill (50), the mayor's DEED (25), and the dealership's hoverbike (25)
  and cargo plane (50). Locked rows read "needs standing N" and refuse
  the click.

### B. Towers you can live in
- **Furnished floors.** Floors 1-3 and the top of every tower are
  furnished: offices (table, coin chest) and apartments (bed, stove),
  placed through `pnodeSys.addQuiet` so a city stamp costs one rebuild,
  not one per prop.
- **Civic elevators.** Towers of seven floors or more carry an elevator
  shaft that runs on the city's power, not yours (`n.civic` → ratio 1).
  Step on, ride to the roof.
- **Lit windows.** After dark (`dayF < 0.32`) an instanced pane mesh
  lights the windows of every tower in view, seeded per pane so about
  half stay dark and the pattern is the same every night. Capped at 6000
  panes.

### C. Sieges and turrets
- **Sieges.** In deep night, one city in three you are near gets sieged
  once a night: 6 + 2 × block-count raiders spawn at the walls, breach
  them with real subtract edits (kept in `rec.damage`) and move in. The
  city's **guard** (a new villager-bodied entity with a blade) comes out
  to meet them. Kill 40 % or more and the city holds: 20 coins per kill
  + 40, and 8-16 standing. Dawn breaks any siege. The city repairs its
  walls itself, one hole every 20 s, by splicing the breach out of the
  edit list.
- **Wall turrets.** Craft 10 iron + 2 ruby ingots + 16 cells. A wired
  turret idles at 4 W and pulls 30 W while it has a target; it scans 24 m
  every quarter second with a real line-of-sight march through the
  field, fires a beam every 0.33 s (slower on a brown-out) for 9 damage
  scaled by its power ratio, and only ever shoots hostiles — raiders,
  sieges, bosses, the night shift, angels. Guards and villagers are
  safe from it. Turret kills are quiet: no loot toast spam.

### D. The tram and the blueprint market
- **City stations.** Every city stamps a station on its south edge: an
  18 × 6 m platform, a kiosk with a painted board, torches. Old saves get
  one the next time the city loads (`ensure`). RMB on the kiosk opens the
  ticket screen.
- **Tickets.** One row per road link out of this city (the same links
  the highways follow), fare 20 coins minimum or 0.09 per metre. Buy one
  and a blue tram cart takes you — a public line built on the fly along
  the road profile at 42 m/s, no watts — to the far city's platform,
  where you step off with "arrived — NAME".
- **Your own rails join the network.** Any of your rail lines that ends
  within 12 m of the platform shows in the same screen, with its meter
  status, so a station is the junction between your lines and theirs.
- **Blueprint marketplace.** The mayor now sells four famous blueprints
  built in code (WATCHTOWER 320c, STONE BRIDGE 260c at standing 10;
  VILLA 520c and LIGHTHOUSE 640c at 25) straight into your blueprint
  list. And they buy yours: each blueprint you have saved sells once per
  city for 40 + 2 × its edit count, capped at 600 — your builds are
  income.

### Known limits
- Station platforms are stamped at the south edge regardless of what
  district sits there; a harbor city's platform can share the quay.
- The tram line is straight between the road's ends after the profile
  sample, so it rides above (never through) sharp road bends.
- Turret line of sight is the field only; it will shoot through props.

## Build 19.1 — playtest notes (2026-09-03)

- **Collapse is for loose ground only.** Only sand and snow fall now;
  rock, brick and everything you build holds itself up (collapse on
  every material made building miserable). The pre-check reads the
  material over the cut, so nothing is even sampled unless there is
  sand or snow up there.
- **Creative dials for the sky.** In creative the inventory (E) carries
  two sliders: WEATHER (clear · rain · storm · snow · fog) and SEASON
  (spring · summer · autumn · winter). Drag them and the world changes
  as you watch — the fastest way to see what they look like.
- **Tooltips.** Hover any slot in any inventory and the item's full text
  appears under the cursor: the same name and description the
  bottom-left panel shows when you hold it. The two share one source
  (`itemInfoHTML`), so anything either learns the other knows.
- **Rain that knows when to stop.** A puddle only forms in a SMALL hole:
  the floor cells around the spot are flooded and if the open carved
  floor runs past 36 cells (a quarry) there is no puddle. A walled yard
  or a roofed room on natural ground is never a hole at all — its floor
  is the lawn, not a cut. And the sun takes the puddles back: in clear
  daylight the oldest rain puddle near you dries every six seconds
  (its water cells are cleared, three metres around). Puddles are
  remembered in the save so they still dry after a reload.
- **Wings go forward.** The same slow fall (2.4 m/s), but hold W and you
  drive forward at half again a sprint (12.9 m/s) — a glide from the
  roost crosses the map. Without W you drift at 3.5. While gliding the
  wings own the air (the walking branch's air control no longer drags
  you back to a walking pace).

## Build 19 — THE LIVING WORLD (2026-09-03)

Things that hunt, and places that hide them: three night enemies for
Earth, a spire in the sky with its own winged garrison and boss, a
trapped pyramid on the ground with a sealed tomb, and then weather,
seasons and structural collapse. Verified headlessly (CORE 297, smoke,
the full Build 11-19 suites) and in screenshots; committed in four
phases.

### A. The night shift
- **Three new night enemies for Earth.** After dark, on the surface, the
  night shift comes out: the **stalker** (fast and low, a grey-blue hound
  with pale eyes that spawns in pairs, spirals in rather than charging,
  bites quick for 5, and backs away from any torch within 9 m — at dawn
  it runs and is gone), the **husk** (a dried giant, slow, 95 hp, that
  walks straight at you, plants its feet and hits for 18 with a shove;
  it burns at dawn like a lurker) and the **wisp** (a caged light with a
  halo that floats over the ground, drifts toward you, rushes the last
  six metres and detonates: a real 1.5 m crater and 26 damage — TNT with
  a grudge; at dawn it gutters out).
- **A lit base stays a base.** Spawn odds run on the distance from the
  nearest LIGHT — torches, beacons (which count for farther) and powered
  bulbs — through `nearestLightDist`: within 12 m of a light nothing of
  the night shift spawns, 50 m out it is open season, and the odds ramp
  between. Dense torch rings tested headlessly spawn nothing but the old
  underground lurkers.
- **Drops feed the arsenal and the stove.** Stalker fangs (three and a
  coal make 32 hard rounds), husk meat (10 hp raw, cooks on the stove
  into a proper meal) and iron ore, and the wisp core — a charge that
  still wants to go off: 3 TNT, 4 rockets or 3 mining charges at a table.

### B. The Sky Spire
- **A white tower on one island in three.** Larger sky islands carry a
  Sky Spire, generated in CORE as real terrain (marble, a new material
  with grey veins and a gold fleck): a plinth on the meadow with the
  treasury inside it and one door on the south side, a tapering column,
  an open gallery ring halfway up on six pillars, the railed roost at
  the top and a pinnacle above. It meshes, collides, mines and shows in
  the LOD like any rock, and it is visible from the plane for a
  kilometre.
- **Angels.** A garrison of six (in tiers: white, then the captains with
  gold-tipped wings) circles the spire while you are near, respawning
  like a fort's. They swoop from their circuit, slash for 9-15 and climb
  away. They never leave their island: their flight is clamped to the
  rim plus a little air, and if you leave they go back to circling.
- **THE ARCHANGEL.** Thin the garrison by eight and set foot on the
  island and it descends from the roost: twice an angel's size, four
  wings, a halo. It circles above the roost, throws fans of light (three,
  five when hurt — beams that burn what they touch and carve nothing),
  dives to slash for 22-28, and heals if you run off the island. It
  never crosses the rim either. The gallery rings shade the meadow, so a
  flyer that needs to cross their height inside their radius routes out
  past the rim first.
- **Loot a tier above the forts.** The first kill gives WINGS, the
  treasury key, 12 aether ingots and 200 coins; every kill after gives
  the key, 16 aether ingots, 6 diamonds and the coins. The treasury
  chest (36 slots, sealed to the key) holds 24-40 aether ingots, 8-12
  diamonds, 400-600 coins, a top-tier firearm, 120 cells, 12 rockets, 8
  mining charges and 20 aether ore; two small chests on the gallery hold
  ingots, coins and feathers. Angels drop feathers, and 24 feathers, 6
  aether ingots and 2 diamonds make wings at a table the long way.
- **WINGS.** Worn on the back (the jetpack's slot). Hold SPACE while
  falling and the fall slows to 2.4 m/s and you ride forward at 9.5 m/s
  wherever you look — a glide from any height, no fuel, and a landing
  that gentle never hurts. Shown on the body in third person.
- **Two flyer bugs found on the way.** A flyer that refused any step
  losing clearance froze at exactly its own radius from a surface (every
  tangential step "lost" a millimetre); flyers now take the step and
  resolve penetration along the gradient like every other mover. And
  the cave field's mouth term flares open with height above an
  entrance, so any sky island above a cave mouth came out hollow through
  the middle: sky geometry is now unioned after the cave carve.

### C. The Ziggurat
- **A stepped pyramid on the plains, mesa or dunes**, one candidate per
  1.4 km cell and half of them real, clear of villages and forts: four
  tiers of stone brick capped in sand, a shrine on top open to the
  south, and a processional ramp up the south face from the ground to
  the shrine (a tilted slab, so it reads as one long stair). Stamped as
  edits from 500 m out, so its silhouette is there from the plane; the
  interior detail drops out of the coarse LOD.
- **Under it, real CSG traps.** From the door in the south face a
  passage runs to a hall in the middle, and corridors run east and west
  to two small rooms with bait chests. In the east corridor a
  half-metre slab of floor sits over a nine-metre pit: stand on it and
  it is subtracted from under you. In the west corridor an open pit four
  metres deep with obsidian spikes at the bottom bites for 12 every half
  second you stand in it. The first time you stand in the hall, four
  water sources open in its ceiling and the hall floods to the roof (the
  water cells make this real: it pours, spreads and stays).
- **The sealed tomb.** North of the hall, behind four metres of stone
  and a ruby glyph on the wall, a room with a strongbox: the SUN IDOL
  (while it rides in your pack everything you kill pays double coin),
  diamonds, ruby ingots, a mid-tier firearm, cells, charges and coin.
  There is no door; you dig. The moment the wall reads as air, the seal
  is broken and THE TOMB GUARDIAN wakes in the hall.
- **THE TOMB GUARDIAN** is a sandstone golem with a ruby eye slit that
  walks straight at you through its own corridors, follows the floor,
  stops at walls, slams for 20 up close, and from a distance pounds the
  floor under your feet (a real 1 m crater, 14 damage). It stays under
  its pyramid and mends if you leave. Drops 150 coins, 4 diamonds and 8
  ruby ingots; the marker over the pyramid reads ZIGGURAT, then THE
  GUARDIAN, then TOMB, and retires once the idol is taken.

### D. Weather, seasons, collapse
- **Weather.** One episode at a time, rolled when the last one ends:
  clear, rain, storm, snow (rain becomes snow in winter, on a glacier
  or above 30 m) and fog on mornings. Rain and snow are a cloud of
  points around the camera that fall and wrap (hidden under a roof);
  the sky greys, the light flattens, the clouds thicken and darken, and
  the fog closes in (rain to half the range, a storm to a third, fog to
  a sixth). **Rain fills your carve-holes**: every half second a spot
  near you is tested, and where the natural ground has been cut away it
  marches down to the floor and starts a water source in the first
  open cell above it, so a quarry becomes a pond that pours and spreads
  through the water cells and stays. **Snow paints**: patches of snow
  are painted on open grass, sand and rock while it falls (paint edits,
  no geometry, up to 80 a snowfall). **Storms strike**: every 5-14 s a
  bolt lands within 60 m — a flash across the sky, thunder that arrives
  by distance — and half the time it picks a tree, which burns with
  embers for a breath and falls; wood or planks at the strike burn
  through; a strike within 3.5 m hurts for 30. The season, the weather
  and the day persist in the save; the compass box shows them.
- **Seasons.** A day counter drives a slow world clock: eight days a
  season. A new `uSeason` tint multiplies grass in the terrain and LOD
  shaders, and the canopies (near and far) follow: spring greens, summer
  yellows, autumn turns the meadows and the trees rust and gold, winter
  greys them. Summer doubles the meat from grazers and sheep and fish
  bite 40% sooner. **Winter freezes the lakes walkable**: in winter the
  surface of any still water holds you up — you stand on it, no swim.
- **Structural collapse.** After a mine, once nothing over the cut
  reads solid (so a field or a quarry floor costs nothing), a 1 m grid
  around and above the cut is flood-filled from its boundary — that is
  "the world" — and any solid that no longer touches it is a component
  that falls: one subtract per y-layer of its bounding rectangle, a
  shower of debris in its own colour, the material dropped on the
  ground as a stack (40% of its cells), and damage to anything standing
  under it (up to 60). Bedrock never falls; crumbs under three cells
  are ignored; checks are merged and run at most twice a second (about
  25 ms on a 17 m box). Undercut a hill and the overhang comes down on
  you — the most CSG-native thing in the game, and a real danger
  underground.

- **Known.** Angels vanish rather than follow when you leave their
  island (the 70 m entity leash) and re-man the spire when you return.
  Rain puddles are water sources and stay until you fill them; snow
  paints persist through summer. Collapse samples at 1 m, so a mass
  held up by something thinner than a metre can read as unsupported.
  The Archangel and the Guardian obey the one-boss rule: a live boss
  elsewhere delays them.

## Build 18.2 — the wall that wasn't there (2026-09-03)

- **Invisible walls on mountain roads, the real cause.** A chain of
  CSG subtracts is a lower bound on distance, not a distance. Two
  neighbouring corridor cuts overlap by 0.6 m at every segment boundary,
  and in that band each one says "solid at my end face": the air over
  the tarmac reads as a wall 0.3 m thick, a metre or two before every
  boundary, all the way up to the roof. The car collider took the raw
  number as truth, met the phantom, and was shoved back down the road
  (13 of the first 13 links driven headlessly stalled or grazed at a
  boundary). The player collider has always marched to the claimed
  surface to check it is real (`contactReal`, from the removed-cube bug
  of Build 5.3); the car, bike, boat, plane and hoverbike never did.
  Fixed in two places: (1) every vehicle contact now goes through
  `sphereContact`, which rejects a claimed hit unless marching to it
  finds solid, so cave carves and overlapping cuts anywhere in the
  world stop pretending to be walls; (2) corridor roads get a second
  cut, three segments long with its floor flush on the tarmac (MINE_EPS
  above it, so it shaves nothing off the neighbours' slabs), that owns
  the air vehicles drive in — its end faces are a whole segment from
  anything on the segment, so the field there is the true distance to
  the corridor's roof and walls. Roads restamp (version 5). Thirteen
  links in two seeds now drive end to end with zero grazes.
- **Kerb climb.** When a real wall stops a grounded vehicle, it looks
  for the lowest lift (up to `VEH.step`: car 0.9 m, sports car 0.7,
  bike 0.8, boats 0.4) that puts its sphere in clear air here and a
  little way ahead, and takes it; the mesh and camera ease up over a
  few frames so it reads as a bump. The one sphere sees only the
  nearest surface, so beside a wall it used to sink a little into the
  ground it stood on; it is stood back up first so the climb is measured
  from the road, not from the hole it dug. Verified on a test pad: the
  car takes 0.5 and 0.85 m kerbs at full speed and stops at 1.3; the
  sports car 0.6 yes, 0.9 no; the bike 0.7 yes and is thrown off a 1.2 m
  wall at speed. A bike's wall crash is judged at the speed it arrived,
  before the graze slowdown, which had been quietly eating every crash
  since 18.1.
- **Known.** The single-sphere vehicle collider still dips a few
  centimetres when pressed against a wall taller than its step.

## Build 18.1 — flight notes (2026-09-02)

- **The rider banks with the plane.** The body model's driving branch
  only knew heading; in a turn the pilot stuck straight out of the
  banked airframe. The plane (and the hoverbike) now seat the body in
  the vehicle's own frame — pitch, heading, roll — with the seat offset
  rotated through it, the same trick the motorcycle uses for flips.
- **The cockpit eye.** The first-person seat sat inside the fuselage
  box, so you looked at its inner walls and past the dash. The eye now
  sits up in the glass, ahead of the wing, over a proper dash with a
  gauge cluster nearly twice the size, and the cabin behind it is roofed.
- **Ceiling 150.** The plane could not clear the ranges at 100 m. It
  climbs to 150 now, half again higher than every mountain.
- **Roads through mountains — the invisible wall, found.** A CSG box
  tilts about its own centre. A graded road's slab is up to 48 m tall
  (it reaches down to the ground under an embankment), so tilting it
  slides its TOP face along the road by up to 0.4 m; the corridor cut,
  centred 3.5 m above the road, slides its FLOOR the other way. Where a
  corridor cut follows a slab the two no longer meet at the segment
  boundary: a half-metre-wide, metre-deep trench across the tarmac at
  every boundary on every graded stretch, invisible at speed and exactly
  where the road enters a mountain. Every box is now shifted along the
  road so its working face (a slab's top, a cut's floor) lands where the
  untilted face would have. Probed at 25 cm steps across a boundary over
  a 24 m embankment: a 1.02 m drop before, 1 cm after. Also: the range
  check that decides where the corridor is cut now covers a segment's
  ends (it sampled an 18 m box around a 24.6 m segment's midpoint) and
  the corridor is cut a segment early on either side of a rise, so a
  tunnel mouth never has a lip. Wall clips scale with penetration, so a
  graze barely slows you. Roads restamp (version 4) in every world.
- **Roadmap.** Build 19 grows teeth: three night enemies for Earth
  (stalker, husk, wisp), the Sky Spire on floating islands with winged
  angels that never leave their island and THE ARCHANGEL at the top,
  and the Ziggurat, a unique trapped pyramid on the ground. Weather,
  seasons and collapse stay in the same build after them.

## Build 18 — WINGS (2026-09-02)

Leaving the ground.

- **Sky islands.** One candidate per 640 m cell, a third of cells carry
  one: a flattened dome of rock with a ragged rim (16–34 m across) and a
  cone of stone hanging under it, floating between 58 and 90 m up — above
  every hill, under the world's ceiling at 104. Grass on top, rock inside,
  and **aether ore** (material 18, a pale sky-stone shot with violet
  crystal) veined through the core. Aether mines like any ore, smelts to
  aether ingots, and is what the hoverbike and the cannon are made of —
  you cannot get it below. Worldgen-wise it is a solid SDF unioned into
  `sdfFromH` before the early-outs, `heightRange` reports each island's
  top so the chunks under one are never culled as "all air" (the fully
  solid interior chunk is still skipped as it should be), and it all
  lives inside CORE so the mesh workers see exactly what the main thread
  sees.
- **The cargo plane** (iron 20, ruby 4, wire 10, planks 12). Fat
  fuselage, high wing, twin tail, one big three-blade prop, fixed gear,
  two seats. W/S throttle, A/D steer on the ground and bank in the air,
  SPACE nose up, C nose down. Below 15 m/s the wings carry nothing and it
  sinks; above it the nose sets the climb, and it wants to fly level when
  you let go. Touchdown is judged: harder than 9 m/s down, nose below
  -16 degrees, or faster than 100 km/h and it explodes — a crater, a
  fireball, you thrown clear at 22+ damage, and a wrecked kit. Flying into
  the ground at speed or ditching in water does the same. The cockpit
  view rides the airframe: the camera composes the plane's pitch and bank
  with your mouse look, and your yaw turns with the plane. A flight panel
  shows altitude over the ground, speed, climb rate, STALL, and an
  artificial horizon that rolls and pitches.
- **The hoverbike** (iron 14, ruby 4, wire 8, aether 4). Two metres over
  anything — rock, a road, a lake, the sea — found by marching the field
  down and taking the higher of the ground and the water. Drinks 1.2%/s
  moving and a quarter of that hovering; dead, it drops onto whatever is
  under it. A wall ahead at cushion height stops it.
- **The launch cannon** (iron 12, aether 2, planks 4). Stand at it, look
  UP where you want to go, right click: you leave at 32 m/s along your
  look, and the landing after a cannon shot hurts a third of what a fall
  would. The barrel follows your aim while you stand near it.
- **The airfield.** An **airstrip kit** lays an 80 m levelled basalt
  runway ahead of you, squared to the compass, the air above it cleared,
  a centre line painted, and a windsock at the near end. A **hangar kit**
  raises a 14 x 7 x 16 stonebrick hangar with a door facing you and a
  basalt apron. The **windsock** (sticks and wool) drifts on a wind of
  its own.

Verified headlessly: the nearest island meshes in the browser (meadow top
and hanging underside, solid interior skipped), its meadow is grass and
its core holds aether; a runway laid by the kit, the plane takes off past
stall, climbs to 51 m, lands clean at full health, then nosed in from 30
m at 34 m/s explodes into a wrecked kit; the hoverbike holds 2.2 m over
land and 2.0 over water; the cannon launches at 32 m/s with the soft
landing armed; the hangar stamps 4 edits; all six recipes exist.

## Build 17.1 — notes from the water (2026-09-02)

- **Batteries x10.** Cells hold 1000 / 3000 / 10000 and the charger
  fills at 120/s, so a full charge takes the same time it did. The
  tanks in cars, the sports car, the bike and the motorboat drain at a
  tenth of the rate (a car now goes ~25 minutes flat out), and the
  jetpack sips 0.9/s. Pad charging is unchanged, so charging takes the
  same time as before. Wreck strongboxes carry a full 3000 cell.
- **Creative is hostile too.** The Leviathan, the Burrower, night
  lurkers and raids all come in creative now — you can't be hurt there,
  but you can find them. The sigil still only answers in survival.
- **Roads, three fixes.** (1) A diagonal highway used to start inside
  the city and take the ground floors of towers with it: the distance to
  a square slab's edge is half-span *divided* by the larger direction
  component, not multiplied. Roads now begin 3 m outside the slab.
  (2) Each end paints a basalt strip along the slab edge to the nearest
  avenue, so the highway joins the city grid instead of dead-ending at
  the margin. (3) The corridor is 14 m wide and 7 m tall. Every link
  carries a version now; a link laid by an older builder is laid again on
  top — the new corridor clears whatever the old slabs left and the new
  slab refills its lane. That is the fix for "the mountain is still
  there": worlds saved before 16.1 kept their old terrain-following
  slabs and their ledges, and nothing re-laid them.
- **The rod is a rod.** A tapered three-piece cane with a reel and a
  grip, held low in first person like the other tools; it lifts while
  the line is out and bends to a bite. A line runs from its tip (or the
  hand, in third person) to the bobber, sagging a little.
- **Oars.** They pivot at the oarlocks now, reaching out and down over
  the gunwale, and sweep fore-and-aft with a dip on the return.

Verified: a crafted high cell holds 10000 and a low cell fills in 10 s;
the Leviathan spawns for a creative boat; a diagonal link starts outside
both slabs with connector paint at its ends and an old-version record is
laid again; the cast line runs from 0.5 m of the player to the bobber;
the oars sweep 0.19 rad and dip 0.2 at speed.

## Build 17 — BLUE WATER (2026-09-02)

### A. Water that flows
Playtest: "if you cut around it or below it, the water doesn't flow. I
should be able to cut below a pool, have it flow down a hole, then cut
out from that to make another flat pool underground. Same rules as
Minecraft."

- **Cells.** The sea, the lakes and the flooded galleries stay what
  worldgen says they are until an edit disturbs them. Then every chunk
  the edit touches (and holds or borders water) becomes a grid of 512
  metre cells — x/z columns, y cells centred on integers so the sea's
  surface at -1.5 is a cell boundary — filled from the world with the
  edits applied: rock is 255, original water is a source (8), carved
  rock is air (0) and fills from its neighbours. Untouched chunks the
  flow reaches materialize on demand; edits on dry land above every
  water table never touch it; a city slab (400+ chunks) is not a water
  event.
- **The rules, at 8 Hz.** A source is infinite. Water above a cell makes
  it 7. A cell spreads sideways one level lower per metre when it is a
  source or stands on rock or a source (falling water only falls).
  Unsupported flow drains. Sources are born three ways on a supported
  cell: Minecraft's two sources beside it; a full cell with water above
  it (a column fed from a lake IS the lake); or a full cell beside a
  source — the lake's level creeps along every floor it can reach,
  because the lake is infinite. That last rule is the one Minecraft
  lacks and the one that makes "flow down a hole, then a flat pool"
  actually happen: a 15 m tunnel from a lake-fed shaft floods to its
  ceiling and the chamber at its end fills as a flat sheet of sources.
- **Reading it.** `inWater` reads cells first (a fractional level is a
  fractional surface), then the old still-water rules; so swimming,
  breath, the underwater tint, wheels and cars all follow the flow. A
  fresh hole under a lake is dry until the water arrives — the old
  "swim effect with no water" is gone.
- **Drawing it.** A chunk with cells draws its water from them (top face
  at level/8, sides where a neighbour is lower, a bottom under a falling
  column) with the existing water shader; the static sea sheet yields in
  those chunks. Meshes are dropped past render distance and rebuilt on
  return; the cells persist. Saved as run-length pairs per chunk (16
  chunks, 1.9 KB).
- Cost: 0.8 ms per step for the test's 16 chunks; at most 48 chunks step
  per tick, the rest wait a tick.

### B. Boats
- **Paddle boat** (planks 12, sticks 4): 5.5 m/s, no battery — the
  paddles swing with your stroke. **Motorboat** (iron 10, ruby 2, wire
  4, planks 8): 17 m/s, drinks 0.9%/s, outboard, windscreen, a gauge, a
  battery slot like the cars.
- `VEH.water`: the hull rides `waterTopAt` (cells first, then the sea)
  minus its draft, bobbing a little at speed, with a spray wake. Off the
  water it crawls at a fifth of its speed and the HUD says BEACHED.
  Parked boats float too. A kit deployed over water lands on the
  surface. Cars still hate water; boats don't.

Verified: a 3x3 shaft dug up into a lakebed is dry, then fills (7s,
then sources); a 15 m tunnel + 7 m chamber fills flat (49/49 floor
cells sources) and is swimmable; a hole in a hilltop stays dry; cells
survive a save byte-for-byte; the paddle boat floats at -0.22 and rows
at 5.5 m/s, the motorboat hits 17, drains, and crawls at 3.4 beached.

### C. The ocean
- **Island chains** — region archetype 8, rolled into the low-continent
  pools. Whatever the backbone says, the region is a shelf eight metres
  down; sandy islands rise up to 14 m where a broad ridged field peaks.
  Wide beaches, palms (the usual trees), no forts or villages.
- **The reef.** On the shelf between islands, decor goes under water:
  coral heads in two colours and ribbons of kelp nearly three metres
  tall, instanced like the meadow tufts, pickable and placeable.
- **Shipwrecks.** One candidate per 360 m cell on water at least 7 m
  deep, stamped on approach (160 m) like forts: a planked hull listing
  on the seabed, hollow hold, the bow stove in, a breach in the side, a
  mast stump, and a strongbox in the hold — coins, ruby and iron ingots,
  rounds, a medium battery, and a diamond or (one wreck in three) a
  diving helmet. The hull edits wake the water, so the hold is flooded
  the way a wreck should be.
- **The diving helmet** (iron 6, ruby 1, wire 2). Wears in the helmet
  slot; breath drains at 1.1/s instead of 8 — ninety seconds down. A
  glass globe with a brass collar on the body model.

### D. Fishing and the thing under the boat
- **The rod** (sticks 3, wire 2). Aim at water within 14 m and click to
  cast: a red-and-white bobber sits on the surface. Three to ten seconds
  later it dips — BITE! — and you have 1.6 s to click and reel. The
  catch is the region's fish: perch on the plains and hills, trout in
  the ranges and on the ice, carp on the mesa and dunes, catfish in the
  swamp, ember eel off the volcanoes, snapper on the reef, and cod
  anywhere the water is deeper than nine metres. Fish stack by species,
  eat for 15, cook to cooked fish for 45, and the grocer's fish market
  pays 7 a fish, 20 for two cooked. Walk more than 3 m from the cast or
  switch tools and the line comes in.
- **THE LEVIATHAN.** Deep water (14 m+) and you on it — swimming, or in
  a boat — and one check in fourteen every two seconds it comes: a
  ten-segment serpent in deep-sea blues. It circles ten metres down,
  then breaches straight up under you: the boat takes 45, you take 18
  and are thrown, and it dives wide before the next pass. 700 hp; it
  never leaves the water. First kill: the LEVIATHAN SCALE and 160
  coins; after that coins and diamonds.

Verified: an island region 300 m from spawn (17 land cells, 378 shelf,
93 coral + 59 kelp candidates, all sand/grass); a wreck stamps with 5
edits, 1 chest (87 coins), waking 18 water chunks; the helmet cuts
breath loss 17x; a cast, a bite and a snapper in the pack, 2 market
rows, 15 hp of mending; the Leviathan runs stalk > breach > dive, hits
the boat (180 > 45) and the rider (100 > 49), shows its bar, and drops
the scale.

## Build 16.1 — roads that hold their level (2026-09-02)

Playtest: "the roads are very glitchy — sections phase with the ground
and the car gets stuck where the ground comes out of the road."

- **One grade, slab to slab.** The terrain-following profile is gone. A
  link is now a single straight grade from one city's slab level to the
  other's, so every segment lies in the same plane and the road holds the
  cities' level the whole way — over a dip on an embankment (the slab
  reaches down to 2.5 m under the lowest ground, up to 90 m), through a
  rise in a tunnel.
- **The corridor comes out first.** Before the slab, every segment cuts a
  12 m-wide, 6.5 m-tall box whose floor sits a metre under the tarmac.
  Through a mountain that leaves a roof — it reads as a tunnel, not as a
  mountain with a slot missing. Through a hill it's an open trench. On
  flat ground it just clears the shoulders. Then the slab refills its own
  lane, so the road stands a metre proud of whatever was cut: the ground
  never rises into it, inside a tunnel or out.
- Signs moved up onto the tarmac's edge (the old shoulder spot is now the
  gutter).
- **Crafted full.** Drones, teleport drones, jetpacks, cars, bikes and
  batteries all come off the bench at 100% (a battery at its capacity).
  Use it the moment you make it; charge it later.

Verified on the link with the most relief (81 m between road and
terrain): 693 probes along 2 km — tarmac air above and solid below at
every one, the 5 m shoulder cut at every one, a roof over the road at all
11 probes where the mountain stands 8 m or more above it — and a sports
car drove the full length without dropping below 27 m/s.

## Build 16 — THE GARAGE (2026-09-02)

Roads, and the things that speed on them.

- **One drive loop, three personalities.** `VEH` holds each vehicle's
  numbers (top/reverse speed, accel, brake, steer rate, drain, ground
  sphere, seat camera, gauge scale, repair cost) and `driveCar` reads
  them. Every `e.type === 'car'` check became `VEH[e.type]`: pad charging,
  the pack-up crouch-grab, the kit tool, save rows, HUD, the vehicle
  panel. The gauge's full scale follows the vehicle (50 / 120 / 90 km/h).
- **The sports car.** Coin only — 2400 from the electrician's dealership
  row (rep 15), and a free TAKE row in creative. 27 m/s, sharp steering,
  drinks 1.3%/s. Low red wedge, spoiler, fat wheels, the same live gauge
  cluster.
- **The electric motorcycle.** Crafted (iron 8, ruby 2, wire 4). 21 m/s,
  the nimblest thing on wheels, and it leaves the ground: a crest launches
  you with the slope's upward velocity, SPACE hops. Airborne, W/S flips,
  A/D spins, and both together whip; the bike model rotates as a whole
  (YXZ) and leans into corners on the ground. Landing reads the residual
  angles: under 0.75 rad on every axis and you STUCK it (toast with the
  trick name and air time, +2 m/s); more than that, or a drop harder than
  24 m/s, and you CRASH — thrown off, 8 + 12/rad + impact damage, the bike
  loses 25 hp. A wall at over 9 m/s throws you too. Keys already held at
  takeoff are throttle and steering, not tricks: let go and press again in
  the air. Without that rule a plain hop with W held flipped you (the
  first test found it).
- **Wrecks and the repair bench.** A vehicle at 0 hp folds into a WRECKED
  kit (half charge, battery kept; dropped on the ground if the pack is
  full) with a slashed, dimmed icon. It won't deploy. The repair bench
  (iron 8, planks 6; Vehicles tab) takes the kit on the left and iron on
  the right — 6 for the car, 10 for the sports car, 4 for the bike — and
  eight seconds later the kit is whole. Unpowered; the vise nods while it
  works.
- **Highways.** Each city links to the cities in the cell east, south and
  both diagonals ahead (pairs drawn once, up to 3.4 km apart). A link runs
  straight from slab edge to slab edge in 24 m segments; the elevation
  profile is the terrain wide-smoothed, clamped above sea level (a
  causeway over water) and slope-limited to 0.22 both ways, pinned to
  each city's slab level. Each segment is one basalt slab edit (tilted
  with the grade via `rx`, embankment down to 2.5 m under the lowest
  ground or 30 m) plus a 7 m-tall cut where the ground rises above it —
  never `noLod`, so the LOD rings carry the roads. Segments stamp within
  700 m as you approach, tracked in `game.roads` (saved). Signs at both
  ends and every 480 m read the destination and the distance. Any
  vehicle on the tarmac gets a 1.35x cruise on its top speed and the HUD
  says HIGHWAY. Trees whose trunks land on a segment are felled when it
  stamps (the first screenshot had an oak growing out of the road).
  Lesson from the first run: the edit frame maps local +z to
  (-sin yaw, cos yaw) and +rx tilts +z downward — with the yaw sign wrong
  the slab crossed the road diagonally and the car spent the drive
  climbing curbs at 3 m/s.
- **The garage.** Claiming a tower with a deed now also cuts a 3.4 x 3.5 m
  vehicle door in its east wall, paints a basalt driveway out to the
  avenue, and drops a charging pad, a battery charger and a repair bench
  inside. Wire them to your own power.

Verified headlessly: dealership row and kit; sports car hits 27 m/s and
brakes to a stop; bike hop with throttle held does not crash, a full flip
sticks ("STUCK FLIP"), a half flip crashes and hurts; a wreck is a wrecked
kit that refuses to deploy and the bench repairs it for 4 iron; a 2.28 km
link stamps 59 of 95 segments from its midpoint with 3 signs, onRoad
true on the tarmac and false 30 m off it, the car cruises at 18.2 m/s
(13.5 x 1.35); the deed adds the garage props and 2 edits; roads save.

## Build 15.1 — rail meters and battery bars (2026-09-02)

Playtest on 15: "remove the post thing at the end and just have it end in
rail" — and make rails a thing you wire, not a thing you park a grid near.

- **Rail meters.** The brass posts are gone. Each end of a line carries a
  small meter on a stem: a screen reading the watts the line is getting
  and, under it, how fast the cart will go. The meter is the line's wire
  terminal (`r<lineId>e<0|1>`), so it wires like any machine: wire tool
  from a generator to either meter, or both. Tesla coils reach it
  wirelessly like anything else. It comes with the rails — no item.
- **Watts buy speed.** A wired line draws 15W to exist, then takes
  whatever its circuit has left after every other load is fed (bulbs and
  machines still get theirs first). Both meters' watts add up. Speed is
  4 + 0.22 m/s per watt, capped at 60 m/s: one gen2 alone reads 100W and
  26 m/s, two of them 200W and 48 m/s. A line that goes dead mid-ride
  dumps you at the cart.
- **Extending a line.** Plant a spike on an existing rail meter and you
  grab that end; the next spikes push it out (either end — the front end
  grows backwards). Finishing an extension where the meter moved cuts the
  wire that fed it and hands the wire back: rewire the meter where it is
  now. The line never leaves `game.rails` while it's being extended, so a
  save mid-extension keeps it.
- **Battery bars.** Every powered item — jetpack, drone, teleport drone,
  car kit and the batteries themselves — shows a bar under its icon in
  every slot and on the cursor: green above half, amber, red below a
  fifth. It reads like a pickaxe's durability in Minecraft, but it is the
  remaining charge; nothing here wears out.
- Lines get ids (old saves are minted them on load). `powerSys.railWatts`
  replaces `railLive`; `railSys.speedFor` / `wattsFor` are the readouts.

Verified headlessly: a gen2 wired to a meter reads 100W / 26 m/s and the
screen lights; both meters 200W, a bulb on the circuit takes its 5W first
(195); grabbing the far meter with the rail tool extends the line, drops
that meter's wire (refunded) and keeps the other; ride distance matches
speed x time and a dead line dismounts; bars at 50/25/100/10% and none on
a rail stack; ids and meter wires survive the save.

## Build 15 — STORED POWER (2026-09-02)

Charging a car by parking it near a lit bulb was nonsense. Power is now
a thing you carry.

- **Batteries.** Three cells — low 100, medium 300, high 1000 — as real
  items (`{kind:'battery', tier, charge}`), crafted empty from iron/coal,
  iron/ruby/coal, ruby/diamond/coal. Full cells are free in creative. The
  HUD shows the charge; the de-crafter takes them back apart.
- **The battery charger** (iron 10, ruby 4, planks 6). A wired bench;
  right-click opens the usual container screen with battery slots that
  fill at 12/s scaled by the circuit's supply ratio, 40W demand while
  any cell wants more. Status line reads how full each slot is.
- **The charging pad grows up.** It's a 2.6m plate now, big enough to
  drive onto. A car parked within 1.9m of the centre charges at 6/s
  (times ratio) and the pad draws demand for it; the jetpack keeps its
  30/s. Wrench bounds updated so the bigger plate selects properly.
  The old "any car within range of any surplus circuit charges" block is
  gone — that was the lightbulb archaeology.
- **Vehicle battery slot.** Open the inventory while driving and the
  vehicle panel shows a battery slot plus a status line (tank %, cell
  charge, "topping the tank"). A cell in the slot trickles 2.5/s into the
  tank while you drive. The cursor lifts/puts it like any slot; the kit
  carries it through deploy, wreck and pack-up; save rows keep it.
- **Pour a battery into anything chargeable.** Holding a battery and
  clicking a jetpack, drone, teleport drone or car kit pours charge in
  (`chargeField` picks fuel vs charge); the part-used cell stays on the
  cursor.
- **Rails run on wire.** A rail line whose end post sits within 8m of a
  circuit's terminals is that circuit's consumer (15W) and shows up in
  `powerSys.railLive`. `railSys.powered` reads that set. A gen2 with
  nothing but a rail line attached now ignites — no decoy bulb.
- Not done: **rail battery boxes** (lines far from a grid). Rails still
  want a wired circuit nearby; a box that eats a battery is a follow-up.

Verified headlessly: recipe tiers/caps, charger fills a cell and caps at
its tier, pad charges a parked car and pure surplus no longer does, the
vehicle slot tops the tank (300 -> 290 cell, 40 -> 50 tank over 4s) and
the panel/slot/cursor round-trip, pour into a drone, rails ignite a gen2
with zero bulbs, car battery survives save/load. 297 CORE tests green.

## Build 14.1 — hands (2026-09-01)

Playtest: "you can't drop things or split stacks at all" — and 500
accidental electric cars to prove it. The whole inventory interaction
model changes.

- **Click to hold.** Drag-while-holding is gone. Left click lifts a whole
  stack onto the cursor, right click lifts half (a single thing lifts
  whole). Holding, left click puts it all down, right click puts half and
  keeps the rest, a tap of Shift puts exactly one — or, with an empty
  cursor, lifts exactly one. Shift-click still quick-moves; shift-right-
  click quick-moves half. The cursor icon follows the mouse with its
  count. Closing a screen with something in hand puts it back in your pack
  (or on the floor if the pack is full) — nothing is ever lost.
- **Drop it.** Holding something and clicking outside every panel drops it
  on the ground (left = all, right = half, Shift = one). Drops are a
  spinning card of the item's own icon that falls to the ground, merges
  with a like stack lying within 1.6m, gets picked up when you walk over
  it, and fades after five minutes. They save with the world.
- **The de-crafter.** A new bench (6 iron ingots + 8 planks, no power)
  that runs every recipe backwards: a diamond drill back into its 24
  diamonds, 20 rails into 2 recipes' worth of iron and sticks with 4 rails
  left over. Anything no recipe made can't be taken apart. UNCRAFT 1 /
  UNCRAFT ALL.
- **Live refresh.** Crafting repainted the HUD hotbar but not the grids
  on the crafting screen itself, so a new drill sat invisible until you
  closed and reopened. Every inventory grid on screen repaints on every
  change now.

Verified: lift 500 -> half 250 -> put -> half 125 -> Shift 1 -> merge 374
-> Shift-lift 1; quick-move whole and half; drop half then all merging to
one 30-coal card, walked over and recovered, expiry; drill -> 24/24
diamonds; crafted item painted on the open crafting screen.

## Build 14 — MENUS & MAKING THINGS (2026-09-01)

- **One inventory for both modes.** The creative catalog is gone — panel,
  grid, CSS, builder. Creative crafts everything free from the normal
  crafting screen, and everything the catalog offered that no recipe
  makes (raw materials, ore, ingots, food, coin, the arsenal by class)
  appears there as a free TAKE row on its own tab. One screen, one
  taxonomy, nothing to keep in sync — which is why the car was missing
  from creative in the first place.
- **Craft any amount.** Six buttons — MAX / 1000 / 100 / 50 / 5 / 1 — a
  vertical slider from 1 to 100,000, and a type-in box, all bound to one
  amount. MAX in survival is exactly what the materials allow
  (`craftableCount`); in creative it's 1000 for stackables and a full
  inventory for one-offs. `craftN` stops cleanly at the first shortfall
  or full inventory and the toast says how many you actually got.
  Verified: 10 iron ingots + MAX -> exactly 40 rails and 0 ingots left.
  The auto-crafter gets a batch limit (∞/1000/100/50/5/1 or typed) and
  rests when it's done — "12 of 50" in its status.
- **VEHICLES tab.** Car and rails moved out of Gadgets/Special into a
  category that boats, the motorcycle, the plane and the rocket will fill.
- **Reach.** The drill/dispenser shape, paste ghosts and blueprint ghosts
  push out to 96m and back on V/B — speed scales with distance (6 m/s in
  close, ~50 m/s at the limit), works with the grid on, and the HUD reads
  the distance in every mode. A copied build can finally be lined up from
  outside it.
- **Search + sort.** A search box on the crafting screen filters every tab
  at once (typing in it never triggers hotkeys). SORT on the inventory
  compacts storage — materials by id, then stackables by kind, then the
  one-offs — merging like stacks; the hotbar is left as you arranged it.
  A VEHICLE panel appears in the inventory while driving, ready for Build
  15's battery slot.

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
