/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

import SplitView from './SplitView';
import Viewport from './Viewport';

export default function Corpus() {
  return (
    <Viewport>
      <SplitView>
        <div>left</div>
        <div>right</div>
      </SplitView>
    </Viewport>
  );
}
