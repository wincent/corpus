/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

jest.dontMock('../Heap');

describe('Heap', () => {
  let Heap;
  let heap;

  beforeEach(() => {
    Heap = require('../Heap').default;
    heap = new Heap();
  });

  describe('extract()', () => {
    it('returns nothing if heap is empty', () => {
      expect(heap.extract()).toBe(undefined);
    });

    it('returns a value', () => {
      heap.insert(1);
      expect(heap.extract()).toBe(1);
    });

    it('always returns the minimum value', () => {
      heap.insert(10);
      heap.insert(3);
      heap.insert(12);
      expect(heap.extract()).toBe(3);
      expect(heap.extract()).toBe(10);
      expect(heap.extract()).toBe(12);
      expect(heap.extract()).toBe(undefined);
    });

    it('accepts a key getter function', () => {
      heap = new Heap(value => value.weight);
      heap.insert({weight: 0, value: 'foo'});
      heap.insert({weight: -10, value: 'bar'});
      heap.insert({weight: 5, value: 'baz'});
      expect(heap.extract()).toEqual({weight: -10, value: 'bar'});
      expect(heap.extract()).toEqual({weight: 0, value: 'foo'});
      expect(heap.extract()).toEqual({weight: 5, value: 'baz'});
      expect(heap.extract()).toBe(undefined);
    });

    it('returns equal-keyed items in FIFO order', () => {
      heap = new Heap(value => value.weight);
      heap.insert({weight: 20, value: 'foo'});
      heap.insert({weight: 0, value: 'bar'});
      heap.insert({weight: 20, value: 'baz'});
      heap.insert({weight: 0, value: 'abc'});
      heap.insert({weight: 20, value: 'xyz'});
      expect(heap.extract()).toEqual({weight: 0, value: 'bar'});
      expect(heap.extract()).toEqual({weight: 0, value: 'abc'});
      expect(heap.extract()).toEqual({weight: 20, value: 'foo'});
      expect(heap.extract()).toEqual({weight: 20, value: 'baz'});
      expect(heap.extract()).toEqual({weight: 20, value: 'xyz'});
      expect(heap.extract()).toBe(undefined);

      // Same, but with some alternation of insertion and extraction.
      heap.insert({weight: 20, value: 'foo'});
      heap.insert({weight: 0, value: 'bar'});
      expect(heap.extract()).toEqual({weight: 0, value: 'bar'});
      expect(heap.extract()).toEqual({weight: 20, value: 'foo'});
      heap.insert({weight: 20, value: 'baz'});
      heap.insert({weight: 0, value: 'abc'});
      heap.insert({weight: 20, value: 'xyz'});
      expect(heap.extract()).toEqual({weight: 0, value: 'abc'});
      expect(heap.extract()).toEqual({weight: 20, value: 'baz'});
      expect(heap.extract()).toEqual({weight: 20, value: 'xyz'});
      expect(heap.extract()).toBe(undefined);
    });
  });

  describe('size', () => {
    it('returns 0 for an empty heap', () => {
      expect(heap.size).toBe(0);
    });

    it('grows by 1 for each item inserted on the heap', () => {
      heap.insert(10);
      expect(heap.size).toBe(1);
      heap.insert(5);
      expect(heap.size).toBe(2);
      heap.insert(15);
      expect(heap.size).toBe(3);
    });

    it('decreases by 1 for each item extracted from the heap', () => {
      heap.insert(5);
      heap.insert(10);
      heap.insert(1);
      expect(heap.size).toBe(3);
      heap.extract();
      expect(heap.size).toBe(2);
      heap.extract();
      expect(heap.size).toBe(1);
      heap.extract();
    });
  });

  describe('smallest child bug', () => {
    // In this bug, we were comparing wrapped values with wrapped values when
    // trying to determine the smallest value. In JS, `object < otherObject`
    // will always return `false`, which effectively meant we were always
    // swapping with the left child instead of the smallest.
    //
    // Even prior to the introduction of wrapping, this bug would have existed
    // when storing objects in the heap and using custom key getters, which is
    // exactly what we do in Corpus. This is why I repeat the tests below with a
    // custom getter.
    it('actually swaps with the smallest child when trickling down', () => {
      // Build up heap:
      //
      //      [1]
      //     /  \
      //   [10] [5]
      //   /
      // [12]
      heap.insert(1);
      heap.insert(10);
      heap.insert(5);
      heap.insert(12);

      // Extract, which should produce:
      //
      //    [5]
      //   /  \
      // [12] [10]
      //
      // But due to the bug was producing:
      //
      //    [10]
      //   /   \
      // [12]  [5]
      expect(heap.extract()).toBe(1);

      // We were returning 10 here instead of 5.
      expect(heap.extract()).toBe(5);

      // Same test, but using a custom getter.
      heap = new Heap(value => value.weight);
      heap.insert({weight: 1, value: 'foo'});
      heap.insert({weight: 10, value: 'bar'});
      heap.insert({weight: 5, value: 'baz'});
      heap.insert({weight: 12, value: 'abc'});
      expect(heap.extract()).toEqual({weight: 1, value: 'foo'});
      expect(heap.extract()).toEqual({weight: 5, value: 'baz'});
    });
  });
});
