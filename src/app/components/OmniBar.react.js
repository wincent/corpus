/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {ipcRenderer, remote} from 'electron';
import React from 'react';
import Actions from '../Actions';
import Keys from '../Keys';
import Store, {createNote} from '../Store';
import * as log from '../log';
import performKeyboardNavigation from '../performKeyboardNavigation';
import getCurrentNote from '../store/getCurrentNote';
import selectFirst from '../store/selectFirst';
import FilteredNotesStore from '../stores/FilteredNotesStore';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import TitleBar from './TitleBar.react';

import type {StoreProps} from '../Store';

function getCurrentTitle(store) {
  const note = getCurrentNote(store);
  if (note === null) {
    return '';
  } else {
    return note.title;
  }
}

type Props = {|
  ...StoreProps,
|};

type State = {|
  lastSeenLogIndex: number,
  foreground: boolean,
  showError: boolean,
  note: $FlowFixMe,
  value: string,
|};

export default Store.withStore(
  class OmniBar extends React.Component<Props, State> {
    _blurred: ?boolean;
    _inputRef: ?HTMLInputElement;
    _pendingDeletion: ?string;
    _query: ?string;

    static getDerivedStateFromProps(props: Props, state: State): State {
      // Check to see whether any WARNING or ERROR log messages have been
      // published since last time we rendered.
      const messages = props.store.get('log');
      const lastLogIndex = messages.length - 1;
      const {LOG_LEVEL} = log;
      if (
        messages
          .slice(state.lastSeenLogIndex + 1)
          .some(({level}) => LOG_LEVEL[level] <= LOG_LEVEL.WARNING)
      ) {
        return {
          ...state,
          lastSeenLogIndex: lastLogIndex,
          showError: true,
        };
      }
      return state;
    }

    constructor(props) {
      super(props);
      const note = getCurrentNote(props.store); // TODO update
      this.state = {
        lastSeenLogIndex: -1,
        foreground: true,
        showError: false,
        note,
        value: getCurrentTitle(props.store),
      };
    }

    /**
     * Returns the maximum note title length.
     */
    _getMaxLength(): number {
      const maxLength =
        this.props.store.get('system.nameMax') - '.md'.length - '.000'.length; // room to disambiguate up to 1,000 duplicate titles

      return Math.max(
        0, // sanity: never return a negative number
        maxLength,
      );
    }

    _getStyles() {
      const rightInputPadding =
        0 +
        (this.state.value ? 18 : 0) +
        (this.state.showError ? 18 : 0) +
        'px';
      return {
        attention: {
          color: '#fe2310',
          fontSize: '13px',
          position: 'absolute',
          right: this.state.value ? '24px' : '10px',
          top: '33px',
        },
        cancel: {
          color: '#bfbfbf',
          fontSize: '13px',
          position: 'absolute',
          right: '10px',
          top: '33px',
        },
        icon: {
          color: '#565656',
          fontSize: '14px',
          left: '10px',
          position: 'absolute',
          top: '33px',
        },
        input: {
          WebkitAppRegion: 'no-drag',
          WebkitAppearance: 'none', // only with this can we override padding
          border: '1px solid #a0a0a0',
          borderRadius: '4px',
          fontFamily: 'Helvetica Neue',
          lineHeight: '16px',
          padding: `2px ${rightInputPadding} 1px 20px`,
          width: '100%',
        },
        root: {
          WebkitAppRegion: 'drag',
          WebkitUserSelect: 'none',
          background: this._getBackgroundStyle(),
          borderBottom: '1px solid #d1d1d1',
          flexGrow: 0,
          padding: '30px 8px 14px',
          position: 'relative',
          minHeight: '60px',
        },
      };
    }

    componentDidMount() {
      ipcRenderer.on('blur', () => {
        this._blurred = true; // See _onFocus for rationale.
        this.setState({foreground: false});
      });
      ipcRenderer.on('focus', () => this.setState({foreground: true}));
      this._inputRef.focus();
      NotesSelectionStore.on('change', this._onNotesSelectionChange);
      FilteredNotesStore.on('change', this._onNotesChange);

      log.subscribe(message => {
        this.props.store.setFrom_EXPERIMENTAL(store =>
          store.set('log')([...store.get('log'), message]),
        );
      });
    }

    componentDidUpdate(prevProps) {
      const focus = this.props.store.get('focus');
      if (focus === 'OmniBar' && prevProps.store.get('focus') !== 'OmniBar') {
        const input = this._inputRef;
        input.focus();
        input.setSelectionRange(0, input.value.length);
      }
    }

    componentWillUnmount() {
      // No need to do clean-up; component never gets unmounted.
      throw new Error('OmniBar.react: Unexpected componentWillUnmount().');
    }

    _getBackgroundStyle() {
      return this.state.foreground
        ? 'linear-gradient(#d3d3d3, #d0d0d0)'
        : '#f6f6f6';
    }

    _onNotesChange = (query: ?string) => {
      this._query = query || '';

      // This will force an update in the event that the notes changed due to
      // clicking on a tag, for instance.
      this.setState({value: this._query});
    };

    _onNotesSelectionChange = () => {
      const {store} = this.props;
      const note = getCurrentNote(store);
      const currentValue = note ? note.title.toLowerCase() : '';
      const pendingValue = this._query ? this._query.toLowerCase() : '';
      if (this.state.note !== note || pendingValue !== currentValue) {
        let value;
        if (this._pendingDeletion != null) {
          value = this._pendingDeletion;
          this._pendingDeletion = null;
        } else {
          value = getCurrentTitle(store) || this._query || '';
        }
        this.setState({note, value}, () => {
          const input = this._inputRef;
          if (document.activeElement === input) {
            if (currentValue && currentValue.startsWith(pendingValue)) {
              input.setSelectionRange(pendingValue.length, input.value.length);
            }
          }
        });
        // TODO: need to handle case where i type "cheatsheet", then back cursor
        // to start and prefix "jest space"; at that point we jump to the end,
        // but nvALT selects the remaining part
      }
      this._query = null;
    };

    _onChange = event => {
      this._pendingDeletion = null;
      const value = event.currentTarget.value;
      this.setState({value});
      Actions.searchRequested(value); // TODO: kill legacy
      this.props.store.set('query')(value);
    };

    _onCancelClick = () => {
      Actions.searchRequested(''); // TODO: kill legacy
      this.props.store.set('query')('');
      this.setState({value: ''}, () => this._inputRef.focus());
    };

    _onAttentionClick = () => {
      remote.getCurrentWindow().openDevTools();
      this.setState({showError: false});
    };

    _onFocus = event => {
      // We want to select all text only if this was an in-app focus event; we
      // don't want to change the selection if this event is the result of the
      // application coming from the background into the foreground.
      if (this._blurred) {
        // Ignore first focus event after app goes to the background
        // (can't rely on this.state.foreground because it's racy with respect to
        // the focus event).
        this._blurred = false;
      } else {
        const input = event.currentTarget;
        input.setSelectionRange(0, input.value.length);
      }
    };

    _onKeyDown = event => {
      const {store} = this.props;
      switch (event.keyCode) {
        case Keys.BACKSPACE:
        case Keys.DELETE:
          {
            const {selectionStart, selectionEnd, value} = event.currentTarget;
            if (selectionEnd === value.length) {
              // Deletion at end of the input.
              event.preventDefault();
              if (selectionStart !== selectionEnd) {
                // Selection deletion.
                this._pendingDeletion = value.substr(0, selectionStart);
              } else if (selectionStart && event.keyCode === Keys.BACKSPACE) {
                if (event.metaKey) {
                  // Command+BACKSPACE: delete all previous characters in field.
                  this._pendingDeletion = '';
                } else {
                  // BACKSPACE: delete last character in field.
                  this._pendingDeletion = value.substr(0, selectionStart - 1);
                }
              } else {
                return; // Nothing to do (already at start of input field).
              }
              this.setState({value: this._pendingDeletion});
              Actions.searchRequested(this._pendingDeletion, true); // TODO: kill legacy, but also figure out what to do about isDeletion boolean flag
              store.set('query')(this._pendingDeletion);
            }
          }
          return;

        case Keys.ESCAPE:
          this.setState({value: ''});
          Actions.searchRequested(''); // TODO: kill legacy
          store.set('query')('');
          return;

        case Keys.RETURN:
          {
            // Don't insert newline into Note view when it focuses.
            event.preventDefault();

            if (this.state.value) {
              const title = getCurrentTitle(store);
              if (this.state.value === title) {
                store.set('focus')('Note');
              } else {
                Actions.noteCreationRequested(this.state.value); // TODO: delete (legacy) call
                createNote(this.state.value);
              }
            } else {
              Actions.noteCreationRequested('Untitled Note'); // TODO: delete (legacy) call
              createNote('Untitled Note');
            }
          }
          return;

        case Keys.TAB:
          {
            // Prevent the <body> from becoming `document.activeElement`.
            event.preventDefault();

            const size = store.get('selection').size;
            if (size === 0) {
              store.set('focus')('NoteList');
              selectFirst(store);
            } else if (size === 1) {
              store.set('focus')('Note');
            } else {
              store.set('focus')('NoteList');
            }
          }
          return;
      }

      performKeyboardNavigation(event, store);
    };

    render() {
      const styles = this._getStyles();
      const iconClass =
        NotesSelectionStore.selection.size === 1
          ? 'icon-pencil'
          : 'icon-search';
      return (
        <div style={styles.root}>
          <TitleBar />
          <span className={iconClass} style={styles.icon} />
          <input
            maxLength={this._getMaxLength()}
            onChange={this._onChange}
            onFocus={this._onFocus}
            onKeyDown={this._onKeyDown}
            placeholder="Search or Create"
            ref={ref => (this._inputRef = ref)}
            style={styles.input}
            tabIndex={1}
            type="text"
            value={this.state.value}
          />
          {this.state.showError ? (
            <span
              className="icon-attention"
              onClick={this._onAttentionClick}
              style={styles.attention}
            />
          ) : null}
          {this.state.value ? (
            <span
              className="icon-cancel-circled"
              onClick={this._onCancelClick}
              style={styles.cancel}
            />
          ) : null}
        </div>
      );
    }
  },
);
