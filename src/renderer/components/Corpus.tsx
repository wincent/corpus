/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

import NoteList from './NoteList';
import OmniBar from './OmniBar';
import SplitView from './SplitView';
import Viewport from './Viewport';

export default function Corpus() {
  return (
    <Viewport>
      <OmniBar />
      <SplitView>
        <NoteList />
        <div>right</div>
      </SplitView>
    </Viewport>
  );
}
