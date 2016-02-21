/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import autobind from 'autobind-decorator';
import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

import ContentEditable from './ContentEditable.react';

const cursorPositions = {};

export default class Note extends React.Component {
  static propTypes = {
    note: React.PropTypes.instanceOf(Immutable.Map).isRequired,
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
