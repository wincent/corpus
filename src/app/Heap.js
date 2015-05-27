(function(window) {
  "use strict";

  // Constructor
  window.Heap = function Heap() {
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
      // min heaps: will swap with smallest child;
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
    } else if (rightChild < leftChild) {
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

    return this.storage[parentIdx] <= this.storage[childIdx];
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
    })();
  }
})(typeof window === "undefined" ? global : window);
