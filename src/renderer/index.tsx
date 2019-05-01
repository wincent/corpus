import * as React from 'react';
import {render} from 'react-dom';

const root = document.getElementById('root');

if (!root) {
  throw new Error('No #root element');
}

render(<div>text</div>, root);
