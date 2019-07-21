/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

// import FrozenSet from '../../util/FrozenSet';
// TODO use this somehow

// TODO: decide what to put in here
// the [] is just a fall back when rendering a consumer without a
// provider (ie. in tests)
const NotesContext = React.createContext<Store>({notes: []});

export default NotesContext;
