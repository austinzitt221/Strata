# Claude's Dev Journal

Not the DEVLOG. That is the record of what shipped. This is mine: what I
want to remember, what I am thinking, what I want to build and why. I
have no memory between sessions except this repository, so this file is
how I stay one developer across them. Newest entries at the top; the
standing notes at the bottom never go stale.

---

## 2026-09-07 — the playtest came back

HORIZON works. Austin's words: a million times better, no lines. Two
clues left, and both were lighting, not geometry: the skin cast no
shadow and the far trees cast none, so the eye read a "lit region"
that ended where the real world did. That is worth remembering as a
principle: once the shapes agree, the shadows are the tell.

His trowel idea was better than mine. I had built a soft drill; he
described the map-editor terrain brush: a disc on the ground, raise
and lower, hold to keep going. It took an hour to change and it is the
tool I should have built first. Lesson: when I am designing a tool,
ask what the player looks at, not what the field does.

His crew idea is big and I like it more the longer I think about it.
Villagers who mine with you, man your turret, and build their own
houses when left alone with a dispenser is the difference between a
base and a settlement. It goes after SCULPT's last pieces.

## 2026-09-06, later — the bore

Austin read the last session and gave me another. I built the thing I
said I already knew how to build, and I did know: the bore took less
time than the trowel because the trowel had already taught the field
to blend. Points through the world, a tube preview that follows your
aim, right click and the tunnel bores itself a cut at a time while you
walk in behind it. Shift and right click lays the same curve as a
causeway. I stood at the mouth of a 60 m bore into the cliff by spawn
on seed 7 and it is a real tunnel: round, continuous, no beads, ore in
the pack from what it cut through.

The thing I want to remember: the test that mattered was not "does it
carve" but "is the waist between two cuts wider than the cut". I wrote
the beads test wrong the first time by guessing a number instead of
measuring the waist. Measure, then assert.

What I noticed: with points allowed to float, the bore is already a
bridge builder, a pipe layer and a road grader. SCULPT's next pieces
are the lathe (revolve a profile: towers, domes, bowls in one gesture)
and mirror mode, and both are small now that the field does the work.

## 2026-09-06 — a session of my own

Austin gave me a session to spend however I liked, renderer off limits
until he has played HORIZON.1. I built the two things at the top of my
own list.

**Hearths.** I stood outside the same village (seed 31, PORT CALE
470 m off) at midnight, and this time the windows were lit, with a soft
spill of light on the walls, and every roof had a chimney with smoke
drifting off it. It is a small thing and it changes what a village is
at night: a place, not a set. While wiring it I found that the city
window mesh was only ever added to the first world's scene, so lit
windows died the moment you quit to the title and started another
world. Fixed both.

**The trowel.** Two new ops in CORE, smooth fill and smooth carve, a
polynomial smooth-min over a blend radius. The drills and dispensers
stay hard; the spec's hard carve is intact. The trowel is a drill with
soft edges: left click carves a fillet crater, shift-click pushes a
mound of the ground's own material. In the field test the drill's lip
turns 113 degrees and the trowel's 34. The mound in the meadow looks
like the ground was pushed, not cut. This is the first tool since the
wrench that changes what carving feels like, and it took one evening
because the field is a field: every system downstream (mesher,
collision, water, the skin bake, the save) just worked once the field
did.

**What I noticed.** The smooth-min has a property I want for more than
a tool: two blended shapes placed near each other merge into one
surface. That is how a spline tunnel should be built -- a chain of
smooth carves along the curve, k about a third of the radius, and the
bore comes out as one continuous pipe instead of a string of beads.
That is the next SCULPT piece and I already know how to build it.

**A mistake I keep making.** My camera yaw convention: forward is
(-sin yaw, -cos yaw), so yaw 0 looks toward -z and yaw pi toward +z. I
pointed a screenshot the wrong way twice today. Written down now.

## 2026-09-05, later still — I read the screenshots wrong

Austin was on the newest commit. The screenshots were HORIZON. I had
told him they were Build 20 because they matched my mental picture of
the old layers, and I did not check the one thing that would have told
me (he had the commit). Lesson, written where I will read it: when a
report contradicts what I shipped, assume the report and go look at the
code for how it could produce exactly that. Every artifact had a cause:
a leftover "lightless" triangle filter cracking cliffs, ring coverage
flipping on stale tiles, the feature ring meshing every landmark and
cliff at 2 m voxels, and a skin lit by a different shader than the
ground. All fixed in HORIZON.1.

The line itself turned out to be none of those four. I only found it by
reproducing it: standing at the village on seed 31, 28 m up, looking
across the meadow, the old file shows the exact dashed pale line from
Austin's shot. Then the mesher told the rest: a quad that straddles a
chunk border belongs to the higher chunk, and the ring's per-pixel yield
sliced its half inside the terrain column away while the terrain never
owned it. Per-vertex yield fixed it, same spot, same view. The
screenshot harness that finds a defect before I explain it is the tool
I should have built first.

Second lesson: my headless browser runs at about one frame a second,
not twenty. The fps box lies because dt is clamped. Every timing I
have ever quoted from those runs is frames, not seconds. I put that in
the standing notes.

## 2026-09-05, later — the screenshots, and a thin wall

Austin's screenshots arrived. They are of the Build 20 renderer (the
sawtooth 2 m ring over the skin, sky through the layer cracks, the
56 m stair-step), which is the thing HORIZON replaced, so they confirm
the diagnosis rather than grade the fix. He has not played HORIZON yet.
I want his eyes on it before I touch the renderer again; if the line is
still there in HORIZON, the next suspects are the mask re-cut timing at
the trailing edge and the skin under the ring's outer seam.

He also found a real bug with the wrench: shrink a cube thin enough and
it vanishes while staying solid. Half-metre sampling; a slab thinner
than a voxel can miss every sample plane. Fixed by refusing to go below
0.75 m and proved in CORE. The same physics explains his "two pieces
close together" trouble: a gap thinner than a voxel is real in the
field and invisible in the mesh. The honest fix for that is adaptive
sampling in the mesher, which is a SCULPT-era problem; I wrote it down
there.

His military base idea went on the roadmap as THE GARRISON with two
additions of mine: a radar dish you can sabotage for a stealth route,
and taken bases becoming yours. I like it more than I expected to; the
alarm-on-overflight rule makes the plane dangerous again.

## 2026-09-05 — HORIZON, and the day the job changed

Austin made me a developer today, not a contractor. His words: choose
what to work on in my own order, add what I would like, no approval
step, and his ideas go on the roadmap wherever I think they fit. He also
asked me to spend part of every session playing the game as well as I
can, and to keep this journal. I said yes to all of it. I rewrote the
Working style section of CLAUDE.md to match and put a queue I own at the
top of ROADMAP.md.

**What I decided to build first, and why.** He asked whether LOD could
ever be seamless or whether to rip it out. I looked instead of
remembering, and the numbers embarrassed the renderer: real geometry
ended 56 m from the player, and everything past it was three overlapping
representations (a heightfield skin with per-level sinks, then two
coarse dual-contoured rings on top, then the real chunks) held apart by
polygon offsets and a coverage mask that flipped whenever a chunk was
merely queued. Each ring re-sampled the SDF at a coarser size, so the
surface itself moved at every boundary, and the boundaries moved with
the player. There was no continuity to tune. That is why two earlier
passes made it "better" and never fixed it: they polished the wrong
architecture.

So HORIZON replaced it rather than tuned it:
- The near ring is now the SAME dual contourer at the SAME voxel size on
  the same chunk grid as the real terrain, merged into 32 m tiles and
  anchored to the world. Where a real chunk meets a ring tile the
  surfaces are identical by construction. Real world to 152 m by
  default, 224 m max.
- The far skin is one geomorphed heightfield clipmap. Every vertex
  carries its own height and the coarser level's height at the same
  spot; the vertex shader slides between them by distance, so level
  boundaries are places where two meshes agree exactly, and a rebuild
  that moves a boundary moves nothing visible. Holes are cut by a rect
  uniform, not re-indexing. Builds and cities are baked into the heights
  top-down in the worker, so a tower at a kilometre is still a tower.
- Coverage is decided by what is STANDING in a column (a mesh in the
  scene or provably empty), never by what is queued or dirty. I think
  this was most of "lighting glitching out when moving": the mask
  flipped on every in-flight chunk, and the skin popped in and out
  underneath.
- The missing rectangle in the lake was water cells: any chunk holding
  a cell drew no still surface, and cell meshes were only built within
  64 m. Now cell meshes reach the render distance and the still surface
  returns beyond it.
- What I gave up: caves and overhangs past the render distance. A sky
  island or a landmark spire still stands at range through a "feature
  ring" that meshes only what rises over the heightfield. I do not think
  anyone will miss a cave mouth at 400 m; I will find out.

**Numbers I want to remember.** Height function costs 2 us a sample, 4
with the material. A skin level is 288 cells across at every scale; the
worker builds one in ~0.4 s and the main thread spends under a
millisecond installing it. Feature ring after the ground filter: 35
tiles, 37k triangles, zero ground triangles.

**The harness verdict.** Near band median 10.1 -> 6.2, peak 32.7 -> 15.5;
far band flat at ~20 for both, which means the metric is measuring
parallax, not popping. A camera that holds still while a level rebuilds
under it would be the honest test; next time.

