// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';

const styles = {
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 36px)',
  },
  notice: {
    WebkitUserSelect: 'none',
    color: '#a3a3a3',
    fontSize: '18px',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  }
};

export default class NotePlaceholder extends React.Component {
  render() {
    return (
      <div style={styles.root}>
        <div style={styles.notice}>
          No Note Selected
        </div>
      </div>
    );
  }
}
