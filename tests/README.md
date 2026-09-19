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
