'use strict';

import React from 'react';
import invariant from 'react/lib/invariant';

import Separator from './Separator.react';

const styles = {
  root: {
    display: 'flex',
    flexGrow: 1,
  },
};

export default class SplitView extends React.Component {
  render() {
    invariant(
      React.Children.count(this.props.children) === 2,
      'SplitView expects exactly two children'
    );
    const children = [];
    React.Children.forEach(
      this.props.children,
      (child, i) => (
        children.push(React.cloneElement(child, {key: i ? 'right' : 'left'}))
      )
    );
    children.splice(1, 0, <Separator key="separator" />);
    return (
      <div style={styles.root}>
        {children}
      </div>
    );
  }
}
