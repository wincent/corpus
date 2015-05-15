// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import invariant from 'react/lib/invariant';

import Separator from './Separator.react';
import clamp from './clamp';

const styles = {
  left: {
    flexBasis: 0,
    flexGrow: 1,
    overflowY: 'scroll',
  },
  right: {
    flexBasis: 0,
    flexGrow: 2,
    overflow: 'scroll',
  },
  root: {
    display: 'flex',
    flexGrow: 1,
  },
};

export default class SplitView extends React.Component {
  constructor(props) {
    super(props);

    // These proportions based on initial window dimensions set in main.js.
    this.state = {left: 400, right: 800};
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _adjustPanes(desiredLeftPaneWidth) {
    if (desiredLeftPaneWidth < 40) {
      desiredLeftPaneWidth = 0;
    } else if (desiredLeftPaneWidth < 75) {
      desiredLeftPaneWidth = 75;
    }

    const width = window.innerWidth;
    const minimumX = 0;
    const maximumX = Math.min(600, width - 100);

    // minimum <= X <= maximum
    const eventX = clamp(desiredLeftPaneWidth, minimumX, maximumX);

    this.setState({
      left: Math.round(eventX),
      right: Math.round(width - eventX - 8),
    });
  }

  @autobind
  _onMouseMove(event) {
    event.preventDefault(); // avoids unwanted selection of note text
    this._adjustPanes(event.clientX);
  }

  @autobind
  _onResize() {
    // want to keep "left" the same as it is, unless it violates a constraint
    requestAnimationFrame(() => this._adjustPanes(this.state.left));
  }

  render() {
    invariant(
      React.Children.count(this.props.children) === 2,
      'SplitView expects exactly two children'
    );
    const leftStyles = {
      ...styles.left,
      flexGrow: this.state.left,
    };
    const rightStyles = {
      ...styles.right,
      flexGrow: this.state.right,
    };
    return (
      <div style={styles.root}>
        <div style={leftStyles}>
          {this.props.children[0]}
        </div>
        <Separator key="separator" onMouseMove={this._onMouseMove} />
        <div style={rightStyles}>
          {this.props.children[1]}
        </div>
      </div>
    );
  }
}
