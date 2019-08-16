/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

const DispatchContext = React.createContext<React.Dispatch<Action>>(() => {});

DispatchContext.displayName = 'DispatchContext';

export default DispatchContext;