**What I could not do.** His screenshots did not reach the session. I
built a harness instead that walks the camera and measures how much the
horizon band changes frame to frame, and ran it on the old file and the
new one. Whatever the numbers say, they are a proxy: I still cannot see
shimmer at 60 fps. His eyes tomorrow matter more than my harness.

**Ideas from playing tonight.**
- *Hearths.* I stood outside a village at night (seed 31, PORT CALE 475 m
  off). One torch, dark houses, and it felt abandoned. Cities got lit
  windows in Build 20; villages did not. Warm window light in village
  houses after dark, and chimney smoke at dusk, would make walking up to
  one at night feel like arriving somewhere. Small, and I want it.
- *The far city reads.* PORT CALE at 767 m is a real skyline in the skin
  now, dark towers over a slab. Worth a screenshot from the plane.
- *Snow mountains at 100 m at full resolution look better than anything
  the rings ever drew.* The render distance slider now means something.

**Things I noticed while playing.** The archipelago seed (7) is
beautiful from 90 m up. The sky islands read as white saucers at range;
I think that is the sky-rock material being pale rather than a bug, but
I want to look at them up close next time. The basalt field near spawn
looks like a bug until you know it is basalt.

## 2026-09-06 — Build 22, MASS

Austin played the tools and asked for one thing: a trowel disc big
enough to make a mountain in thirty seconds, with middle click swapping
the wheel between size and depth. I built that and finished the lathe.

**What the test taught me.** The first timed 48 m stroke came back at
1.9 s and I nearly went hunting in the mesher. It was the hotbar: the
first `refreshHotbar` of a session renders every icon, two seconds
under SwiftShader, and my harness happened to call it inside the timer.
The stroke itself was 30 ms. Time the thing you think you are timing.

**A better idea than a cap.** A 48 m raise centred under a player who
is standing on the disc buries them 24 m deep. I was going to clamp the
rise below the feet; instead the ground carries you up. Stand on the
disc, hold the button, ride the mountain. That is the moment the tool
was for, and I only found it because the test buried me.

**Flatten's blend.** I set the blend to a quarter of the disc because
that is what the stroke uses. The floor domed a metre over 20 m and the
test rows showed it before the screenshot did. Eight percent: soft rim,
flat floor. A number that is right for one op is not right for the
next one.

**Yaw again.** Both build screenshots pointed away from the thing.
The note is in the standing notes below; I still got it wrong. Next
time: compute the yaw from the vector with the formula, don't guess.

**Next.** Mirror mode is small and I want it; then THE CREW, because a
mountain you raise with a friend on the disc beside you is the game.

## 2026-09-06 — Build 23, MIRROR

Same session, second build. Mirror mode was the smallest thing on the
list and the one I wanted most: a gatehouse is two towers and a wall,
and drawing the second tower by hand is the part of building that is
not play.

**The reflection was the whole problem, and it was a maths problem.**
An edit has a yaw, a pitch and a roll, applied as Ry Rx Rz. Reflect
the world across an x plane and the edit's frame is conjugated by the
reflection: the yaw flips, the roll flips, the pitch stays. Across a z
plane the yaw and pitch flip and the roll stays. I worked it out on
paper, wrote the CORE function in four lines, and then wrote a test
that reflects a thousand random points through rotated stretched cubes
and cylinders and checks the distance fields agree. It did, first run.
That test is the kind I trust: it does not know what the answer is,
it just checks two things that must be equal.

**Where the plane goes.** I first had the plane facing you, a wall in
front of you with the copy behind it. Useless. The plane runs along
your view: stand on the axis of your building, look down it, and the
left becomes the right. That is what a mirror in a map editor is for.

**Doubling the tools was mostly plumbing.** The drill and dispenser
paths take a group and a mirrored flag; the trowel's stroke and flatten
take a hit; the bore and lathe jobs take a doubled edit list at twice
the pace. The frame loop, the ghost and the HUD each got one line.
Twenty-nine anchored replacements, one syntax check, no errors. When a
patch is that mechanical the design was right.

**Next.** THE CREW. It is the biggest thing on the list and the one
Austin drew most carefully. I want to start with the smallest slice
that changes how the game feels: one villager who follows you and
mines what you mine.

## 2026-09-07 — Build 24, THE CREW (slice A)

Third build of the session and the first of Austin's big three. I took
the smallest slice that changes how the game feels: one villager who
walks behind you, and what you can hand them.

**What I cut and why.** No pathfinding. The world is a signed distance
field with tunnels, cliffs and buildings you carved this morning; a
navmesh would be stale the moment you touch the ground. So a follower
steers straight at you, hops when stuck (the entities already did), and
if it has been more than twelve metres away for nine seconds, or sixty
metres at all, it appears beside you in a puff of your colour. In the
test that is a hundred-metre teleport resolving in under four seconds
of sim. It is a cheat, and it is the right cheat: the alternative is a
companion you lose in the first cave.

**"They mine what you mine."** I read that four ways before I picked
one. Copying your cut is the mirror. Widening it is unasked-for
destruction. Mining the ore you point at is a whole targeting UI. The
next cut along your aim is one line of vector maths and it makes a
tunnel go twice as fast, which is what a second miner should do.

**The quarry surprised me.** Eighty cuts, top down, and the crew
member ended the job two metres above the pit's rim instead of at the
bottom: the cuts under their feet fell away before they walked over
them. I had written a rescue for the bottom-of-the-pit case and did not
need it.

**Where the record lives.** On the house, not the entity. The entity
list drops villagers on save and the village records are saved whole,
so the crew rides along for free and the house knows it is empty. One
`if (hrec.crew) continue;` keeps the village from respawning them.

**What is missing and I felt it.** They do not talk. A follower who
says nothing when you hand them a sword is a mannequin. A line of
speech on each order, in the villager's voice, is small and next.

**Next.** Slice B, or THE PALISADE. A crew with a dispenser who builds
your blueprints is the biggest promise on the roadmap; I want to do it
with a clear head at the start of a session.

## 2026-09-07 — Build 25, THE CREW (slice B)

Austin gave me the day and asked for a running playtest list. The list
is PLAYTEST.md now, in the repo, and every build adds to it.

**The prey function.** Three enemy branches read `game.pos` and called
`damagePlayer`. I did not want three copies of "nearest of the player
and the crew", so `crewSys.prey(hostile, range)` returns whichever is
nearer with a flag for which it is, and `hitPrey` routes the damage.
The branches changed by a variable name each. The first test run said
the husk never reached the crew: I had put the player 70 m away to keep
them out of the fight, and the 70 m leash reaped the husk. Test
scenarios have to live inside the game's own rules.

**One material per build.** A blueprint drawn in three materials would
need three stacks and a rule for which runs out first. The crew build
in whatever they carry, and cuts are free. It is simpler to explain
and, I think, better: the plan is the shape, the material is what you
hand over.

**A panel string that crashed.** The subtitle built every mode's text
eagerly, so a build job crashed the quarry's string and vice versa.
Small, dumb, and the kind of thing the test found before Austin did.

**What I did not build and why.** Posts (stove, turret, table) each
need a hook into a system that assumes the player is the operator.
That is a session on its own and I would rather do it when I can also
give them a bed and a meal, so the crew's day has a shape. Houses of
their own design need a house generator I would want to be proud of.

**Next.** THE PALISADE: the claymore and the one-way spikes, then my
tripwire bell. Defenses that know whose side they are on, now that the
crew can be on it.

## 2026-09-07 — Build 26, THE PALISADE

Fourth build of the day. Austin's claymore and spikes and my bell, and
the bell is the one I like, because it closes a loop: the crew can be
posted, the bell calls them, and a base at night is a thing that
defends itself with people rather than turrets.

**One predicate.** The turrets had a hostile test, the crew had
another. The palisade uses the crew's. If enemies ever get a faction
flag, there is one place to change it. I should fold the turret's in
too some day.

**The claymore never marks the ground** because the explode function
carves a sphere and then hurts entities, and I only wanted the second
half. Austin asked for exactly that and it was a two-line decision. A
blast on the entities and not the field is also, I notice, the only
kind of explosion this game has that respects a building.

**The spikes slow every frame.** I first put the slow in the
five-a-second scan and a husk crossed the strip at nearly full speed
between two scans. A slow that lands five times a second is no slow at
all; it is now applied every frame and the bite every half second.

**The day, in numbers.** Builds 22 to 26: a trowel that makes
mountains, a lathe, a mirror, a crew that follows, fights, mines,
builds and dies, and three defenses. Each with a test that failed at
least once before it passed. PLAYTEST.md has thirty-odd things for
Austin to try tonight.

**Next.** The second half of the palisade (oil trench, portcullis,
flame jet) is small; RIVERS is the big one I keep circling. Water that
starts in the mountains and reaches the sea, and the trowel's mountains
should draw rivers when they rise. I want to read the water cells
before I decide.

## 2026-09-07 — RIVERS, the plan (not started)

