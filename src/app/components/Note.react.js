/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import ContentEditable from './ContentEditable.react';

const cursorPositions = {};

export default class Note extends React.Component {
  static propTypes = {
    // TODO: better shape for this
    note: React.PropTypes.object,
  };

  // TODO: DRY this up
  @autobind
  _onBlur(event) {
    if (this.props.note) {
      const position = event.currentTarget.selectionStart;
      cursorPositions[this.props.note.get('id')] = position;
      console.log('recorded (i)', position);
    }
  }

  @autobind
  _onFocus(event) {
    if (this.props.note) {
      const id = this.props.note.get('id');
      if (id in cursorPositions) {
        const textarea = event.currentTarget;
        textarea.selectionStart = textarea.selectionEnd = cursorPositions[id];
        console.log('restored (i)', cursorPositions[id]);
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.note) {
      const textarea = React.findDOMNode(this);
      const position = textarea.selectionStart;
      cursorPositions[this.props.note.get('id')] = position;
      console.log('recorded (ii)', position);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.note !== prevProps.note) {
      if (this.props.note) {
        const id = this.props.note.get('id');
        if (id in cursorPositions) {
          const textarea = React.findDOMNode(this);
          textarea.selectionStart = textarea.selectionEnd = cursorPositions[id];
          console.log('restored (ii)', cursorPositions[id]);
        }
      }
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
