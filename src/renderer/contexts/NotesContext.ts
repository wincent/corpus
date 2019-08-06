/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import FrozenSet from '@wincent/frozen-set';
import * as React from 'react';

import loadConfig from '../util/loadConfig';

loadConfig().then(c => console.log('got the conf', c));

// TODO: decide what to put in here
// the [] is just a fall back when rendering a consumer without a
// provider (ie. in tests)
const NotesContext = React.createContext<Store>({
  filteredNotes: [],
  notes: [],
  selectedNotes: new FrozenSet(),
});

export default NotesContext;
