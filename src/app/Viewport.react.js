'use strict';

import React from 'react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
  },
};

export default class Viewport extends React.Component {
  render() {
    return (
      <div style={styles.root}>
        {this.props.children}
      </div>
    );
  }
}
