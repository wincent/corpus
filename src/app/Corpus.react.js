'use strict';

import React from 'react';

import SplitView from './SplitView.react';
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
        <SplitView>
          <div>left</div>
          <div>right</div>
        </SplitView>
      </div>
    );
  }
}
