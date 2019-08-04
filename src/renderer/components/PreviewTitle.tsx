/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

type Props = {
  focused: boolean;
  selected: boolean;
  title: string;
};

export default function PreviewTitle({focused, selected, title}: Props) {
  const styles: Styles<'input' | 'root'> = {
    root: {
      color: focused ? '#fff' : selected ? '#4e4e4e' : '#4f4f4f',
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    // TODO: handle isEditing state, where title becomes an input onDoubleClick
    input: {
      fontFamily: 'inherit',
      margin: '-3px 0', // preserve overall row height
      width: '100%',
    },
  };

  return <p style={styles.root}>{title}</p>;
}
