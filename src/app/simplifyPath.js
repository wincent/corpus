/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

/**
 * Simplifies path, replacing "$HOME" with "~".
 */
export default function simplifyPath(path: string): string {
  const homePrefix = process.env.HOME + '/';
  if (path.startsWith(homePrefix)) {
    return '~/' + path.slice(homePrefix.length);
  }
  return path;
}
