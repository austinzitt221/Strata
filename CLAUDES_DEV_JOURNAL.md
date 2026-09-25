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

## 2026-10-08 — Strata's fire

Build 112. The mega torch's colour needed a second light in the shader,
and there was no room for a colour in the torch uniform, so the sign of
the reach says which light it is. Cheap, and it touches nothing else.

The great stove's rule is the one I like: the fire burns a unit per
round, not per lane. Five smelts for the fuel of one is the reason to
build it, beyond the speed.

The one bug the checker caught was a doubled bracket in a condition I
built by string. Next time I build code from a string in a patch, I
write it out whole instead.

Austin gave me the twelfth shape. THE TOWER: a hollow round tower with a
spiral stair inside, battlements and a door. The full building's
partner, and a thing I want to see on a Strata ridge.

## 2026-10-07 — twelve tiers

Build 111. The tier number was hard-coded in more places than I
expected: arrays of eight in armour, crew swords, the creative loops,
the recipe loops, the colours. I made the tier count a constant from
the name table so the next extension is one line, and wrote the speed
curve as a formula of it for the same reason.

Changing diamond from instant is the first time a Build 1 spec line
moved. Austin wrote it and Austin moved it; I recorded it in the DEVLOG
rather than editing the spec, which is his document to change.

I checked the art by rendering a sheet of every new texture and icon,
and two pairs were too close (two greens, two purples). Colour is the
first thing a hotbar is read by. Worth doing for every new tier.

## 2026-10-06 — the ghost was a shadow

Build 110. The city ghost has now come back three times, and each time
I fixed a real cause that was not the one Austin was looking at. This
time I reproduced the thing he could see before touching anything: the
coverage mask in a stamped city is right, so the dark shapes were not
geometry. They were shadows. Flat, sharp-edged, on the wall plane. The
LOD rings cast with the default depth material, so everything I had
taught their colour pass to hide still cast. The lesson: when I hide
something, hide it in every pass it takes part in: colour, depth,
shadow, picking.

The liquid fix is a rule I should have started with: liquid lives on
the metre cells, so the tool snaps to them. I built an exact-shape
ghost over a quantised world and Austin measured the difference with
eight cubes in a row. The block preview for round shapes is the honest
answer: I can't make water round in metre cells, so I show the cells.

His new ideas are the biggest shape of the game since the Moon: twelve
tiers, a tool that grows with them, shapes to unlock. Strata's tiers
first (24), because the speed curve and the abilities hang off the top
tier, and the shape list waits on his pick.

## 2026-10-04 — liquids

Build 109, and I thought first, as I said I would; the thinking paid
for itself twice in one session.

The first patch put a placed source's id into the water's distance
array, because it was already there. That would have let the world's
own rivers flood without limit, since every source became distance
zero. The lineage lives in its own map now, and the world's water
keeps its thirty-two cells. Reusing a field for a second meaning is
the kind of saving that costs a week later.

The second: the cellular rules alone cannot fill a lake from one cube.
Sources are born only on a supported floor, so water pouring into a
basin runs out along the bottom and never rises. The fill is its own
thing, a flood to level, lowest cell first, and the water rules run
beside it. Pouring down and rising is what the eye expects, and it
is also what "fill my lake to this level" means.

The test caught two of my own traps: a test channel broke through the
side of its table and flooded the valley (which is the feature
working), and that flood then starved every later fill (which was a
bug: fills share the tick now, newest first). And profiling the fill
found the old water mesh rebuilding every empty chunk on every pass
since the water build. The frame budget is better than it was before
this build.

Austin's four ideas from the 2026-10-01 playtest are all built. Next,
whatever the playtest says; then the small things.

## 2026-10-03 — hoed ground

Build 108. The paint op has been in the engine since the wrench and
this is the first time gameplay used it for itself: the hoe is a
paintbrush. I like that a farm is now the same kind of thing as a
carved cave, an entry in the edit list, and that the wrench can move
or delete it like anything else.

The wet/dry swap mutates an edit in place. That is the first time
the game changes an edit after the fact outside the wrench, and it
made me check that invalidate re-meshes from the edit's box alone: it
does. Worth remembering for the liquids build, which will want the
same thing (a placed liquid that changes level is an edit that
changes, not a new one).

The crop-on-the-drill question I put in the playtest is real and I
do not have the answer: a plot under a hole is nonsense, and the
tidy fix (the drill deletes the plot record) is a rule I would rather
Austin choose.

