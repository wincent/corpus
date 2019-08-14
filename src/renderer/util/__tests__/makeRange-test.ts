/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import makeRange from '../makeRange';

describe('makeRange()', () => {
  it('creates a range of size 0', () => {
    expect(makeRange(0)).toEqual([]);
  });

  it('creates a range of size 1', () => {
    expect(makeRange(1)).toEqual([0]);
  });

  it('creates a range larger than size 1', () => {
    expect(makeRange(5)).toEqual([0, 1, 2, 3, 4]);
  });
});
