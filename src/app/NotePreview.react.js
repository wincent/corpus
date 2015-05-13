// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import Keys from './Keys';
import pure from './pure';

/**
 * Don't want the DOM to contain all the text of all the notes.
 * Truncate to a length that can fill two 600px rows.
 */
const PREVIEW_LENGTH = 250;

@pure
export default class NotePreview extends React.Component {
  static propTypes = {
    focused: React.PropTypes.bool,
    index: React.PropTypes.number.isRequired,
    note: React.PropTypes.object.isRequired, // TODO: better shape here
    selected: React.PropTypes.bool,
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
      index: this.props.index,
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
        Actions.noteDeselected({index: this.props.index});
      } else {
        Actions.noteSelected({index: this.props.index});
      }
    } else if (event.shiftKey) {
      Actions.noteRangeSelected({index: this.props.index});
    } else {
      Actions.noteSelected({
        exclusive: true,
        index: this.props.index,
      });
    }
  }

  @autobind
  _onDoubleClick() {
    this.setState({
      isEditing: true,
      pendingTitle: this.props.note.get('title'),
    });
  }

  _onFocus(event) {
    const input = event.currentTarget;
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
      const title = this.props.note.get('title').substr(0, PREVIEW_LENGTH);
      return (
        <p
          onDoubleClick={this._onDoubleClick}
          style={styles.title}>
          {title}
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
          {this.props.note.get('text')}
        </p>
      </li>
    );
  }
}
