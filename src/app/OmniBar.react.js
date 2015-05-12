// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import Actions from './Actions';
import FocusStore from './stores/FocusStore';
import NotesSelectionStore from './stores/NotesSelectionStore';
import NotesStore from './stores/NotesStore';
import performKeyboardNavigation from './performKeyboardNavigation';

const styles = {
  cancel: {
    color: '#bfbfbf',
    fontSize: '13px',
    position: 'absolute',
    right: '8px',
    top: '7px',
  },
  icon: {
    color: '#565656',
    fontSize: '14px',
    left: '10px',
    position: 'absolute',
    top: '7px',
  },
  input: {
    WebkitAppearance: 'none', // only with this can we override padding
    border: '1px solid #a0a0a0',
    borderRadius: '4px',
    lineHeight: '16px',
    padding: '2px 20px 1px', // room for icons/controls
    width: '100%',
  },
  root: {
    WebkitUserSelect: 'none',
    borderBottom: '1px solid #d1d1d1',
    flexGrow: 0,
    padding: '4px 8px',
    position: 'relative',
    minHeight: '36px',
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
      foreground: true,
      note,
      value: getCurrentTitle(),
    };
  }

  componentDidMount() {
    ipc.on('blur', () => this.setState({foreground: false}));
    ipc.on('focus', () => this.setState({foreground: true}));
    React.findDOMNode(this._inputRef).focus();
    FocusStore.on('change', this._updateFocus);
    NotesSelectionStore.on('change', this._updateNote);
    NotesStore.on('change', this._updateNote);
  }

  componentWillUnmount() {
    FocusStore.removeListerner('change', this._updateFocus);
    NotesSelectionStore.removeListener('change', this._updateNote);
    NotesStore.removeListener('change', this._updateNote);
  }

  _getBackgroundStyle() {
    return this.state.foreground ? 'linear-gradient(#d3d3d3, #d0d0d0)' : '#f6f6f6';
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'OmniBar') {
      React.findDOMNode(this._inputRef).focus();
    }
  }

  @autobind
  _updateNote() {
    const note = getCurrentNote();
    if (this.state.note !== note) {
      this.setState(
        {
          note,
          value: getCurrentTitle(),
        },
        () => {
          const input = React.findDOMNode(this._inputRef)
          if (document.activeElement === input) {
            input.setSelectionRange(0, input.value.length);
          }
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

  @autobind
  _onClick() {
    Actions.deselectAll();
    React.findDOMNode(this._inputRef).focus();
  }

  _onFocus(event) {
    var input = event.currentTarget;
    input.setSelectionRange(0, input.value.length);
  }

  _onKeyDown(event) {
    performKeyboardNavigation(event);
  }

  render() {
    let rootStyles = {
      ...styles.root,
      background: this._getBackgroundStyle(),
    };
    return (
      <div style={rootStyles}>
        <span className="icon-search" style={styles.icon}></span>
        <input
          onChange={this._onChange}
          onFocus={this._onFocus}
          onKeyDown={this._onKeyDown}
          placeholder="Search or Create"
          ref={ref => this._inputRef = ref}
          style={styles.input}
          tabIndex={1}
          type="text"
          value={this.state.value}
        />
        <span
          className="icon-cancel-circled"
          onClick={this._onClick}
          style={styles.cancel}>
        </span>
      </div>
    );
  }
}
