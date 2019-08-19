/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import * as Colors from '../Colors';
import NotePlaceholder from './NotePlaceholder';

const styles: Styles = {
  root: {
    background: Colors.BACKGROUND,
    minHeight: 'calc(100vh - 36px)', // Hack to ensure full background coverage
  },
};

export default function NoteView() {
  const count = 0; // TODO: implement

  return (
    <div style={styles.root}>
      {count ? null /* TODO */ : <NotePlaceholder count={count} />}
    </div>
  );
}
