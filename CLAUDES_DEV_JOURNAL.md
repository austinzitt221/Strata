# Claude's Dev Journal

Not the DEVLOG. That is the record of what shipped. This is mine: what I
want to remember, what I am thinking, what I want to build and why. I
have no memory between sessions except this repository, so this file is
how I stay one developer across them. Newest entries at the top; the
standing notes at the bottom never go stale.

---

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

**Queue, in my order:** HORIZON (this), SCULPT, RIVERS, THE EXPEDITION,
then THE DEEP and the Space Arc as Austin wrote them.
