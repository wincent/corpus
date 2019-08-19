/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

const styles: Styles<'lowerSpacer' | 'notice' | 'root' | 'upperSpacer'> = {
  root: {
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 36px)',
  },
  lowerSpacer: {
    flexGrow: 2,
  },
  notice: {
    WebkitUserSelect: 'none',
    color: '#a3a3a3',
    fontSize: '18px',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  upperSpacer: {
    flexGrow: 1,
  },
};

type Props = {
  count: number;
};

export default function NoteView({count}: Props) {
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault(); // Disallow focus.
  };

  return (
    <div onMouseDown={handleMouseDown} style={styles.root}>
      <div style={styles.upperSpacer} />
      <div style={styles.notice}>{count} Notes Selected</div>
      <div style={styles.lowerSpacer} />
    </div>
  );
}
