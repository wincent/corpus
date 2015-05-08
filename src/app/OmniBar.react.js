// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import NotesSelectionStore from './stores/NotesSelectionStore';
import NotesStore from './stores/NotesStore';

const styles = {
  input: {
    width: '100%',
  },
  root: {
    borderBottom: '1px solid #d1d1d1',
    flexGrow: 0,
    padding: '4px 8px',
    minHeight: '32px',
  },
};

function getCurrentNote() {
  const selectedIndex = NotesSelectionStore.currentSelectionIndex;
  if (selectedIndex === null) {
    return null;
  } else {
    return NotesStore.notes.get(selectedIndex);
  }
}

function getCurrentTitle() {
  const note = getCurrentNote();
  if (note === null) {
    return '';
  } else {
    return note.get('title');
  }
}

export default class OmniBar extends React.Component {
  constructor(props) {
    super(props);
    const note = getCurrentNote();
    this.state = {
      focused: true,
      note,
      value: getCurrentTitle(),
    };
  }

  componentDidMount() {
    ipc.on('blur', () => this.setState({focused: false}));
    ipc.on('focus', () => this.setState({focused: true}));

    NotesSelectionStore.on('change', this._updateNote);
    NotesStore.on('change', this._updateNote);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNote);
    NotesStore.removeListener('change', this._updateNote);
  }

  _getBackgroundStyle() {
    return this.state.focused ? 'linear-gradient(#d3d3d3, #d0d0d0)' : '#f6f6f6';
  }

  @autobind
  _updateNote() {
    const note = getCurrentNote();
    if (this.state.note !== note) {
      this.setState({
        note,
        value: getCurrentTitle(),
      });
    }
  }

  render() {
    let rootStyles = {
      ...styles.root,
      background: this._getBackgroundStyle(),
    };
    return (
      <div style={rootStyles}>
        <input
          style={styles.input}
          tabIndex={0}
          type="search"
          value={this.state.value}
        />
      </div>
    );
  }
}
