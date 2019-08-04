/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import {PREVIEW_ROW_HEIGHT} from '../constants';
import PreviewTitle from './PreviewTitle';
import Tags from './Tags';

type Props = {
  focused: boolean;
  selected: boolean;
  note: Note;
};

function getStyles({
  focused,
  selected,
}: Pick<Props, 'focused' | 'selected'>): Styles<'root' | 'text'> {
  // const {focused, note, selected} = this.props;
  // const isPrivate = note.tags.has('private');
  const isPrivate = false;

  return {
    root: {
      background: focused ? '#6f6f73' : selected ? '#c8c8c8' : 'inherit',
      borderBottom: '1px solid #c0c0c0',
      fontFamily: 'Helvetica Neue',
      fontSize: '11px',
      lineHeight: '14px',
      listStyleType: 'none',
      height: PREVIEW_ROW_HEIGHT + 'px',
      padding: '4px 4px 4px 8px',
      position: 'relative',
    },
    text: {
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      color: isPrivate
        ? 'transparent'
        : focused
        ? '#fff'
        : selected
        ? '#4e4e4e'
        : '#a3a3a3',
      display: '-webkit-box',
      fontWeight: 'normal',
      overflow: 'hidden',
      textShadow:
        isPrivate && focused
          ? '0 0 5px rgba(255, 255, 255, .5)'
          : isPrivate
          ? '0 0 5px rgba(0, 0, 0, .25)'
          : 'unset',
    },
  };
}

export default function NotePreview({focused, selected, note}: Props) {
  const styles = getStyles({focused, selected});

  const {tags, text, title} = note;

  return (
    <li style={styles.root}>
      <PreviewTitle focused={focused} selected={selected} title={title} />
      <p style={styles.text}>{text}</p>
      <Tags focused={focused} tags={tags} />
    </li>
  );
}