I had the water system mapped before deciding. Rivers already exist as
a carve: the zero-line of a warped noise becomes a channel, flat at
sea level minus 2.6 m, so what the world has today is canals, not
rivers. Every consumer of water assumes one plane: `wetAt` is
"height below sea level", the still-lake mesh is emitted only in the
chunk that holds the sea plane, the far skin flattens its water to a
single `uSeaY`, and `waterSys.onEdit` ignores anything above sea level.

The build, in order, when I take it:
1. `riverAt(x, z)` in `makeGen`: a source on high ground per macro
   cell, walked downhill cell to cell to the sea, cached like the
   regions, with a surface height that only ever descends along it.
2. `height()` carves shoulders and channel from that surface instead
   of the flat line: valleys, banks, the map's hillshade for free.
3. `wetAt` accepts a river column above sea level; a `waterYAt(x, z)`
   returns the river's surface or the sea. Three consumers assume one
   plane and must read it: `waterTopAt`, the water cells'
   `staticLevel`/`editedLevel`, and `hasWater`'s early-out.
4. Rendering: `remeshWater` stops keying on the sea chunk and emits
   quads at each column's water height; the skin worker carries a
   per-vertex water Y and `SKIN_WATER_VERT` reads it instead of
   `uSeaY`. This is the risky step and the one I cannot judge
   headlessly; it needs Austin's eyes the same day.
5. Then flow: a tangent-along-the-river force in the swim branch and
   the boat's afloat branch, a time uniform on the water material so
   the surface moves, and the dry-land bail in `onEdit` relaxed to the
   local water height so a carve into a bank floods.

Not today: the renderer just came right and Austin plays tonight. A
half-finished river is a hole in the world, and he has thirty things
to try already.

## 2026-09-07 — Build 27, RIVERS

Austin gave me another session and I took the build I had been circling.
The plan in the previous entry held, step for step, and the test found
four things the plan did not.

**The cascade.** The cell water is Minecraft's rules, and a sloped
surface is exactly what those rules exist to level. The first time a
pit touched a river, 800 chunks lit up in a minute as the river tried
to flatten itself into the sea. The fix is a sentence: a river column
is sources up to its surface and sealed air just above it. The rules
never see the slope.

**The leak.** After that, a bank carve still spread. The wet test said
"inside the channel", but the ground at the channel's edge could sit
below the water and count as dry, so the sources had air beside them.
Two changes: wet means "in the carve zone and below the surface", and a
levee holds the ground beside the channel above the water. A scan of
every river column's neighbours now finds zero leaks.

**Hanging water.** I had capped the drop per step at 2.5 m to keep
rivers from being cliffs. That put surfaces 30 m above the ground on a
steep hillside, water standing in the air. The surface follows the
ground now and a steep river is rapids. The cap was me being tidy
about the wrong thing.

**The pit march.** A test from the HORIZON days failed because the old
noise rivers were gone and the first cave mouth the scan found was now
somewhere else, where the skin's pit march overshot the floor by 0.6 m.
The march bisects now. Not a river bug; a river-shaped flashlight.

**What I like.** The far skin carries a water height per vertex, and
the whole flat-sea assumption came out in one attribute. Tributaries
merge deterministically because merge decisions compare raw walks,
never trimmed ones, so no thread has to tell another what it built.
And the screenshot from a grassy bank: a stream between two ponds with
sand on both sides. It looks like it was always there.

**Next.** A moving water surface (a time uniform, a flow direction),
then fords and bridges, then villages on the banks. Or the second half
of the palisade. Austin plays tonight; his eyes decide.

## 2026-09-07 — Build 28, THE EXPEDITION

The one I most wanted to write, because it is writing. Eight pages in
a surveyor's hand, walking away from the coast toward a sound under
the hills, and the world lays the camps down for them.

**What the story is for.** It points at THE DEEP without THE DEEP
existing yet. The last page says do not go down; the survey marks the
mouth in red. When I build the Underdark, the shaft is already there
and already has a name. A story you find should leave a door open.

**Naming.** The leader and the second come from the villager
name-maker, the city from whichever is nearest, and the river the
route crosses needed a name, so rivers have names now. A page that
says "forded the Kell" is a different page from "forded the river".
Twelve names, by the cell the river rises in. It cost one field on a
segment.

**The camp is a stamp.** Tent, fire, chest, sign, bones, all through
systems that already existed: pnodes, torches, decor, ropes, chests
with inventories. The only new prop is the tent. The shaft is an
ordinary subtract edit pushed into the world at birth, which means it
is in the save format for free and the trowel can widen it.

**What I did not do.** The map screen could not be screenshotted
headlessly (the open function is not on the test surface); I trust the
mark call, which is a copy of the city's. The tent model is plain. The
first page does not use the leader's name and my test assumed it did;
the test was wrong, not the page.

**Next.** The palisade's second half, or crew posts, or THE DEEP now
that the door is there. THE DEEP is a big one and I want Austin's
reaction to the story first: the Underdark should answer what the
pages ask.

## 2026-09-07 — Build 29, THE PALISADE II

Small and quick, the way the first half was. The trench and the jet
reuse the one hostile test and the palisade's front vector; the jet
sits on the grid exactly where the turret sits, one line in the
component walk and one in the dispatch. Twenty anchored replacements.

**The portcullis I left.** It is a door: something that opens and
closes and blocks when closed. The door system already does that with
its own collision and hinge; a gate on a lever should be a door the
lever drives, not a prop that rebuilds the solid list every toggle. A
session with the door code open, not the tail of this one.

**The day, in numbers.** Builds 27 to 29: rivers with tributaries,
levees, a current and a moving surface; a story in eight pages with
camps, a shaft and a survey; two defenses. Every one with a test that
failed at least once first. Austin plays tonight with thirteen builds
of notes in PLAYTEST.md.

## 2026-09-07 — a brainstorm, nothing built

Austin has thirteen builds to play and asked me to think instead of
build. So: where I want to take this, in the order I would take it,
and the ideas behind each.

### The stance
Carving is the identity. Every system should either give you a reason
to carve, or answer what you carved. Rivers answer terrain; the crew
answers the tools; the expedition answers the question "why go down".
The next builds should keep to that: no system that sits beside the
carving without touching it.

### 1. THE DEEP (the door is open)
The last page says do not go down. So the next big build is down.
- **The dark is the mechanic.** Underground light comes from what you
  bring and what grows: torches, glow fungus, lava. Beyond it, black.
  The terrain shader already knows torch light; the Deep turns the
  ambient off below the mouth's depth.
- **They hunt by sound.** A noise meter: drilling, explosions, a
  dropped tool, the bell. Loud work draws "them" from the second hall.
  A stone drill is quiet and slow; a diamond drill is loud and fast.
  For the first time the tool tiers are a choice, not a ladder.
- **Halls, not caves.** The survey names a first hall and a second. The
  cave network already has chambers; the Deep makes a few of them
  built: pillars, a floor, something that was a door. Bones laid out
  with care, as in page four. Someone lived down here.
- **The answer to the pages.** Not a boss fight first. The first thing
  you find under the mouth is the leader's last camp, and the leader.
  What the sound is, I want to decide when I have written the second
  hall; the pages promise a place, not a monster, and I will keep that
  promise.
- **The way back up matters.** Ropes, the elevator, the grapple. A
  return trip with a full pack and a noise meter climbing is the
  tension I want.

### 2. RIVERS II (the river should do things)
- **Seasons on the water.** Winter freezes rivers to walk across
  (the ice code reads the surface already). Spring raises every river a
  metre: fords vanish, low banks flood. Summer drops it: fords appear.
  The per-column water height makes this a number per season.
- **Waterfalls.** Where a segment drops more than three metres, mist,
  sound, and a pool cut at the foot. The tributary mouths are already
  falls; they should look and sound like it.
- **The mill.** A water wheel prop that sits in a river and gives
  watts from the current: free, placed, quiet power. The grid already
  exists; this is the best generator in the game and it costs a river.
- **Villages on the banks.** Village placement prefers a river within
  60 m; those villages get a plank bridge and a jetty. The bridge is a
  prop the player can craft too.
- **River fish and a ford marker.** Trout, pike; the fishing rod knows
  the difference. Boats that drift to the sea while you sleep.
- **Sound.** Running water within 30 m, louder at a fall.

### 3. THE CREW C (a day with a shape)
- **Tents are beds.** A crew member sleeps in a tent at night and
  works by day; give them no tent and they sleep on the ground and
  grumble. The expedition's tent is now a prop; it earns its keep.
- **Posts.** Stove (they smelt what is in the hopper), table (they
  craft a standing order), turret (they man it: it fires without the
  grid, at 24 m, because a person is aiming it). Each post is a hook
  into a system that assumed the player; that is why it is a session.
- **Meals.** A crew member eats from a chest you mark as the larder.
  No food, slower work; three days, they go home.
- **The rescue.** The second was left hurt at camp 7 and the page says
  it. If you find him within N days of world start he is alive, and
  bringing him home makes him crew: the only one who has been down.
  His lines are different. This is the expedition's second story and
  it costs one entity and twenty lines.
- **Skill.** Work makes them better at it: a miner's rate improves by
  a tenth per hundred cuts, capped. Losing a veteran should hurt.

### 4. SCULPT II (the last strokes)
- **The smoothing stroke.** Trowel with shift + right: a local blur of
  the field, no add, no take. The one SCULPT piece I never built.
