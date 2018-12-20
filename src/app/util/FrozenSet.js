/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

/**
 * Set subclass for programming in an immutable style.
 *
 * In __DEV__ will throw an error on attempted mutation.
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
    // TODO: make properties not configurable etc
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
