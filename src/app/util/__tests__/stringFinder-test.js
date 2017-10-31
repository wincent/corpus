/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

jest.dontMock('../stringFinder');

import stringFinder from '../stringFinder';

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

  it('finds normal strings', () => {
    expect(find('document')).toBe(true);

    expect(find('science')).toBe(false);
  });

  it('finds substrings of words', () => {
    expect(find('eatur')).toBe(true);
    expect(find('men')).toBe(true);
    expect(find('H')).toBe(true);

    expect(find('z')).toBe(false);
  });

  it('finds multiline strings', () => {
    expect(find('words')).toBe(true);
  });

  it('finds strings case insensitively', () => {
    expect(find('MixedCase')).toBe(true);
    expect(find('mixedcase')).toBe(true);
  });

  it('finds RegExp special characters', () => {
    // Finds literal match.
    expect(find('\\d+')).toBe(true);

    // Ignores thing that would be a match if it were used as a RegExp.
    expect(find('.+')).toBe(false);
  });

  it('finds URLs', () => {
    // Testing these because they have literal `/` in them.
    expect(find('http://example.com')).toBe(true);
  });
});
