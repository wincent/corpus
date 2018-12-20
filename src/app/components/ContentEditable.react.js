/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';
import debounce from 'simple-debounce';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';
// TODO: move these actions
import Store, {bubbleNote, updateNote} from '../Store';
import Keys from '../Keys';
import NotesSelectionStore from '../stores/NotesSelectionStore';
import colors from '../colors';
import performKeyboardNavigation from '../performKeyboardNavigation';

import type {StoreProps} from '../Store';

type Props = {
  ...StoreProps,
  note: $FlowFixMe,
  tabIndex: number,
};

type State = {|
  id: number,
  value: string,
|};

const viewStates = {};

export default Store.withStore(
  class ContentEditable extends React.Component<Props, State> {
    _node: ?HTMLTextAreaElement;
    _pendingSave: boolean;

    _autosave = debounce(() => this._persistChanges(true), 5000);

    static getDerivedStateFromProps(props, state) {
      const id = props.note.id;
      if (id === state.id) {
        return state;
      }
      return {
        id,
        value: props.note.text,
      };
    }

    constructor(props) {
      super(props);
      this.state = {
        id: props.note.id,
        value: props.note.text,
      };
    }

    componentDidMount() {
      this._restoreViewState();
      if (this.props.store.get('focus') === 'Note') {
        this._getNode().focus();
      }
    }

    getSnapshotBeforeUpdate(prevProps) {
      // Check for note identity ('id') rather than using `===`. Attributes of a
      // note may change (for example, 'index' will change in response to
      // bubbling).
      if (prevProps.note.id !== this.props.note.id) {
        this._recordViewState(prevProps.note.id);
      }
      return null;
    }

    componentWillUnmount() {
      this._recordViewState(this.props.note.id);
      this._persistChanges();
    }

    _getNode(): HTMLTextAreaElement {
      if (!this._node) {
        throw new Error('Expected HTMLTextAreaElement');
      }
      return this._node;
    }

    _recordViewState(id: number) {
      const node = this._getNode();
      const viewState = {
        scrollTop: node.scrollTop,
        selectionEnd: node.selectionEnd,
        selectionStart: node.selectionStart,
      };
      viewStates[id] = viewState;
    }

    _restoreViewState() {
      const id = this.props.note.id;
      const node = this._getNode();
      let viewState = viewStates[id];
      if (!viewState) {
        viewState = {
          scrollTop: 0,
          selectionEnd: 0,
          selectionStart: 0,
        };
        viewStates[id] = viewState;
      }
      node.scrollTop = viewState.scrollTop;
      node.selectionEnd = viewState.selectionEnd;
      node.selectionStart = viewState.selectionStart;
    }

    componentDidUpdate(prevProps: Props) {
      if (this.props.note.id !== prevProps.note.id) {
        this._restoreViewState();
      }
      this._persistChanges();
      const focus = this.props.store.get('focus');
      if (focus === 'Note' && prevProps.store.get('focus') !== 'Note') {
        this._getNode().focus();
      }
    }

    _getStyles() {
      const {store} = this.props;
      return {
        root: {
          background: colors.background,
          border: 0,
          fontFamily: store.get('config.noteFontFamily'),
          fontSize: store.get('config.noteFontSize') + 'px',
          minHeight: 'calc(100vh - 36px)',
          outline: 0,
          overflowWrap: 'break-word',
          padding: '8px',
          whiteSpace: 'pre-wrap',
          width: '100%',
        },
      };
    }

    _persistChanges(isAutosave: boolean = false) {
      if (!this._pendingSave && isAutosave) {
        // No need to complete the autosave; an eager save already happened.
        return;
      }

      const text = this.state.value;
      if (text !== this.props.note.text) {
        // TODO: <-- remove (legacy) once NotesStore is gone
        Actions.noteTextChanged({
          index: this.props.note.index,
          isAutosave,
          text,
        });
        // END: legacy section
        updateNote(this.props.note.index, text, isAutosave);
      }

      this._pendingSave = false;
    }

    _onBlur = () => {
      this._recordViewState(this.props.note.id);

      if (!Dispatcher.isDispatching()) {
        this._persistChanges();
      }
    };

    _onChange = (event: SyntheticInputEvent<HTMLTextAreaElement>) => {
      const index = NotesSelectionStore.selection.values().next().value;
      if (index) {
        // Not at top of list, so bubble note to top.
        Actions.noteBubbled(this.props.note.index); // TODO: <-- remove (legacy)
        bubbleNote(this.props.note.index);
        this.props.store.set('bubbling')(this.props.note.index);
      }
      this.setState({value: event.currentTarget.value});
      this._pendingSave = true;
      this._autosave();
    };

    _onKeyDown = event => {
      // Prevent undesired fallthrough to `performKeyboardNavigation` for some
      // keys.
      switch (event.keyCode) {
        case Keys.DOWN:
        case Keys.UP:
          return;

        case Keys.ESCAPE:
          event.preventDefault();
          Actions.searchRequested(''); // TODO: kill legacy
          this.props.store.set('query')('');
          this.props.store.set('focus')('OmniBar');
          Actions.allNotesDeselected();
          return;

        case Keys.J:
        case Keys.K:
          if (!event.metaKey) {
            return;
          }
          break;

        case Keys.TAB:
          // Prevent the <body> from becoming `document.activeElement`.
          if (!event.shiftKey) {
            event.preventDefault();
            this.props.store.set('focus')('OmniBar');
            return;
          }
          break;
      }

      performKeyboardNavigation(event);
    };

    render() {
      return (
        <textarea
          onBlur={this._onBlur}
          onChange={this._onChange}
          onKeyDown={this._onKeyDown}
          ref={node => (this._node = node)}
          style={this._getStyles().root}
          tabIndex={this.props.tabIndex}
          value={this.state.value}
        />
      );
    }
  },
);
