// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Note from './Note.react';
import NotePlaceholder from './NotePlaceholder.react';
import NotesStore from './stores/NotesStore';
import NotesSelectionStore from './stores/NotesSelectionStore';

const styles = {
  root: {
    background: '#ebebeb',
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
  },
};

export default class NoteView extends React.Component {
  constructor(props) {
    super(props);
    const selectedNoteIndex = NotesSelectionStore.currentSelectionIndex;
    const note = selectedNoteIndex !== null ? NotesStore.notes.get(selectedNoteIndex) : null;
    this.state = {note};
  }

  componentDidMount() {
    NotesSelectionStore.on('change', this._updateNote);
    NotesStore.on('change', this._updateNote);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNote);
    NotesStore.removeListener('change', this._updateNote);
  }

  @autobind
  _updateNote() {
    const selectedIndex = NotesSelectionStore.currentSelectionIndex;
    const note = NotesStore.notes.get(selectedIndex);
    if (this.state.note !== note) {
      this.setState({note});
    }
  }

  render() {
    const note = <Note note={this.state.note} /> || <NotePlaceholder />;
    return (
      <div style={styles.root} tabIndex={2}>
        {note}
      </div>
    );
  }
}
