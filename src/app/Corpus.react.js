'use strict';

import React from 'react';
import colors from './colors';

const styles = {
  container: {
    border: `1px solid ${colors.border}`,
  },
};

export default class Corpus extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        Split view
      </div>
    );
  }
}
