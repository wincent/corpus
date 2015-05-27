/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Promise from 'bluebird';
import {spawn} from 'child_process';

function git(...args: Array<string>): Promise {
  const promise = new Promise((resolve, reject) => {
    const child = spawn('git', args);
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

export default git;