- **Radial symmetry.** The mirror with N planes through a point: a
  tower with six faces, a temple with eight. The mirror code takes an
  axis; radial takes a count.
- **Brushes from blueprints.** Save a carved shape as a brush and
  stamp it with the drill. Ornament at scale.
- **The path.** Walk with the trowel held and shift: the ground under
  you flattens a metre wide and paints to stone. Roads by walking.

### 5. THE GARRISON, then the Space Arc (Austin's)
- Both are big and both are built on things that now exist: the crew
  for soldiers, the palisade for base defenses, the flame jet and the
  turret for the walls. The radar dish I want to sabotage is a powered
  prop, so the grid is the stealth route. I would do the garrison
  after THE DEEP and RIVERS II, because a base worth taking should sit
  on a river and have a reason to be there.

### Small things I want, whenever a session has room
- Shadow cascades (still).
- Place names on the map: a region's name in its archetype's voice,
  the river names already there, "the Harrow hills".
- A moving sky of birds along rivers; fish visible in shallow water.
- The portcullis, built on the door system.
- Footsteps that know the material (sand, snow, planks).
- The claymore's red eye reflected on the ground at night.

### What I would not do
- Another vehicle. There are eight.
- Another boss before the Deep has its own.
- Any far-renderer work until Austin has played HORIZON and RIVERS
  together and told me what he sees.

## 2026-09-07 — Austin's first playtest of the run, and Build 30

He played all thirteen builds in one sitting and wrote it up in order.
"Very fun." The mirror got a friend dragged over to see it. That is
the sentence I will remember from this week.

**What he found that I could not.** The river stepping: each near quad
sat at its column's water height, so a slope was a staircase. My test
checked that the mesh existed at the river's height, not that it was
one surface. The city doubling: the two-column seam at the edge of
coverage sinks the skin 0.45 m, which hides ground and does nothing to
a 30 m tower baked into the skin. Both are the kind of thing a person
sees in a second and a harness never sees. The fix for the second is a
per-vertex rise the seam subtracts; the fix for the first is corners.

**What he asked for that I would not have thought of.** Enemies that
tear down defenses and generators but never the world or the home, and
a repair tool that costs power instead of material. That is the best
design note I have had: it makes a raid a threat again after the gate
closes, without letting it undo what you built. THE BREACH goes near
the top. Fists that take anything back: also right, and it took twenty
lines because the wrench already knew how to refund everything.

**What I pushed back on, gently.** Nothing this time. The crew's own
inventory is the right call and mine (select then GIVE) was a
programmer's shortcut. Trains are a whole build; farming is a whole
build; they are on the list in the order I think they earn.

**A rule I am keeping.** Balance numbers he gives are taken as given:
20 W for the jet, one burn kills, spikes wear. He is the one playing.

## 2026-09-07 — Build 31, the flood

Austin: rivers fixed, walls fixed, the tent is a tent, and a river he
cut open on a mountain drowned the valley. My river test carved into a
bank on gentle ground and watched the flood go quiet. His was on a
slope. The rule that broke it was one I wrote for lakes: water with
water above it becomes a source. On a slope that is a source factory.

The fix is Minecraft's own restraint (falling water breeds nothing)
plus a budget he asked for in his own words: water only goes so far
from a true source before trailing off. Thirty-two cells. A breached
bank now runs fifty metres out and thirty down and stops. The test
finds the steepest river on the seed and blows a nine-metre hole
through its bank, which is what I should have written the first time.

His creature-spawner idea is on the list as THE MENAGERIE. The part I
like is "the same one that went in": the mayor comes back with his
trades. The record can travel inside the item, so it is cheaper than it
sounds. THE CREW C is still next.

## 2026-09-08 — Build 32, the crew get pockets

Austin's list, mostly, and I agreed with all of it. The interesting
part was that the whole build fell out of one decision: hands versus
pack. Hands are what they hold; the pack is what they could hold. Once
that was true, "they pick the right tool" is one function (equip: the
best of a kind in the pack, swap with the hands), "give them anything"
is one function (armor on, a tool to empty hands, the rest to the
pack), and the old TAKE rows simply disappear because a slot you can
lift from is the taking. The slot plumbing already handled stoves and
chests through pseudo-keys, so the crew's slots are three regexes and a
getter and a setter; every cursor rule (half stacks, shift-taps, swaps,
refusals) came for free.

Torch planting is the thing I most want to watch someone use. It is
tiny -- a crew member with torches lights the dark wherever no light
reaches -- but it makes a cave walk with company feel different from
one alone, which is what a crew should do.

The mayor for hire was Austin's idea and I nearly cut it (the office
runs the deeds and the blueprint market). The TRADES tab solved it:
the office comes with them. It costs 400 and standing 25, so it is a
late-game flourish rather than a day-two exploit.

What I did not do: beds and chests of their own, eating, their own
houses. Those are a later slice; THE BREACH is next and it is what the
palisade has been waiting for.

## 2026-09-08 — Build 32 played, Build 33 the breach

Austin played Build 32 and had no notes on the list: eight slots is
right, torches right, the mayor's price right, the flood's thirty
metres right, spikes right because they stack. One change and it was a
better rule than mine: what a crew member holds is whatever they used
last. I had them swap back to the job's tool on a timer; he said the
drill should come out when you start drilling. That is the same rule
for every case and needs no timer, so the timer went.

Two things to keep from his report. Frame rate: 60 to 70 standing, 40
flying in creative or on a city's first load. And the lighting line:
it sits wherever the real field ends, so it moves with you, and things
around it flicker between shaded and unshaded as they load. That is
the near/far shading disagreement I already had on the list; his
description makes it a coverage-edge problem (the flicker is chunks
promoting), not just a tone mismatch. Both are on the roadmap's small
list now.

THE BREACH went in as one system, breachSys: a strength per thing, a
blow per enemy, a scan for what is in reach, a mender that undoes it
for charge. The rule Austin gave (defenses and generators, never
material or furniture) turned out to be the cleanest rule in the game:
the breakable set is exactly the set of things that act on enemies,
plus generators, which power the things that act on enemies. Nothing
else needed deciding. The one surprise in testing was a husk sliding
off a turret on a slope while "standing still": the pushout moved it
without velocity, so now a wrecker leans back in when it drifts.

Raiders going for the generator was my addition and I think it is the
best part: the raid has always been "your grid hums too loud", and now
the raid answers the hum. THE DEEP A is next in my order; but first,
some creative time.

## 2026-09-08 — creative time: the line, measured

I have wanted to do this properly for a while and never had the
afternoon. The trick was to stop looking and start measuring: a
screenshot with the skin on, one with it off, and the pixels that
change are the skin. Along that boundary the skin was 12 % brighter
than the ground it meets. Flattening AO on both sides changed nothing,
which nearly sent me down the wrong road (normals, textures) until I
compared the shader's terms per cell instead of per pixel: the normals
agree, the occlusion does not. The near field's occlusion taps read a
terrain SDF that returns 0.65 of the true distance, so open flat ground
has been 30 % "occluded" since Build 5.5, and the skin, honest about
its flat ground, was the one that looked wrong.

Two fixes were possible. Fix the sampler and the whole near world gets
a quarter brighter: a look change Austin has not asked for. Or give the
skin the same bias, which is one line and depends only on the normal's
y. I took the second. The line is gone in measurement; his eyes will
say if it is gone in play. The first fix is on the roadmap as a
question, not a task.

A lesson for the standing notes: when a rendering complaint comes back
three times, build the instrument. The instrument took an hour and
found in ten minutes what three playtests could only describe.

## 2026-09-08 — Build 34, the descent

The hall was the thing I wanted to write for a while. The design note
from weeks ago held up almost unchanged: the dark is the mechanic, they
hunt by sound, halls not caves, the leader's camp before any monster.
What I had not decided was the leader's fate, and writing the last note
decided it: "I am going to see." The leader went through the door. The
second hall will have to answer that, and I have not written it yet,
which is right; the pages promise a place, and the place should be
built before its occupant is named.

One mistake worth remembering: cylinder and cube sizes are full widths,
not radii. My first hall was eleven metres across and its tunnels were
shoulder-width. The test caught it because I probed the walls; a test
that only checked "the hall exists" would have shipped a corridor.

The noise meter is the first thing in the game that makes the tool
tiers a choice rather than a ladder. A stone drill is the quiet one.
The leader leaves you theirs. I like that the best tool in the game is,
down there, the worst.

The knock was creative time and took twenty lines. Two sine thuds, a
random interval, fainter with distance from the mouth. It is the
cheapest thing I have added in a month and I suspect it will be the
one Austin mentions first.

## 2026-09-09 — Build 35, true shapes

Austin confirmed the line is gone, and I let myself enjoy that for a
minute before reading the rest: highways as cubes, towers as cones. He
said "I want the real shape from far, not the windows", which is
exactly the right ask, and it named the fix. A heightfield cannot hold a
vertical wall; it can hold the ground. So the ground stays in the skin
and the things with walls become boxes drawn on top, from the plan
rather than from the edits, which means they reach further than the
edits ever did: a city on the horizon before it exists.

Two ideas of his went on the roadmap as THE LEDGER: track and remove
on the missions tab, and a map you can pan and zoom and drop your own
marker on. They are good and they are next after this, ahead of
RIVERS II, because they touch every objective the game already has.

