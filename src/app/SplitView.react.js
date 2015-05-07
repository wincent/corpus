'use strict';

import React from 'react';
import invariant from 'react/lib/invariant';

import Separator from './Separator.react';

const styles = {
  left: {
    border: '5px solid #00f',
    flexBasis: 0,
    flexGrow: 1,
    overflowY: 'scroll',
  },
  right: {
    border: '5px solid #f00',
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
    this.state = {left: 1, right: 2};
  }

  _onMouseMove(event) {
    event.preventDefault(); // avoids unwanted selection of note text
    const width = window.innerWidth;
    const minimumX = 0;
    const maximumX = width - 200;

    // minimum <= X <= maximum
    const eventX = Math.min(
      Math.max(event.clientX, minimumX),
      maximumX
    );

    this.setState({
      left: Math.round(eventX),
      right: Math.round(width - eventX),
    });
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
    }
    return (
      <div style={styles.root}>
        <div style={leftStyles}>
          {this.props.children[0]}
        </div>
        <Separator key="separator" onMouseMove={this._onMouseMove.bind(this)} />
        <div style={rightStyles}>
          {this.props.children[1]}
        </div>
      </div>
    );
  }
}
