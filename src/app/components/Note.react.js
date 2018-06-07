/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

import ContentEditable from './ContentEditable.react';

const viewStates = {};

type Props = {|
  // PropTypes.instanceOf(Immutable.Map).isRequired
  note: $FlowFixMe,
|};

export default class Note extends React.Component<Props> {
  /* When we get rid of Redux, getWrappedInstance() will go away and we can type
   * this.
   */
  _node: $FlowFixMe;

  _recordViewState() {
    const {note} = this.props;
    if (note) {
      const viewState = this._node.getWrappedInstance().getViewState();
      if (viewState.scrollTop !== undefined) {
        viewStates[note.get('id')] = viewState;
      }
    }
  }

  _restoreViewState() {
    if (this.props.note) {
      const id = this.props.note.get('id');
      const viewState = viewStates[id];
      const node = this._node.getWrappedInstance();
      if (viewState) {
        node.setViewState(viewState);
      } else {
        const newState = {
          scrollTop: 0,
          selectionEnd: 0,
          selectionStart: 0,
        };
        node.setViewState(newState);
        viewStates[id] = newState;
      }
    }
  }

  _onBlur = () => {
    this._recordViewState();
  };

  UNSAFE_componentWillUpdate(nextProps) {
    if (this.props.note.get('id') !== nextProps.note.get('id')) {
      this._recordViewState();
    }
  }

  componentDidMount() {
    this._restoreViewState();
  }

  componentDidUpdate(prevProps) {
    if (this.props.note.get('id') !== prevProps.note.get('id')) {
      this._restoreViewState();
    }
  }

  render() {
    const {note} = this.props;
    if (note) {
      return (
        <ContentEditable
          note={note}
          onBlur={this._onBlur}
          ref={node => (this._node = node)}
          tabIndex={3}
        />
      );
    }
    return null;
  }
}
