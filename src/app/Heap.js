/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

type WrappedValue = {
  value: mixed;
  insertionCounter: number;
};

/**
 * Given two equally-valued keys, we use this counter to track insertion order
 * and serve as a tie-breaker; this allows us to maintain FIFO behavior for
 * equal-priority items.
 *
 * @see http://stackoverflow.com/a/20022710/2103996
 */
let insertionIndex = 0;

/**
 * Annotate `value` with insertion order information.
 */
function wrapValue(value: mixed): WrappedValue {
  return {
    value,
    insertionIndex: insertionIndex++,
  };
}

/**
 * Retrieve the original wrapped value from an item previously annotated with
 * insertion order information.
 */
function unwrapValue(value: WrappedValue): mixed {
  return value.value;
}

/**
 * Binary min-heap implementation with FIFO behavior for equal-priority items,
 * for use as a priority queue.
 */
export default class Heap {
  constructor(keyGetter: ?(value: mixed) => number) {
    this._emptySlot = 0;
    this._keyGetter = keyGetter || (x => x);
    this._storage = [];
  }

  insert(value: mixed): void {
    // Insert into first empty slot.
    this._storage[this._emptySlot] = wrapValue(value);

    // Bubble upwards until heap property is restored.
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
      // Grab root.
      const extracted = this._storage[0];
      this._emptySlot--;

      // Move last item to root.
      this._storage[0] = this._storage[this._emptySlot];
      this._storage.pop();
      this._trickleDown(0);

      return unwrapValue(extracted);
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
    // Trickle down until heap property is restored.
    const [leftChildIndex, rightChildIndex] = this._childIndices(parentIndex);

    if (!this._respectsHeapProperty(parentIndex, leftChildIndex) ||
        !this._respectsHeapProperty(parentIndex, rightChildIndex)) {
      // Swap with smallest child.
      const smallestChildIndex = this._smallestChildIndex(parentIndex);
      this._swap(smallestChildIndex, parentIndex);
      this._trickleDown(smallestChildIndex);
    }
  }

  _smallestChildIndex(index: number): number {
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

    // Use key getter to extract sorting key.
    const parent = this._storage[parentIndex];
    const child = this._storage[childIndex];
    const parentKey = this._keyGetter(unwrapValue(parent));
    const childKey = this._keyGetter(unwrapValue(child));

    // Use insertion index as a tiebreaker for equal keys.
    if (parentKey === childKey) {
      return parent.insertionIndex < child.insertionIndex;
    } else {
      return parentKey < childKey;
    }
  }
}
