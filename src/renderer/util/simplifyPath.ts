/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
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
