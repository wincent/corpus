// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import NotePreview from './NotePreview.react';
import NotesSelectionStore from './stores/NotesSelectionStore';
import NotesStore from './stores/NotesStore';

const styles = {
  root: {
    background: '#ebebeb',
    cursor: 'default',
    margin: 0,
    padding: 0,
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
    WebkitUserSelect: 'none',
  }
};

export default class NoteList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      notes: NotesStore.notes,
      selectedNoteIndex: NotesSelectionStore.currentSelectionIndex,
    };
  }

  componentDidMount() {
    NotesSelectionStore.on('change', this._updateNoteSelection);
    NotesStore.on('update', this._updateNotes);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNoteSelection);
    NotesStore.removeListener('update', this._updateNotes);
  }

  @autobind
  _updateNoteSelection() {
    this.setState({selectedNoteIndex: NotesSelectionStore.currentSelectionIndex});
  }

  @autobind
  _updateNotes() {
    this.setState({notes: NotesStore.notes});
  }

  @autobind
  _onBlur() {
    this.setState({focused: false});
  }

  _onClickNotePreview(index) {
    Actions.noteSelected({index});
  }

  @autobind
  _onFocus() {
    this.setState({focused: true});
  }

  _renderNotes() {
    return this.state.notes.map((note, i) => {
      const selected = (i === this.state.selectedNoteIndex);
      return (
        <NotePreview
          focused={this.state.focused && selected}
          key={i}
          onClick={this._onClickNotePreview.bind(this, i)}
          selected={selected}
          title={note.get('title')}
          text={note.get('text')}
        />
      );
    });
  }

  render() {
    return (
      <ul
        onBlur={this._onBlur}
        onFocus={this._onFocus}
        style={styles.root}
        tabIndex={1}
      >
        {this._renderNotes()}
      </ul>
    );
  }
}
