/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import React from 'react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
  },
};

export default class Viewport extends React.Component {
  static propTypes = {
    children: React.PropTypes.arrayOf(React.PropTypes.element).isRequired,
  };

  render() {
    return (
      <div style={styles.root}>
        {this.props.children}
      </div>
    );
  }
}
