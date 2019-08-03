/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

/**
 * Returns a copy of the JSON input string with comments removed.
 */
export default function stripComments(json: string): string {
  let inComment = false;
  let inString = false;
  let output = '';
  for (let i = 0, max = json.length; i < max; i++) {
    let c = json[i];
    if (inComment) {
      if (c === '\n') {
        inComment = false;
      }
      continue;
    }
    if (c === '\\') {
      output += c;
      if (++i < max) {
        output += json[i];
      }
      continue;
    }
    if (c === '"') {
      inString = !inString;
    }
    if (c === '/' && !inString) {
      if (json[i + 1] === '/') {
        inComment = true;

        // Slurp preceding horizontal whitespace.
        output = output.replace(/[ \t]+$/, '');
        continue;
      }
    }
    output += c;
  }
  return output;
}
