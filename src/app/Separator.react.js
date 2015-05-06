'use strict';

import React from 'react';

const styles = {
  root: {
    backgroundColor: '#0f0',
    flexGrow: 0,
    width: '8px',
  },
};

export default class Separator extends React.Component {
  render() {
    return <div style={styles.root} />;
  }
}
