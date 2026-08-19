# CLAUDE.md — STRATA

## What this project is
A blockless 3D mining/building sandbox. Minecraft's feel and pixel-art look, but the terrain is a continuous volume you carve and fill with clean geometric shapes (spheres and cubes) instead of breaking blocks. Single HTML file, no build step, runs in Chrome from a double-click.

## Hard constraints
- **One file.** `strata.html` contains everything: JS, CSS, shaders, procedurally generated textures. No external assets.
- **Three.js from CDN.** Load via ES module import map or ensure script tags resolve before any code runs. **Known failure mode from a previous build: the game crashed because game code executed before the CDN script finished loading. Guard against this explicitly** (module imports, or wrap init in load event and verify `THREE` exists).
- **Validate with `node --check`** on the extracted script before shipping. Where logic can be tested headlessly (SDF math, brush ops, grid snapping, inventory), prefer a small test harness over eyeballing.
- Target: Windows / Chrome, keyboard + mouse, pointer lock.

## Core architecture (this is the important part)

### Terrain = Signed Distance Field + edit list
- Base world: flat infinite plane of rock. Base SDF: `f(p) = p.y - surfaceHeight`.
- **Bedrock:** clamp the field so everything below `y = bedrockY` is permanently solid regardless of edits. Bedrock gets its own material/texture. The clamp happens after edits are applied, so it is unminable by construction, not by input filtering.
- Every mine/place action is a **CSG edit** appended to a list: `{ op: subtract|union, shape: sphere|cube, center, size, rotation?, material }`.
  - Mining = smooth-free (hard) boolean subtract.
  - Placing = hard boolean union with a material ID.
- The world is fully described by `(seed, editList)` — this is also the save format.

### Meshing = Dual Contouring, chunked
- **Dual contouring, not marching cubes.** The spec requires a cube brush to cut a perfect cube hole with sharp edges and no gaps; marching cubes rounds corners. DC with QEF vertex placement preserves sharp features from the exact SDF + gradients.
- World divided into chunks (e.g. 32³ samples at a fixed voxel resolution). Only re-mesh chunks whose bounds intersect an edit's AABB. Chunks stream in/out around the player for the "infinite" flat world.
- Chunk seams must be watertight — sample shared boundary cells identically on both sides.
- Store per-cell material ID (rock, bedrock, later ores) so placed material renders with the right texture.

### Rendering
- Pixel-art look: procedural textures drawn to canvas at low res (e.g. 16×16), `NearestFilter`, no mipmaps blur. **Triplanar mapping** in a custom shader — carved terrain has no UVs, triplanar is how the pixel texture tiles cleanly on arbitrary surfaces.
- Distinct textures required per material: rock, bedrock (and every future material).
- Simple directional + ambient light. Keep the frame budget for meshing.
- **Known failure modes from a previous build:** (1) a render-pass misconfiguration produced a fully black world — keep the pipeline plain (single renderer pass) until everything works; (2) WASD moved along world axes instead of camera facing — movement must be camera-relative on the horizontal plane.

## Gameplay spec — Build 1

### Player
- First person, pointer lock. WASD camera-relative. Space jump. **C = crouch. Shift = sprint. Z = toggle fly** (fly is on-spawn available in build 1; space up / C down while flying).
- Standard capsule-vs-SDF collision (SDF makes this easy: sample distance + gradient for pushout).

### Tools
Two tool families, five tiers each: **stone, iron, ruby, obsidian, diamond.** All pre-loaded in inventory on spawn for build 1.

**Drill (mining)**
- No crosshair/cursor HUD element. Instead, a **ghost preview shape floats in the world in front of the player** — a wireframe/translucent sphere or cube showing exactly what will be removed.
- **Right click:** toggle sphere ↔ cube.
- **Left click (hold):** mine — subtract that exact shape. Cube leaves a perfect sharp-edged cube hole; sphere leaves a perfect smooth spherical hole. No gaps, no crumbs.
- **Scroll wheel:** size. Tiers stone→obsidian use **discrete size steps**; each tier up unlocks one step larger AND one step smaller than the previous tier's range. **Diamond removes steps entirely — smooth continuous sizing.**
- Higher tier = faster mine speed (shorter action time / higher repeat rate).

**Dispenser (placing)** — "drill in reverse"
- Loaded by **drag-and-dropping a material stack onto the dispenser in the inventory UI.**
- Model: gravity-gun-ish prop; a sphere of the loaded material visibly sits at the end of the barrel. Hotbar slot shows dispenser icon + small material icon overlay.
- Same ghost preview, same right-click shape toggle, same scroll sizing and tier step rules. Left click unions the shape into the world with the loaded material; surrounding geometry connects seamlessly.
- Higher tier = larger sizes + faster placement; diamond = smooth sizing + instant place.

**Grid snap (both tools)**
- **Tap F:** toggle snap grid on/off. When on, the ghost shape's position snaps to a world-aligned grid.
- **Hold F + press 1–0:** set grid cell size (10 preset sizes). Render a subtle grid visualization near the ghost while snap is on.

### Inventory / crafting
- **Hotbar:** 10 slots, keys 1–0. **E:** inventory — hotbar + 3 rows of 10 = 40 slots. **Q:** crafting screen (can be a stub panel in build 1).
- **No stack limits.** Counts render on icons.
- Drag-and-drop between slots; drag material onto dispenser to load it.

### Menus / worlds
- **Main menu:** Worlds / Options / Quit Game.
- **Worlds:** list, create (name + seed, random seed if blank), delete with confirm.
- Persistence: `localStorage` (or IndexedDB if edit lists get big) keyed by world — store seed, edit list, player position, inventory. Seed feeds terrain gen (irrelevant for the flat world, but wire it now).
- **Options:** at minimum mouse sensitivity, FOV, render distance. Esc = pause menu (resume / options / save & quit to title).

### Build 1 world
- Superflat infinite rock, bedrock layer at the bottom. Nothing else. The entire point of build 1 is that mining and placing feel *perfect*.

## Definition of done — Build 1
1. Cube subtract at any rotation-free position leaves crisp 90° interior corners. Sphere subtract leaves a smooth curve. Zero holes/gaps/z-fighting at chunk seams.
2. Place-then-mine and mine-then-place at overlapping positions resolve correctly (edit list order respected).
3. Bedrock cannot be mined at any tier or size.
4. All 5 tiers of both tools work with correct size-step ranges; diamond sizing is smooth; diamond dispenser is instant.
5. Grid snap + F-hold grid sizing works for both tools.
6. Worlds save/load and round-trip the edit list exactly.
7. Stable 60fps on a mid-range machine while mining continuously (chunk re-mesh must be incremental, ideally amortized across frames or in a worker via embedded blob).

## Working style
- Targeted fixes over rewrites. If I report a regression, find the cause; don't rebuild the system.
- When given latitude ("dealer's choice"), take it, but keep the spec above inviolate.
- Log meaningful decisions and known issues in DEVLOG.md as you go.
