#!/usr/bin/env node

/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

const assert = require('assert');
const createDMG = require('electron-installer-dmg');
const packager = require('electron-packager');
const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const util = require('util');

const dmg = util.promisify(createDMG);
const writeFile = util.promisify(fs.writeFile);

const BUILTINS = ['fs', 'os', 'path', 'util'];

async function build() {
  // TODO: add support for debug build as well
  const icon = path.join(__dirname, 'gfx/release/corpus.icns');

  const appPaths = await packager({
    afterPrune: [
      async (buildPath, electronVersion, platform, arch, done) => {
        const cwd = process.cwd();

        try {
          process.chdir(buildPath);

          const chunks = await Promise.all(
            ['dist/renderer/index.js', 'dist/main/index.js'].map(
              async input => {
                const bundle = await rollup.rollup({
                  external: BUILTINS,
                  input,
                  plugins: [
                    resolve({
                      // Invert the normal order ("module", "main"): if you look at the tsc
                      // output, it is emitting requires like:
                      //
                      //    const frozen_set_1 = require('@wincent/frozen-set');
                      //
                      // and usages like:
                      //
                      //    new frozen_set_1.default()
                      //
                      // If we let rollup choose the the "module" offered in the package.json
                      // (index.mjs) then it inlines the module source code, assigns it to
                      // `lib.default`, and then tries to grab the default with a
                      // `getCjsExportFromNamespace()` helper, which plucks the "default" back
                      // out again. That would be all well and good, but it leaves the usage
                      // site as `new frozen_set_1.default()` (equivalent to `new
                      // FrozenSet.default()`), which of course won't work.
                      //
                      // On the other hand, if we force rollup to favor "main", then it uses
                      // its `createCommonjsModule()` helper, which basically makes
                      // a `exports` object with a `default` property that holds a
                      // reference do `FrozenSet`, and the `new frozen_set_1.default()` call
                      // will work.
                      mainFields: ['main', 'module'],
                    }),
                    commonjs({
                      ignore: [
                        // Cannot bundle because it uses __dirname, and bundling breaks it.
                        'electron',
                      ],
                    }),
                    replace({
                      // Seems rollup does some basic dead-code elimination; this is enough.
                      'process.env.NODE_ENV': JSON.stringify('production'),
                    }),
                  ],
                });

                const {output} = await bundle.generate({
                  format: 'cjs',
                });

                for (const chunk of output) {
                  assert.ok(
                    !chunk.isAsset,
                    'Expected a chunk but got an asset',
                  );

                  return [input, chunk.code];
                }
              },
            ),
          );

          for (const [chunk, contents] of chunks) {
            // TODO: delete everything else in dist/
            await writeFile(chunk, contents);
          }
        } finally {
          process.chdir(cwd);
        }

        done();
      },
    ],
    appBundleId: 'com.wincent.corpus',
    appCategoryType: 'public.app-category.productivity',
    appCopyright: 'Copyright © 2019-present Greg Hurrell',
    dir: __dirname,
    icon,
    ignore: [
      '[^/]+\\.dmg',
      '\\.[^/]+',
      'gfx',
      'master',
      'media',
      'next',
      'src',
      'tsconfig\\.[^/]+',
      'yarn.lock',
    ].map(pattern => `/${pattern}($|/)`),
    overwrite: true,
  });

  assert.strictEqual(
    appPaths.length,
    1,
    `Expected 1 path, got ${appPaths.length}`,
  );

  const appPath = appPaths[0];
  const name = require('./package.json').name;

  await dmg({
    appPath: path.join(appPath, `${name}.app`),
    icon,
    name,
    overwrite: true,
  });
}

build();
