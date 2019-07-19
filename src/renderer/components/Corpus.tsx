/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

import NotesContext from '../contexts/NotesContext';
import NotesDispatch from '../contexts/NotesDispatch';
import NoteList from './NoteList';
import OmniBar from './OmniBar';
import SplitView from './SplitView';
import Viewport from './Viewport';

const {useEffect, useReducer} = React;

// figure out best place to put reducers etc

const reducer = (store: Store, action: Action): Store => {
  switch (action.type) {
    case 'load':
      return {
        ...store,
        notes: action.notes,
      };
  }
  return store;
};

export default function Corpus() {
  // TODO: read notes... update them... if I want to do that async, where is the
  // best place to do it?
  const initialState = {
    notes: [],
  };
  const init: (initialState: Store) => Store = initialState => {
    return initialState;
  };
  const [store, dispatch] = useReducer(reducer, initialState, init);

  useEffect(() => {
    // load notes data
    Promise.resolve().then(() => {
      dispatch({
        type: 'load',
        notes: [
          {title: 'note 1', body: 'contents'},
          {title: 'note 2', body: 'body'},
        ],
      });
    });
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
