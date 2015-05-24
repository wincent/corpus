/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Promise from 'bluebird';
import {spawn} from 'child_process';

function run(subcommand, ...args) {
  const promise = new Promise((resolve, reject) => {
    const git = spawn('git', [subcommand, ...args]);
    let stdout = '';

    git.stdout.on('data', data => stdout += data);

    git.on('error', error => {
      if (promise.isPending()) {
        reject(error);
      }
    });

    git.on('close', code => {
      if (code) {
        if (promise.isPending()) {
          reject(code);
        }
      } else {
        resolve(stdout);
      }
    });

  });

  return promise;
}

const git = {
  init(...args) {
    return run('init', ...args);
  },
};

export default git;
