/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

jest.dontMock('../normalizeText');

const normalizeText = require('../normalizeText');

describe('normalizeText()', () => {
  it('does nothing to empty strings', () => {
    expect(normalizeText('')).toBe('');
  });

  it('adds a missing trailing newline', () => {
    expect(normalizeText('foo')).toBe('foo\n');
  });

  it('does not add a newline if one is already present', () => {
    expect(normalizeText('foo\n')).toBe('foo\n');
  });

  it('does not compress multiple trailing newlines', () => {
    expect(normalizeText('foo\n\n\n')).toBe('foo\n\n\n');
  });
});
