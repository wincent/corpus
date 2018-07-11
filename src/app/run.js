/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {spawn} from 'child_process';

function run(command: string, ...args: Array<string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';
    let pending = true;

    function log(message) {
      /* eslint-disable no-console */
      console.error(message);
      console.error(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      /* eslint-enable no-console */
    }

    child.stderr.on('data', data => (stderr += data));
    child.stdout.on('data', data => (stdout += data));

    child.on('error', error => {
      if (pending) {
        pending = false;
        log(`error: ${error}`);
        reject(error);
      }
    });

    child.on('close', code => {
      if (code) {
        if (pending) {
          pending = false;
          log(`exit code: ${code}`);
          reject(code);
        }
      } else {
        pending = false;
        resolve(stdout);
      }
    });
  });
}

export default run;
