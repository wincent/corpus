// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import React from 'react';

const styles = {
  root: {
    padding: '8px',
    fontFamily: 'Monaco',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
};

export default class Note extends React.Component {
  static propTypes = {
    note: React.PropTypes.object, // TODO: better shape for this
  };

  render() {
    if (this.props.note) {
      return (
        <div style={styles.root}>
          {this.props.note.get('text')}
        </div>
      );
    }

    return null;
  }
}
