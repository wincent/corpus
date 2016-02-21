/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

jest.dontMock('../clamp');

const clamp = require('../clamp');

describe('clamp', () => {
  it('clamps to the minimum when the value is too small', () => {
    expect(clamp(1, 3, 10)).toEqual(3); // +ve value, +ve lower bound
    expect(clamp(-1, 3, 10)).toEqual(3); // -ve value, +ve lower bound
    expect(clamp(-5, -3, 10)).toEqual(-3); // -ve value, -ve lower bound
  });

  it('clamps to the maximum when the value is too big', () => {
    expect(clamp(10, 3, 7)).toEqual(7); // +ve value, +ve upper bound
    expect(clamp(10, -5, -1)).toEqual(-1); // +ve value, -ve upper bound
    expect(clamp(-1, -5, -3)).toEqual(-3); // -ve value, -ve upper bound
  });

  it('returns the value unchanged when it is within bounds', () => {
    expect(clamp(5, 1, 9)).toEqual(5); // +ve value, +ve bounds
    expect(clamp(5, 5, 9)).toEqual(5); // +ve value, at lower bound
    expect(clamp(9, 5, 9)).toEqual(9); // +ve value, at upper bound

    expect(clamp(-5, -9, 9)).toEqual(-5); // -ve value, -ve/+ve bounds
    expect(clamp(-5, -9, -1)).toEqual(-5); // -ve value, -ve bounds
    expect(clamp(-9, -9, 9)).toEqual(-9); // -ve value, at lower bound
    expect(clamp(-5, -9, -5)).toEqual(-5); // -ve value, at upper bound
  });

  it('returns NaN for invalid bounds', () => {
    expect(isNaN(clamp(1, 10, 5))).toBe(true);
  });
});