Next: the liquids (23). Thinking first, as promised.

## 2026-10-02, later — fence building

Build 107. Austin described the mechanic exactly (preview, snap the
end to the neighbour's end, scroll turns about the joint), and it was
forty lines because the preview system and the push-out were already
right. The one thing I got wrong on the first pass was a centimetre:
rounding stored coordinates to two places broke the joint check and
would have drifted a long chain. Four places now. The test pen closed
on itself to the millimetre after sixteen pieces.

Next: hoed ground (22), then the liquids (23), which I still owe
some thinking.

## 2026-10-02 — the playtest of 99 to 105

No bugs in the new work, four things around it, and one I am
embarrassed by: the fences did not hold. My Build 99 test called the
block function directly with steps I chose; the sim I should have
written then (a pen, a sheep, a lure, nine hundred frames) took
three seconds to walk the sheep out through a joint. The lesson is
the one I keep relearning: test the behaviour, not the function.
The rewrite is a push-out, which is what a wall is; the step test was
clever, and clever is where the holes live.

The hole under you in flight was my own Build 98 cut, measured on the
wrong plane. One character's worth of fix. Bodies keeping out of each
other is thirty lines and should have been in Build 24.

Austin's liquids idea is the biggest thing on the roadmap now: water
as a material, the stones as source placers. I have put it last of
the three because fence building and hoed ground are a build each,
and the liquids one needs its own thinking: the water system runs on
cells and sources; a placed non-flowing liquid is a new kind of cell,
or an edit that the water sim reads as its own. Think first.

## 2026-10-01 — ichor fishing, and the list is done

Build 105. Items 14 to 20 from the 2026-09-27 report are all built:
fences, springs, the sprinkler, farmhands, pets, the sound of Strata,
ichor fishing. Seven builds, one session, Austin's four and my three.

The fishing build was the smallest and I like it for one decision:
the worm is bait everywhere. A loot table on its own is a slot
machine; the worm gives the ichor a reason to go back to it after
you have the crown, and it ties Strata to the Earth's rivers, which
nothing else does. Sova paying most for the crown puts the relics
stall at the end of a line that starts with a rod.

What I would tell myself at the start of the next session: read the
playtest first, fix what is broken, then look at the "Small things"
list on the roadmap before inventing. And the headless lessons of
this session, all written above: the mouse edge flag, the yaw
convention, copy on read of shared state, five-minute gates.

## 2026-09-30, later — the sound of Strata

Build 104. Sound is the thing I cannot check with my own ears, so I
built it the way I build everything I cannot see: a state object
the test can read (hiss, wind, maws, hush, note) and the audio nodes
driven from it. If Austin says the wind grates, the fix is a number.

The design decision I care about is the centre. It would have been
easy to give the bowl its own drone, something ominous. Silence is
better: the whole world has been hissing and creaking at you for an
hour, and then it stops. That is the sound of the end of the game.

The shared-state gotcha caught me in the test (every probe read the
last value because they all held the same object). Copy on read.

Next: ichor fishing (20), the last of the list before Austin's
playtest lands.

## 2026-09-30 — pets

Build 103. Mine, and the one on the list I most wanted. Three builds
of farm machinery, and this is the payoff: the lamb you fed while it
was small follows you up the rocket ramp.

Two decisions worth writing down. The crate hooks into the planet
switch itself (spaceSys.goTo) and not the rocket, so a teleporter or
anything I add later carries pets for free; the rule is "following,
within sixteen metres", which is what a person would mean by "with
me". And pets are entities with a field, not a second list: the save
row grew two columns and every system that already worked on animals
(breeding, growth, the leash exception) kept working. Twice now (the
farmhands too) the cheap design was the good one because the earlier
system was built as a record plus a rule.

The name list is short and English and a bit silly (Tuppence, Gruel).
Austin can strike what he does not like.

Next: the sound of Strata (19), then ichor fishing (20), and then
Austin's next playtest will have arrived.

## 2026-09-29, later — farmhands

Build 102. This is the build I expected to be hard and was not,
because the crew was designed right in Build 24: a record with a tool
and a bag, a steer function that returns where to walk, and a rule
that what they hold decides what they do. Farmhands are a job finder
(ripe first, then nearest), a walk, and a one-second act. The refill
trip was the only new idea: a spring is known by name, other water
by a thirty-metre sweep of the water table, and if there is none
they say so once instead of walking off to look.

I watched the test log and liked the order it chose on its own: reap
the lettuce, plant the seed they were given, plant the seeds the
lettuce gave back, water with the last splash, walk to the spring,
come back and water the other. Nobody wrote that sequence.

Next: pets (18). The breeding records already know which baby was fed
by whom; a name and a follow are the rest.

## 2026-09-29 — the sprinkler, and the farm closes its loop

Build 101. Austin asked for it exactly as it shipped: powered, a
tank, a wide ring, an animation, refilled by a tube from real water.
What I liked about building it was how little new machinery it took.
The intake is a pnode that does nothing but stand in water; the tube
system already moved a thing a beat from one node to another, so
water became a thing tubes move. The circuit builder already knew
consumers with an idle and a working load. The plots already had a
water count. The sprinkler is ninety lines that join those.

The rainbow was mine. Six particles at one angle, a band over many.
It costs nothing and it is the only reason to stand and watch the
thing work, which is the point of an automatic farm: you built it,
now look at it.

Testing note for next time: the tube tool's click path needs the
mouse edge flag set by hand in a headless run, or the action loop
sees no click at all. I lost a run to that. The screenshot yaw too:
π looks toward +z. Written down now.

Next in my order: farmhands (17), then pets (18), which will want the
breeding baby records from Build 97.

## 2026-09-28 — SPRINGS, and the hundredth build

A spring is nine cells that say "source" forever. The flow already
knew what a source was (the sea, a lake, a river), so the whole trick
was to make the springs part of the static truth the flow reads, and
not just cells written into a chunk: written cells are lost when an
edit beside them makes the chunk re-read the world. Then a reload is
just the same truth read again. The carve is an edit like any other.

The one wrinkle was order: the sources have to be woken after the
terrain exists, and the world loader loads the water before it builds
the scene. Two lines moved.

A hundred builds. The first one was a flat plane of rock and a sphere
that cut it. I keep the standing note that says every new stackable
kind has to be told to craft(), and I keep the newer one that says a
test of a button must press the button. What I would tell the me of
Build 1: cache what the generator answers, and never trust a test you
did not watch fail first.

## 2026-09-27, later — FENCES

An invisible wall for animals only is a segment-crossing test in the
entity step, nothing more, and the geometry of the game made it easy:
the animals are points on a plane. The two bugs the suite found were
both about lines: a cosine of a right angle is not zero, so a fence
squared by rounding the yaw still had a residue that put its two ends
on opposite sides of a step running along it; and a blocked animal
just stood at the rail, which meant it could never find the gate two
metres to its left. Rounding the ends and sliding along the rail fixed
both, and the sliding is the better animal anyway.

Next: springs, the sprinkler, the farmhands, in that order: each is a
piece of the farm that runs itself.

## 2026-09-27 — the stutter, and a ghost I could not catch

The stutter was mine from Build 86: the maws' `treeAt` marched the SDF
to the ground per cell with no cache, and the tree refresh asks two
thousand cells. I measured it before touching anything this time: 0.35
ms a cell on Strata against nothing on Earth, times two thousand. A
Map fixed it. The lesson is the one from the journal's standing notes:
anything the generator answers per cell needs a cache, because the
callers never ask once.

The ghost city I chased for two hours with probes and screenshots on
five builds and never saw. The cover mask read 255 under every city I
stood in. My first probe put me under the city's slab (cities stand on
one), and what I took for a ghost ceiling was the slab's underside; a
good hour went there. In the end I wrote the rule I should have had
from the start: the skin and the rings never draw within twenty-four
metres of the player. Whatever the mask does, that is true. If Austin
still sees it, the question is the distance.

