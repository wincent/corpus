// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import invariant from 'react/lib/invariant';

import Separator from './Separator.react';
import clamp from './clamp';
import throttle from './throttle';

const styles = {
  left: {
    flexBasis: 0,
    overflowY: 'scroll',
  },
  right: {
    flexBasis: 0,
    overflowY: 'scroll',
  },
  root: {
    display: 'flex',
    flexGrow: 1,
  },
};

export default class SplitView extends React.Component {
  // Using a property initializer here because I couldn't get my @throttled
  // decorator to interoperate with @autobind.
  _onScroll = throttle(
    (event) => {
      const target = event.currentTarget;
      if (target) {
        // No idea why these events sometimes don't have a target.
        requestAnimationFrame(() => {
          this.setState({scrollTop: target.scrollTop});
        });
      }
    },
    100
  );

  constructor(props) {
    super(props);

    // Initial desired separator location based on initial window dimensions
    // set in main.js.
    this.state = this._getPaneDimensions(400);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _getPaneDimensions(desiredLeftPaneWidth) {
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

    return {
      left: Math.round(eventX),
      right: Math.round(width - eventX - 8),
    };
  }

  @autobind
  _onMouseMove(event) {
    event.preventDefault(); // avoids unwanted selection of note text
    this.setState(this._getPaneDimensions(event.clientX));
  }

  @autobind
  _onResize() {
    this.setState(this._getPaneDimensions(this.state.left));
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
        <div onScroll={this._onScroll} style={leftStyles}>
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
