'use strict';

import React from 'react';

import NotePlaceholder from './NotePlaceholder.react';

const styles = {
  root: {
    background: '#ebebeb',
    margin: '-16px 0', // offset webkit blank space at top and bottom
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
      <div style={styles.root}>
        {note}
      </div>
    );
  }
}
