/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import clamp from '@wincent/clamp';
import React, {useEffect, useState} from 'react';

import Separator from './Separator';

const styles = {
  left: {
    flexBasis: 0,
    overflowY: 'scroll',
  } as React.CSSProperties,

  right: {
    flexBasis: 0,
    overflowY: 'scroll',
  } as React.CSSProperties,

  root: {
    display: 'flex',
    flexGrow: 1,
  } as React.CSSProperties,
};

interface Props {
  children: React.ReactNode;
}

function getPaneDimensions(desiredLeftPaneWidth: number) {
  if (desiredLeftPaneWidth < 40) {
    desiredLeftPaneWidth = 0;
  } else if (desiredLeftPaneWidth < 75) {
    desiredLeftPaneWidth = 75;
  }

  const width = window.innerWidth;
  const minimumX = 0;
  const maximumX = Math.min(600, width - 100);

  // minimum <= X <= maximum
  const eventX = clamp(desiredLeftPaneWidth, minimumX, maximumX);

  return {
    left: Math.round(eventX),
    right: Math.round(width - eventX - 8),
  };
}

export default function SplitView({children}: Props) {
  const {left: initialLeft, right: initialRight} = getPaneDimensions(400);

  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);

  const childArray = React.Children.toArray(children);

  if (childArray.length !== 2) {
    throw new RangeError('SplitView expects exactly two children');
  }

  const leftStyles = {
    ...styles.left,
    flexGrow: left,
  };

  const rightStyles = {
    ...styles.right,
    flexGrow: right,
  };

  const updatePanes = (x: number) => {
    const {left: newLeft, right: newRight} = getPaneDimensions(x);

    setLeft(newLeft);
    setRight(newRight);
  };

  const onMouseMove = (event: MouseEvent) => {
    updatePanes(event.clientX);
  };

  useEffect(() => {
    const onResize = () => {
      updatePanes(left);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [left]);

  return (
    <div style={styles.root}>
      <div style={leftStyles}>{childArray[0]}</div>
      <Separator key="separator" onMouseMove={onMouseMove} />
      <div style={rightStyles}>{childArray[1]}</div>
    </div>
  );
}
