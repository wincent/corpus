/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import throttle from '@wincent/throttle';
import * as React from 'react';

import * as colors from '../colors';
import {PREVIEW_ROW_HEIGHT} from '../constants';
import NotesContext from '../contexts/NotesContext';
import NotesDispatch from '../contexts/NotesDispatch';
import useStyles from '../hooks/useStyles';
import getLastInSet from '../util/getLastInSet';
import NotePreview from './NotePreview';

const {useContext, useEffect, useRef, useState} = React;

/**
 * How many notes will be rendered beyond the edges of the viewport (above and
 * below).
 */
const OFF_VIEWPORT_NOTE_BUFFER_COUNT = 20;

/**
 * Minimum delay between processing consecutive scroll events.
 */
const SCROLL_THROTTLE_INTERVAL = 250;

export default function NoteList() {
  const dispatch = useContext(NotesDispatch);
  const {filteredNotes} = useContext(NotesContext);

  const ref = useRef<HTMLDivElement>(null);

  const [scrollTop, setScrollTop] = useState(0);

  const mostRecent = null; // TODO: actually implement selection, then use it
  // here to determine mostRecent selection; using getLastInSet(selection)

  // TODO: decide whether to pull this kind of thing out into a separate
  // function or not.
  const firstRenderedNote = (() => {
    const topEdge = Math.floor(scrollTop / PREVIEW_ROW_HEIGHT);
    const first = Math.max(0, topEdge - OFF_VIEWPORT_NOTE_BUFFER_COUNT);

    // Always keep last-selected note in the range, even if it means
    // over-rendering.
    // TODO: reconsider this as it makes things slow
    if (mostRecent != null) {
      return Math.min(mostRecent, first);
    } else {
      return first;
    }
  })();

  const filteredNotesSize = filteredNotes.length;

  const lastRenderedNote = (() => {
    const visibleHeight = window.innerHeight - 36; // TODO extract named constant
    const bottomEdge = Math.ceil(
      (scrollTop + visibleHeight) / PREVIEW_ROW_HEIGHT,
    );
    const last = Math.min(
      filteredNotesSize - 1,
      bottomEdge + OFF_VIEWPORT_NOTE_BUFFER_COUNT,
    );

    // Always keep last-selected note in the range, even if it means
    // over-rendering.
    if (mostRecent != null) {
      return Math.max(mostRecent, last);
    } else {
      return last;
    }
  })();

  console.log('first', firstRenderedNote, 'last', lastRenderedNote);

  const styles = useStyles<'list' | 'root'>(() => {
    const space = firstRenderedNote * PREVIEW_ROW_HEIGHT;

    return {
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
    };
  });

  useEffect(() => {
    const updateScrollTop = throttle((scrollTop: number) => {
      requestAnimationFrame(() => setScrollTop(scrollTop));
    }, SCROLL_THROTTLE_INTERVAL);

    const onScroll = (event: Event) => {
      // A layer of indirection here is needed because event objects are pooled;
      // if we passed them directly into the throttled function they may have
      // changed by the time the wrapped function gets executed.
      if (event.currentTarget instanceof Element) {
        updateScrollTop(event.currentTarget.scrollTop);
      }
    };

    const node = ref.current;
    const parent = node!.parentNode!;
    parent.addEventListener('scroll', onScroll);

    return () => {
      // No need to do clean-up; component never gets unmounted.
      throw new Error('NoteList: Unexpected unmount');
    };
  }, []);

  const focused = false;

  // TODO: implement filtering, selection etc
  return (
    <div ref={ref} style={styles.root}>
      <ul style={styles.list}>
        {filteredNotes
          .slice(firstRenderedNote, lastRenderedNote)
          .map((note, i) => (
            <NotePreview
              focused={/*selected && */ focused}
              key={i}
              note={note}
              selected={false}
            />
          ))}
      </ul>
    </div>
  );
}
