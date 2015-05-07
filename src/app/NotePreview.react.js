'use strict';

import React from 'react';

const styles = {
  root: {
    borderBottom: '1px solid #c0c0c0',
    fontFamily: 'Helvetica',
    fontSize: '11px',
    lineHeight: '14px',
    listStyleType: 'none',
    padding: '4px 4px 4px 8px',
  },
  title: {
    color: '#4f4f4f',
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  text: {
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    color: '#a3a3a3',
    display: '-webkit-box',
    overflow: 'hidden',
  }
};

export default class NotePreview extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
  };

  render() {
    return (
      <li style={styles.root}>
        <p style={styles.title}>
          {this.props.title}
        </p>
        <p style={styles.text}>
          {this.props.text}
        </p>
      </li>
    );
  }
}
