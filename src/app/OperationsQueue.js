/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

import type Promise from 'bluebird';

import Heap from './Heap';

type Operation = () => Promise;

const DEFAULT_PRIORITY = 20;
const queue = new Heap(value => value.priority);
let isRunning = false;

async function _run(operation: Operation) {
  try {
    await operation();
  } finally {
    isRunning = false;
    OperationsQueue.dequeue();
  }
}

/**
 * Priority queue for serializing file-system operations that may depend on one
 * another (for example, a rename followed by a write). All file-system
 * operations in Corpus get channeled through this chokepoint.
 */
const OperationsQueue = {
  DEFAULT_PRIORITY,

  dequeue() {
    if (queue.size && !isRunning) {
      isRunning = true;
      requestAnimationFrame(() => _run(queue.extract().operation));
    }
  },

  enqueue(operation: Operation, priority: number = DEFAULT_PRIORITY) {
    if (!queue.size && !isRunning) {
      isRunning = true;
      requestAnimationFrame(() => _run(operation));
    } else {
      queue.insert({priority, operation});
    }
  },

  get size() {
    return queue.size;
  },
};

export default OperationsQueue;
