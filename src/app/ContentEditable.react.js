// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import Dispatcher from './Dispatcher';
import FocusStore from './stores/FocusStore';
import Keys from './Keys';
import NotesStore from './stores/NotesStore';
import colors from './colors';
import performKeyboardNavigation from './performKeyboardNavigation';

export default class ContentEditable extends React.Component {
  static propTypes = {
    note: React.PropTypes.object,
    value: React.PropTypes.text,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.note.get('text'),
    };
  }

  componentDidMount() {
    React.findDOMNode(this).focus();
    FocusStore.on('change', this._updateFocus);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.note !== this.props.note) {
      this._persistChanges();
    }
    this.setState({
      value: nextProps.note.get('text'),
    });
  }

  componentWillUnmount() {
    FocusStore.removeListener('change', this._updateFocus);
    this._persistChanges();
  }

  _getStyles() {
    return {
      root: {
        WebkitUserSelect: this.state.focused ? 'inherit' : 'none',
        background: colors.background,
        border: 0,
        fontFamily: 'Monaco',
        fontSize: '12px',
        minHeight: 'calc(100vh - 36px)',
        outline: 0,
        overflowWrap: 'break-word',
        padding: '8px',
        whiteSpace: 'pre-wrap',
        width: '100%',
      }
    };
  }

  _persistChanges() {
    const text = this.state.value;

    // Ugh, would like to do this without a linear scan.
    let matchingIndex = null;
    const index = NotesStore.notes.find((note, index) => {
      if (note.get('id') === this.props.note.get('id')) {
        matchingIndex = index;
        return true;
      }
    });

    if (text !== this.props.note.get('text')) {
      Actions.noteTextChanged({
        index: matchingIndex,
        text,
      });
    }
    // TODO: persist changes properly (to disk/git)
  }

  @autobind
  _onBlur(event) {
    if (!Dispatcher.isDispatching()) {
      this._persistChanges();
    }
  }


  @autobind
  _onChange(event) {
    this.setState({value: event.currentTarget.value});
    // TODO: persist changes after an interval has passed, or a set number of
    // changes (or size of changes)
  }

  _onKeyDown(event) {
    // Prevent undesired fallthrough to `performKeyboardNavigation` for some
    // keys.
    switch (event.keyCode) {
      case Keys.DOWN:
      case Keys.UP:
        return;

      case Keys.ESCAPE:
        event.preventDefault();
        Actions.searchRequested({value: ''});
        Actions.omniBarFocused();
        Actions.allNotesDeselected();
        return;

      case Keys.J:
      case Keys.K:
        if (!event.metaKey) {
          return;
        }
        break;

       case Keys.TAB:
        // Prevent the <body> from becoming `document.activeElement`.
        if (!event.shiftKey) {
          event.preventDefault();
          Actions.omniBarFocused();
          return;
        }
        break;
    }

    performKeyboardNavigation(event);
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'Note') {
      React.findDOMNode(this).focus();
    }
  }

  render() {
    return (
      <textarea
        {...this.props}
        onBlur={this._onBlur}
        onChange={this._onChange}
        onKeyDown={this._onKeyDown}
        style={this._getStyles().root}
        value={this.state.value}
      />
    );
  }
}
