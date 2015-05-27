(function(window) {
  "use strict";

  // Constructor
  window.Heap = function Heap(type) {
    if (type !== "min" && type !== "max") {
      throw new Error("type must be one of 'min' or 'max'");
    }
    this.type      = type;
    this.storage   = [];
    this.emptySlot = 0;
  };

  // Operations

  Heap.prototype.insert = function(value) {
    // insert into first empty slot
    this.storage[this.emptySlot] = value;

    // bubble upwards until heap property is restored
    var childIdx  = this.emptySlot,
        parentIdx = this.parentIdx(childIdx),
        parent    = this.storage[parentIdx];
    while (!this.respectsHeapProperty(parentIdx, childIdx)) {
      var swapValue           = this.storage[childIdx];
      this.storage[childIdx]  = this.storage[parentIdx];
      this.storage[parentIdx] = swapValue;
      childIdx = parentIdx;
      parentIdx = this.parentIdx(childIdx);
    }

    this.emptySlot++;
  };

  Heap.prototype.extract = function() {
    if (!this.emptySlot) {
      return; // heap is empty
    }

    // grab root
    var extracted = this.storage[0];
    this.emptySlot--;

    // move last item to root
    this.storage[0] = this.storage[this.emptySlot];
    this.storage.pop();
    this.trickleDown(0);

    return extracted;
  };

  // Batch insert values into the heap in O(n) time.
  Heap.prototype.heapify = function(values) {
    // insert all values into array
    this.storage = this.storage.concat(values);
    this.emptySlot = this.storage.length;

    // starting at last non-leaf node, bubble root of subtree downward (as in
    // extraction) until heap property restored
    for (var i = Math.floor(this.emptySlot / 2) - 1; i >= 0; i--) {
      this.trickleDown(i);
    }
  };

  // Low-level support methods

  Heap.prototype.trickleDown = function(fromIdx) {
    // trickle down until heap property is restored
    var parentIdx     = fromIdx,
        childIndices  = this.childIndices(parentIdx),
        leftChildIdx  = childIndices[0],
        rightChildIdx = childIndices[1],
        leftChild     = this.storage[leftChildIdx],
        rightChild    = this.storage[rightChildIdx];

    if (!this.respectsHeapProperty(parentIdx, leftChildIdx) ||
        !this.respectsHeapProperty(parentIdx, rightChildIdx)) {
      // for min heaps, will swap with smallest child;
      // for max heaps, will swap with largest child
      var preferredChild = this.preferredChild(parentIdx),
          swapIdx        = preferredChild[0],
          swapChild      = preferredChild[1];
      this.storage[swapIdx] = this.storage[parentIdx];
      this.storage[parentIdx] = swapChild;
      this.trickleDown(swapIdx);
    }
  };

  Heap.prototype.preferredChild = function(idx) {
    var childIndices  = this.childIndices(idx),
        leftChildIdx  = childIndices[0],
        rightChildIdx = childIndices[1],
        leftChild     = this.storage[leftChildIdx],
        rightChild    = this.storage[rightChildIdx];

    if (typeof leftChild === "undefined") {
      return [rightChildIdx, rightChild];
    } else if (typeof rightChild === "undefined") {
      return [leftChildIdx, leftChild];
    } else if (this.type === 'min' && rightChild < leftChild ||
               this.type === 'max' && rightChild > leftChild) {
      return [rightChildIdx, rightChild];
    } else {
      return [leftChildIdx, leftChild];
    }
  };

  Heap.prototype.parentIdx = function(idx) {
    return Math.floor((idx - 1) / 2);
  };

  Heap.prototype.childIndices = function(idx) {
    return [
      2 * (idx + 1) - 1, // left child
      2 * (idx + 1)      // right child
    ];
  };

  Heap.prototype.respectsHeapProperty = function(parentIdx, childIdx) {
    if (typeof this.storage[parentIdx] === "undefined" || // child is root
        typeof this.storage[childIdx] === "undefined") {  // parent is leaf
          return true;
    }

    if (this.type === 'max') {
      return this.storage[parentIdx] >= this.storage[childIdx];
    } else {
      return this.storage[parentIdx] <= this.storage[childIdx];
    }
  };

  // Tests.
  if (typeof require === "function") {
    (function() {
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

      assert.throws(function() { new Heap(); },
                    /min.+max/,
                    "requires a 'min' or 'max' argument");
      assert.throws(function() { new Heap("fibonacci"); },
                    /min.+max/,
                    "rejects unrecognized arguments");
      var h = new Heap("min");
      assert.equal(h.extract(), undefined, "extract() returns nothing if heap is empty");
      h.insert(1);
      assert.equal(h.extract(), 1, "extract() returns a value");
      assert.equal(h.extract(), undefined, "extract() removes values from the heap");
      h.insert(10);
      h.insert(3);
      h.insert(12);
      var result = extractAll(h);
      assert.deepEqual(result, [3, 10, 12], "extract() always returns the minimum value");

      h.heapify([13, 4, 6, 8, 7]);
      result = extractAll(h);
      assert.deepEqual(result, [4, 6, 7, 8, 13], "values inserted with heapify() can be extracted");

      h = new Heap("max");
      h.heapify([1, 3, 9, 4, 9, 2]);
      result = extractAll(h);
      assert.deepEqual(result, [9, 9, 4, 3, 2, 1], "'max' heaps work as well");

      h.heapify([6, 8]);
      h.heapify([9, 1]);
      result = extractAll(h);
      assert.deepEqual(result, [9, 8, 6, 1], "consecutive calls to heapify() have an additive effect");

      console.log("Done");
    })();
  }
})(typeof window === "undefined" ? global : window);