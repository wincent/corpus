'use strict';

import React from 'react';
import cx from 'classnames';

const styles = {
  root: {
    backgroundColor: '#0f0',
    flexGrow: 0,
    width: '8px',
  },
};

export default class Separator extends React.Component {
  static propTypes = {
    onMouseMove: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {grabbing: false};
  }

  _onMouseDown() {
    const onMouseMove = this.props.onMouseMove;
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      this.setState({grabbing: false});
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    global.document.body.style.cursor = '-webkit-grabbing';
    this.setState({grabbing: true});
  }

  render() {
    var classes = cx({
      grabbing: this.state.grabbing,
      separator: true,
    });
    return (
      <div
        className={classes}
        onMouseDown={this._onMouseDown.bind(this)}
        style={styles.root}
      />
    );
  }
}
