/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import useStyles from '../hooks/useStyles';

type Props = {
  focused: boolean;
  tag: string;
};

export default function Tag({focused, tag}: Props) {
  const styles = useStyles<'root'>(() => ({
    root: {
      backgroundColor: focused ? '#fff' : '#9e9e9e',
      borderRadius: '2px',
      color: focused ? '#6f6f73' : '#e6e6e6',
      cursor: 'pointer',
      display: 'inline-block',
      marginLeft: '4px',
      padding: '0 4px',
    },
  }));

  return (
    <span
      className="tag"
      onClick={event => {
        // Don't want to select note that was clicked on.
        event.stopPropagation();
        // TODO: dispatch to initiate search for `#${tag}`
      }}
      style={styles.root}
    >
      {tag}
    </span>
  );
}