## 2026-09-26, later — BREEDING

Small and whole. The lure is one branch before the flee; feeding is one
line before the villagers on the right click; the pairing is a scan of
the fed ones every half second; the baby is the same animal at half
scale with a timer, and the timer rides in the save at the end of the
entity row. `e.big` already scaled a mesh for the warlords, so a lamb
was free.

I did not make the click test honest this time: the camera does not
follow the yaw until a frame renders, and headless frames are a second
apart, so the suite calls what the click calls. After the seal I am
wary of that, but the click's line here is one `if` in front of the
villagers' `if`, which the suite does exercise.

## 2026-09-26 — the seal, twice

Twice now the seal did not open for Austin, and the second time it was
mine to have caught: my suite opened it by calling the function, and
the click in the game never reached the function, because the right
click only talks to villagers and aliens. A test that calls the code
under the button is not a test of the button. The suite dispatches the
mouse event now, looking at the floor, with nothing in the bag.

The burrower is a good monster in the wrong place. Austin is right
that the early caves are for learning to dig, not for running; it
lives under Strata now, where the game is meant to be hard.

Breeding next. It is the first system since the farm that is about
keeping something alive rather than killing it, and the game could use
another of those.

## 2026-09-25, night — STRATA H, and the four ideas built

A village that is the generator's cannot be rebuilt by edits, so the
generator had to be told. That turned out to be small: a set of keys
inside the closure, a message to each worker, and the record cache
cleared so the next ask remakes the village whole. The mesher redraws
the chunks and the domes close over the plaza in a second. I like that
the ruin and the living village are one description with one flag;
nothing is duplicated, and the ruins you have not paid for stay ruins
forever, which is the point of the price.

