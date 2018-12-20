/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {withLogger} from 'undux';
import * as log from './log';
import querySystem from './querySystem';
import filterNotes from './store/filterNotes';
import loadNotes from './store/loadNotes';

import type {StoreEffects} from './Store';

const effects: StoreEffects = store => {
  store.on('config.notesDirectory').subscribe(notesDirectory => {
    log.info(`Using notesDirectory: ${notesDirectory}`);

    querySystem(notesDirectory).then(({nameMax, pathMax}) => {
      store.set('system.nameMax')(nameMax);
      store.set('system.pathMax')(pathMax);
    });

    loadNotes(notesDirectory).subscribe(notes => {
      store.setFrom_EXPERIMENTAL(store =>
        store.set('notes')([...store.get('notes'), ...notes]),
      );
    });

    // TODO: persist last selection across restarts
  });

  store.on('notes').subscribe(notes => {
    const query = store.get('query');
    const previous = store.get('filteredNotes');
    const filtered = filterNotes(query, notes);
    if (filtered !== previous) {
      store.set('filteredNotes')(filtered);
    }
  });

  // TODO: de-dupe this and the above?
  store.on('query').subscribe(query => {
    const notes = store.get('notes');
    const previous = store.get('filteredNotes');
    const filtered = filterNotes(query, notes);
    if (filtered !== previous) {
      store.set('filteredNotes')(filtered);
    }
  });

  combineLatest(store.on('filteredNotes'), store.on('selection'))
    .pipe(
      map(([filteredNotes, selection]) =>
        filteredNotes.filter((note, index) => selection.has(index)),
      ),
    )
    .subscribe(store.set('selectedNotes'));

  // store.on('filteredNotes').subscribe(notes => {});
  // store.on('selection').subscribe(selection => {});

  return withLogger(store);
};

export default effects;
