// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';

import Actions from './Actions';
import Keys from './Keys';

export default class Note extends React.Component {
  static propTypes = {
    note: React.PropTypes.object, // TODO: better shape for this
  };

  constructor(props) {
    super(props);
    this.state = {focused: false};
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
      },
    };
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case Keys.ESCAPE:
        Actions.deselectAll();
        Actions.focusOmniBar();
        break;
    }
  }

  render() {
    if (this.props.note) {
      return (
        <div
          onBlur={() => this.setState({focused: false})}
          onFocus={() => this.setState({focused: true})}
          onKeyDown={this._onKeyDown}
          style={this._getStyles().root}
          tabIndex={3}>
          {this.props.note.get('text')}
        </div>
      );
    }

    return null;
  }
}
