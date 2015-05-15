// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import Actions from './Actions';
import FocusStore from './stores/FocusStore';
import Keys from './Keys';
import Mouse from './Mouse';
import NotesSelectionStore from './stores/NotesSelectionStore';
import pure from './pure';

/**
 * Don't want the DOM to contain all the text of all the notes.
 * Truncate to a length that can fill two 600px rows.
 */
const PREVIEW_LENGTH = 250;
const TITLE_LENGTH = 125;

@pure
export default class NotePreview extends React.Component {
  static ROW_HEIGHT = 51;
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

  _addListener() {
    if (!this._listening) {
      FocusStore.addListener('change', this._updateFocus);
      this._listening = true;
    }
  }

  _removeListener() {
    if (this._listening) {
      FocusStore.removeListener('change', this._updateFocus);
      this._listening = false;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.focused && NotesSelectionStore.selection.size === 1) {
      // We are the only selected note. Listen for (input title) focus events.
      this._addListener();
      // BUG: if you get focused as the second item in a set, and then the first
      // item gets removed, we never set up the listeners, even though you
      // should be eligible to get renamed at this point
    } else if (this._listening) {
      this._removeListener();
    }
  }

  componentWillUnmount() {
    this._removeListener();
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
        height: NotePreview.ROW_HEIGHT + 'px',
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

  _startEditing() {
    this.setState(
      {
        isEditing: true,
        pendingTitle: this.props.note.get('title'),
      },
      () => React.findDOMNode(this).scrollIntoViewIfNeeded(false)
    );
  }

  _endEditing(event) {
    const title = event.currentTarget.value;
    if (title !== this.props.note.get('title')) {
      Actions.noteTitleChanged({
        index: this.props.index,
        title,
      });
    }
    this.setState({
      isEditing: false,
      pendingTitle: null,
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
  _onContextMenu(event) {

    if (this.state.isEditing) {
      return;
    }

    // Ghastly hack returns...
    setTimeout(() => ipc.send('context-menu'), 100);
  }

  @autobind
  _onDoubleClick() {
    this._startEditing();
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

  @autobind
  _onMouseDown(event) {
    if (this.state.isEditing) {
      return;
    }

    if (
      event.button === Mouse.LEFT_BUTTON && event.ctrlKey ||
      event.button === Mouse.RIGHT_BUTTON
    ) {
      // Context menu is about to appear.
      Actions.noteSelected({
        exclusive: true,
        index: this.props.index,
      });
      // TODO: disable scrollIntoViewIfNeeded in this case; that would be weird
    }
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'TitleInput') {
      const selection = NotesSelectionStore.selection;
      if (selection.size === 1) {
        if (this.props.selected) {
          this._startEditing();
        }
      }
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
      const title = this.props.note.get('title').substr(0, TITLE_LENGTH);
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
      <li
        onClick={this._onClick}
        onContextMenu={this._onContextMenu}
        onMouseDown={this._onMouseDown}
        style={styles.root}>
        {this._renderTitle()}
        <p style={styles.text}>
          {this.props.note.get('text').substr(0, PREVIEW_LENGTH)}
        </p>
      </li>
    );
  }
}
