/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';

import Actions from '../Actions';
import Constants from '../Constants';
import Keys from '../Keys';
import NotePreview from './NotePreview.react';
import colors from '../colors';
import getLastInSet from '../getLastInSet';
import * as log from '../log';
import printableFromKeyEvent from '../util/printableFromKeyEvent';
import performKeyboardNavigation from '../performKeyboardNavigation';
import Store from '../Store';
import selectAll from '../store/selectAll';
import throttle from '../throttle';
import nullthrows from '../../common/nullthrows';

/**
 * How many notes will be rendered beyond the edges of the viewport (above and
 * below).
 */
const OFF_VIEWPORT_NOTE_BUFFER_COUNT = 20;

/**
 * Minimum delay between processing consecutive scroll events.
 */
const SCROLL_THROTTLE_INTERVAL = 250;

import type {Note, StoreProps} from '../Store';

type Props = {|
  ...StoreProps,
|};

type State = {|
  animating: boolean,
  bubbling: ?number,
  focused: boolean,
  scrollTop: number,
|};

export default Store.withStore(
  class NoteList extends React.PureComponent<Props, State> {
    _lastKeyDown: ?number;
    _listening: boolean;
    _listenerTimeout: ?TimeoutID;
    _ref: ?HTMLDivElement;
    _ulRef: ?HTMLUListElement;

    constructor(props: Props) {
      super(props);
      this._listening = false;
      this._listenerTimeout = null;
      this._ref = React.createRef();
      this.state = {
        animating: false,
        bubbling: null,
        focused: false,
        scrollTop: 0,
      };
    }

    componentDidMount() {
      const node = nullthrows(this._ref.current);
      node.addEventListener('transitionend', this._onTransitionEnd);
      const parent = nullthrows(node.parentElement);
      parent.addEventListener('scroll', this._onScroll);
    }

    componentWillUnmount() {
      // No need to do clean-up; component never gets unmounted.
      throw new Error('NoteList.react: Unexpected componentWillUnmount().');
    }

    /**
     * Returns the index of the first renderable note in the range.
     */
    _getFirstRenderedNote() {
      const topEdge = Math.floor(
        this.state.scrollTop / Constants.PREVIEW_ROW_HEIGHT,
      );
      const first = Math.max(0, topEdge - OFF_VIEWPORT_NOTE_BUFFER_COUNT);

      // Always keep last-selected note in the range, even if it means
      // over-rendering.
      const mostRecent = getLastInSet(this.props.store.get('selection'));
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
        (this.state.scrollTop + visibleHeight) / Constants.PREVIEW_ROW_HEIGHT,
      );
      const last = Math.min(
        this.props.store.get('filteredNotes').length - 1,
        bottomEdge + OFF_VIEWPORT_NOTE_BUFFER_COUNT,
      );

      // Always keep last-selected note in the range, even if it means
      // over-rendering.
      const mostRecent = getLastInSet(this.props.store.get('selection'));
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
          height:
            this.props.store.get('filteredNotes').length *
            Constants.PREVIEW_ROW_HEIGHT,
          minHeight: 'calc(100vh - 36px)', // ensure full background coverage
          position: 'relative',
        },
      };
    }

    _addListeners = () => {
      if (!this._listening) {
        document.addEventListener('selectionchange', this._selectionChanged);
        this._listening = true;
      }
    };

    _removeListeners() {
      this._listenerTimeout && clearTimeout(this._listenerTimeout);
      this._listenerTimeout = null;
      if (this._listening) {
        document.removeEventListener('selectionchange', this._selectionChanged);
        this._listening = false;
      }
    }

    // TODO: remind myself what this is for...
    _selectionChanged = () => {
      // Don't want to trigger on descdendant (eg. NotePreview title) selection
      // changes.
      if (document.activeElement === this._ref.current) {
        selectAll(this.props.store);
      }
    };

    _onBlur = () => {
      this._removeListeners();
      this.setState({focused: false});
    };

    _onFocus = () => {
      // In order to avoid re-implementing the first-responder wheel, we need to
      // handle "Select All" specially here. When we're focused, we want to
      // intercept it. We do this by ensuring that `Note.react` has `user-select:
      // none`, and we listen for "selectionchange". In order to eliminate false
      // positives, we only listen when we're focused, and we use `setTimeout`
      // here because otherwise we wind up with a "selectionchange" event
      // immediately after focusing.
      this._listenerTimeout && clearTimeout(this._listenerTimeout);
      this._listenerTimeout = setTimeout(this._addListeners, 200);
      this.setState({focused: true});
    };

    _onKeyDown = (event: SyntheticKeyboardEvent<HTMLUListElement>) => {
      const {store} = this.props;
      this._lastKeyDown = event.keyCode; // teh hax!

      switch (event.keyCode) {
        case Keys.A:
          if (event.metaKey) {
            selectAll(store);
            event.preventDefault();
          }
          break;

        case Keys.TAB:
          event.preventDefault();

          if (event.shiftKey) {
            this.props.store.set('focus')('OmniBar');
          } else {
            if (store.get('selection').size === 1) {
              store.set('focus')('Note');
            } else {
              // Multiple notes are selected, otherwise we wouldn't have focus.
              store.set('focus')('OmniBar');
            }
          }
          break;
      }

      performKeyboardNavigation(event, store);

      // If event not handled yet, focus the OmniBar and initiate a search.
      if (!event.defaultPrevented) {
        const printable = printableFromKeyEvent(event.nativeEvent);
        if (printable != null) {
          event.preventDefault();
          this.props.store.set('focus')('OmniBar');
          Actions.searchRequested(printable); // TODO: kill legacy
          this.props.store.set('query')(printable);
        }
      }
    };

    _updateScrollTop = throttle(
      scrollTop => requestAnimationFrame(() => this.setState({scrollTop})),
      SCROLL_THROTTLE_INTERVAL,
    );

    // BUG: fix animations (they aren't working)
    _onTransitionEnd = () => {
      // A note has bubbled to the top, make sure we can see it still.
      const parent = nullthrows(this._ref.current).parentElement;
      nullthrows(parent).scrollTop = 0;
      this.props.store.set('bubbling')(null);
    };

    _onScroll = (event: Event): mixed => {
      // A layer of indirection here is needed because event objects are pooled;
      // if we passed them directly into the throttled function they may have
      // changed by the time the wrapped function gets executed.
      const scrollTop = event.currentTarget.scrollTop;
      this._updateScrollTop(scrollTop);
    };

    componentDidUpdate(prevProps: Props, prevState: State) {
      if (prevState.bubbling !== this.state.bubbling && !this.state.animating) {
        // Bubbling has been set up (we've re-rendered with the notes in a new
        // order, but with offsets in place to make it seem they haven't moved),
        // so now it's time to actually animate them to their new (real)
        // positions.
        this.setState({animating: true}); // eslint-disable-line react/no-did-update-set-state
      }

      // TODO; check whether this works at all
      if (
        prevProps.store.get('selection') !== this.props.store.get('selection')
      ) {
        if (this.props.store.get('selection').size) {
          // Maintain last selection within view.
          const lastIndex = getLastInSet(this.props.store.get('selection'));
          const last = this.refs[lastIndex]; // eslint-disable-line react/no-string-refs

          // Using findDOMNode because Undux wraps the NotePreviews, breaking
          // the refs.
          try {
            ReactDOM.findDOMNode(last).scrollIntoViewIfNeeded(false); // eslint-disable-line react/no-find-dom-node
          } catch (error) {
            // BUG: fixme!
            // refs don't seem to be working, should be using forwarded refs
            // anyway:
            // https://github.com/bcherny/undux/issues/75
            log.error(error);
          }
        } else {
          // If we cleared the selection by pressing Escape or entering a
          // non-exact title match, we want to scroll to the top.
          const parent = nullthrows(this._ref.current).parentElement;
          nullthrows(parent).scrollTop = 0;
        }
      }

      const focus = this.props.store.get('focus');
      if (focus !== prevProps.store.get('focus') && focus === 'NoteList') {
        nullthrows(this._ulRef).focus();
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
      const {store} = this.props;
      const first = this._getFirstRenderedNote();
      const last = this._getLastRenderedNote();
      const notes = store.get('filteredNotes');
      const previews = [];
      for (var i = first; i <= last; i++) {
        const selected = store.get('selection').has(i);
        const note = notes[i];
        previews.push(
          <NotePreview
            animating={this.state.animating}
            focused={this.state.focused && selected}
            index={i}
            key={note.id}
            note={note}
            ref={String(i)}
            selected={selected}
            translate={this._getTranslate(i)}
          />,
        );
      }
      return previews;
    }

    render() {
      const styles = this._getStyles();
      return (
        <div ref={this._ref} style={styles.root}>
          <ul
            onBlur={this._onBlur}
            onFocus={this._onFocus}
            onKeyDown={this._onKeyDown}
            ref={ref => (this._ulRef = ref)}
            style={styles.list}
            tabIndex={2}>
            {this._renderNotes()}
          </ul>
        </div>
      );
    }
  },
);
