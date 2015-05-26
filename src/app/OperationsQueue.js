/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

import {EventEmitter} from 'events';

class OperationsQueue extends EventEmitter {
  constructor() {
    super();
    this._isRunning = false;
    this._queue = [];
  }

  dequeue() {
    if (this._queue.length && !this._isRunning) {
      this._run(this._queue.shift());
    }
  }

  enqueue(operation) {
    if (!this._queue.length && !this._isRunning) {
      this._run(operation);
    } else {
      this._queue.push(operation);
    }
  }

  _run(operation) {
    this._isRunning = true;
    operation(() => {
      this._isRunning = false;
      setImmediate(() => this.dequeue());
    });
  }
}

export default new OperationsQueue();
