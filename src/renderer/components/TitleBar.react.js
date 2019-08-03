/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';
import simplifyPath from '../simplifyPath';
import Store from '../Store';

import type {StoreProps} from '../Store';

const styles = {
  root: {
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    bottom: '36px',
    cursor: 'default',
    fontFamily: 'BlinkMacSystemFont',
    fontSize: '14px',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
  },
};

export default Store.withStore(({store}: StoreProps) => {
  const notesDirectory = store.get('config.notesDirectory');
  const title = notesDirectory ? simplifyPath(notesDirectory) : 'Corpus';
  return (
    <div style={styles.root}>
      <span>{title}</span>
    </div>
  );
});
