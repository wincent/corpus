/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

import Note from './Note.react';
import NotePlaceholder from './NotePlaceholder.react';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import FilteredNotesStore from '../stores/FilteredNotesStore';
import colors from '../colors';

const styles = {
  root: {
    background: colors.background,
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
  },
};

export default class NoteView extends React.Component {
  constructor(props) {
    super(props);
    const {selection} = NotesSelectionStore;
    const count = selection.size;
    const note =
      count === 1
        ? FilteredNotesStore.notes.get(selection.values().next().value)
        : null;
    this.state = {count, note};
  }

  componentDidMount() {
    NotesSelectionStore.on('change', this._updateNote);
    FilteredNotesStore.on('change', this._updateNote);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNote);
    FilteredNotesStore.removeListener('change', this._updateNote);
  }

  _updateNote = () => {
    // TODO: make a convenience method for this, probably on the store, to DRY
    // this up (we'll be doing it in a few places)
    const {selection} = NotesSelectionStore;
    const count = selection.size;
    const note =
      count === 1
        ? FilteredNotesStore.notes.get(selection.values().next().value)
        : null;
    if (this.state.note !== note || this.state.count !== count) {
      this.setState({count, note});
    }
  };

  render() {
    let note;
    if (this.state.note) {
      note = <Note note={this.state.note} />;
    } else {
      note = <NotePlaceholder count={this.state.count} />;
    }
    return <div style={styles.root}>{note}</div>;
  }
}
