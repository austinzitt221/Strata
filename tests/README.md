# Headless tests

Playwright + SwiftShader runs of `strata.html`. Each `bNNtest.js` covers a
build; `smoke.js` opens a world, mines once, checks every vehicle kit has a
label and an icon, and saves.

Setup (once, in this directory):

    npm pack three@0.164.1 && tar xzf three-0.164.1.tgz package/build/three.module.js \
      && cp package/build/three.module.js . && rm -rf package three-0.164.1.tgz

The tests route the CDN request for Three.js to that local copy. Chromium is
expected at `/opt/pw-browsers/chromium` (edit `executablePath` otherwise).

Run:

    NODE_PATH=$(npm root -g) node smoke.js
    NODE_PATH=$(npm root -g) node b62test.js

Every suite prints one JSON line per scenario and ends with `errors: none`
when no page error fired. Screenshots land beside the script.

## Performance tools (Build 115)

    NODE_PATH=$(npm root -g) node profile.js ../strata.html spawn,city,fly,mine

profiles the real frame loop with the Chrome CPU profiler in each scenario
and prints each function's self time per frame (`CALLERS=fnName,...` adds
the call paths to those functions; `REPORT=1` prints the game's own
Shift+F3 stopwatch report as well). SwiftShader makes rendering and GPU
uploads look far slower than a real GPU would: trust the JavaScript
numbers, not the `render` ones.

    NODE_PATH=$(npm root -g) node abwater.js old.html new.html
    NODE_PATH=$(npm root -g) node abstream.js old.html new.html

run the same scenario on two builds and print SAME when the water comes out
identical cell for cell (`abwater`), or when the streaming disc marks the
same chunks empty, banded and queued on Earth, Strata and the Moon
(`abstream`). Use them for any change that should be faster, not different.
