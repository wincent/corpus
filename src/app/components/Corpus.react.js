/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';
import {ipcRenderer} from 'electron';

import NoteView from './NoteView.react';
import NoteList from './NoteList.react';
import OmniBar from './OmniBar.react';
import SplitView from './SplitView.react';
import Viewport from './Viewport.react';

// TODO: change this
import Store, {deleteNotes} from '../Store';
import Actions from '../Actions';
import selectNext from '../store/selectNext';
import selectPrevious from '../store/selectPrevious';
import FilteredNotesStore from '../stores/FilteredNotesStore';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import loadConfig from '../loadConfig';
import * as log from '../log';
import processConfig from '../processConfig';
import run from '../run';

import type {StoreProps} from '../Store';

type Props = {|
  ...StoreProps,
|};

function deleteSelectedNotes() {
  const selection = NotesSelectionStore.selection;
  let warning;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes[selection.values().next().value];
    warning = `Delete the note titled "${note.title}"?`;
  } else {
    warning = `Delete ${selection.size} notes?`;
  }
  if (!confirm(warning)) {
    return;
  }

  // Convert selection indices to canonical indices.
  const indices = new Set();
  for (const index of selection) {
    const note = FilteredNotesStore.notes[index];
    indices.add(note.index);
  }
  Actions.selectedNotesDeleted(indices); // TODO: delete legacy once NotesStore, FilteredNotesStore, NotesSelectionStore are gone
  deleteNotes(indices);
}

function preview() {
  const selection = NotesSelectionStore.selection;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes[selection.values().next().value];
    // TODO: show link to get a previewer if not available
    // TODO: make previewer configurable
    run('open', note.path, '-b', 'com.brettterpstra.marked2').catch(log.warn);
  }
}

function reveal() {
  const selection = NotesSelectionStore.selection;
  if (selection.size === 1) {
    const note = FilteredNotesStore.notes[selection.values().next().value];
    run('open', '-R', note.path).catch(log.warn);
  }
}

export default Store.withStore(
  class Corpus extends React.Component<Props> {
    _selectionCount: number;

    constructor(props: Props) {
      super(props);
      this._selectionCount = 0;
    }

    async componentDidMount() {
      ipcRenderer.on('delete', deleteSelectedNotes);
      ipcRenderer.on('next', () => selectNext(this.props.store));
      ipcRenderer.on('preview', preview);
      ipcRenderer.on('previous', () => selectPrevious(this.props.store));
      ipcRenderer.on('rename', () =>
        this.props.store.set('focus')('TitleInput'),
      );
      ipcRenderer.on('reveal', reveal);
      ipcRenderer.on('search', () => this.props.store.set('focus')('OmniBar'));
      NotesSelectionStore.on('change', this._updateSelection);

      const rawConfig = await loadConfig();
      const config = processConfig(rawConfig);
      const {noteFontFamily, noteFontSize, notesDirectory} = config;
      const {store} = this.props;
      store.set('config.noteFontFamily')(noteFontFamily);
      store.set('config.noteFontSize')(noteFontSize);
      store.set('config.notesDirectory')(notesDirectory);
    }

    componentWillUnmount() {
      // No need to do clean-up; component never gets unmounted.
      throw new Error('Corpus.react: Unexpected componentWillUnmount().');
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
  },
);
