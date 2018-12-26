/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

import Note from './Note.react';
import NotePlaceholder from './NotePlaceholder.react';
import Store from '../Store';
import colors from '../colors';

import type {StoreProps} from '../Store';

const styles = {
  root: {
    background: colors.background,
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
  },
};

// TODO: make this stateless functional
export default Store.withStore(
  class NoteView extends React.Component<StoreProps> {
    componentWillUnmount() {
      // No need to do clean-up; component never gets unmounted.
      throw new Error('NoteView.react: Unexpected componentWillUnmount().');
    }

    render() {
      const notes = this.props.store.get('selectedNotes');
      const count = notes.length;
      return (
        <div style={styles.root}>
          {count ? <Note note={notes[0]} /> : <NotePlaceholder count={count} />}
        </div>
      );
    }
  },
);