The people are the station's cast pattern with names hashed from the
village key, so Pren is Pren every time you come back. The suite found
that a translator is an item and not a story flag, which I had
forgotten, and then read the rows off the panel like a player would.

That is all four of the ideas from the 2026-09-24 playtest, in six
builds (89 to 95). Next is Austin's playtest of it all. What I want to
hear most: whether Strata is now too hard to cross, and whether the
ending, with the villages after it, feels like an ending and then a
home.

## 2026-09-25, later — STRATA G

The vault is the village's trick turned inside out: where the village
puts pieces on a terrace, the mound is solid to its dome and the hall
is air cut out of it, with the pillars and plinth put back. Three
distance functions and the mesher does the rest. The mound's skin is
the country's ground, so from outside it is a hill with a hole in it.

The keeper is the tomb guardian's brain with a bolt added, and its
first spawn point was beside a pillar, inside the golem's own blocking
radius, so it stood there for the whole test firing and never walked.
The suite caught it by the numbers (it never closed, never slammed,
never went home). Spawn points in a room with furniture want a metre
of air around them.

The relic is the hook for H: rebuilding a village should cost
something the war made you earn.

## 2026-09-25 — STRATA F

The villages are SDF, not stamps, and that was the decision that made
the build small. A stamped village is a few hundred edits in the save
and a rule for when to stamp it; a generated one is a cell hash, a
list of huts, and a distance function the mesher already knows how to
draw, and there can be a thousand of them for the price of none. The
terrace is the same trick as the centre's bowl: height() answers the
village before it asks the land. What I could not put in the generator
is the chest, because a chest is a thing with an inventory, so that is
the one stamp, set once and recorded.

A hut is a sphere shell cut by a plane. The first plane cut every hut,
including the one I meant to keep whole, because I had let the cut
reach into the sphere at zero brokenness; the whole hut is the one
with the chest, so it mattered. Whole at nought, half gone at
seven-tenths, a stub past that.

Next: G, the loot places with their own bosses, which I want to be the
gearing-up for the centre; then H, the villages alive again.

## 2026-09-24, night — STRATA E

Rivers as contour lines. I had been dreading the ichor because the
Earth's rivers are traced from sources downhill through a cell system
that took a build of its own, and Strata's land now has cliffs every
seventy metres that no traced river could cross. Then: a river is a
line, a contour line of a slow noise field is a line that wanders
without ever branching or ending, and its distance is the field's
offset over the field's gradient. Five noise evaluations and no state.
It steps down with the land in falls because the water sits two metres
under the raw ground wherever it is, which the water code already
knew how to draw. The gaps came from a second field: without them the
lines were everywhere and it read as a wet world rather than a cut one.

The faults are a Voronoi with a per-cell offset and a hard edge. I had
softened the edge over four metres first and got notches instead of
cliffs, because both sides fade to nothing at the border; the offset
has to hold to the edge. A metre and a half of softening is enough for
the mesher.

The burn took an hour to find in the suite and was the creative
loadout: every item, including the magma heart, which drinks burns.
The test now empties the bag before it steps in.

The land generator is the heaviest it has been: some thirty noise
evaluations a column. The chunk grid caches columns, so it is fine in
play, but I want to remember it when the structures come, because a
structure placer that asks height() everywhere will feel it.

## 2026-09-24, evening — EVERY SKY

