/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

jest.dontMock('../Heap');

describe('Heap', () => {
  let Heap;
  let heap;

  beforeEach(() => {
    Heap = require('../Heap');
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

  describe('size()', () => {
    it('returns 0 for an empty heap', () => {
      expect(heap.size()).toBe(0);
    });

    it('grows by 1 for each item inserted on the heap', () => {
      heap.insert(10);
      expect(heap.size()).toBe(1);
      heap.insert(5);
      expect(heap.size()).toBe(2);
      heap.insert(15);
      expect(heap.size()).toBe(3);
    });

    it('decreases by 1 for each item extracted from the heap', () => {
      heap.insert(5);
      heap.insert(10);
      heap.insert(1);
      expect(heap.size()).toBe(3);
      heap.extract();
      expect(heap.size()).toBe(2);
      heap.extract();
      expect(heap.size()).toBe(1);
      heap.extract();
    });
  });
});
