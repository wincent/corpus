/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import Actions from '../Actions';
import FilteredNotesStore from '../stores/FilteredNotesStore';
import GitStore from '../stores/GitStore'; // eslint-disable-line no-unused-vars
import NoteView from '../components/NoteView.react';
import NoteList from '../components/NoteList.react';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import OmniBar from '../components/OmniBar.react';
import SplitView from '../components/SplitView.react';
import Viewport from '../components/Viewport.react';
import * as log from '../log';
import run from '../run';

const ReduxActions = {};

function mapStateToProps(state) {
  return {
    ...state,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(ReduxActions, dispatch),
  };
}

function deleteSelectedNotes() {
  const selection = NotesSelectionStore.selection;
  let warning;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes.get(selection.first());
    warning = `Delete the note titled "${note.get('title')}"?`;
  } else {
    warning = `Delete ${selection.size} notes?`;
  }
  if (!confirm(warning)) {
    return;
  }

  // Convert selection indices within the FilteredNotesStore to
  // canonical indices within the NotesStore.
  Actions.selectedNotesDeleted(
    selection
      .map(index => FilteredNotesStore.notes.get(index))
      .map(note => note.get('index'))
      .toSet()
  );
}

function reveal() {
  const selection = NotesSelectionStore.selection;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes.get(selection.first());
    run('open', '-R', note.get('path')).catch(log.warn);
  }
}

class Corpus extends React.Component {
  constructor(props) {
    super(props);
    this._selectionCount = 0;
  }

  componentDidMount() {
    ipc.on('delete', deleteSelectedNotes);
    ipc.on('next', Actions.nextNoteSelected);
    ipc.on('previous', Actions.previousNoteSelected);
    ipc.on('rename', Actions.renameRequested);
    ipc.on('reveal', reveal);
    ipc.on('search', Actions.omniBarFocused);
    NotesSelectionStore.on('change', this._updateSelection);
  }

  componentWillUnmount() {
    ipc.removeAllListeners('delete');
    ipc.removeAllListeners('next');
    ipc.removeAllListeners('previous');
    ipc.removeAllListeners('rename');
    ipc.removeAllListeners('reveal');
    ipc.removeAllListeners('search');
    NotesSelectionStore.removeListener('change', this._updateSelection);
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

export default connect(mapStateToProps, mapDispatchToProps)(Corpus);
