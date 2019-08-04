/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import Tag from './Tag';

type Props = {
  focused: boolean;
  tags: Set<string>;
};

export default function Tags({focused, tags}: Props) {
  const styles: Styles<'root'> = {
    root: {
      bottom: '4px',
      position: 'absolute',
      right: '4px',
    },
  };

  return (
    <div style={styles.root}>
      {Array.from(tags).map(tag => (
        <Tag focused={focused} key={tag} tag={tag} />
      ))}
    </div>
  );
}
