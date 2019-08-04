/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

import * as colors from '../colors';
import {PREVIEW_ROW_HEIGHT} from '../constants';
import NotesContext from '../contexts/NotesContext';
import NotesDispatch from '../contexts/NotesDispatch';

const {useContext} = React;

function getStyles() {
  const filteredNotesSize = 0; // TODO calc
  const space = /* getFirstRenderedNote() * */ PREVIEW_ROW_HEIGHT;

  const styles: Styles = {
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
    },

    root: {
      background: colors.background,
      height: filteredNotesSize * PREVIEW_ROW_HEIGHT,
      minHeight: 'calc(100vh - 36px)', // ensure full background coverage
      position: 'relative',
    },
  } as const;

  return styles;
}

export default function NoteList() {
  const dispatch = useContext(NotesDispatch);
  const {notes} = useContext(NotesContext);

  const styles = getStyles();

  return (
    <div style={styles.root}>
      <ul style={styles.list}>
        {notes.map((note, i) => (
          <li key={i}>{note.title}</li>
        ))}
      </ul>
    </div>
  );
}
