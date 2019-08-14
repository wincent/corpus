/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

const {useEffect, useRef} = React;

/**
 * Described here:
 *
 *    https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 *
 * Explained here:
 *
 *    https://usehooks.com/usePrevious/
 */
export default function usePrevious<T extends any>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    // 2. After rendering, remember used value.
    ref.current = value;
  }, [value]);

  // 1. Return previously recorded value.
  return ref.current;
}