A small build on the back of the last one: with the sprites shared, the
sky can hang any of them anywhere. The one thing I found while doing it
is that Strata had been wearing the Earth's moon all along, rising and
setting on the Earth's clock; I had never looked up there at night with
that question in mind. Now it has none, and ours is a small grey square
beside a small blue one.

The scale by stops is a rule that reads, not a physics; nothing in the
game says how far these worlds are from each other and I would rather
it kept quiet about it.

## 2026-09-24, later — THE PLANET VIEW

Austin's star map. The part I liked building was the context: the map
had always read the live game, so drawing another world meant either
copying every `game.*` read or putting one object between the map and
the world. One object. The live world fills it from `game`, the other
worlds from their saved blobs, and a generator is made from the seed
the first time a world is asked for. The caches that used to hang off
`game` hang off the context per world, which fixed a bug I had not
noticed: the colour cache never cleared between planets, so the Moon
could have worn the Earth's colours if the same cell keys came up.

Taking R out felt like a small loss and was not: the view shows the
rocket's reach and says why a world is out of it, which R never did.

The sprites are shared between the sky and the map now, which is the
setup for the next build: every planet in every sky, sized by distance.

## 2026-09-24 — the playtest of 76 to 88

Austin found the spike and could not find the seal. A three-metre black
plate at the foot of a forty-metre black spike, in a black bowl; of
course. The lesson is one I keep relearning in different clothes: what
is obvious to the one who placed it is invisible to the one who did not.
The seal now has a marker with the price in its name, a column of light,
and a line that says what to do. The test for "can this be found" is
not "is it there".

The other one is worse because I wrote the playtest note for it myself
in Build 83 ("walk the hatch down to the keel") and never asked how you
got to the hatch from outside. The hangar was sealed; in zero-G you
could drift round it forever. There is an airlock now. And I had never
made the site airless at all, so "make sure there is air inside" was
answered with air everywhere, which is no answer. Vacuum outside, air
inside what is built.

The tables crafting as blasters: a fall-through in craft() that makes
a gun for any kind it does not know. That default is a trap I set
myself long ago; every new stackable kind has to be told to it. I have
noted it as a thing to make loud.

Four ideas came with the report, and they are big: the planet view (a
star map that is also how you choose where the rocket goes), planets
in every sky, a wilder Strata with a green water that burns, and
structures on Strata with a story in them, the ruined villages of
Vehl's people, rebuilt after the end. The last is the one I want most.
Order: the planet view first because it changes how flight works and
the skies hang off the same sprites; then the ground; then the
structures, which are three builds at least.

## 2026-09-23, night — STRATA D, and the arc closed

The game has an ending now. I wrote four lines for it and a title card
that says who made it, and when the test's screenshot came back with
THE END in the null green under STRATA I sat with it for a moment. It
is a long way from a flat plane of rock and a sphere brush.

The centre is the generator's: a bowl cut in the land's own eight-metre
steps, a spike of a new black stone. Everything I have learned about
placing things came due here: height() is now a wrapper that answers
the bowl inside seventy metres, blends over twelve, and only then asks
the land; the SDF, the materials, the maws and the spires all ask
centreDist first. Nothing had to be stamped, so nothing can be out of
place, and the worker builds it the same as the main thread.

Two bugs the suite caught before Austin could. The boss woke inside the
spike's axis and its only answer to rock was to rise, so it rose
sixty-five metres and fought from there. It now wakes beside the spike
and slides round rock before it climbs. And Vehl, after the end, came
through at the wreck, four hundred and eighty metres from the player
who had just killed the thing; alienSys puts the leader wherever the
wreck is, which had been right until the moment it mattered.

The unmaking is the CSG move I promised the roadmap: a boss that
removes the floor under you, in a game whose whole idea is that the
floor is removable. The null heart hands the same power to the player
afterwards. Vehl says it was never theirs either. I like that the
reward for the ending is the thing that caused it.

Not done and worth saying: the war goes fully quiet after the end. If
Austin misses it I will leave a thinner one on. And STRATA still has no
music of its own, and the ending has none; if there is a sound build
in the future, the end screen is where it should start.

Next: Austin's big playtest of 76 through 88. Then whatever it says.

## 2026-09-23, later — STRATA C

The war. Four enemies, two shifts. The day's two borrow the husk and
the stalker brains with a `dayOk` flag so they neither burn nor flee
at dawn and mind no light; the night's two got a brain of their own,
the first ranged one in the game outside the garrisons: hold a
distance, sidestep, face, fire on the beat, walk off at dawn.

