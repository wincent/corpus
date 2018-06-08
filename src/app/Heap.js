/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

type WrappedValue<T> = {|
  value: T,
  insertionIndex: number,
|};

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
function wrapValue<T>(value: T): WrappedValue<T> {
  return {
    value,
    insertionIndex: insertionIndex++,
  };
}

/**
 * Retrieve the original wrapped value from an item previously annotated with
 * insertion order information.
 */
function unwrapValue<T>(value: WrappedValue<T>): T {
  return value.value;
}

/**
 * Binary min-heap implementation with FIFO behavior for equal-priority items,
 * for use as a priority queue.
 */
export default class Heap<T: mixed> {
  _emptySlot: number;
  _keyGetter: (value: T) => number;
  _storage: Array<WrappedValue<T>>;

  constructor(keyGetter: ?(value: T) => number) {
    this._emptySlot = 0;
    this._keyGetter = keyGetter || Number;
    this._storage = [];
  }

  insert(value: T): void {
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

  extract(): ?T {
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

  get size(): number {
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

    if (
      !this._respectsHeapProperty(parentIndex, leftChildIndex) ||
      !this._respectsHeapProperty(parentIndex, rightChildIndex)
    ) {
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
    } else if (this._compare(rightChild, leftChild) === -1) {
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
      2 * (index + 1), // right child
    ];
  }

  /**
   * Returns the relative ordering of wrapped values `a` and `b`. That is:
   *
   * Returns -1 if `a` comes before `b`.
   * Returns 1 if `a` comes after `b`.
   *
   * Note that we can never return 0 because `a` can never be ordered "the same"
   * as `b` thanks to our use of the `insertionIndex` tie-breaker.
   */
  _compare(a: WrappedValue<T>, b: WrappedValue<T>): number {
    const aKey = this._keyGetter(unwrapValue(a));
    const bKey = this._keyGetter(unwrapValue(b));
    if (aKey === bKey) {
      return a.insertionIndex < b.insertionIndex ? -1 : 1;
    } else {
      return aKey < bKey ? -1 : 1;
    }
  }

  /**
   * Returns `true` when the item at `parentIndex` is "smaller" than the one at
   * `childIndex`.
   */
  _respectsHeapProperty(parentIndex: number, childIndex: number): boolean {
    const parent = this._storage[parentIndex];
    const child = this._storage[childIndex];

    if (
      parent === undefined || // child is root
      child === undefined // parent is leaf
    ) {
      return true;
    }

    return this._compare(parent, child) === -1;
  }
}
