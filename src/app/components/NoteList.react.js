/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';

import Actions from '../Actions';
import Constants from '../Constants';
import Keys from '../Keys';
import NotePreview from './NotePreview.react';
import NoteAnimationStore from '../stores/NoteAnimationStore';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import FilteredNotesStore from '../stores/FilteredNotesStore';
import FocusStore from '../stores/FocusStore';
import colors from '../colors';
import printableFromKeyEvent from '../util/printableFromKeyEvent';
import performKeyboardNavigation from '../performKeyboardNavigation';
import pure from '../pure';
import throttle from '../throttle';

/**
 * How many notes will be rendered beyond the edges of the viewport (above and
 * below).
 */
const OFF_VIEWPORT_NOTE_BUFFER_COUNT = 20;

/**
 * Minimum delay between processing consecutive scroll events.
 */
const SCROLL_THROTTLE_INTERVAL = 250;

@pure
export default class NoteList extends React.Component {
  constructor(props) {
    super(props);
    this._listening = false;
    this._listenerTimeout = null;
    this.state = {
      animating: false,
      bubbling: null,
      focused: false,
      notes: FilteredNotesStore.notes,
      scrollTop: 0,
      selection: NotesSelectionStore.selection,
    };
  }

  componentDidMount() {
    NoteAnimationStore.on('change', this._initiateBubbling);
    NotesSelectionStore.on('change', this._updateNoteSelection);
    FilteredNotesStore.on('change', this._updateNotes);
    FocusStore.on('change', this._updateFocus);

    const node = ReactDOM.findDOMNode(this);
    node.addEventListener('transitionend', this._onTransitionEnd);
    const parent = node.parentNode;
    parent.addEventListener('scroll', this._onScroll);
  }

  componentWillUnmount() {
    NotesSelectionStore.removeListener('change', this._updateNoteSelection);
    FilteredNotesStore.removeListener('change', this._updateNotes);
    FocusStore.removeListener('change', this._updateFocus);
    this._removeListeners();

    const node = ReactDOM.findDOMNode(this);
    node.removeEventListener('transitionend', this._onTransitionEnd);
    const parent = node.parentNode;
    parent.removeEventListener('scroll', this._onScroll);
  }

