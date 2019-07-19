/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

import * as colors from '../colors';
import {PREVIEW_ROW_HEIGHT} from '../constants';

function getStyles() {
  const filteredNotesSize = 0; // TODO calc
  const space = /* getFirstRenderedNote() * */ PREVIEW_ROW_HEIGHT;

  const styles = {
    list: {
      WebkitUserSelect: 'none',
      cursor: 'default',
      margin: 0,
      outline: 0,
      padding: 0,
      position: 'absolute',
      top: space + 'px',
      left: 0,
      right: 0,
    } as React.CSSProperties,
    root: {
      background: colors.background,
      height: filteredNotesSize * PREVIEW_ROW_HEIGHT,
      minHeight: 'calc(100vh - 36px)', // ensure full background coverage
      position: 'relative',
    } as React.CSSProperties,
  };

  return styles;
}

export default function NoteList() {
  const styles = getStyles();

  return (
    <div style={styles.root}>
      <ul style={styles.list}></ul>
    </div>
  );
}
