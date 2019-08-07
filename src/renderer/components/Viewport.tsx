/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

type Props = {
  children?: React.ReactNode;
};

const styles: Styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
  },
};

export default function Viewport({children}: Props) {
  return <div style={styles.root}>{children}</div>;
}
