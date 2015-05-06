'use strict';

import React from 'react';

const styles = {
  root: {
    border: '5px solid #00f',
    flexGrow: 1,
    overflowY: 'scroll',
  },
  list: {
    border: '5px solid #ff0',
    margin: 0,
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
      <div style={styles.root}>
        <ul style={styles.list}>
          {getDummyNotes()}
        </ul>
      </div>
    );
  }
}
