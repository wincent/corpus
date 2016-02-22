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

const viewStates = {};

export default class Note extends React.Component {
  static propTypes = {
    note: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  };

  _recordViewState(element) {
    if (this.props.note) {
      viewStates[this.props.note.get('id')] = {
        scrollTop: element.scrollTop,
        selectionEnd: element.selectionEnd,
        selectionStart: element.selectionStart,
      };
    }
  }

  _restoreViewState(element) {
    if (this.props.note) {
      const id = this.props.note.get('id');
      const viewState = viewStates[id];
      if (viewState) {
        element.scrollTop = viewState.scrollTop;
        element.selectionEnd = viewState.selectionEnd;
        element.selectionStart = viewState.selectionStart;
      } else {
        element.selectionStart = element.selectionEnd = element.scrollTop = 0;
      }
    }
  }

  @autobind
  _onBlur(event) {
    this._recordViewState(event.currentTarget);
  }

  @autobind
  _onFocus(event) {
    this._restoreViewState(event.currentTarget);
  }

  componentWillUpdate(nextProps) {
    if (this.props.note !== nextProps.note) {
      this._recordViewState(ReactDOM.findDOMNode(this));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.note !== prevProps.note) {
      this._restoreViewState(ReactDOM.findDOMNode(this));
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
