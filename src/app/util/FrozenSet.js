/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

/**
 * This is an ES6 Set subclass for programming in an immutable style.
 *
 * In __DEV__ will throw an error on attempted mutation (use of `add()`,
 * `clear()` or `delete()`.
 *
 * NOTE: Implements "shallow" immutability only.
 */
export default class FrozenSet extends Set {
  _isFrozen: bool;

  constructor(iterable, callback) {
    super(iterable);
    this._isFrozen = false;
    if (callback != null) {
      callback.call(this, this);
    }
    this.freeze();
  }

  freeze() {
    this._isFrozen = true;
    Object.freeze(this);
  }

  _assert() {
    if (this._isFrozen) {
      throw new Error('FrozenSet: Mutation Violation');
    }
  }

  add(value) {
    if (__DEV__) {
      this._assert();
    }
    super.add(value);
    return this;
  }

  delete(value) {
    if (__DEV__) {
      this._assert();
    }
    super.delete(value);
  }

  clear() {
    if (__DEV__) {
      this._assert();
    }
    super.clear();
  }
}