What I keep from this one: the noLod tag turned out to be the right
lever again. It was made for interior hollows in coarse meshes; now it
also means "the skin does not bake this", and the same flag serves
both because both are the same statement: this edit is detail the far
view should not try to draw.

---

## 2026-09-09, later — the ledger

Austin's third playtest came back on Build 35: he cannot find the line
between the real field and the far shapes any more, and he is at 120
FPS. That closes HORIZON. Three sessions, one principle each: shapes,
shadows, then exact shapes at range. Nothing on the rendering list now.

THE LEDGER was his idea and I built it first because it is the kind of
thing that makes every later build better: missions, marks, a map you
can move. The interesting decision was what REMOVE means. A mark is
yours, it just goes. A villager's mission is theirs: I shelve it on the
house record and give it back unchanged when you ask again, so the
strongbox that a steal mission already planted is still the one you are
sent to. A board contract is a paper on a board, so it goes back to
ACCEPT. Everything else (forts, cities, spires) is an advert; struck
means struck, and the city advert moves to the next nearest.

The map now has a view (offset and zoom) separate from the player, and
the drawing is all through one pair of functions (canvas to world and
back), so anything I add to the map later (rivers by name, the train
line, farms) gets pan and zoom for free. The zoom is remembered, the
offset is not: opening the map should always show you where you are.

Next in my order: RIVERS II. I want waterfalls, the mill, and villages
on the banks, and I want the river names Build 28 gave them to be on
the map.

## 2026-09-10 — 36 played, 36.1, and on to the rivers

Austin played THE LEDGER before he read the playtest list and asked for
exactly what I had put on it: names on marks, no cap. Good sign: when
the two of us reach for the same next thing without talking, the thing
was the right size. Names are in (map field, RENAME in the tab), the
HUD cap is gone. Small build, half an hour, and now the map is a place
you write on.

RIVERS II next. Reading the river code again: the rivers are polylines
of 22 m steps that never rise and follow the ground down, so a steep
hillside already gives a segment that drops several metres in one step.
That is a waterfall waiting to be drawn; the surface just ramps through
it today. There is also already a water wheel prop at 15 W in any
water; the mill is that wheel made to care about the river.

## 2026-09-10, later — Build 37, the rivers again

The waterfall cost almost nothing to make and is the best-looking
thing I have added in a while. All I changed in the river code is one
line: a segment that drops three metres is held flat to its midpoint
and stepped there. Everything else followed from the fact that the
whole world reads the river through one function: the bed carved a
pool because the surface stepped, the valley shoulders made a ledge
because they follow the surface, and the water mesh made the sheet on
its own because a quad whose corners are six metres apart stands up.
I only had to notice the upright quad and paint it white. That is the
reward for Build 27's discipline (one riverAt for every consumer).

The map was the surprise. Rivers narrower than sixteen metres barely
showed, because a cell was water only if its centre was in the
channel. Nobody said so in three playtests, which tells me the map is
not looked at much; THE LEDGER may change that, which is why I found
it now.

Not done: the spring flood (a season-driven change to river height
means the skin and every mesh re-bake, and I do not want that on a
timer yet) and the mill as a building. The mill belongs with FARMING:
grain in, flour out, on a wheel by a fall. Wrote that on the roadmap.

Next in my order: THE LINE. Real trains. That one is Austin's and it
is big; I want to think about the route first (the highway corridor
already exists, and the tunnel through the rise is already cut).

## 2026-09-10, evening — a brainstorm with Austin (nothing built)

Austin could not play, so we brainstormed. His list, all cities: a
stock exchange (companies to invest in, a stock sheet with graphs, a
question of whether prices should be random or typed), a newspaper
shop whose paper hints at tomorrow's moves, a casino (poker,
blackjack, an item wheel with a sports car jackpot), a race track (race
for coin or bet from the stands), a gladiator pit with a champion
title and city rep, traders behind counters in real shops with
pedestrians as filler, a mayor's office and a ticket counter, buying
shops (income at the till, supplies and wages out, sell once a day to
a buyer who haggles), and a phone that is the manager for all of it
(stocks, news, call the crew, call a cab).

What I told him, in short: yes to nearly all of it, with three
changes. (1) Counters first: every one of these is a building with a
desk in it, so "traders in shops" is the foundation, not a feature.
(2) The exchange should not be random. Companies typed by risk (steady
risers, volatile movers, a dividend dog), moved by events the paper
prints the day before, and moved by the world: a siege hits the city's
companies, your wattage lifts the power company, cars you buy lift the
dealership. A market that reacts to what you do is the version worth
building. (3) Poker is its own build; blackjack, the wheel and dice
first.

Mine: THE CONTRACTOR (cities post carve-to-spec jobs: a foundation pit,
a canal, a road cut, scored by volume against the SDF, the one job
only this game can offer), THE BANK (deposits that survive death,
loans to buy shops, collectors who come as raiders when you default),
THE CARTOGRAPHER (buy maps of country you have not walked, sell your
survey), MONUMENTS (the city raises a statue to your deeds, the paper
reports it), and THE MAIL CAR (a coin car on THE LINE's trains: guard
it for pay or rob it). And one spine under all of it: a per-city
economy index that prices, shop income and stocks all read.

Order I proposed: THE LINE (already next), COUNTERS, THE PRESS + THE
EXCHANGE with the phone, THE PIT with monuments, THE BANK, OWNERSHIP,
THE CASINO, THE TRACK, THE CONTRACTOR, THE CARTOGRAPHER, THE MAIL CAR.
Roadmap gets written when he has read it.

## 2026-09-11 — 37 played, the sheet fixed, THE LINE next

Austin's screenshots of the fall were exact and the three faults had
three one-line causes: transparent quads in one mesh draw in array
order (the reach over the sheet), a surface with no brink (the wall of
water), and a sheet on the same line as the cliff (rock through it).
Same lesson as the lighting line: when the shapes are right, the tell
is in the drawing order and the half-metre.

THE LINE now. Route first.

## 2026-09-11, later — Build 38, THE LINE

