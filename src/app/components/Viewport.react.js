/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
  },
};

import type {ChildrenArray, Node as ReactNode} from 'react';

type Props = {|
  children: ChildrenArray<ReactNode>,
|};

// TODO: Make this a functional component
export default class Viewport extends React.Component<Props> {
  render() {
    return <div style={styles.root}>{this.props.children}</div>;
  }
}
