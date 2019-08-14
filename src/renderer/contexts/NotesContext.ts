/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import FrozenSet from '@wincent/frozen-set';
import * as React from 'react';

/**
 * Fallback for rendering consumers without providers (ie. in tests).
 */
const DEFAULT_STATE: Store = {
  filteredNotes: [],
  focus: 'omnibar',
  notes: [],
  query: null,
  selectedNotes: new FrozenSet(),
};

const NotesContext = React.createContext(DEFAULT_STATE);

export default NotesContext;
