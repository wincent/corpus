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
    WebkitUserSelect: 'none',
    borderBottom: '1px solid #d1d1d1',
    flexGrow: 0,
    padding: '4px 8px',
    minHeight: '32px',
  },
};

function getCurrentNote() {
  const selection = NotesSelectionStore.selection;
  if (selection.size === 1) {
    return NotesStore.notes.get(selection.first());
  } else {
    return null;
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

  _onChange() {
    // Nothing to see here yet; just silencing this React warning:
    //
    //   "Warning: Failed propType: You provided a `value` prop to a form field
    //   without an `onChange` handler. This will render a read-only field. If
    //   the field should be mutable use `defaultValue`. Otherwise, set either
    //   `onChange` or `readOnly`. Check the render method of `OmniBar`.
  }

  render() {
    let rootStyles = {
      ...styles.root,
      background: this._getBackgroundStyle(),
    };
    return (
      <div style={rootStyles}>
        <input
          onChange={this._onChange}
          placeholder="Search or Create"
          style={styles.input}
          tabIndex={1}
          type="search"
          value={this.state.value}
        />
      </div>
    );
  }
}
