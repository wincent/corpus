/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

const queue = [];
let isRunning = false;


function run(operation) {
  isRunning = true;
  operation(() => {
    isRunning = false;
    setImmediate(OperationsQueue.dequeue);
  });
}

const OperationsQueue = {
  dequeue() {
    if (queue.length && !isRunning) {
      run(queue.shift());
    }
  },

  enqueue(operation) {
    if (!queue.length && !isRunning) {
      run(operation);
    } else {
      queue.push(operation);
    }
  },
};

export default OperationsQueue;