  /**
   * Returns the index of the first renderable note in the range.
   */
  _getFirstRenderedNote() {
    const topEdge = Math.floor(this.state.scrollTop / Constants.PREVIEW_ROW_HEIGHT);
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
      (this.state.scrollTop + visibleHeight) / Constants.PREVIEW_ROW_HEIGHT
    );
    const last = Math.min(
      this.state.notes.size - 1,
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

  _getStyles() {
    const space = this._getFirstRenderedNote() * Constants.PREVIEW_ROW_HEIGHT;
    return {
      list: {
        WebkitUserSelect: 'none',
        cursor: 'default',
        margin: 0,
        outline: 0,
        padding: 0,
        position: 'absolute',
        top: space + 'px',
        left: 0,
        right: 0,
      },
      root: {
        background: colors.background,
        height: FilteredNotesStore.notes.size * Constants.PREVIEW_ROW_HEIGHT,
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
  _selectionChanged() {
    // Don't want to trigger on descdendant (eg. NotePreview title) selection
    // changes.
    if (document.activeElement === ReactDOM.findDOMNode(this)) {
      Actions.allNotesSelected();
    }
  }

  @autobind
  _initiateBubbling() {
    const bubbling = NoteAnimationStore.bubbling;
    this.setState({
      animating: false,
      bubbling,
    });
  }

  @autobind
  _updateFocus() {
    if (FocusStore.focus === 'NoteList') {
      ReactDOM.findDOMNode(this._ulRef).focus();
    }
  }

  @autobind
  _updateNoteSelection() {
    this.setState({selection: NotesSelectionStore.selection});
  }

  @autobind
  _updateNotes() {
    this.setState({notes: FilteredNotesStore.notes});
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
    // none`, and we listen for "selectionchange". In order to eliminate false
    // positives, we only listen when we're focused, and we use `setTimeout`
    // here because otherwise we wind up with a "selectionchange" event
    // immediately after focusing.
    clearTimeout(this._listenerTimeout);
    this._listenerTimeout = setTimeout(this._addListeners, 200);
    this.setState({focused: true});
  }

  @autobind
  _onKeyDown(event) {
    this._lastKeyDown = event.keyCode; // teh hax!

    switch (event.keyCode) {
      case Keys.A:
        if (event.metaKey) {
          Actions.allNotesSelected();
          event.preventDefault();
        }
        break;

      case Keys.TAB:
        event.preventDefault();

        if (event.shiftKey) {
          Actions.omniBarFocused();
        } else {
          if (NotesSelectionStore.selection.size === 1) {
            Actions.noteFocused();
          } else {
            // Multiple notes are selected, otherwise we wouldn't have focus.
            Actions.omniBarFocused();
          }
        }
        break;
    }

    performKeyboardNavigation(event);

    // If event not handled yet, focus the OmniBar and initiate a search.
    if (!event.defaultPrevented) {
      const printable = printableFromKeyEvent(event.nativeEvent);
      if (printable !== null) {
        event.preventDefault();
        Actions.omniBarFocused();
        Actions.searchRequested(printable);
      }
    }
  }

  // TODO: if I can figure out how to get @autobind and @throttle to play
  // nicely, use them...
  _updateScrollTop = throttle(
    scrollTop => requestAnimationFrame(() => this.setState({scrollTop})),
    SCROLL_THROTTLE_INTERVAL
  );

  @autobind
  _onTransitionEnd() {
    // A note has bubbled to the top, make sure we can see it still.
    const parent = ReactDOM.findDOMNode(this).parentNode;
    parent.scrollTop = 0;
  }

  @autobind
  _onScroll() {
    // A layer of indirection here is needed because event objects are pooled;
    // if we passed them directly into the throttled function they may have
    // changed by the time the wrapped function gets executed.
    const scrollTop = event.currentTarget.scrollTop;
    this._updateScrollTop(scrollTop);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.bubbling !== this.state.bubbling &&
      !this.state.animating
    ) {
      // Bubbling has been set up (we've re-rendered with the notes in a new
      // order, but with offsets in place to make it seem they haven't moved),
      // so now it's time to actually animate them to their new (real)
      // positions.
      this.setState({animating: true}); // eslint-disable-line react/no-did-update-set-state
    }

    if (prevState.selection !== this.state.selection) {
      if (this.state.selection.size) {
        // Maintain last selection within view.
        const lastIndex = this.state.selection.last();
        const last = ReactDOM.findDOMNode(this.refs[lastIndex]);
        last.scrollIntoViewIfNeeded(false);
      } else {
        // If we cleared the selection by pressing Escape or entering a
        // non-exact title match, we want to scroll to the top.
        const parent = ReactDOM.findDOMNode(this).parentNode;
        parent.scrollTop = 0;
      }
    }
    this._lastKeyDown = null;
  }

  _getTranslate(index: number) {
    let translate = this.state.bubbling;
    if (translate != null) {
      // The bubbled note is going to move up; handle the others specially:
      if (index > translate) {
        // This note should stay still.
        translate = null;
      } else if (index) {
        // This note was displaced downwards by the bubbled note.
        // We'll show it as animating down 1 slot from its original position.
        translate = -1;
      }
    }
    return translate;
  }

  _renderNotes() {
    const first = this._getFirstRenderedNote();
    const last = this._getLastRenderedNote();
    const notes = [];
    for (var i = first; i <= last; i++) {
      const selected = this.state.selection.has(i);
      const note = this.state.notes.get(i);
      notes.push(
        <NotePreview
          animating={this.state.animating}
          focused={this.state.focused && selected}
          index={i}
          key={note.get('id')}
          note={note}
          ref={i}
          selected={selected}
          translate={this._getTranslate(i)}
        />
      );
    }
    return notes;
  }

  render() {
    const styles = this._getStyles();
    return (
      <div style={styles.root}>
        <ul
          onBlur={this._onBlur}
          onFocus={this._onFocus}
          onKeyDown={this._onKeyDown}
          ref={ref => this._ulRef = ref}
          style={styles.list}
          tabIndex={2}
        >
          {this._renderNotes()}
        </ul>
      </div>
    );
  }
}
