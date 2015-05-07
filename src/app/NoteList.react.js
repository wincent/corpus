'use strict';

import React from 'react';

const styles = {
  root: {
    background: '#ebebeb',
    margin: 0,
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
    WebkitUserSelect: 'none',
  }
};

function getDummyNotes(): Array<React.Element> {
  return Array.apply(null, new Array(100)).map(
    (_, i) => <li key={i}>oh, look! a thing!</li>
  );
}

export default class NoteList extends React.Component {
  render() {
    return (
      <ul style={styles.root}>
        {getDummyNotes()}
      </ul>
    );
  }
}
