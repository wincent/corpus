/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

const queue = [];
let isRunning = false;

const OperationsQueue = {
  dequeue() {
    if (queue.length && !isRunning) {
      OperationsQueue._run(queue.shift());
    }
  },

  enqueue(operation) {
    if (!queue.length && !isRunning) {
      OperationsQueue._run(operation);
    } else {
      queue.push(operation);
    }
  },

  _run(operation) {
    isRunning = true;
    operation(() => {
      isRunning = false;
      setImmediate(OperationsQueue.dequeue);
    });
  },
};

export default OperationsQueue;
