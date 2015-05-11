// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import shallowEqual from 'react/lib/shallowEqual';

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
    WebkitUserSelect: 'none',
    background: '#ebebeb',
    cursor: 'default',
    margin: 0,
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
    padding: 0,
  }
};

export default class NoteList extends React.Component {
  constructor(props) {
    super(props);
    this._listening = false;
    this._listenerTimeout = null;
    this.state = {
      focused: false,
      notes: NotesStore.notes,
      selection: NotesSelectionStore.selection,
    };
  }

  componentDidMount() {
    NotesSelectionStore.on('change', this._updateNoteSelection);
    NotesStore.on('change', this._updateNotes);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNoteSelection);
    NotesStore.removeListener('change', this._updateNotes);
    this._removeListeners();
  }

  @autobind
  _addListeners() {
    if (!this._listening) {
      document.addEventListener('selectionchange', this._selectionChanged);
      this._listening = true;
    }
  }

  _removeListeners() {
    if (this._listening) {
      document.removeEventListener('selectionchange', this._selectionChanged);
      this._listening = false;
    }
  }

  @autobind
  _selectionChanged() {
    Actions.allNotesSelected();
  }

  @autobind
  _updateNoteSelection() {
    this.setState({selection: NotesSelectionStore.selection});
  }

  @autobind
  _updateNotes() {
    this.setState({notes: NotesStore.notes});
  }

  @autobind
  _onBlur() {
    clearTimeout(this._listenerTimeout);
    this._listenerTimeout = null;
    this._removeListeners();
    this.setState({focused: false});
  }

  @autobind
  _onFocus() {
    // In order to avoid re-implementing the first-responder wheel, we need to
    // handle "Select All" especially here. When we're focused, we want to
    // intercept it. We do this by ensuring that `Note.react` has `user-select:
    // none`, and we listen for "selectionchange". In order to elimate false
    // positives, we only listen when we're focused, and we use `setTimeout`
    // here because otherwise we wind up with a "selectionchange" event
    // immediately after focusing.
    clearTimeout(this._listenerTimeout);
    this._listenerTimeout = setTimeout(this._addListeners, 200);
    this.setState({focused: true});
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case Keys.DOWN:
        if (event.metaKey) {
          Actions.lastNote();
        } else if (event.shiftKey) {
          Actions.adjustNoteSelectionDown();
        } else {
          Actions.nextNote();
        }
        event.preventDefault();
        break;
      case Keys.ESCAPE:
        Actions.deselectAll();
        break;
      case Keys.UP:
        if (event.metaKey) {
          Actions.firstNote();
        } else if (event.shiftKey) {
          Actions.adjustNoteSelectionUp();
        } else {
          Actions.previousNote();
        }
        event.preventDefault();
        break;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }

  _renderNotes() {
    return this.state.notes.map((note, i) => {
      const selected = this.state.selection.has(i);
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
        tabIndex={2}
      >
        {this._renderNotes()}
      </ul>
    );
  }
}
