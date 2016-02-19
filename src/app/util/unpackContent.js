/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

type Content = {
  body: string;
  tags: Array<string>;
  [metadata:string]: string;
};

type Offsets = {
  headersStart: number;
  headersEnd: number;
  bodyStart: number;
};

function getEmptyOffsets(): Offsets {
  return {
    headersStart: 0,
    headersEnd: 0,
    bodyStart: 0,
  };
}

function measureHeaders(blob: string): Offsets {
  // Simple approach would be to split on linebreaks and process line by line,
  // but blob may be quite large, so we make a RegExp-based scanner to avoid the
  // unnecessary allocations.
  const regExp = /([^\n]*)(?:\n|$)/g;

  // Skip over initial header start marker.
  let match = regExp.exec(blob);
  if (match[1] !== '---') {
    return getEmptyOffsets();
  }

  // Consume lines until hitting header end marker.
  const headersStart = match[0].length;
  while ((match = regExp.exec(blob))) {
    if (match[1] === '---\n' || match[1] === '---') {
      // Found end marker.
      const bodyStart = regExp.lastIndex;
      const headersEnd = regExp.lastIndex - match[0].length;
      return {
        bodyStart,
        headersEnd,
        headersStart,
      };
    }
  }

  // Got all the way to the end of the input without seeing the end marker.
  return getEmptyOffsets();
}

function unpackHeaders(string: string): Object {
  const headers = {};
  const regExp = /(\w+)[ \t]*:[ \t]*([^\n]*)(?:\n|$)/g;
  let match;
  while ((match = regExp.exec(string))) {
    headers[match[1]] = match[2].trim();
  }
  return headers;
}

export default function unpackContent(blob: string): Content {
  const {bodyStart, headersEnd, headersStart} = measureHeaders(blob);
  const headersString = blob.substring(headersStart, headersEnd);
  const metadata = unpackHeaders(headersString);
  metadata.tags = metadata.tags ? metadata.tags.split(/\s+/) : [];
  const body = blob.slice(bodyStart);
  return {
    body,
    ...metadata,
  };
}
