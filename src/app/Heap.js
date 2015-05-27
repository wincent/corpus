/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

export default class Heap {
  constructor() {
    this._storage   = [];
    this._emptySlot = 0;
  }

  insert(value) {
    // insert into first empty slot
    this._storage[this._emptySlot] = value;

    // bubble upwards until heap property is restored
    var childIdx  = this._emptySlot,
        parentIdx = this._parentIndex(childIdx),
        parent    = this._storage[parentIdx];
    while (!this._respectsHeapProperty(parentIdx, childIdx)) {
      var swapValue           = this._storage[childIdx];
      this._storage[childIdx]  = this._storage[parentIdx];
      this._storage[parentIdx] = swapValue;
      childIdx = parentIdx;
      parentIdx = this._parentIndex(childIdx);
    }

    this._emptySlot++;
  }

  extract() {
    if (!this._emptySlot) {
      return; // heap is empty
    }

    // grab root
    var extracted = this._storage[0];
    this._emptySlot--;

    // move last item to root
    this._storage[0] = this._storage[this._emptySlot];
    this._storage.pop();
    this._trickleDown(0);

    return extracted;
  }

  _trickleDown(fromIdx) {
    // trickle down until heap property is restored
    var parentIdx     = fromIdx,
        childIndices  = this_childIndices(parentIdx),
        leftChildIdx  = childIndices[0],
        rightChildIdx = childIndices[1],
        leftChild     = this._storage[leftChildIdx],
        rightChild    = this._storage[rightChildIdx];

    if (!this._respectsHeapProperty(parentIdx, leftChildIdx) ||
        !this._respectsHeapProperty(parentIdx, rightChildIdx)) {
      // min heaps: will swap with smallest child;
      var preferredChild = this._preferredChild(parentIdx),
          swapIdx        = preferredChild[0],
          swapChild      = preferredChild[1];
      this._storage[swapIdx] = this._storage[parentIdx];
      this._storage[parentIdx] = swapChild;
      this._trickleDown(swapIdx);
    }
  }

  _preferredChild(idx) {
    var childIndices  = this_childIndices(idx),
        leftChildIdx  = childIndices[0],
        rightChildIdx = childIndices[1],
        leftChild     = this._storage[leftChildIdx],
        rightChild    = this._storage[rightChildIdx];

    if (typeof leftChild === "undefined") {
      return [rightChildIdx, rightChild];
    } else if (typeof rightChild === "undefined") {
      return [leftChildIdx, leftChild];
    } else if (rightChild < leftChild) {
      return [rightChildIdx, rightChild];
    } else {
      return [leftChildIdx, leftChild];
    }
  }

  _parentIndex(idx) {
    return Math.floor((idx - 1) / 2);
  }

  _childIndices(idx) {
    return [
      2 * (idx + 1) - 1, // left child
      2 * (idx + 1)      // right child
    ];
  }

  _respectsHeapProperty(parentIdx, childIdx) {
    if (typeof this._storage[parentIdx] === "undefined" || // child is root
        typeof this._storage[childIdx] === "undefined") {  // parent is leaf
          return true;
    }

    return this._storage[parentIdx] <= this._storage[childIdx];
  }
}

// Tests.
var assert = require('assert');

function extractAll(heap) {
  var result = [],
      extracted;
  while (extracted = heap.extract()) {
    result.push(extracted);
  }
  return result;
};

console.log("Running tests");

var h = new Heap();
assert.equal(h.extract(), undefined, "extract() returns nothing if heap is empty");
h.insert(1);
assert.equal(h.extract(), 1, "extract() returns a value");
assert.equal(h.extract(), undefined, "extract() removes values from the heap");
h.insert(10);
h.insert(3);
h.insert(12);
var result = extractAll(h);
assert.deepEqual(result, [3, 10, 12], "extract() always returns the minimum value");

console.log("Done");