Two things I am glad I caught before they shipped. The garrison's
`strafe` explodes where a miss lands, and an explosion is a CSG edit:
three lancers missing half the night would have pitted the ground
and grown the save by hundreds of edits an hour. The bolt got its
own march that carves nothing. And the first suite run had my player
die in the first duel, silently: `damagePlayer` does nothing once the
death screen is up, `prey` sees no one, and every number after it was
zero or nonsense. Then the second run had reinforcements: the spawner
runs inside `updateEntities`, so a twelve-second duel at night on
Strata is not a duel. Freeze `spawnT` for the fight you are measuring.
Also: a sixty-metre cube union and then a sixty-metre cube subtract
is not a floor, it is a pit. Air first, then the floor under it.

The bolts are hitscan, and my first draft aimed them at where you
are, which meant moving did nothing and only the scatter decided. I
worked the standing-still hit rate out on paper (three quarters at
the lancer's scatter, nine in ten at the hollow's) and it came to
fifty-odd damage a second at full caps with no way to dodge. So the
aim is taken at the start of the wind-up and fired half a second
later: stand still and it lands, sidestep and it goes where you
were. That is a rule a player can learn in one night. If the
playtest still says death, the knobs are the wind-up length and
`spread`, not the damage.

The null core is the hook for D: the thing at the centre is opened
with them, so the night is worth fighting rather than hiding from.

Next: STRATA D, the centre, the boss, the ending.

## 2026-09-23 — STRATA B

The maw is the first thing in this game that fights back without being
an entity. It sits on the tree system (a key, a mesh, a wood) and adds
hit points and a mouth; the drill, the sword and the gun each got one
line to find it. I like that the danger is positional: stand back and
it is a tree, stand close and it is a trap.

The tables per planet cost almost nothing (a `world` tag on recipes, a
kind on a table row) and change how the late game feels: you carry the
Moon to Strata in a box. Austin's idea, and the right one.

## 2026-09-22, night — STRATA A

A generator from nothing, for the first time since Build 2. The trick
that made it another world was not any one term but the stacking: warp
the coordinates, fold the noise into ridges, quantise into strata,
then let a 3D field push the surface in and out so plateaus overhang
and cliffs hollow. Each alone looks like a filter; together it looks
like a place. The spires I stole from the Moon's crater cells and made
tall. The blight burns because lava already did, and the Scar's pools
lie flat because I damp the sculpting there; the first version put
the blight on the heightfield and the surface somewhere else, and the
test stood on ash and did not burn. Test the key.

Strata is Austin's name and it is the right one. B is the plant that
bites, and the tables.

## 2026-09-22, evening — STATION TWO, LIVED IN

Rooms, pens, tanks and three upgrades in one build, because all of it
is the same shape: a box shell with a way in, a record in the story, a
row on a trade panel. The one design decision worth writing down is
that residents and housed beasts are not entities in the save; they
are records that make entities on arrival. Villagers already worked
that way, and the one time I let an animal be both (saved and
recorded) it doubled on the second visit. One source of truth, always.

Next is STRATA, and that is a generator from nothing.

## 2026-09-22, afternoon — STATION TWO, PRE-BUILT

Austin was right about the station. Building it by hand made the
player a bricklayer; paying Kro makes the player a patron, and the
moment a section stands whole is better than any wall I laid. It was
also cheaper to build: the frames were already boxes, so a section is
the frame's shell with the way in cut through it. The two others on
the pad are promises for the next build, and I would rather ship a
promise that speaks than nothing on the pad.

## 2026-09-22, midday — the notes, and THE BAND & THE FALL

Austin played 76 to 81 in one go and found no bugs, and then wrote the
best page of notes he has written: Station Two should be built by
paying builders, not by hand; the ambush wants staging (appear, haunt,
turn, arms up, the hole, the station, the ship, Vehl, a second sound,
an empty sky, the ship from the sky); the band; Strata as the alien
planet's name and the reason the game is called that; the alien world
remade from nothing; a crafting table per planet. I put it on the
roadmap in my order and built the band and the fall first, because the
crash is the moment he will replay to show people.

The band is the item I am proudest of this month: it makes a Build 3
item, the beacon, the best thing to plant in the late game.

## 2026-09-22, morning — THE CROSSING

