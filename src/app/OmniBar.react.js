'use strict';

import React from 'react';

// TODO: Ideally, this would blend into title bar, but the gradient may be
// tricky
const styles = {
  input: {
    width: '100%',
  },
  root: {
    flexGrow: 0,
    padding: '4px 8px',
    minHeight: '28px',
  },
};

export default class OmniBar extends React.Component {
  render() {
    return (
      <div style={styles.root}>
        <input style={styles.input} type="search" />
      </div>
    );
  }
}
