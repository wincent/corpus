'use strict';

import React from 'react';

import NotePreview from './NotePreview.react';

const styles = {
  root: {
    background: '#ebebeb',
    margin: 0,
    padding: 0,
    minHeight: 'calc(100vh - 36px)', // hack to ensure full background coverage
    WebkitUserSelect: 'none',
  }
};

function getDummyNotes(): Array<React.Element> {
  return Array.apply(null, new Array(100)).map((_, i) => (
    <NotePreview
      key={i}
      title="random title which keeps going on for some time you see"
      text="some body text and some more body text; quite a bit of this too as well of course"
    />
  ));
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
