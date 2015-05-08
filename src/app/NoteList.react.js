'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

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
      focusedNoteIndex: null,
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

  _onClickNotePreview(index) {
    this.setState({focusedNoteIndex: index});
  }

  _renderNotes() {
    return this.state.notes.map((note, i) => (
      <NotePreview
        focused={i === this.state.focusedNoteIndex}
        key={i}
        onClick={this._onClickNotePreview.bind(this, i)}
        selected={i === this.state.selectedNoteIndex}
        title={note.title}
        text={note.text}
      />
    ));
  }

  render() {
    return (
      <ul style={styles.root}>
        {this._renderNotes()}
      </ul>
    );
  }
}
