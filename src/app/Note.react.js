'use strict';

import React from 'react';

const styles = {
  root: {
    border: '5px solid #f00',
    flexGrow: 2,
    overflow: 'scroll',
  },
};

function getDummyParagraphs(): Array<React.Element> {
  return Array.apply(null, new Array(100)).map(
    (_, i) => <p key={i}>Plenty of content for the right pane.</p>
  );
}

export default class Note extends React.Component {
  render() {
    return (
      <div style={styles.root}>
        {getDummyParagraphs()}
      </div>
    );
  }
}
