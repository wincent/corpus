/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import FrozenSet from '@wincent/frozen-set';
// TODO: move some of these "util" modules into a "store" directory
import filterNotes from './filterNotes';
import makeRange from '../util/makeRange';

// TODO: decide whether I want to factor out into little functions like
// I previously did on the next branch

export default function reducer(store: Store, action: Action): Store {
  switch (action.type) {
    // TODO: consider offering a separate context for filtered notes?
    case 'filter':
      return {
        ...store,
        filteredNotes: filterNotes(action.query, store.notes),
        query: action.query,
      };
    case 'focus':
      return {
        ...store,
        focus: action.target,
      };
    case 'load': {
      const notes = [...store.notes, ...action.notes];

      return {
        ...store,
        filteredNotes: filterNotes(store.query, notes),
        notes,
      };
    }
    case 'select-all':
      return {
        ...store,
        selectedNotes: new FrozenSet(makeRange(store.filteredNotes.length)),
      };
  }
  return store;
}
