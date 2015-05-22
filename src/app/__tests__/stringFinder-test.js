/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

jest.dontMock('../stringFinder');

const stringFinder = require('../stringFinder');

describe('stringFinder', () => {
  let haystack;

  function find(needle) {
    return haystack.search(stringFinder(needle)) !== -1;
  }

  beforeEach(() => {
    haystack = `
      Here is a multiline document with some features in it.
      It has words with MixedCase.
      It has http://example.com/RegExpSpecialCharacters.
      It has /\\d+ literal RegExps/ in it.
    `;
  });

  it('findes normal strings', () => {
    expect(find('document')).toBe(true);

    expect(find('science')).toBe(false);
  });

  it('findes substrings of words', () => {
    expect(find('eatur')).toBe(true);
    expect(find('men')).toBe(true);
    expect(find('H')).toBe(true);

    expect(find('z')).toBe(false);
  });

  it('findes multiline strings', () => {
    expect(find('words')).toBe(true);
  });

  it('findes strings case insensitively', () => {
    expect(find('MixedCase')).toBe(true);
    expect(find('mixedcase')).toBe(true);
  });

  it('findes RegExp special characters', () => {
    // Finds literal match.
    expect(find('\\d+')).toBe(true);

    // Ignores thing that would be a match if it were used as a RegExp.
    expect(find('.+')).toBe(false);
  });

  it('findes URLs', () => {
    // Testing these because they have literal `/` in them.
    expect(find('http://example.com')).toBe(true);
  });
});
