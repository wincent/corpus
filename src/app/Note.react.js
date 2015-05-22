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
import FocusStore from './stores/FocusStore';

export default class Note extends React.Component {
  static propTypes = {
    // TODO: better shape for this
    note: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {focused: false};
  }

  componentDidMount() {
    FocusStore.on('change', this._updateFocus);
  }

  componentWillUnmount() {
    FocusStore.removeListener('change', this._updateFocus);
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'Note') {
      this.setState({focused: true});
    }
  }

  _getStyles() {
    return {
      root: {
        WebkitUserSelect: this.state.focused ? 'inherit' : 'none',
        fontFamily: 'Monaco',
        fontSize: '12px',
        outline: 0,
        overflowWrap: 'break-word',
        padding: '8px',
        whiteSpace: 'pre-wrap',
      }
    };
  }

  @autobind
  _onMouseDown() {
    this.setState({focused: true});
  }

  render() {
    if (this.props.note) {
      if (this.state.focused) {
        return (
          <ContentEditable
            note={this.props.note}
            tabIndex={3}
          />
        );
      } else {
        return (
          <div onMouseDown={this._onMouseDown} style={this._getStyles().root}>
            {this.props.note.get('text')}
          </div>
        );
      }
    }

    return null;
  }
}
