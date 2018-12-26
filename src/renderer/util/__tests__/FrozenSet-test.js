/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

import FrozenSet from '../FrozenSet';

describe('FrozenSet', () => {
  describe('without arguments', () => {
    it('rejects add() attempts', () => {
      expect(() => new FrozenSet().add(1)).toThrow(/Mutation Violation/);
    });

    it('rejects clear() attempts', () => {
      expect(() => new FrozenSet().clear()).toThrow(/Mutation Violation/);
    });

    it('rejects delete() attempts', () => {
      expect(() => new FrozenSet().delete(1)).toThrow(/Mutation Violation/);
    });
  });

  describe('with an initial iterable', () => {
    let set;

    beforeEach(() => {
      set = new FrozenSet([1, 2, 3]);
    });

    it('rejects add() attempts', () => {
      expect(() => set.add(1)).toThrow(/Mutation Violation/);
    });

    it('rejects clear() attempts', () => {
      expect(() => set.clear()).toThrow(/Mutation Violation/);
    });

    it('rejects delete() attempts', () => {
      expect(() => set.delete(1)).toThrow(/Mutation Violation/);
    });

    it('supports has() calls', () => {
      expect(set.has(2)).toBe(true);
      expect(set.has(5)).toBe(false);
    });

    it('can be used to initialize another set', () => {
      const newSet = new Set(set);
      expect(newSet.has(1)).toBe(true);
    });
  });

  describe('with a constructor callback', () => {
    let set;

    beforeEach(() => {
      set = new FrozenSet([1, 2, 3], s => s.add(4));
    });

    it('rejects add() attempts', () => {
      expect(() => set.add(1)).toThrow(/Mutation Violation/);
    });

    it('rejects clear() attempts', () => {
      expect(() => set.clear()).toThrow(/Mutation Violation/);
    });

    it('rejects delete() attempts', () => {
      expect(() => set.delete(1)).toThrow(/Mutation Violation/);
    });

    it('supports has() calls', () => {
      expect(set.has(2)).toBe(true);
      expect(set.has(5)).toBe(false);
    });

    it('retains any side effects applied in the callback', () => {
      expect(set.has(4)).toBe(true);
    });
  });

  describe('clone()', () => {
    let set;

    beforeEach(() => {
      set = new FrozenSet([1, 2, 3]);
    });

    it('returns a modified clone of the original', () => {
      const clone = set.clone(mutable => {
        mutable.delete(2);
        mutable.add(4);
      });
      expect(Array.from(clone.values())).toEqual([1, 3, 4]);
      expect(clone).not.toBe(set);
    });

    it('leaves the original object unchanged', () => {
      const clone = set.clone(mutable => mutable.clear());
      expect(Array.from(set.values())).toEqual([1, 2, 3]);
    });
  });
});
