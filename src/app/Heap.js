/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

/**
 * Binary min-heap implementation, for use as a priority queue.
 */
export default class Heap {
  constructor(keyGetter: ?(value: mixed) => number) {
    this._emptySlot = 0;
    this._keyGetter = keyGetter || (x => x);
    this._storage = [];
  }

  insert(value: mixed): void {
    // insert into first empty slot
    this._storage[this._emptySlot] = value;

    // bubble upwards until heap property is restored
    let childIndex = this._emptySlot;
    let parentIndex = this._parentIndex(childIndex);
    while (!this._respectsHeapProperty(parentIndex, childIndex)) {
      this._swap(childIndex, parentIndex);
      childIndex = parentIndex;
      parentIndex = this._parentIndex(childIndex);
    }

    this._emptySlot++;
  }

  extract(): mixed {
    if (this._emptySlot) {
      // grab root
      const extracted = this._storage[0];
      this._emptySlot--;

      // move last item to root
      this._storage[0] = this._storage[this._emptySlot];
      this._storage.pop();
      this._trickleDown(0);

      return extracted;
    }
  }

  size(): number {
    return this._emptySlot;
  }

  _swap(index: number, otherIndex: number): void {
    const value = this._storage[index];
    this._storage[index] = this._storage[otherIndex];
    this._storage[otherIndex] = value;
  }

  _trickleDown(parentIndex: number): void {
    // trickle down until heap property is restored
    const [leftChildIndex, rightChildIndex] = this._childIndices(parentIndex);

    if (!this._respectsHeapProperty(parentIndex, leftChildIndex) ||
        !this._respectsHeapProperty(parentIndex, rightChildIndex)) {
      // min heaps: will swap with smallest child;
      const preferredChildIndex = this._preferredChildIndex(parentIndex);
      this._swap(preferredChildIndex, parentIndex);
      this._trickleDown(preferredChildIndex);
    }
  }

  _preferredChildIndex(index: number): number {
    const [leftChildIndex, rightChildIndex] = this._childIndices(index);
    const leftChild = this._storage[leftChildIndex];
    const rightChild = this._storage[rightChildIndex];

    if (leftChild === undefined) {
      return rightChildIndex;
    } else if (rightChild === undefined) {
      return leftChildIndex;
    } else if (rightChild < leftChild) {
      return rightChildIndex;
    } else {
      return leftChildIndex;
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

    return (
      this._keyGetter(this._storage[parentIndex]) <=
      this._keyGetter(this._storage[childIndex])
    );
  }
}