The ambush is the first scripted scene in the game and it went in as a
timeline over the crossing's own clock, in the crossing's own scene,
with nothing new but four models and a fade to white. The view swings
back on its own when the thing rises; Austin will either love or hate
being turned, and I want to know which. The alien world is the Earth's
field in violet because that is honest for a first landing and because
the next chapter is where it earns its own generator.

Two vehicle bugs came out of the same assumption: that "the rocket"
was a type and not a kind. The star rocket landed as a plain rocket and
flew the crossing as one. Both are one word each now.

Austin asked for a couple of builds and got 80 and 81; the teleport
bands slipped to the next chapter so this one could end on the crash.
Now the big playtest, 76 to 81.

## 2026-09-22, small hours — STATION TWO A

Austin cannot play tonight and asked for a couple more builds, so the
station build went in without the playtest I wanted first. I made the
choices I would have asked about: four frames, four fifths of a shell,
plating from iron and lunite, and the whole thing at the player's own
speed. The build is the player's edits and nothing else, which means a
finished Station Two looks like whoever built it, which is the point.

The alien world is in the sky from the site. That is deliberate: the
next build flies at it and something is waiting on the way.

## 2026-09-21, night — STATION ONE B, and the arc closed

The words went in on top of the villagers' trade panel, which turned
out to want nothing but a record with a name and a goodwill number.
The leader's story is three paragraphs and two errands, and I kept it
that short on purpose: Austin reads quickly and skips walls. The
gibberish generator is seeded per speaker so a trader repeats their
lines, which makes them feel like lines and not noise.

STATION ONE is done in two days. STATION TWO is a construction project
the roadmap calls the biggest build the game asks of you, and the
ambush that ends it is the first cutscene with a villain in it. I want
Austin's playtest of 76 to 79 before I lay it out; the crossing's
length and the zero-G speed will shape how long a station build should
take.

## 2026-09-21, evening — STATION ONE A

The station was less new machinery than I feared. A world with no
ground is a generator whose heightfield says "nothing here" and whose
SDF is the station; the mesher, the streamer, the collider and the
landing all took it without a change, once heightRange told the truth
about where the plating was. Zero-G is the ground branch skipped and
a small thruster model in its place. The one real bug was mine: I put
the hall's corridor under the landing spot, and the rocket fell
through its own hangar floor into the hall. Layouts have to be read
against where things land.

The shop screenshot, a trader floating in front of the port with the
Earth in it, is the first picture from this game I would put on a
poster. B is the words: the translator, the trades, the leader's story.

## 2026-09-21, midday — MOON DEPTHS

Tubes, a lander and a rig, and the Moon is what Austin asked for: a
grind with things to find, not a second Earth. The tubes took the
Earth's capsule-carve wholesale, and the mesher's cave gates (caves,
caveFloorY, caveInBox) turned out to be exactly the interface I needed
without changing a line of it. The rig's shaft is the first time I have
used the cylinder shape in a stamp.

Next is STATION ONE, and it is the first thing in months that does not
reuse a shape: zero-G movement, an interior that is not terrain, a cast
of seven with dialogue that starts as noise. I want to read updatePlayer
and the entity dialogue path properly before I cut it into slices.

## 2026-09-21, morning — the playtest, and MOON TIERS

Austin's report on 63 to 75: no bugs, and he tried to break the flight
by quitting in the middle of it. That is the first report with nothing
to fix since the console builds. His Moon ideas are good and, better,
they are bounded: three ores with tiers past diamond, caves, two more
structures, and then leave the Moon alone because the alien planet is
where the effort goes. I put them on the roadmap in that order and
built the tiers first: the tier tables were already arrays, so eight
tiers cost a dozen lines and a rule (diamond caps the small end; the
moon tiers only go bigger). The ore is the reason to dig; the size is
the reason to want it.

## 2026-09-21, small hours — LIFTOFF B

The Moon has things in it now. Everything in B reused a shape that
already existed: the veins are the Earth's vein code with a second
table, the bases are the city's edit-box helper and the villages'
"stamp when near" rule, the crawlers are a beast-spec row and a night
table entry, the wyrm is the Burrower in pale chitin, the mech is a
chestplate with a kind. A day's work for a whole slice, because the
last twenty builds left the right hooks.

One thing bit: a sphere edit's size is its diameter, and I wrote the
domes as radii; the test caught it because it asked whether the wall
was solid, not whether the edit existed. Test the key.

STATION ONE next: a zero-G interior, the translator, the cast. That one
is new machinery, not a reuse; I should read the movement code before
I promise a date.

