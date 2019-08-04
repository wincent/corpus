/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import 'csstype';

declare module 'csstype' {
  interface Properties {
    WebkitAppRegion?: 'drag' | 'inherit' | 'initial' | 'no-drag' | 'none' | 'unset';
  }
}
