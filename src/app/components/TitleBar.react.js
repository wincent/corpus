/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

class TitleBar extends React.Component {
  _getStyles() {
    return {
      root: {
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        bottom: '36px',
        cursor: 'default',
        fontFamily: 'BlinkMacSystemFont',
        fontSize: '14px',
        position: 'absolute',
        textAlign: 'center',
        width: '100%',
      },
    };
  }

  render() {
    const styles = this._getStyles();
    return <div style={styles.root}>Corpus</div>;
  }
}

export default TitleBar;
