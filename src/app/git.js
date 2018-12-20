/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import run from './run';

function git(...args: $ReadOnlyArray<string>): Promise<string> {
  return run('git', ...args);
}

export default git;
