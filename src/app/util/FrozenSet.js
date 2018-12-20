/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

/**
 * This is an ES6 Set subclass for programming in an immutable style.
 *
 * In __DEV__ will throw an error on attempted mutation (use of `add()`,
 * `clear()` or `delete()`.
 *
 * NOTE: Implements "shallow" immutability only.
 */
export default class FrozenSet<T> extends Set<T> {
  _isFrozen: boolean;

  constructor(iterable: ?Iterable<T>, callback: ?(Set<T>) => void) {
    super(iterable);
    this._isFrozen = false;
    if (callback != null) {
      callback.call(this, this);
    }
    this.freeze();
  }

  clone(callback: (Set<T>) => void): FrozenSet<T> {
    return new FrozenSet(this, callback);
  }

  freeze() {
    this._isFrozen = true;
    if (__DEV__) {
      Object.freeze(this);
    }
  }

  _assert() {
    if (this._isFrozen) {
      throw new Error('FrozenSet: Mutation Violation');
    }
  }

  add(value: T): FrozenSet<T> {
    if (__DEV__) {
      this._assert();
    }
    super.add(value);
    return this;
  }

  delete(value: T): boolean {
    if (__DEV__) {
      this._assert();
    }
    return super.delete(value);
  }

  clear(): void {
    if (__DEV__) {
      this._assert();
    }
    super.clear();
  }
}
