'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import Dispatcher from './Dispatcher';
import NotePreview from './NotePreview.react';
import NoteSelectionStore from './stores/NotesSelectionStore';
import NotesStore from './stores/NotesStore';

const styles = {
  root: {
    background: '#ebebeb',
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
      notes: NotesStore.getNotes(),
      selectedNoteIndex: NoteSelectionStore.getCurrentSelectionIndex(),
    };
  }

  componentDidMount() {
    NoteSelectionStore.on('change', this._updateNoteSelection);
    NotesStore.on('update', this._updateNotes);
  }

  componentWillUnmount() {
    NoteSelectionStore.removeListener('change', this._updateNoteSelection);
    NotesStore.removeListener('update', this._updateNotes);
  }

  @autobind
  _updateNoteSelection() {
    this.setState({selectedNoteIndex: NoteSelectionStore.getCurrentSelectionIndex()});
  }

  @autobind
  _updateNotes() {
    this.setState({notes: NotesStore.getNotes()});
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
          title={note.title}
          text={note.text}
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
