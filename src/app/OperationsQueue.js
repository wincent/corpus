/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import Heap from './Heap';

type Operation = () => Promise<void>;
type Job = {|
  operation: Operation,
  priority: number,
|};

const DEFAULT_PRIORITY = 20;
const queue = new Heap((job: Job): number => job.priority);
let isRunning = false;

async function _run(operation: Operation) {
  try {
    await operation();
  } finally {
    isRunning = false;
    OperationsQueue.dequeue();
  }
}

function extract(): Job {
  const job = queue.extract();
  if (!job) {
    throw new Error('extract(): Expected job');
  }
  return job;
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
      requestAnimationFrame(() => void _run(extract().operation));
    }
  },

  enqueue(operation: Operation, priority: number = DEFAULT_PRIORITY) {
    if (!queue.size && !isRunning) {
      isRunning = true;
      requestAnimationFrame(() => void _run(operation));
    } else {
      queue.insert({priority, operation});
    }
  },

  // flowlint-next-line unsafe-getters-setters:off
  get size() {
    return queue.size;
  },
};

export default OperationsQueue;
