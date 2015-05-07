'use strict';

import React from 'react';

const styles = {
  root: {
    background: '#ebebeb',
    flexGrow: 1,
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
      <ul style={styles.root}>
        {getDummyNotes()}
      </ul>
    );
  }
}
