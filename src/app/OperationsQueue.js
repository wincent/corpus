/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

import type Promise from 'bluebird'; // eslint-disable-line no-unused-vars

import Heap from './Heap';

type Operation = () => Promise;

const DEFAULT_PRIORITY = 20;
const queue = new Heap(value => value.priority);
let isRunning = false;

function _run(operation: Operation) {
  isRunning = true;
  operation().finally(() => {
    isRunning = false;
    OperationsQueue.dequeue();
  });
}

/**
 * Priority queue for serializing file-system operations that may depend on one
 * another (for example, a rename followed by a write). All file-system
 * operations in Corpus get channeled through this chokepoint.
 */
const OperationsQueue = {
  DEFAULT_PRIORITY,

  dequeue() {
    if (queue.size() && !isRunning) {
      _run(queue.extract().operation);
    }
  },

  enqueue(operation: Operation, priority = DEFAULT_PRIORITY: number) {
    if (!queue.size() && !isRunning) {
      _run(operation);
    } else {
      queue.insert({priority, operation});
    }
  },
};

export default OperationsQueue;