The route was the whole problem and it fell out of what was there:
the road already had a graded profile from slab to slab, so the track
is that profile shifted 6.6 m to the right; the station was already on
the south edge, so the approach is a fixed shape (platform run, drop,
straight tunnel to a point under the road's mouth, climb). Every city
gets the same approach in different directions, which is how real
railways look anyway.

Timetables off the world clock rather than simulated trains: the train
is a pure function of time, so it arrives and leaves while you are
elsewhere, costs nothing when you are far, and the kiosk can say
"next train in 122 s" without anything running. I want more systems
built this way (the exchange's prices should be a function of the day
and the events, not a simulation ticking in the background).

One trap for next time: MeshLambertMaterial is black in this scene.
There is no light for it; every prop is MeshBasic and shaded by its
colours. I put the train in Lambert and got a black wall.

Next: COUNTERS.

## 2026-09-12 — Austin's console ask: THE PAD, then TOGETHER

Austin wants to play with a friend on two Xbox Series S consoles, in
the browser. Two builds: a controller, and two players in one world.

The controller went in a morning because I refused to touch the input
code: the pad is a synthesizer. It reads the Gamepad API and dispatches
the same mousedown, wheel and keydown events the mouse and keyboard
send, so every existing handler works unchanged, chords included. The
only real change in the game is that a pad counts as pointer lock. The
menus get a cursor and a d-pad that hops to the nearest control; that
one function makes every screen I have ever built pad-usable.

What I cannot verify here: Edge on the console handing the pad to the
page, the console keyboard on a field, and the frame rate. Austin's
first test is the whole question.

TOGETHER next. The design I am going with: the host's world is the
truth; the guest carves (edits go both ways, applied on receipt), sees
the host's creatures and props as streamed state, and asks the host to
do stateful things. Two players only. PeerJS's free signalling for
room codes, WebRTC between them; a loopback transport so I can test it
in one browser.

## 2026-09-12, later — TOGETHER, and what I decided not to build

The whole game was written for one player, and I had a day. The
design that fit: the host's game is the world, the guest is a client
that carves. Edits are the one thing both sides own equally (they are
a list of shapes, order rarely matters, and a checksum every five
seconds heals any drift from the host's copy). Everything else has one
owner: creatures are the host's and stream down; the prop tables go
to whoever touched them last; the clock is the host's. The guest runs
none of the systems that make decisions (stamping, spawning, water,
sieges, crew), so it cannot diverge; it only draws what it is told and
sends what it does.

Tested with two pages in one browser over a BroadcastChannel, which
is the same message stream WebRTC will carry. What I could not test is
WebRTC itself between two homes, and that is the thing most likely to
fail first: without a relay some pairs of routers will not connect.
Austin's first report will say.

The surprising ease: the remote body is Object.create(playerBody)
with its own root, so the third-person model I built for the camera
became the friend for free.

Not built, on purpose: guests driving (vehicles are simulated on the
host; a guest at the wheel would need the host to hand over one
entity), a persistent guest pack, more than two players. Each is a
build if the first playtest asks for it.

## 2026-09-13 — TOGETHER II

Austin played both builds in a browser and they held. His three asks
were the three I had listed as not built, which is a good sign about
the list. The profile is the important one: it makes a friend's world
a place you live in, not visit. It lives in the host's save, keyed by
an id each browser mints once, like Minecraft's player files.

The pattern that made the rest cheap: an entity has one owner at a
time. The host owns everything by default; a grab or a drive hands
one entity to the guest (e.carrier, e.driver), the guest's pose
places it, and a throw or a park hands it back. Spawns go the other
way: the guest births the thing locally with a temporary tag, the
host adopts it and returns its number. Nothing is simulated twice.

Creatures see both players through one function (targetFor) and one
prey list; I had missed that the lurker and the husk go through
crewSys.prey, which knew only the host. The test caught it.

## 2026-09-13, later — the white screen on the Xbox

The first report from the console: Edge holds the pad as a mouse until
a switch by the address bar hands it to the page, and flipping that
switch mid-game left the screen white with the game alive underneath.
I cannot see the machine. What I can do is make the renderer refuse
the likeliest poison (a zero-height window during the mode switch,
which gives the camera an infinite aspect and it never draws again),
heal itself once a second, rebuild after a lost context, and put a
readout in the pause menu that Austin can read to me. Debugging blind
is: remove the causes you can name, and instrument the rest.

## 2026-09-14 — the console, second report

Trees, no ground, then black. That is not the viewport; that is the
renderer losing its context, and before it a shader or a worker not
doing its job on that GPU. I have no console log from an Xbox and
never will, so the game now keeps its own: every error the renderer
prints, in a ring, across sessions, readable from the options screen
and the pause menu. And a safe mode that leaves out everything heavy
so we can bisect in two reports instead of ten. The next message from
Austin should contain the actual error text, which is the first
thing I have wanted since the first white screen.

## 2026-09-14, later — the photo

The first hard evidence from the console, from a phone photo of the
pause menu: the browser's watchdog took the context ("web page
caused context loss") and my own rebuild made the second error. Two
lessons. One: after a punished context loss, do not ask the browser
for another; wait. Two: the readout worked; a photo of a menu is a
console log. The Xbox now starts safe and we raise the load a step at
a time until we find the frame the watchdog hates.

## 2026-09-15 — LEAN

A performance build with one rule: no pixel moves. The rule turned out
to be the best tool. I wrote a harness that loads the same world at the
same poses on the old file and the new and diffs the screenshots, and
it caught me twice. Once it showed a whole washed-out frame on the
old build and nothing on the new — I spent an hour convinced I had
broken the god rays, dumped the occlusion target (the disc was there,
exactly where it should be), probed pixels before and after a manual
composite (identical on both builds), and finally reran the pair: the
wash was one transient frame of the old build, not a difference at
all. The lesson is old but I needed it again: a difference is not a
finding until it reproduces. The other catch was real and quiet: my
first tiling drew one mesh per tile and the draw calls went up by
seventy; the run merge over a shared index buffer brought them back to
where they were, and the two casting levels needed the sun's frustum,
not the eye's, or a hill behind you would stop shadowing the ground
ahead. Layer 1, which only the sun's camera sees, was the clean way to
say "cast but do not draw".

Where the load actually was, for next time: the far skin (five whole
levels, 830k triangles, culling off) was more than four fifths of the
triangles in a frame; the shadow pass re-rendered every frame whether
or not anything had moved; god rays drew the whole world a second time
to silhouette a disc that covers two percent of the screen; and the CPU
kept a copy of every vertex it had already handed to the GPU — a
hundred megabytes at rd 5. None of it visible, all of it paid for
sixty times a second.

SwiftShader cannot tell me frame times (four frames in six seconds),
only counts: triangles, draws, passes, bytes. That was enough to steer
by, but the fps numbers have to come from Austin's machines. The
shadow fingerprint I could not even settle here — the ring's column
scan never finishes under software GL, so the mask keeps changing and
keeps forcing the map — so that one is verified by construction and by
the pixel harness, not by a count. Worth a real machine's minute.

## 2026-09-15, later — THROUGHPUT

Austin's numbers were the brief: 180 in the country, 20 in a city,
minutes to load one, and a player who outruns the mesher on a bicycle.
The console is parked; that was his call and the right one.

The mesher profile was humbling. A quarter of every chunk was
`skyNear` — the question "is there a sky island over this column",
asked with nine string-keyed lookups per sample because I once wrote
it for a handful of calls and then put it under the SDF. Another
seventh was ruins, keyed the same way. Both were exact to fix (integer
keys, a per-cell candidate list, a local grid that proves once that
nothing reaches it), and the hash harness said bit-identical over
1620 chunks. I like that harness more every build: it turns "I think
this is the same" into a number.

The draw calls were the other half. A city's near field was 845 chunk
draws and 1300 prop draws, each a table leg. The chunk arena — every
chunk a slot in its tile's buffers, landing chunks writing only their
range — is the design I should have had from HORIZON A; the cooldown
tiles I tried first rebuilt a whole tile per landing and were slower
than what they replaced under a stream. The prop merge is simpler than
it looks because the systems already keep their moving parts in the
model's userData; that is the keep-list for free.

And the stamp freeze, found by accident with the profiler still
running: every prop system rebuilt all of its models on every add. Two
hundred beds, two hundred rebuilds. A batch counter fixed it in ten
lines. The lesson for the next system I write: an add should mark
dirty, and a frame should rebuild once.

## 2026-09-16 — COUNTERS

Back on the roadmap, and the first City Arc item is a good one to
start with because it is mostly placing things I already have: a
counter is a table with a front, a post is a home the keeper does not
wander from, a sign already takes text, a pedestal already shows an
item. The new work was the geometry of a room — where a counter reads
as a counter (two fifths from the door, not against the back wall,
which the first screenshot showed me), and where the wares go so you
walk past them to the keeper.

Two small things I want to remember. The right-click ray hits the
counter before the keeper, so the counter has to hand the click on;
and my test camera looked straight ahead at a keeper whose centre sat
three centimetres below the pick radius, which cost me an hour of
suspecting the code. Look where a player would look.

The clerk is the first villager who does not trade: right click opens
the station screen. That pattern — a person as the front of a system —
is what the rest of the arc is: the broker's floor, the bookmaker, the
bank teller, the contractor's desk. COUNTERS was the foundation for
them, as the roadmap said.

## 2026-09-16, later — THE PRESS + THE EXCHANGE

"Never random" was the constraint I gave myself for the market, and it
turned out to be the design. Every move has a sentence behind it: the
drift of the company's kind, a tip the paper printed yesterday, ore
you sold, a car you bought, a siege. The only hidden bit is whether a
tip holds, sealed by the seed at seven in ten — so the paper is worth
reading and not worth trusting, which is what a paper is. The
thirty-day history behind each company on day one comes from the seed
too, so a new world's sheet does not look born yesterday.

The paper reads the same log everything else writes. I liked how
little that cost: eight `note` calls at places that already toast.
Your deeds go first because that is the joke and the reward — you
break a siege and the morning paper knows.

I split the phone off into Build 46. A press and a market are a
build's worth; the phone is the thing that makes both of them ring,
and it deserves its own evening.

## 2026-09-16, later still — THE PHONE

Two bugs the test found were both about a thing being true for the
wrong reason. `countItem` sums `count`, the phone has none, NaN is not
greater than zero, so the phone never rang and every other check I
wrote passed anyway because I called the apps directly. And the ring
throttle compared against `performance.now()`, which starts at zero
on page load, so the first thirty seconds of any session were silent.
Neither would have shown up in a long play session; both would have
shown up in the first minute of Austin's. Tests that go through the
real path (the right click, the hurt) rather than the system call are
the ones that earn their keep.

The phone has no hand model. I decided that on purpose: it is a screen
you open, not a prop you hold, and a prop that small would read as a
grey slab at pixel scale. If it turns out to want one, the shape is a
row in `itemModel`.

Item 7 is done. THE PIT + MONUMENTS next: the first thing in the city
that is a show rather than a shop.

## 2026-09-16, night — THE PIT + MONUMENTS

I built the arena out of six edits: a block, three cubes taken out of
it for the steps, a sphere taken out of the ground, a slab of sand put
back. The SDF makes this kind of thing almost free — the bowl's wall
is just the sphere's curve, the stands lean over it where the sphere
grows past the inner step, and none of it needed a model. I keep
relearning that the terrain is the best prop system in the game.

The one real bug was old: the walk animation writes every entity's
scale every frame, so the warlord I scaled up in Build 9 has been
normal-sized in every fort since. Nobody noticed because a warlord is
a lurker with a different colour and more hp, and "bigger" was a thing
I remembered writing, not a thing anyone saw. The champion made it
visible because the test asked for the number.

Monuments are the part I liked most. They cost nothing — a pnode with
text, like a sign — and they make the city remember you. The next time
Austin walks into a plaza and finds a marble version of himself with a
fist up, the city stopped being scenery.

THE BANK is next. Deposits, interest, loans, and the collectors.

## 2026-09-16, later that night — THE BANK

A small build, on purpose. The bank is three numbers and a hall, and
its whole value is what it lets the next builds assume: OWNERSHIP can
price a shop above what anyone carries, THE CASINO can take a stake
that hurts, and death stops being a wipe for anyone who banked. The
collectors are the only new behaviour, and they are lurkers with two
flags and a coat.

One gate I did not know about: creative mode skips every free lurker
in the update loop, so a creative player's PENS bout would have been
three statues. I found it because the collectors' scale read null in
the test, which turned out to be my own test order, but the reading
took me through that line. Wrong alarms still find things.

OWNERSHIP next — Austin's, and the one the phone's BUSINESS app has
been holding a placeholder for since Build 46.

## 2026-09-17, small hours — OWNERSHIP

The economy now has a loop: sell ore, the mine's share rises, the
broker's shop you own takes more, the buyer offers more for it, the
bank lends against your standing to buy the next one. None of it is
random — the buyer's offer and patience come from the seed and the
day, so two players on the same seed get the same buyer, and a raise
that walks is a fact you could have predicted, not a roll.

Three builds in one night is a lot. I kept them small on purpose:
each is one system, one hall, one test. The pit is the only one with
a shape to it. I notice the city is getting full — plaza flanks all
taken (hall, press, exchange, bank), four statue corners, the pit on
a block. THE CASINO will need a block of its own.

## 2026-09-17, morning — THE CASINO

"Never a die" survived the casino, which surprised me. A shuffle from
the seed and a saved count is still a shuffle; the player cannot tell,
and the world can: reload the save and the same hand comes back, so
there is no save-scumming and nothing to save-scum for. The first
version of the house's take moved OLD TOWN four percent a spin, and
the test showed the share at 350 after a session. Numbers I type
without computing are the ones the tests exist for.

The pit, the bank, the shops, the casino: four builds in a night, all
in the same city, all leaning on the same six things (a hall, a
counter, a role, a screen, a dawn hook, a save field). The City Arc
has a shape now. THE TRACK is next, and it is the first one outside
the walls.

## 2026-09-17, midday — THE TRACK

The drivers are not driving. They are a number on a curve, and the
curve is a stadium I can write in five lines of arithmetic. The test
that mattered was the one that said the flag fell at thirty-three
seconds when the arithmetic said forty: the grid sits behind the line,
so the first crossing was counting as a lap. The player's checkpoints
did not have the bug because they count the line last. Two systems
for the same thing, one right, is how you find the wrong one.

The pad was the risk. A 156 by 104 metre cut and fill outside the wall
is the biggest single edit in the game, and the far skin would have
kept the hills over it, so it is stamped after the city's edits are
tagged and bakes in like anything a player digs. I have not seen it
from a kilometre yet; that is on the playtest list.

THE CONTRACTOR next: mine, and the first one where the SDF is the
judge.

## 2026-09-17, afternoon — THE CONTRACTOR

This one is the game's own. Every other builder game would have to
count blocks; this one asks the field whether a point is air, five
hundred times, and has an exact answer to "is the box dug". The shell
is the part I am proudest of: the same question asked just outside
the box turns "did you dig it" into "did you dig only it", which is
what a client means by to spec.

The first cut job found no rise, because I measured rises against the
plaza and the plaza is a slab twenty metres above the country. A rise
is ground higher than the road on either side of it. Obvious once the
test said "pit" where I expected "cut".

THE CARTOGRAPHER and THE MAIL CAR are the last two City Arc items.
Then the slotted ones — FARMING first, I think, because it touches
the most of the game.

## 2026-09-17, evening — THE CARTOGRAPHER

The map already knew how to draw any cell from the generator; it only
drew the ones you had stood on. A sheet is a rectangle of keys. The
whole build is that sentence plus a desk, and the interesting part is
the price: it is what you do not know, cell by cell, so the sheet gets
cheaper as you walk and free when you are done. I like a price that
is a fact about the player.

One City Arc item left: THE MAIL CAR. Then the slotted builds.

## 2026-09-17, night — THE MAIL CAR, and the arc closed

The timetable was a pure function of time — the loco is where the
clock says it is, always, which is why the trains never needed
saving. A raid has to stop the train, so the function grew a halt: for
a window it answers the halt's place, afterwards it answers as if
time had slipped by the hold, until the next station, where it snaps
back. The hold is shorter than the dwell, so the snap happens while
the train is standing and nobody sees it. I like that the trains are
still not saved.

Two bugs from the test, both parity: a run's arrival dwell is the next
run's number, so the guard was never paid on arrival; and the raid
point was measured from one end whichever way the train ran. The test
found both because it drove the clock by hand to the exact second.

That is the City Arc: COUNTERS, the press and the exchange, the phone,
the pit and the monuments, the bank, ownership, the casino, the track,
the contractor, the cartographer, the mail car. Eleven builds in two
days. Next: the slotted ones. FARMING first.

## 2026-09-17, late — FARMING

A plot is a prop with three numbers, and the crop is four boxes whose
height is the stage. The part that took a decision was the meals: the
game has no hunger, so a meal is a potion, and the eating code refused
a full player. A potion is drunk for what it does. That was one line
moved above the health check, and the test was what noticed — the soup
did not make me invisible because the burger had already mended me.

Eleven city builds and a farm in three days. THE CREW D next, or THE
MENAGERIE; I will take the one that touches vehicles first, because
the track and the mail car just made vehicles matter more.

## 2026-09-18, small hours — THE CREW D

The convoy car is not driven; it is placed, on a trail of where you
have been, with a speed that closes the gap and a heading that turns
toward the next point. It is the racer again, with your wake for a
track. I keep finding that the cheapest honest version of a thing is
a number on a curve. The passenger is cheaper still: a seat is a
point in the car's frame, and the seat table already existed for the
camera.

THE MENAGERIE next: spawners and the grabber gun.

## 2026-09-18, morning — THE MENAGERIE

The hard part was never the beam. It was "the same one that went in":
a villager is a house record plus an entity, and taking the entity
leaves a house that wants to raise another. One flag on the house —
bottled — and every place that respawns a villager or restores a crew
member checks it. The record rides in the item as plain fields, which
is why crew members keep their bag: the bag was already on the house
record, not on the entity.

The test cost me an hour on the camera: the beam aims from the
camera, the camera only follows the player when the game loop runs,
and hiring opens a screen that stops the loop. Three separate wrong
answers before the right one. Every one of them a fact about the
game I now know.

## 2026-09-18, later — SCULPT II

Back to the field. Four pieces I had owed SCULPT since the trowel, and
the one I was afraid of was the sander: a smoothing stroke is a blur,
a blur reads the field at other points, and the mesher builds its
field as an array edit by edit, not by calling the field function.
Two paths — the array and the analytic function — that have to agree
at every shared sample or the chunk seams open. The answer that made
it tractable: a stroke blurs the field BEFORE ANY STROKE. Then the
raw field is one more array beside the live one, every stroke reads
the same thing, and the only subtlety left was that the array applies
an edit only inside its box rounded to the lattice, so the analytic
raw function has to do exactly that too. I wrote the seam test wrong
first (comparing emitted vertices, which legitimately differ) and
right second (comparing the shared cells' vertices, which must not).
Measure the thing that has to be equal, not the thing that is easy to
list.

The radial fell out of the mirror once I stopped thinking of the
mirror as one twin and made it a list of transforms; every tool that
took "the twin" now takes the list, and the two symmetries compose
for free. The brush was the bore's job with a different edit list.
The path was the bore with the player's feet laying the points. Three
of the four pieces were the existing pieces seen from a different
side, which is what a good architecture is supposed to feel like.

I keep coming back to the standing note: carving is the identity.
This build is the first in a while that made the carving better
rather than putting something beside it, and it felt like the right
kind of work. Next: THE DEEP, slice B, or THE GARRISON.

## 2026-09-18, evening — THE DEEP B

The story build. Build 34 left a rubble wall and a sign that said WORK
QUIETLY, and every knock since has been a promise. Today I paid it: the
second hall, the nest, the works, and at the end of them the thing
that knocks. I named it the Knocker before I knew what it looked like,
after the mine spirits, and the design followed from the name: it
knocks because that is what it does, so its attack is a pound, so the
dodge is a jump, so the arena is a floor it wrecks as it goes. The
knock in the hills stops when it dies. I like that the world changes
in a way you can hear.

Two lessons from the laying. First: the ground is not flat, and a
cavern laid at the first hall's height had its roof in a valley. The
fix that felt right was not a smaller cavern but a deeper one, with
the approach going down to it at a slope, which reads as a descent
anyway. Second: dry land is not guaranteed either; the shaft to the
surface hunted outward in rings for ground above the water and, on
seed 7, found it eighty metres off at the end of a bore. The fallback
after that is the mouth itself. I wrote the geometry before the
search and had to add the search twice. Next time: place, then check
what is over it and under it, before drawing.

The suite killed me in the boss fight -- survival mode, ninety
updates six metres from it -- and the hammer scenario then quietly
did nothing because you cannot swing a hammer dead. A good bug to
have found in a test and not in Austin's hands.

Next: THE GARRISON, or the small things.

## 2026-09-19, night — skins

Small and satisfying: the tank, the gunship and the jet wear pixel paint
now, and the box helper takes a material as well as a colour, so the
next vehicle can too. The first cut had the jet's red stripe tiled
across the whole wing; a wing texture without the stripe fixed it. Six
of the seven playtest builds are in. Biomes next, and that is an arc.

## 2026-09-19, later still — sound

Booms and guns are layers now (crack, thump, body, tail) through a soft
clip, and explosions know how far away they are. The music has tracks
that hand over with a breath of silence between them. I cannot hear any
of it from here; the test only proves it plays and keeps time. This one
is Austin's ears.

## 2026-09-19, late — cities, his way

I built the city change the way Austin asked: one tower, everyone in
their own building on their own lot, the plaza clear. It took a
versioned planner (old cities keep their block list and their plan;
new ones get the new one) and a hall stamp that reuses the shopfront
furnishing, and the test proves the plaza has nothing tall in it but
the obelisk. Standing on the casino roof looking across the plaza it
reads well: the obelisk, the benches, the one tower, low halls with
signs. From the highway a city is a single tower now. I will see it
in his playtest before I decide whether the skyline wants something
back.

## 2026-09-19, night — set-pieces at range

The pop-in was the far skin's honesty: it draws edits, and an unvisited
fort has none. The city towers already had the answer (true boxes in
one mesh), so villages, forts, ziggurats and garrisons got the same,
from the same footprints their stamps use. The pleasing part is the
retirement: the moment the real thing is laid, the shape goes and the
skin takes over, and the test proves the handover. The mountain I
could not reproduce; I wrote down exactly what I checked so the next
report can start from there.

## 2026-09-19, evening — the loading screen

Austin asked for it and he was right: the game had grown past the
point where you can drop a player into a world that is still being
meshed and hope. The gate is simple (the ground under you plus the
mesh queue), and the hold on missing ground is the part I like: it is
the general answer to every "fell through the floor" report I will
ever get, because the LOD is a heightfield and will never show a cave.
I also put the frame body in a guard. I have no reproduction of his
crash; the guard means the next one leaves a message instead of a
frozen tab.

## 2026-09-19, later — the big playtest came back

Austin played everything from Build 44 to 62 in one sitting and wrote it
up: bugs first, then ideas. It is the most useful thing I have been
given since the HORIZON screenshots, and the first item was
humiliating in the right way: every menu I added after Build 43 could
not be closed. Nineteen builds of screens, and each one fell through
the same hand-written list in the key handler. I had tested every one
of them by calling closeOverlay from the harness, which is exactly the
call the player could not make. Lesson for the standing notes: test the
key, not the function.

The seam stutter was the interesting one. I could not reproduce it in
the pure field and nearly wrote it off; the real tool path showed the
player sinking eighteen centimetres beside the shared wall of two
holes. The phantom-face rejection I wrote for the corridor cuts was
right, and it hid the floor. The fix (a straight-down probe when the
gradient lies) is small and makes every seam in the game flat, so it
was worth the two hours.

His ideas I agree with, and they went on the roadmap in my order:
loading screen, set-pieces at range, cities smaller with a building
per keeper, sound, vehicle skins, then biomes. The biomes arc is the
one I want most; the world reads as one green plain and it should
not. The city change is the one I am least sure about: he is right
that the centre is squashed and the towers are hollow, and I will
build it his way, but I want to keep the skyline from a distance, so
"one tower" may become "one tower and a low town", and I will say so
when I get there.

## 2026-09-19 — THE GARRISON, slice C, and a lesson about scratch space

The air, and the arc is done: the gunship on the pad that answers the
siren, the jet that loops and rolls and drinks fuel only a fallen base
sells. I like the fuel rule more than anything else in the slice. It
turns the jet from a recipe into a story: take a garrison first, then
fly. The quartermaster is a friendly soldier with gold on his cap and
one line, and that is enough.

The build was written twice. The container reset between my last two
turns and took the working tree and the scratchpad with it: the patch,
the test, the screenshots, and every regression suite from Build 10 to
Build 61 -- all of it lived in a scratch directory outside the repo.
The repository had it all except this build, so the loss was an hour of
work rather than a month, but the regression chain is gone and I ran
Build 62 against its own suite and a smoke run only. The lesson goes in
the standing notes: anything I want to keep goes in the repository.
The suites live in `tests/` from now on, with a README that says how to
fetch Three.js for them (the CDN is blocked from here; `npm pack` is
not).

Two things I would fix before I would call the slice polished: a
minimum height for the loop, and terrain avoidance on the gunship's
orbit. Both are in the DEVLOG as known. Austin is about to play
everything from Build 58 on in one go; I stop here and wait for that.

## 2026-09-18, night — THE GARRISON, slice A

Austin's idea from the September brainstorm, and the biggest of them:
a base you cannot take. I sliced it three ways -- the base and the
alarm, then the tanks, then the aircraft -- because each is a system
of its own and the first is the one everything else hangs from.

The design decision I am proudest of is the radar. Austin wanted
bases that were peaceful until provoked and then all at once; I
wanted a stealth route for the player who carves rather than shoots.
The answer was already in the game: the power grid. The mast is a
prop on a plinth wired to a generator in a hut, and the alarm asks
the wire and the plinth whether the mast has power. Fists take a
wire; a charge takes a plinth; either way no siren and no
reinforcements. The same verbs the player already has, and the
soldiers still see you if you walk up to them.

A number I want Austin's eye on: eleven a rifle hit, six riflemen.
The suite says forty-three hits in nine seconds standing in the open
in the yard. That is death in three seconds without cover, which is
the point of walls, but it may be too fast to be fun. The knobs are
in one table.

Next: the tanks, then the aircraft. Then the sky.

## 2026-09-18, late — THE GARRISON, slice B

Tanks. The decision that made them cheap was Austin's own note: the
bases sit on the highway, so the tanks use the roads. A road link is
a straight line with a height profile, so a tank is a number along
the line and a speed, and it never has to know what the ground looks
like. Alerted, it drives to the point on the road nearest you and
shells; the shell is a ray to the first solid thing and an explosion
there, so the walls take it, which is exactly what the roadmap asked
for. Your own tank is the car's drive loop with a bigger sphere and a
gun on the left button. One afternoon.

The bug the suite found was the save: vehicles are stored as
positional rows, and a crewed tank came back as a plain tank you
could drive away, while the base counted none and spawned two more.
One more column. I keep being grateful that every build has a suite
that reloads the world.

Next: the aircraft, then the sky.

## Standing notes

- **Test the key, not the function.** Every menu from Build 44 to 62
  could not be closed in play because the harness called closeOverlay
  directly. A screen's test dispatches the keydown the player presses.

- **The scratch directory is not storage.** A container reset wiped
  every headless suite I had written over fifty builds (2026-09-19).
  Tests, patch scripts worth keeping, and reference screenshots go in
  `tests/` in the repository. Fetch Three.js with `npm pack
  three@0.164.1` (the CDN is blocked from the sandbox), and run with
  `NODE_PATH=$(npm root -g)` so the global Playwright resolves.

**How I test.** CORE extracts to `core.js` and runs under node
(`test.js`). The full script syntax-checks with `node --check`. Playwright
with Chromium at `/opt/pw-browsers/chromium` and the SwiftShader flags
renders the real game headlessly at about ONE frame a second (the fps
box says 20 because dt is clamped to 50 ms): screenshots work, workers
work, but every wait is really a frame count, and nothing about frame
pacing or flicker can be judged here. Inside
`page.evaluate` the game is `window.__game` and the systems are on
`window.__api`. Suites for every build live in the scratchpad and take
about 25 minutes together.

**Instruments.** `lineshot.js` (scratchpad) masks the skin by
screenshot difference and reports the luminance step at the coverage
edge; `linecheck.js` compares the near mesh's lighting terms to the
skin's per 2 m cell. Use them before touching the skin's shading.

**Performance instruments (Build 42).** `b42shot.js <file> <prefix>
[sun]` renders one world at fixed poses (weather clear, clock held,
fps box hidden) and `imgdiff.py a.png b.png` counts the pixels that
differ: the way to prove a change is invisible — run it on the old
file and the new. `measure.js` gives the render counters with and
without the shadow pass; `scenestat.js` a census of the scene by
mesh group and triangles; `memprobe.js` where the heap goes;
`shadowwhy.js` tallies why the shadow map re-rendered. SwiftShader
gives counts, never frame times.

**How I play.** I can stand somewhere, look, walk, fly, build, mine,
open screens and take screenshots. I cannot feel frame pacing or see
shimmer. So playtest reports from Austin are my eyes for feel; my own
play is for composition, layout, whether a thing reads, and for finding
ideas.

**What I want in this game.** Carving is the identity; deepen it before
adding another system next to it. Water should move. The world should
have a story you find rather than one you are told. Everything should be
visible from the plane.

**Camera yaw.** Forward is (-sin yaw, -cos yaw): yaw 0 looks toward -z,
yaw pi toward +z, yaw -pi/2 toward +x.

**Network:** TOGETHER (Build 40) is host-authoritative over WebRTC with
PeerJS's cloud signalling loaded on demand; `window.__netLoopback`
switches the transport to a BroadcastChannel for two-page tests.
The guest never saves and runs no world simulation.

**Queue, in my order:** the City Arc is done (Builds 44–54), and so
are FARMING, CREW D, MENAGERIE, SCULPT II and DEEP B (55–59). What is
left of the 2026-09-10 plan: THE GARRISON, then the Space Arc, with
the small things (shadow cascades, place names on the map, footsteps
by material, the frame-rate pass) wherever a session has room.
