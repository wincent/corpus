/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * This is an ES6 Set stand-in for programming in an immutable style.
 *
 * In development will throw an error on attempted mutation (use of `add()`,
 * `clear()` or `delete()`.
 *
 * NOTE: Implements "shallow" immutability only.
 */

export default class FrozenSet<T> implements Set<T> {
  private isFrozen: boolean;
  private storage: Set<T>;

  constructor(
    iterable?: Iterable<T> | null,
    callback?: (s: FrozenSet<T>) => void,
  ) {
    this.storage = new Set(iterable);

    this.isFrozen = false;

    if (callback != null) {
      callback.call(this, this);
    }

    this.freeze();
  }

  clone(this: FrozenSet<T>, callback: (s: FrozenSet<T>) => void): FrozenSet<T> {
    return new FrozenSet(this, callback);
  }

  freeze(this: FrozenSet<T>) {
    this.isFrozen = true;

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(this.storage);
    }
  }

  private assert(this: FrozenSet<T>) {
    if (this.isFrozen) {
      throw new Error('FrozenSet: Mutation Violation');
    }
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.storage[Symbol.iterator]();
  }

  add(value: T): this {
    if (process.env.NODE_ENV !== 'production') {
      this.assert();
    }

    this.storage.add(value);

    return this;
  }

  clear(this: FrozenSet<T>): void {
    if (process.env.NODE_ENV !== 'production') {
      this.assert();
    }

    this.storage.clear();
  }

  delete(this: FrozenSet<T>, value: T): boolean {
    if (process.env.NODE_ENV !== 'production') {
      this.assert();
    }

    return this.storage.delete(value);
  }

  entries(): IterableIterator<[T, T]> {
    return this.storage.entries();
  }

  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any,
  ): void {
    return this.storage.forEach(callbackfn, thisArg);
  }

  has(value: T): boolean {
    return this.storage.has(value);
  }

  keys(): IterableIterator<T> {
    return this.storage.keys();
  }

  values(): IterableIterator<T> {
    return this.storage.values();
  }

  get [Symbol.toStringTag](): string {
    return 'FrozenSet';
  }

  get size(): number {
    return this.storage.size;
  }
}
