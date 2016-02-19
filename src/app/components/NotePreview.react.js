/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import ipc from 'ipc';

import Actions from '../Actions';
import Constants from '../Constants';
import FocusStore from '../stores/FocusStore';
import Keys from '../Keys';
import Mouse from '../Mouse';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import pure from '../pure';

/**
 * Don't want the DOM to contain all the text of all the notes.
 * Truncate to a length that can fill two 600px rows.
 */
const PREVIEW_LENGTH = 250;
const TITLE_LENGTH = 125;

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

  componentDidUpdate() {
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
    const {focused, note, selected} = this.props;
    const isPrivate = note.get('tags').has('private');
    return {
      root: {
        background: (
          focused ? '#6f6f73' :
          selected ? '#c8c8c8' :
          'inherit'
        ),
        borderBottom: '1px solid #c0c0c0',
        fontFamily: 'Helvetica Neue',
        fontSize: '11px',
        lineHeight: '14px',
        listStyleType: 'none',
        height: Constants.PREVIEW_ROW_HEIGHT + 'px',
        padding: '4px 4px 4px 8px',
      },
      text: {
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        color: (
          isPrivate ? 'transparent' :
          focused ? '#fff' :
          selected ? '#4e4e4e' :
          '#a3a3a3'
        ),
        display: '-webkit-box',
        fontWeight: 'normal',
        overflow: 'hidden',
        textShadow: (
          isPrivate ?
          '0 0 5px rgba(0, 0, 0, .5)' :
          'unset'
        ),
      },
      title: {
        color: (
          focused ? '#fff' :
          selected ? '#4e4e4e' :
          '#4f4f4f'
        ),
        fontWeight: 'bold',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      titleInput: {
        fontFamily: 'inherit',
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
    if (event.metaKey && event.shiftKey) { // eslint-disable-line no-empty
      // TODO: in nvALT this is some kind of drag;
      // eg. to a text document -> copies path
      // to desktop -> copies document
    } else if (event.metaKey) {
      if (this.props.selected) {
        Actions.noteDeselected(this.props.index);
      } else {
        Actions.noteSelected(this.props.index);
      }
    } else if (event.shiftKey) {
      Actions.noteRangeSelected(this.props.index);
    } else {
      Actions.noteSelected(this.props.index, true);
    }
  }

  @autobind
  _onContextMenu() {
    if (this.state.isEditing) {
      return;
    }

    // Ghastly hack...
    setTimeout(() => ipc.send('context-menu'), 100);
  }

  @autobind
  _onDoubleClick() {
    this._startEditing();
  }

  // TODO: the input is getting complicated enough to pull out into a separate
  // component?
  _onFocus(event) {
    const input = event.currentTarget;
    input.setSelectionRange(0, input.value.length);
  }

  @autobind
  _onKeyDown(event) {
    event.stopPropagation();
    switch (event.keyCode) {
      case Keys.RETURN:
        event.preventDefault();
        React.findDOMNode(this).parentNode.focus(); // focus NoteList
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
      const selection = NotesSelectionStore.selection;
      if (!selection.has(this.props.index)) {
        // We weren't selected (or among a multiple selection); change that.
        Actions.noteSelected(this.props.index, true);
      }
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
    if (this.props.translate != null) {
      // We can't just animate `translate3d` because that would move the element
      // away from its new position; instead, we want it to appear to start at
      // its original position and move towards the new position.
      //
      // I was originally (ab)using chained transitions to get the desired
      // effect: the first one happened instantaneously (we used `top` to jump
      // by the specified `offset`), then the next one happened over .5s
      // (gradually restoring us back to 0 offset, this time with
      // `transform/translate3d`). However, the way React removes and reinserts
      // DOM nodes confused the browser and prevented some of the transitions
      // from happening, so instead, we use state juggling in `NoteList.react`
      // to effectively `setState` twice, and render twice.
      const offset = Constants.PREVIEW_ROW_HEIGHT * this.props.translate;
      if (this.props.animating) {
        styles.root.transition = 'transform .5s ease-in-out';
      } else {
        // Not ready to start animating yet, but the note has been reordered
        // within the `NotesStore` and within the DOM, so we have to offset it
        // to make it appear like it was still in its original location.
        styles.root.transform = `translate3d(0, ${offset}px, 0)`;
      }
    }
    const {note} = this.props;
    const text = note.get('body').substr(0, PREVIEW_LENGTH);
    return (
      <li
        className="animatable"
        onClick={this._onClick}
        onContextMenu={this._onContextMenu}
        onMouseDown={this._onMouseDown}
        style={styles.root}>
        {this._renderTitle()}
        <p style={styles.text}>
          {text}
        </p>
      </li>
    );
  }
}
