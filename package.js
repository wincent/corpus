#!/usr/bin/env node

/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

const packager = require('electron-packager')
const path = require('path');

async function build() {
  const appPaths = await packager({
    afterPrune: [
      (buildPath, electronVersion, platform, arch, done) => {
        console.log(...arguments);
        done();
      },
    ],
    appBundleId: 'com.wincent.corpus',
    appCategoryType: 'public.app-category.productivity',
    appCopyright: 'Copyright © 2019-present Greg Hurrell',
    dir: __dirname,
    icon: path.join(__dirname, 'gfx/release/corpus.icns'),
  });

  console.log(`Electron app bundles created:\n${appPaths.join("\n")}`);
}

build();
