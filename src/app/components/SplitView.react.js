/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

import Separator from './Separator.react';
import clamp from '../clamp';

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

import type {ChildrenArray, Node as ReactNode} from 'react';
type Props = {|
  children: $ReadOnlyArray<ChildrenArray<ReactNode>>,
|};
type State = {|
  left: number,
  right: number,
|};

export default class SplitView extends React.Component<Props, State> {
  constructor(props: Props) {
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

  _getPaneDimensions(desiredLeftPaneWidth: number) {
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

  _onMouseMove = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    event.preventDefault(); // avoids unwanted selection of note text
    this.setState(this._getPaneDimensions(event.clientX));
  };

  _onResize = () => {
    this.setState(this._getPaneDimensions(this.state.left));
  };

  render() {
    const children = React.Children.toArray(this.props.children);
    if (children.length !== 2) {
      throw new Error('SplitView expects exactly two children');
    }
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
        <div style={leftStyles}>{children[0]}</div>
        <Separator key="separator" onMouseMove={this._onMouseMove} />
        <div style={rightStyles}>{children[1]}</div>
      </div>
    );
  }
}