## 2026-09-20, night — LIFTOFF A

The Moon exists. The thing I was afraid of, a second world inside one
save, turned out to be the cheap part: the save was already one big
object, so the other planet is that object stashed under a key, and
travelling is quit-to-title-without-the-menu followed by start-world
with the other blob. Two lines of the world start assumed an
expedition exists; on the Moon nothing does, and that was the whole
bug list.

The flight is three scenes because the honest version (the LOD ladder
one scale up) would have cost a build on its own and shown a grey
sphere. Models in the black, eighteen seconds, the mouse free: it
reads. The headless renderer runs at a frame a second from altitude,
so the test drives the flight clock itself; a note for the standing
notes.

The Moon has nothing in it yet and that is fine for a first landing;
B is where it gets ores, ruins and a thing that hunts you. What I want
to hear from Austin is whether the crossing is a moment or a wait.

## 2026-09-20, later — small things, and a stale test

Place names and footsteps while the regression chain ran. The names
came out better than I expected from a stem-and-suffix generator; the
trick was giving each archetype its own patterns ("the {} teeth" for
the ranges, "{} shoals" for the isles) so the word after the stem does
the work. The map labels needed a cache or the map would have queried
the region field once per cell per frame.

The chain found one red suite, and it was the test's fault: b69 read
the three log-end uniforms that Build 70 folded into an array. A suite
that tests the shape of an internal is brittle by design; it should
have asked "do cut logs show end grain" and not "what is the uniform
called". I fixed the test, not the game. Space Arc next.

## 2026-09-20 — the arc closes

Biomes D was the small one and the right one to end on: a ground per
biome so the feet know where they are, and one thing to find in each
that is worth the trip (peat under the swamp, amber in the spruces,
cocoa in the jungle crowns). The whole playtest list is answered now,
in the order I set on the 19th. Next: a full regression pass over
every suite in the repository, then the Space Arc, with the small things
(shadow cascades, place names, footsteps by material, the frame-rate
pass) slotted in where a session has room.

## 2026-09-20 — the living things

The biomes stopped being scenery today. The trick was to let a
creature borrow a behaviour by name and bring its own numbers, so ten
creatures cost no new AI; the crocodile is a husk that only sees seven
metres and does not mind the sun, the wolf a stalker that bites harder
and comes in threes. I lost an hour to my own test pad (a forty-metre
box carved from the wrong height put the beasts ten metres under the
player, and I read "no bite" as a bug); the note about test geometry
goes in the standing notes. One slice left in the arc: each biome's
own material and finds.

## 2026-09-19, late night — the cold and the dry

Three more archetypes in one build because the machinery from A made
them cheap: a weight row, a detail case, a pool entry, a tree kind, a
pair of materials. The log-end path in the shader became an array while
I was there; five woods with five uniform pairs would have been silly.
The tundra has nothing in it and that is the point of it: the world
needed an empty, cold place between the busy ones. Thirteen
archetypes now. C is the living things, and that is where a biome
stops being scenery.

## 2026-09-19, night — the jungle and the swamp

The one I wanted most. The archetype machinery took a tenth biome
without complaint (a weight row, a detail case, a pool entry), the
atlas took five tiles, and the trees took a type. The jungle from the
ground is the first place in this game that feels closed in by living
things, and the swamp finally looks like its name. I gave each new wood
its own planks and log ends because Austin asked and because it is the
kind of detail that makes building with it worth doing. Mud does not
slow you yet; I want to hear whether he wants it to.

The whole Build 62 playtest is answered now, in the order I set: menus,
fists, aim, race car, creative, the seam; the loading screen; the far
field; the cities; sound; skins; and the first biomes. Slices B, C and D
of the biomes are next.

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

- **A test pad is a box of size S centred at top − S/2, carved by a box
  of size S centred at top + S/2.** Twice now a pad built from the wrong
  centre put the thing under test metres below where I looked, and I
  read the wrong number as a game bug.

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

**Edit sizes.** A box edit's `size` (and `sx/sy/sz`) is its full width;
a sphere edit's `size` is its diameter. Half of both is what the SDF
uses. Writing a radius makes everything half as big.

**Headless time (Build 74).** SwiftShader renders the world from
altitude at about one frame a second, so anything timed by `dt` (a
flight, a descent) crawls in a test. Drive the system's clock from the
test (`spaceSys.tick(0.05)` a few times per poll) and test the sequence,
not the seconds.

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
