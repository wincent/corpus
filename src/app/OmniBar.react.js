// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import Actions from './Actions';
import FocusStore from './stores/FocusStore';
import Keys from './Keys';
import NotesSelectionStore from './stores/NotesSelectionStore';
import FilteredNotesStore from './stores/FilteredNotesStore';
import performKeyboardNavigation from './performKeyboardNavigation';
import stringFinder from './stringFinder';

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
    return FilteredNotesStore.notes.get(selection.first());
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
    NotesSelectionStore.on('change', this._onSelectionChange);
    FilteredNotesStore.on('change', this._onNotesChange);
  }

  componentWillUnmount() {
    ipc.removeAllListeners('blur');
    ipc.removeAllListeners('focus');
    FocusStore.removeListerner('change', this._updateFocus);
    NotesSelectionStore.removeListener('change', this._onSelectionChange);
    FilteredNotesStore.removeListener('change', this._onNotesChange);
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
  _onNotesChange(query: ?string) {
    this._query = query || '';
  }

  @autobind
  _onSelectionChange() {
    const note = getCurrentNote();
    const currentValue = note ? note.get('title').toLowerCase() : '';
    const previousValue = this.state.value.toLowerCase();
    const pendingValue = this._query ? this._query.toLowerCase() : '';
    if (
      this.state.note !== note ||
      pendingValue !== currentValue
    ) {
      let value;
      if (this._pendingDeletion != null) {
        value = this._pendingDeletion;
        this._pendingDeletion = null;
      } else {
        value = getCurrentTitle() || this._query || '';
      }
      this.setState(
        {note, value},
        () => {
          const input = React.findDOMNode(this._inputRef)
          if (document.activeElement === input) {
            if (currentValue && currentValue.startsWith(pendingValue)) {
              input.setSelectionRange(pendingValue.length, input.value.length);
            }
          }
        }
      );
    }
    this._query = null;
  }

  @autobind
  _onChange(event) {
    const value = event.currentTarget.value;
    this.setState({value});
    Actions.searchRequested(value);
  }

  @autobind
  _onClick() {
    Actions.allNotesDeselected();
    React.findDOMNode(this._inputRef).focus();
  }

  _onFocus(event) {
    const input = event.currentTarget;
    input.setSelectionRange(0, input.value.length);
  }

  @autobind
  _onKeyDown(event) {
    switch (event.keyCode) {
      case Keys.BACKSPACE:
      case Keys.DELETE:
        {
          const {selectionStart, selectionEnd, value} = event.currentTarget;
          if (selectionEnd === value.length) {
            // Deletion at end of the input.
            event.preventDefault();
            if (selectionStart !== selectionEnd) {
              // Selection deletion.
              this._pendingDeletion = value.substr(0, selectionStart);
            } else if (selectionStart && event.keyCode === Keys.BACKSPACE) {
              // Delete last character in field.
              this._pendingDeletion = value.substr(0, selectionStart - 1);
            } else {
              return; // Nothing to do (already at start of input field).
            }
            this.setState({value: this._pendingDeletion});
            Actions.searchRequested(this._pendingDeletion);
          }
        }
        break;

      case Keys.ESCAPE:
        Actions.allNotesDeselected();
        Actions.searchRequested('');
        Actions.omniBarFocused();
        return;

      case Keys.TAB:
        {
          // Prevent the <body> from becoming `document.activeElement`.
          event.preventDefault();

          const size = NotesSelectionStore.selection.size;
          if (size === 0) {
            Actions.noteListFocused();
            Actions.firstNoteSelected();
          } else if (size === 1) {
            Actions.noteFocused();
          } else {
            Actions.noteListFocused();
          }
        }
        break;
    }

    performKeyboardNavigation(event);
  }

  render() {
    const rootStyles = {
      ...styles.root,
      background: this._getBackgroundStyle(),
    };
    const iconClass = NotesSelectionStore.selection.size === 1 ?
      'icon-pencil' :
      'icon-search';
    return (
      <div style={rootStyles}>
        <span className={iconClass} style={styles.icon}></span>
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
