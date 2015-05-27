/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import type Promise from 'bluebird';

import git from './git';

/**
 * Wrapper around subset of Git functionality needed by Corpus.
 */
export default class Repo {
  constructor(path: string) {
    this._path = path;
  }

  /**
   * `git add -- '*.txt'`
   *
   * Handles deletions as well.
   */
  add(pathspec: string): Promise {
    return git('-C', this._path, 'add', '--', pathspec);
  }

  /**
   * Create a new commit
   */
  commit(): Promise {
    const message = 'Corpus snapshot';
    return git('-C', this._path, 'commit', '--allow-empty', '-m', message);
  }

  init(): Promise {
    return git('init', this._path);
  }

  // TODO: decide what kind of API I want for navigating backwards through
  // history
}
