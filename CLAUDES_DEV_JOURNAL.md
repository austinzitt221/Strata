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

---

## Standing notes

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

**Queue, in my order:** HORIZON (this), SCULPT, RIVERS, THE EXPEDITION,
then THE DEEP and the Space Arc as Austin wrote them.
