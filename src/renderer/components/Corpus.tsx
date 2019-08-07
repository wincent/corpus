/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import FrozenSet from '@wincent/frozen-set';
import * as React from 'react';

import NotesContext from '../contexts/NotesContext';
import NotesDispatch from '../contexts/NotesDispatch';
// TODO: move some of these "util" modules into a "store" directory
import filterNotes from '../util/filterNotes';
import loadConfig from '../util/loadConfig';
import loadNotes from '../util/loadNotes';
import NoteList from './NoteList';
import OmniBar from './OmniBar';
import SplitView from './SplitView';
import Viewport from './Viewport';

const {useEffect, useReducer} = React;

// figure out best place to put reducers etc

const reducer = (store: Store, action: Action): Store => {
  switch (action.type) {
    // TODO: consider offering a separate context for filtered notes?
    case 'filter':
      return {
        ...store,
        filteredNotes: filterNotes(action.query, store.notes),
        query: action.query,
      };
    case 'load': {
      const notes = [...store.notes, ...action.notes];

      return {
        ...store,
        filteredNotes: filterNotes(store.query, notes),
        notes,
      };
    }
  }
  return store;
};

export default function Corpus() {
  // TODO: read notes... update them... if I want to do that async, where is the
  // best place to do it?
  const initialState: Store = {
    filteredNotes: [],
    notes: [],
    query: null,
    selectedNotes: new FrozenSet(),
  };
  const init: (initialState: Store) => Store = initialState => {
    return initialState;
  };
  const [store, dispatch] = useReducer(reducer, initialState, init);

  useEffect(() => {
    async function load() {
      const {notesDirectory} = await loadConfig();
      loadNotes(notesDirectory).subscribe((notes: readonly Note[]) => {
        dispatch({
          type: 'load',
          notes,
        });
      });
    }

    load();
  }, []);

  return (
    <NotesDispatch.Provider value={dispatch}>
      <NotesContext.Provider value={store}>
        <Viewport>
          <OmniBar />
          <SplitView>
            <NoteList />
            <div>right</div>
          </SplitView>
        </Viewport>
      </NotesContext.Provider>
    </NotesDispatch.Provider>
  );
}
