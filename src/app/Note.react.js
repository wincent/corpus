// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import FocusStore from './stores/FocusStore';
import Keys from './Keys';
import colors from './colors';
import performKeyboardNavigation from './performKeyboardNavigation';

export default class Note extends React.Component {
  static propTypes = {
    // TODO: better shape for this
    note: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      value: this.props.note ? this.props.note.get('text') : '',
    };
  }

  componentDidMount() {
    FocusStore.on('change', this._updateFocus);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.note ? nextProps.note.get('text') : '',
    });
  }

  componentWillUpdate(nextProps, nextState) {
    FocusStore.on('change', this._updateFocus);
  }

  _getStyles() {
    const baseStyles = {
      WebkitUserSelect: this.state.focused ? 'inherit' : 'none',
      fontFamily: 'Monaco',
      fontSize: '12px',
      outline: 0,
      overflowWrap: 'break-word',
      padding: '8px',
      whiteSpace: 'pre-wrap',
    };
    return {
      inactive: baseStyles,
      active: {
        ...baseStyles,
        background: colors.background,
        border: 0,
        minHeight: 'calc(100vh - 36px)',
        width: '100%',
      },
    };
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'Note') {
      this.setState(
        {focused: true},
        () => React.findDOMNode(this._textareaRef).focus()
      );
    }
  }

  @autobind
  _onBlur(event) {
    this.setState({focused: false});
    // Ugh, would like to do this without a linear scan.
    let matchingIndex = null;
    // For some reason, eager `import` up top breaks things.
    const NotesStore = require('./stores/NotesStore');
    const index = NotesStore.notes.find((note, index) => {
      if (note.get('id') === this.props.note.get('id')) {
        matchingIndex = index;
        return true;
      }
    });
    Actions.noteTextChanged({
      index: matchingIndex,
      text: event.currentTarget.value,
    });
    // TODO: persist changes properly (to disk/git)
  }

  @autobind
  _onFocus() {
    this.setState(
      {focused: true},
      () => React.findDOMNode(this._textareaRef).focus()
    );
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
        }
        break;
    }

    performKeyboardNavigation(event);
  }

  render() {
    if (this.props.note) {
      if (this.state.focused) {
        return (
          <textarea
            onBlur={this._onBlur}
            onChange={this._onChange}
            ref={ref => this._textareaRef = ref}
            style={this._getStyles().active}
            tabIndex={3}
            value={this.state.value}
          />
        );
      } else {
        return (
          <div
            onFocus={this._onFocus}
            onKeyDown={this._onKeyDown}
            style={this._getStyles().inactive}
            tabIndex={3}>
            {this.state.value}
          </div>
        );
      }
    }

    return null;
  }
}
