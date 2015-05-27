/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

import Heap from './Heap';

const DEFAULT_PRIORITY = 20;
const queue = new Heap(value => value.priority);
let isRunning = false;

const OperationsQueue = {
  DEFAULT_PRIORITY,

  dequeue() {
    if (queue.size() && !isRunning) {
      OperationsQueue._run(queue.extract().operation);
    }
  },

  enqueue(operation, priority = DEFAULT_PRIORITY) {
    if (!queue.size() && !isRunning) {
      OperationsQueue._run(operation);
    } else {
      queue.insert({priority, operation});
    }
  },

  _run(operation) {
    isRunning = true;
    operation(() => {
      isRunning = false;
      OperationsQueue.dequeue();
    });
  },
};

export default OperationsQueue;
