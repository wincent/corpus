// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import shallowEqual from 'react/lib/shallowEqual';

import Actions from './Actions';
import Keys from './Keys';

export default class NotePreview extends React.Component {
  static propTypes = {
    focused: React.PropTypes.bool,
    noteID: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool,
    text: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  };
  static defaultProps = {
    focused: false,
    selected: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      pendingTitle: null,
    };
  }

  _getStyles() {
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
      text: {
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        color: (
          this.props.focused ? '#fff' :
          this.props.selected ? '#4e4e4e' :
          '#a3a3a3'
        ),
        display: '-webkit-box',
        fontWeight: 'normal',
        overflow: 'hidden',
      },
      title: {
        color: (
          this.props.focused ? '#fff' :
          this.props.selected ? '#4e4e4e' :
          '#4f4f4f'
        ),
        fontWeight: 'bold',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      titleInput: {
        margin: '-3px 0', // preserve overall row height
        width: '100%',
      },
    };
  }

  _endEditing(event) {
    this.setState({
      isEditing: false,
      pendingTitle: null,
    });
    Actions.noteTitleChanged({
      noteID: this.props.noteID,
      title: event.currentTarget.value,
    });
  }

  @autobind
  _onBlurTitle(event) {
    this._endEditing(event);
  }

  @autobind
  _onChange(event) {
    this.setState({pendingTitle: event.currentTarget.value});
  }

  @autobind
  _onClick(event) {
    if (event.metaKey && event.shiftKey) {
      // TODO: in nvALT this is some kind o drag;
      // eg. to a text document -> copies path
      // to desktop -> copies document
    } else if (event.metaKey) {
      if (this.props.selected) {
        Actions.noteDeselected({index: this.props.noteID});
      } else {
        Actions.noteSelected({index: this.props.noteID});
      }
    } else if (event.shiftKey) {
      Actions.noteRangeSelected({index: this.props.noteID});
    } else {
      Actions.noteSelected({
        exclusive: true,
        index: this.props.noteID,
      });
    }
  }

  @autobind
  _onDoubleClick() {
    this.setState({
      isEditing: true,
      pendingTitle: this.props.title,
    });
  }

  _onFocus(event) {
    var input = event.currentTarget;
    input.setSelectionRange(0, input.value.length);
  }

  @autobind
  _onKeyDown(event) {
    switch (event.keyCode) {
      case Keys.RETURN:
        event.currentTarget.blur(); // TODO: lose focus on input but not on entire preview
        break;
      case Keys.DOWN:
      case Keys.UP:
        event.stopPropagation(); // don't actually want to switch notes here
        break;
      case Keys.ESCAPE:
        this._endEditing(event);
        break;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }

  _renderTitle() {
    if (this.state.isEditing) {
      return (
        <input
          onBlur={this._onBlurTitle}
          onChange={this._onChange}
          onFocus={this._onFocus}
          onKeyDown={this._onKeyDown}
          ref={input => input && React.findDOMNode(input).focus()}
          style={this._getStyles().titleInput}
          type="text"
          value={this.state.pendingTitle}
        />
      );
    } else {
      const styles = this._getStyles();
      return (
        <p
          onDoubleClick={this._onDoubleClick}
          style={styles.title}>
          {this.props.title}
        </p>
      );
    }
  }

  render() {
    const styles = this._getStyles();
    return (
      <li onClick={this._onClick} style={styles.root}>
        {this._renderTitle()}
        <p style={styles.text}>
          {this.props.text}
        </p>
      </li>
    );
  }
}
