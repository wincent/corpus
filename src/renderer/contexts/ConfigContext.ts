/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import {DEFAULT_CONFIG} from '../util/loadConfig';

/**
 * Use DEFAULT_CONFIG a fallback for rendering consumers without
 * providers (ie. in tests).
 */
const ConfigContext = React.createContext<Config | null>(DEFAULT_CONFIG);

ConfigContext.displayName = 'ConfigContext';

export default ConfigContext;
