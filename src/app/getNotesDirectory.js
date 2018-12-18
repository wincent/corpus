/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

// import store from './Store';

let notesDirectory;
let subscription;

export default function getNotesDirectory(): Promise<string> {
  notesDirectory = notesDirectory; /*|| store.get('config.notesDirectory');*/ // BUG: can't use store here at this time
  if (notesDirectory) {
    return Promise.resolve(notesDirectory);
  } else if (subscription) {
    return new Promise((resolve, reject) => {
      subscription.add(() => {
        if (notesDirectory) {
          resolve(notesDirectory);
        } else {
          reject(new Error('No notesDirectory is set'));
        }
      });
    });
  } else {
    // BUG: hack to not blow up in absence of store
    return Promise.resolve();
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
