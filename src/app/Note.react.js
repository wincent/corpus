'use strict';

import React from 'react';

function getDummyParagraphs(): Array<React.Element> {
  return Array.apply(null, new Array(100)).map(
    (_, i) => <p key={i}>Plenty of content for the right pane.</p>
  );
}

export default class Note extends React.Component {
  render() {
    return (
      <div>
        {getDummyParagraphs()}
      </div>
    );
  }
}
