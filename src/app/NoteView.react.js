// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';

import NotePlaceholder from './NotePlaceholder.react';

const styles = {
  root: {
    background: '#ebebeb',
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
  },
};

export default class NoteView extends React.Component {
  static propTypes = {
    note: React.PropTypes.object,
  };

  render() {
    let note = this.props.note;
    if (!note) {
      note = <NotePlaceholder />;
    }
    return (
      <div style={styles.root} tabIndex={2}>
        {note}
      </div>
    );
  }
}
