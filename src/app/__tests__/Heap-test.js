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
  });
});
