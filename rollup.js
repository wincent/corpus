#!/usr/bin/env node

/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

const rollup = require('rollup');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

// TODO: decide whether this should be called from electron-packager callback or
// run as a separate script.... (probably the latter, because I want to
// overwrite the index.js files)
async function build() {
  const bundle = await rollup.rollup({
    external: ['fs', 'path', 'util'],
    input: 'dist/renderer/index.js', // TODO: same for main bundle
    plugins: [
      resolve(),
      commonjs(),
      replace({
        // could also do this with babel...
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      babel({
        generatorOpts: {
          minified: true,
        },
        plugins: [
          'babel-plugin-minify-dead-code-elimination'
        ],
        externalHelpers: false
      })
    ],
  });

  await bundle.write({
    file: '/tmp/example.js',
    format: 'cjs',
  });
}

build();
