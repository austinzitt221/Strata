# DEVLOG — STRATA

Append decisions, known issues, and playtest feedback here. Newest first.

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
