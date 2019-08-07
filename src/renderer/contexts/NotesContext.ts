/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import FrozenSet from '@wincent/frozen-set';
import * as React from 'react';

import loadConfig from '../util/loadConfig';

// TODO: move this or stick it in store:
loadConfig().then(c => console.log('got the conf', c));

/**
 * Fallback for rendering consumers without proviers (ie. in tests).
 */
const DEFAULT_STATE: Store = {
  filteredNotes: [],
  notes: [],
  query: null,
  selectedNotes: new FrozenSet(),
};

const NotesContext = React.createContext(DEFAULT_STATE);

export default NotesContext;
