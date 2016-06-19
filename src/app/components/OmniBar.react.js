/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Immutable from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';
import {remote} from 'electron';
import {connect} from 'react-redux';
import {ipcRenderer} from 'electron';
import Actions from '../Actions';
import Keys from '../Keys';
import FilteredNotesStore from '../stores/FilteredNotesStore';
import FocusStore from '../stores/FocusStore';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import performKeyboardNavigation from '../performKeyboardNavigation';

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

class OmniBar extends React.Component {
  static propTypes = {
    logs: React.PropTypes.instanceOf(Immutable.List),
    system: React.PropTypes.instanceOf(Immutable.Map),
  };

  constructor(props) {
    super(props);
    const note = getCurrentNote();
    this.state = {
      foreground: true,
      hasError: props.logs.size,
      note,
      value: getCurrentTitle(),
    };
  }

  /**
  * Returns the maximum note title length.
  */
  _getMaxLength(): number {
    const maxLength =
      this.props.system.get('nameMax') -
      '.txt'.length -
      '.000'.length; // room to disambiguate up to 1,000 duplicate titles

    return Math.max(
      0, // sanity: never return a negative number
      maxLength
    );
  }

  _getStyles() {
    const rightInputPadding = 0 +
      (this.state.value ? 18 : 0) +
      (this.state.hasError ? 18 : 0) +
      'px';
    return {
      attention: {
        color: '#fe2310',
        fontSize: '13px',
        position: 'absolute',
        right: this.state.value ? '24px' : '10px',
        top: '33px',
      },
      cancel: {
        color: '#bfbfbf',
        fontSize: '13px',
        position: 'absolute',
        right: '10px',
        top: '33px',
      },
      icon: {
        color: '#565656',
        fontSize: '14px',
        left: '10px',
        position: 'absolute',
        top: '33px',
      },
      input: {
        WebkitAppRegion: 'no-drag',
        WebkitAppearance: 'none', // only with this can we override padding
        border: '1px solid #a0a0a0',
        borderRadius: '4px',
        fontFamily: 'Helvetica Neue',
        lineHeight: '16px',
        padding: `2px ${rightInputPadding} 1px 20px`,
        width: '100%',
      },
      root: {
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        background: this._getBackgroundStyle(),
        borderBottom: '1px solid #d1d1d1',
        flexGrow: 0,
        padding: '30px 8px 14px',
        position: 'relative',
        minHeight: '36px',
      },
    };
  }

  componentDidMount() {
    ipcRenderer.on('blur', () => {
      this._blurred = true; // See _onFocus for rationale.
      this.setState({foreground: false});
    });
    ipcRenderer.on('focus', () => this.setState({foreground: true}));
    ReactDOM.findDOMNode(this._inputRef).focus();
    FocusStore.on('change', this._updateFocus);
    NotesSelectionStore.on('change', this._onNotesSelectionChange);
    FilteredNotesStore.on('change', this._onNotesChange);
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('blur');
    ipcRenderer.removeAllListeners('focus');
    FocusStore.removeListener('change', this._updateFocus);
    NotesSelectionStore.removeListener('change', this._onNotesSelectionChange);
    FilteredNotesStore.removeListener('change', this._onNotesChange);
  }

  _getBackgroundStyle() {
    return this.state.foreground ? 'linear-gradient(#d3d3d3, #d0d0d0)' : '#f6f6f6';
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'OmniBar') {
      const input = ReactDOM.findDOMNode(this._inputRef);
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.logs !== nextProps.logs) {
      this.setState({hasError: true});
    }
  }

  @autobind
  _onNotesChange(query: ?string) {
    this._query = query || '';
  }

  @autobind
  _onNotesSelectionChange() {
    const note = getCurrentNote();
    const currentValue = note ? note.get('title').toLowerCase() : '';
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
          const input = ReactDOM.findDOMNode(this._inputRef);
          if (document.activeElement === input) {
            if (currentValue && currentValue.startsWith(pendingValue)) {
              input.setSelectionRange(pendingValue.length, input.value.length);
            }
          }
        }
      );
      // TODO: need to handle case where i type "cheatsheet", then back cursor
      // to start and prefix "jest space"; at that point we jump to the end,
      // but nvALT selects the remaining part
    }
    this._query = null;
  }

  @autobind
  _onChange(event) {
    this._pendingDeletion = null;
    const value = event.currentTarget.value;
    this.setState({value});
    Actions.searchRequested(value);
  }

  @autobind
  _onCancelClick() {
    Actions.allNotesDeselected();
    ReactDOM.findDOMNode(this._inputRef).focus();
  }

  @autobind
  _onAttentionClick() {
    remote.getCurrentWindow().openDevTools();
    this.setState({hasError: false});
  }

  @autobind
  _onFocus(event) {
    // We want to select all text only if this was an in-app focus event; we
    // don't want to change the selection if this event is the result of the
    // application coming from the background into the foreground.
    if (this._blurred) {
      // Ignore first focus event after app goes to the background
      // (can't rely on this.state.foreground because it's racy with respect to
      // the focus event).
      this._blurred = false;
    } else {
      const input = event.currentTarget;
      input.setSelectionRange(0, input.value.length);
    }
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
              if (event.metaKey) {
                // Command+BACKSPACE: delete all previous characters in field.
                this._pendingDeletion = '';
              } else {
                // BACKSPACE: delete last character in field.
                this._pendingDeletion = value.substr(0, selectionStart - 1);
              }
            } else {
              return; // Nothing to do (already at start of input field).
            }
            this.setState({value: this._pendingDeletion});
            Actions.searchRequested(this._pendingDeletion, true);
          }
        }
        return;

      case Keys.ESCAPE:
        this.setState({value: ''});
        Actions.searchRequested('');
        return;

      case Keys.RETURN:
        {
          // Don't insert newline into Note view when it focuses.
          event.preventDefault();

          if (this.state.value) {
            const title = getCurrentTitle();
            if (this.state.value === title) {
              Actions.noteFocused();
            } else {
              Actions.noteCreationRequested(this.state.value);
            }
          } else {
            Actions.noteCreationRequested('Untitled Note');
          }
        }
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
        return;
    }

    performKeyboardNavigation(event);
  }

  render() {
    const styles = this._getStyles();
    const iconClass = NotesSelectionStore.selection.size === 1 ?
      'icon-pencil' :
      'icon-search';
    return (
      <div style={styles.root}>
        <span className={iconClass} style={styles.icon}></span>
        <input
          maxLength={this._getMaxLength()}
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
        {
          this.state.hasError ?
            <span
              className="icon-attention"
              onClick={this._onAttentionClick}
              style={styles.attention}>
            </span> :
            null
        }
        {
          this.state.value ?
            <span
              className="icon-cancel-circled"
              onClick={this._onCancelClick}
              style={styles.cancel}>
            </span> :
            null
        }
      </div>
    );
  }
}

function mapStateToProps({logs, system}) {
  return {logs, system};
}

export default connect(mapStateToProps)(OmniBar);
