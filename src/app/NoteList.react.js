// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import Keys from './Keys';
import NotePreview from './NotePreview.react';
import NotesSelectionStore from './stores/NotesSelectionStore';
import NotesStore from './stores/NotesStore';

// Don't want the DOM to contain all the text of all the notes.
// Truncate to a length that can fill two 600px rows.
const PREVIEW_LENGTH = 250;

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
    NotesStore.on('change', this._updateNotes);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNoteSelection);
    NotesStore.removeListener('change', this._updateNotes);
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

  @autobind
  _onFocus() {
    this.setState({focused: true});
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case Keys.DOWN:
        if (event.metaKey) {
          Actions.lastNote();
        } else if (event.shiftKey) {
          // TODO: extend selection
        } else {
          Actions.nextNote();
        }
        event.preventDefault();
        break;
      case Keys.UP:
        if (event.metaKey) {
          Actions.firstNote();
        } else if (event.shiftKey) {
          // TODO: extend selection
        } else {
          Actions.previousNote();
        }
        event.preventDefault();
        break;
    }
  }

  _renderNotes() {
    return this.state.notes.map((note, i) => {
      const selected = (i === this.state.selectedNoteIndex);
      return (
        <NotePreview
          focused={this.state.focused && selected}
          key={i}
          noteID={i}
          selected={selected}
          title={note.get('title')}
          text={note.get('text').substr(0, PREVIEW_LENGTH)}
        />
      );
    });
  }

  render() {
    return (
      <ul
        onBlur={this._onBlur}
        onFocus={this._onFocus}
        onKeyDown={this._onKeyDown}
        style={styles.root}
        tabIndex={1}
      >
        {this._renderNotes()}
      </ul>
    );
  }
}
