/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Promise from 'bluebird';
import {spawn} from 'child_process';

function run(command, ...args: Array<string>): Promise {
  const promise = new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';

    child.stdout.on('data', data => stdout += data);

    child.on('error', error => {
      if (promise.isPending()) {
        reject(error);
      }
    });

    child.on('close', code => {
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

export default run;
