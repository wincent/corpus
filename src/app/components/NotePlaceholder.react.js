/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  root: {
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 36px)',
  },
  lowerSpacer: {
    flexGrow: 2,
  },
  notice: {
    WebkitUserSelect: 'none',
    color: '#a3a3a3',
    fontSize: '18px',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  upperSpacer: {
    flexGrow: 1,
  },
};

export default class NotePlaceholder extends React.Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
  };

  _onMouseDown(event) {
    event.preventDefault(); // Disallow focus.
  }

  render() {
    const count = this.props.count ? this.props.count : 'No';
    return (
      <div onMouseDown={this._onMouseDown} style={styles.root}>
        <div style={styles.upperSpacer} />
        <div style={styles.notice}>
          {count} Notes Selected
        </div>
        <div style={styles.lowerSpacer} />
      </div>
    );
  }
}
