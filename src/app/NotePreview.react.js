'use strict';

import React from 'react';

export default class NotePreview extends React.Component {
  static propTypes = {
    focused: React.PropTypes.bool,
    selected: React.PropTypes.bool,
    text: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  };
  static defaultProps = {
    focused: false,
    selected: false,
  };

  getStyles() {
    return {
      root: {
        background: (
          this.props.focused ? '#6f6f73' :
          this.props.selected ? '#c8c8c8' :
          'inherit'
        ),
        borderBottom: '1px solid #c0c0c0',
        fontFamily: 'Helvetica Neue',
        fontSize: '11px',
        lineHeight: '14px',
        listStyleType: 'none',
        minHeight: '51px',
        padding: '4px 4px 4px 8px',
      },
      title: {
        color: (
          this.props.focused ? '#fff' :
          this.props.selected ? '#4e4e4e' :
          '#4f4f4f'
        ),
        fontWeight: (this.props.focused ? 'normal' : 'bold'),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      text: {
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        color: (
          this.props.focused ? '#fff' :
          this.props.selected ? '#4e4e4e' :
          '#a3a3a3'
        ),
        display: '-webkit-box',
        fontWeight: (this.props.focused ? 200 : 'normal'),
        overflow: 'hidden',
      },
    };
  }

  render() {
    const styles = this.getStyles();
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
