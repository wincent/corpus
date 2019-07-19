/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

const styles = {
  root: {
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    bottom: '36px',
    cursor: 'default',
    fontFamily: 'BlinkMacSystemFont',
    fontSize: '14px',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
  } as React.CSSProperties,
};

export default function TitleBar() {
  const title = 'some title read from state management';

  return (
    <div style={styles.root}>
      <span>{title}</span>
    </div>
  );
}
