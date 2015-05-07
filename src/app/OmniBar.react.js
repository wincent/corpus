'use strict';

import React from 'react';
import ipc from 'ipc';

const styles = {
  input: {
    width: '100%',
  },
  root: {
    borderBottom: '1px solid #d1d1d1',
    flexGrow: 0,
    padding: '4px 8px',
    minHeight: '32px',
  },
};

export default class OmniBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {focused: true};
  }

  componentDidMount() {
    ipc.on('blur', () => this.setState({focused: false}));
    ipc.on('focus', () => this.setState({focused: true}));
  }

  _getBackgroundStyle() {
    return this.state.focused ? 'linear-gradient(#d3d3d3, #d0d0d0)' : '#f6f6f6';
  }

  render() {
    let rootStyles = {
      ...styles.root,
      background: this._getBackgroundStyle(),
    };
    return (
      <div style={rootStyles}>
        <input style={styles.input} type="search" />
      </div>
    );
  }
}
