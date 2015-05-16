// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

jest.dontMock('../stringFinder');

const stringFinder = require('../stringFinder');

describe('stringFinder', () => {
  let haystack;

  function match(needle) {
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

  it('matches normal strings', () => {
    expect(match('document')).toBe(true);

    expect(match('science')).toBe(false);
  });

  it('matches substrings of words', () => {
    expect(match('eatur')).toBe(true);
    expect(match('men')).toBe(true);
    expect(match('H')).toBe(true);

    expect(match('z')).toBe(false);
  });

  it('matches multiline strings', () => {
    expect(match('words')).toBe(true);
  });

  it('matches strings case insensitively', () => {
    expect(match('MixedCase')).toBe(true);
    expect(match('mixedcase')).toBe(true);
  });

  it('matches RegExp special characters', () => {
    // Finds literal match.
    expect(match('\\d+')).toBe(true);

    // Ignores thing that would be a match if it were used as a RegExp.
    expect(match('.+')).toBe(false);
  });

  it('matches URLs', () => {
    // Testing these because they have literal `/` in them.
    expect(match('http://example.com')).toBe(true);
  });
});
