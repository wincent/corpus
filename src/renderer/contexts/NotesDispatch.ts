/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

const NotesDispatch = React.createContext<React.Dispatch<Action>>(() => {});

export default NotesDispatch;
