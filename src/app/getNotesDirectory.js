/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import store from './store';

let notesDirectory;
let subscription;

export default function getNotesDirectory(): Promise<string> {
  notesDirectory = notesDirectory || store.get('config.notesDirectory');
  if (notesDirectory) {
    return Promise.resolve(notesDirectory);
  } else {
    return new Promise((resolve, reject) => {
      subscription = store.on('config.notesDirectory').subscribe(directory => {
        notesDirectory = directory;
        resolve(directory);
        subscription.unsubscribe();
        subscription = null;
      }, reject);
    });
  }
}
