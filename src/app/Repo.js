/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import git from './git';

/**
 * Wrapper around subset of Git functionality needed by Corpus.
 */
export default class Repo {
  _path: string;

  constructor(path: string) {
    this._path = path;
  }

  /**
   * `git add -- '*.md'`
   *
   * Handles deletions as well.
   */
  add(pathspec: string): Promise<string> {
    return git('-C', this._path, 'add', '--', pathspec);
  }

  /**
   * Create a new commit
   */
  commit(message: string): Promise<string> {
    return Promise.resolve(); // don't touch filesystem during migration
    // return git('-C', this._path, 'commit', '--allow-empty', '-m', message);
  }

  init(): Promise<string> {
    return git('init', this._path);
  }

  // TODO: decide what kind of API I want for navigating backwards through
  // history
}
