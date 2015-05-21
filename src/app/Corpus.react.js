// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import Actions from './Actions';
import FilteredNotesStore from './stores/FilteredNotesStore';
import NoteView from './NoteView.react';
import NoteList from './NoteList.react';
import NotesSelectionStore from './stores/NotesSelectionStore';
import OmniBar from './OmniBar.react';
import SplitView from './SplitView.react';
import Viewport from './Viewport.react';

export default class Corpus extends React.Component {
  constructor(props) {
    super(props);
    this._selectionCount = 0;
  }

  componentDidMount() {
    // TODO: implement confirmtion dialog
    ipc.on('delete', this._deleteSelectedNotes);
    ipc.on('next', Actions.nextNoteSelected);
    ipc.on('previous', Actions.previousNoteSelected);
    ipc.on('rename', Actions.renameRequested);
    ipc.on('search', Actions.omniBarFocused);
    NotesSelectionStore.on('change', this._updateSelection);
  }

  componentWillUnmount() {
    ipc.removeAllListeners('delete');
    ipc.removeAllListeners('next');
    ipc.removeAllListeners('previous');
    ipc.removeAllListeners('rename');
    ipc.removeAllListeners('search');
    NotesSelectionStore.removeListener('change', this._updateSelection);
  }

  _deleteSelectedNotes() {
    // Convert selection indices within the FilteredNotesStore to
    // canonical indices within the NotesStore.
    Actions.selectedNotesDeleted(
      NotesSelectionStore.selection
        .map(index => FilteredNotesStore.notes.get(index))
        .map(note => note.get('index'))
        .toSet()
    );
  }

  @autobind
  _updateSelection() {
    // Notify of changes to selection size so that the main process can
    // enable/disable menu items.
    const size = NotesSelectionStore.selection.size;
    if (
      size === 0 && this._selectionCount !== 0 ||
      size === 1 && this._selectionCount !== 1 ||
      size > 1 && this._selectionCount <= 1
    ) {
      ipc.send('selection-count-changed', size);
    }
    this._selectionCount = size;
  }

  render() {
    return (
      <Viewport>
        <OmniBar />
        <SplitView>
          <NoteList />
          <NoteView />
        </SplitView>
      </Viewport>
    );
  }
}
