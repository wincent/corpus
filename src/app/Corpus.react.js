'use strict';

import React from 'react';

import Note from './Note.react';
import NoteList from './NoteList.react';
import OmniBar from './OmniBar.react';
import SplitView from './SplitView.react';
import Viewport from './Viewport.react';

export default class Corpus extends React.Component {
  render() {
    return (
      <Viewport>
        <OmniBar />
        <SplitView>
          <NoteList />
          <Note />
        </SplitView>
      </Viewport>
    );
  }
}
