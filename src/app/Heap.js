/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

export default class Heap {
  constructor() {
    this._storage = [];
    this._emptySlot = 0;
  }

  insert(value: number): void {
    // insert into first empty slot
    this._storage[this._emptySlot] = value;

    // bubble upwards until heap property is restored
    var childIndex = this._emptySlot;
    var parentIndex = this._parentIndex(childIndex);
    while (!this._respectsHeapProperty(parentIndex, childIndex)) {
      var swapValue = this._storage[childIndex];
      this._storage[childIndex] = this._storage[parentIndex];
      this._storage[parentIndex] = swapValue;
      childIndex = parentIndex;
      parentIndex = this._parentIndex(childIndex);
    }

    this._emptySlot++;
  }

  extract(): number {
    if (this._emptySlot) {
      // grab root
      var extracted = this._storage[0];
      this._emptySlot--;

      // move last item to root
      this._storage[0] = this._storage[this._emptySlot];
      this._storage.pop();
      this._trickleDown(0);

      return extracted;
    }
  }

  _trickleDown(fromIndex: number): void {
    // trickle down until heap property is restored
    var parentIndex = fromIndex;
    var childIndices = this._childIndices(parentIndex);
    var leftChildIndex = childIndices[0];
    var rightChildIndex = childIndices[1];

    if (!this._respectsHeapProperty(parentIndex, leftChildIndex) ||
        !this._respectsHeapProperty(parentIndex, rightChildIndex)) {
      // min heaps: will swap with smallest child;
      var preferredChild = this._preferredChild(parentIndex);
      var swapIndex = preferredChild[0];
      var swapChild = preferredChild[1];
      this._storage[swapIndex] = this._storage[parentIndex];
      this._storage[parentIndex] = swapChild;
      this._trickleDown(swapIndex);
    }
  }

  _preferredChild(index: number): [number, number] {
    var childIndices = this._childIndices(index);
    var leftChildIndex = childIndices[0];
    var rightChildIndex = childIndices[1];
    var leftChild = this._storage[leftChildIndex];
    var rightChild = this._storage[rightChildIndex];

    if (leftChild === undefined) {
      return [rightChildIndex, rightChild];
    } else if (rightChild === undefined) {
      return [leftChildIndex, leftChild];
    } else if (rightChild < leftChild) {
      return [rightChildIndex, rightChild];
    } else {
      return [leftChildIndex, leftChild];
    }
  }

  _parentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  _childIndices(index: number): [number, number] {
    return [
      2 * (index + 1) - 1, // left child
      2 * (index + 1)      // right child
    ];
  }

  _respectsHeapProperty(parentIndex: number, childIndex: number): boolean {
    if (this._storage[parentIndex] === undefined || // child is root
        this._storage[childIndex] === undefined) {  // parent is leaf
      return true;
    }

    return this._storage[parentIndex] <= this._storage[childIndex];
  }
}
