/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import FrozenSet from '@wincent/frozen-set';
import {ipcRenderer} from 'electron';
import * as React from 'react';

import NotesContext from '../contexts/NotesContext';
import NotesDispatch from '../contexts/NotesDispatch';
// TODO: move some of these "util" modules into a "store" directory
import filterNotes from '../util/filterNotes';
import loadConfig from '../util/loadConfig';
import loadNotes from '../util/loadNotes';
import makeRange from '../util/makeRange';
import NoteList from './NoteList';
import OmniBar from './OmniBar';
import SplitView from './SplitView';
import Viewport from './Viewport';

const {useEffect, useReducer} = React;

// TODO: figure out best place to put reducers etc
// and whether I want to factor them out into little functions like I previously
// did on the next branch

const reducer = (store: Store, action: Action): Store => {
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
};
// TODO: expose store on window to make debugging easy in dev-mode

export default function Corpus() {
  // TODO: read notes... update them... if I want to do that async, where is the
  // best place to do it?
  const initialState: Store = {
    filteredNotes: [],
    focus: 'omnibar',
    notes: [],
    query: null,
    selectedNotes: new FrozenSet(),
  };
  const init: (initialState: Store) => Store = initialState => {
    return initialState;
  };
  const [store, dispatch] = useReducer(reducer, initialState, init);

  useEffect(() => {
    load();

    ipcRenderer.on('search', () => {
      dispatch({
        type: 'focus',
        target: 'omnibar',
      });
    });

    async function load() {
      const {notesDirectory} = await loadConfig();
      loadNotes(notesDirectory).subscribe((notes: readonly Note[]) => {
        dispatch({
          type: 'load',
          notes,
        });
      });
    }
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
