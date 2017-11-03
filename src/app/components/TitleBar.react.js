/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import simplifyPath from '../simplifyPath';

class TitleBar extends React.Component {
  static propTypes = {
    config: PropTypes.instanceOf(Immutable.Record),
  };

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
    const title = simplifyPath(this.props.config.notesDirectory);
    return (
      <div style={styles.root}>
        <span>{title}</span>
      </div>
    );
  }
}

function mapStateToProps({config}) {
  return {config};
}

export default connect(mapStateToProps)(TitleBar);
