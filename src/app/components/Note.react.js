/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';

import ContentEditable from './ContentEditable.react';

const cursorPositions = {};

export default class Note extends React.Component {
  static propTypes = {
    // TODO: better shape for this
    note: React.PropTypes.object,
  };

  _recordCursorPosition(element) {
    if (this.props.note) {
      const position = element.selectionStart;
      cursorPositions[this.props.note.get('id')] = position;
    }
  }

  _restoreCursorPosition(element) {
    if (this.props.note) {
      const id = this.props.note.get('id');
      if (id in cursorPositions) {
        element.selectionStart = element.selectionEnd = cursorPositions[id];
      }
    }
  }

  @autobind
  _onBlur(event) {
    this._recordCursorPosition(event.currentTarget);
  }

  @autobind
  _onFocus(event) {
    this._restoreCursorPosition(event.currentTarget);
  }

  componentWillUpdate(nextProps) {
    if (this.props.note !== nextProps.note) {
      this._recordCursorPosition(ReactDOM.findDOMNode(this));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.note !== prevProps.note) {
      this._restoreCursorPosition(ReactDOM.findDOMNode(this));
    }
  }

  render() {
    if (this.props.note) {
      return (
        <ContentEditable
          note={this.props.note}
          onBlur={this._onBlur}
          onFocus={this._onFocus}
          tabIndex={3}
        />
      );
    }

    return null;
  }
}
