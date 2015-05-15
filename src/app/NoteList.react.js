// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import Actions from './Actions';
import NotePreview from './NotePreview.react';
import NotesSelectionStore from './stores/NotesSelectionStore';
import NotesStore from './stores/NotesStore';
import performKeyboardNavigation from './performKeyboardNavigation';
import pure from './pure';
import throttle from './throttle';

/**
 * How many notes will be rendered beyond the edges of the viewport (above and
 * below).
 */
// BUG: should be able to reduce this, but we lose momentum scrolling
// (need throttle?)
const OFF_VIEWPORT_NOTE_BUFFER_COUNT = 20;

/**
 * Minimum delay between processing consecutive scroll events.
 */
const SCROLL_THROTTLE_INTERVAL = 32; // ie. two frames

@pure
export default class NoteList extends React.Component {
  constructor(props) {
    super(props);
    this._listening = false;
    this._listenerTimeout = null;
    this.state = {
      focused: false,
      notes: NotesStore.notes,
      scrollTop: 0,
      selection: NotesSelectionStore.selection,
    };
  }

  componentDidMount() {
    NotesSelectionStore.on('change', this._updateNoteSelection);
    NotesStore.on('change', this._updateNotes);

    const parent = React.findDOMNode(this).parentNode;
    parent.addEventListener('scroll', this._onScroll);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNoteSelection);
    NotesStore.removeListener('change', this._updateNotes);
    this._removeListeners();

    const parent = React.findDOMNode(this).parentNode;
    parent.removeEventListener('scroll', this._onScroll);
  }

  /**
   * Returns the index of the first renderable note in the range.
   */
  _getFirstRenderedNote() {
    const topEdge = Math.floor(this.state.scrollTop / NotePreview.ROW_HEIGHT);
    const first = Math.max(0, topEdge - OFF_VIEWPORT_NOTE_BUFFER_COUNT);

    // Always keep last-selected note in the range, even if it means
    // over-rendering.
    const mostRecent = this.state.selection.last();
    if (mostRecent != null) {
      return Math.min(mostRecent, first);
    } else {
      return first;
    }
  }

  /**
   * Returns the index of the last renderable note in the range.
   */
  _getLastRenderedNote() {
    const visibleHeight = window.innerHeight - 36;
    const bottomEdge = Math.ceil(
      (this.state.scrollTop + visibleHeight) / NotePreview.ROW_HEIGHT
    );
    const last = Math.min(
      this.state.notes.size,
      bottomEdge + OFF_VIEWPORT_NOTE_BUFFER_COUNT
    );

    // Always keep last-selected note in the range, even if it means
    // over-rendering.
    const mostRecent = this.state.selection.last();
    if (mostRecent != null) {
      return Math.max(mostRecent, last);
    } else {
      return last;
    }
  }

  _getSpacerHeight() {
    const upperNoteCount = this._getFirstRenderedNote();
    return upperNoteCount * NotePreview.ROW_HEIGHT;
  }

  _getStyles() {
    const space = this._getSpacerHeight();
    return {
      list: {
        WebkitUserSelect: 'none',
        cursor: 'default',
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: space + 'px',
        left: 0,
        right: 0,
      },
      root: {
        background: '#ebebeb',
        height: NotesStore.notes.size * NotePreview.ROW_HEIGHT,
        minHeight: 'calc(100vh - 36px)', // ensure full background coverage
        position: 'relative',
      },
    };
  }

  @autobind
  _addListeners() {
    if (!this._listening) {
      document.addEventListener('selectionchange', this._selectionChanged);
      this._listening = true;
    }
  }

  _removeListeners() {
    clearTimeout(this._listenerTimeout);
    this._listenerTimeout = null;
    if (this._listening) {
      document.removeEventListener('selectionchange', this._selectionChanged);
      this._listening = false;
    }
  }

  @autobind
  _selectionChanged(event) {
    // Don't want to trigger on descdendant (eg. NotePreview title) selection
    // changes.
    if (document.activeElement === React.findDOMNode(this)) {
      Actions.allNotesSelected();
    }
  }

  @autobind
  _updateNoteSelection() {
    this.setState({selection: NotesSelectionStore.selection});
  }

  @autobind
  _updateNotes() {
    this.setState({notes: NotesStore.notes});
  }

  @autobind
  _onBlur() {
    this._removeListeners();
    this.setState({focused: false});
  }

  @autobind
  _onFocus() {
    // In order to avoid re-implementing the first-responder wheel, we need to
    // handle "Select All" especially here. When we're focused, we want to
    // intercept it. We do this by ensuring that `Note.react` has `user-select:
    // none`, and we listen for "selectionchange". In order to elimate false
    // positives, we only listen when we're focused, and we use `setTimeout`
    // here because otherwise we wind up with a "selectionchange" event
    // immediately after focusing.
    clearTimeout(this._listenerTimeout);
    this._listenerTimeout = setTimeout(this._addListeners, 200);
    this.setState({focused: true});
  }

  _onKeyDown(event) {
    performKeyboardNavigation(event);
  }

  _updateScrollTop = throttle((scrollTop) => {
    this.setState({scrollTop});
  }, SCROLL_THROTTLE_INTERVAL);

  @autobind
  _onScroll() {
    // A layer of indirection here is needed because event objects are pooled;
    // if we passed them directly into the throttled function they may have
    // changed by the time the wrapped function gets executed.
    const scrollTop = event.currentTarget.scrollTop;
    this._updateScrollTop(scrollTop);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selection !== this.state.selection) {
      if (this.state.notes.size) {
        const parent = React.findDOMNode(this).parentNode;
        if (!this.state.selection.size) {
          // We have notes, but nothing selected; scroll to top.
          parent.scrollTop = 0;
        } else {
          // Maintain last selection within view.
          const lastIndex = this.state.selection.last();
          const last = React.findDOMNode(this.refs[lastIndex]);
          last.scrollIntoViewIfNeeded(false);
        }
      }
    }
  }

  _renderNotes() {
    const first = this._getFirstRenderedNote();
    const last = this._getLastRenderedNote();
    return this.state.notes.map((note, i) => {
      if (i < first || i > last) {
        return null;
      }
      const selected = this.state.selection.has(i);
      return (
        <NotePreview
          focused={this.state.focused && selected}
          index={i}
          key={note.get('id')}
          note={note}
          ref={i}
          selected={selected}
        />
      );
    });
  }

  render() {
    const styles = this._getStyles();
    return (
      <div style={styles.root}>
        <ul
          onBlur={this._onBlur}
          onFocus={this._onFocus}
          onKeyDown={this._onKeyDown}
          style={styles.list}
          tabIndex={2}
        >
          {this._renderNotes()}
        </ul>
      </div>
    );
  }
}
