/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
  },
} as const;

interface Props {
  children?: React.ReactNode;
}

export default function Viewport({children}: Props) {
  return <div style={styles.root}>{children}</div>;
}
