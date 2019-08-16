#!/usr/bin/env node

/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

const rollup = require('rollup');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const builtins = ['fs', 'os', 'path', 'util'];

// TODO: decide whether this should be called from electron-packager callback or
// run as a separate script.... (probably the latter, because I want to
// overwrite the index.js files)

// may want to do this programatically (without bundle.write) so i can write my own chunks in the right place...
// also, not passing an array to `input` because it factors out common chunks
// and breaks stuff
async function build() {
  const bundle = await rollup.rollup({
    external: builtins,
    input: [
      'dist/renderer/index.js',
      // 'dist/main/index.js',
    ],
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
        ]
      }),
      replace({
        // Seems rollup does some basic dead-code elimination; this is enough.
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  });

  await bundle.write({
    dir: '/tmp', // TOOD: fix
    format: 'cjs',
  });
}

build();
