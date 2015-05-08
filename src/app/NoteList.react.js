'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import NotePreview from './NotePreview.react';
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
    this.state = {notes: NotesStore.getNotes()};
  }

  componentDidMount() {
    NotesStore.on('update', this._updateNotes);
  }

  componentWillUnmount() {
    NotesStore.removeListener('update', this._updateNotes);
  }

  @autobind
  _updateNotes() {
    this.setState({notes: NotesStore.getNotes()});
  }

  _renderNotes() {
    return this.state.notes.map((note, i) => (
      <NotePreview
        focused={i === 0}
        key={i}
        selected={i === 1}
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
