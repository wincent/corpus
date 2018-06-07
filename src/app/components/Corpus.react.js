/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {ipcRenderer} from 'electron';

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
      .toSet(),
  );
}

function preview() {
  const selection = NotesSelectionStore.selection;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes.get(selection.first());
    // TODO: show link to get a previewer if not available
    // TODO: make previewer configurable
    run('open', note.get('path'), '-b', 'com.brettterpstra.marked2').catch(
      log.warn,
    );
  }
}

function reveal() {
  const selection = NotesSelectionStore.selection;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes.get(selection.first());
    run('open', '-R', note.get('path')).catch(log.warn);
  }
}

type Props = {||};

class Corpus extends React.Component<Props> {
  _selectionCount: number;

  constructor(props) {
    super(props);
    this._selectionCount = 0;
  }

  componentDidMount() {
    ipcRenderer.on('delete', deleteSelectedNotes);
    ipcRenderer.on('next', Actions.nextNoteSelected);
    ipcRenderer.on('preview', preview);
    ipcRenderer.on('previous', Actions.previousNoteSelected);
    ipcRenderer.on('rename', Actions.renameRequested);
    ipcRenderer.on('reveal', reveal);
    ipcRenderer.on('search', Actions.omniBarFocused);
    NotesSelectionStore.on('change', this._updateSelection);
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('delete');
    ipcRenderer.removeAllListeners('next');
    ipcRenderer.removeAllListeners('preview');
    ipcRenderer.removeAllListeners('previous');
    ipcRenderer.removeAllListeners('rename');
    ipcRenderer.removeAllListeners('reveal');
    ipcRenderer.removeAllListeners('search');
    NotesSelectionStore.removeListener('change', this._updateSelection);
  }

  _updateSelection = () => {
    // Notify of changes to selection size so that the main process can
    // enable/disable menu items.
    const size = NotesSelectionStore.selection.size;
    if (
      (size === 0 && this._selectionCount !== 0) ||
      (size === 1 && this._selectionCount !== 1) ||
      (size > 1 && this._selectionCount <= 1)
    ) {
      ipcRenderer.send('selection-count-changed', size);
    }
    this._selectionCount = size;
  };

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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Corpus);
