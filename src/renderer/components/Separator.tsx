/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import React, {useEffect, useState} from 'react';

const styles = {
  root: {
    background: 'linear-gradient(90deg, #f8f8f8, #e9e9e9)',
    borderLeft: '1px solid #c3c3c3',
    borderRight: '1px solid #bebebe',
    flexGrow: 0,
    outline: 0,
    width: '8px',
  } as React.CSSProperties,
};

interface Props {
  onMouseMove: (event: MouseEvent) => void;
}

export default function Separator({onMouseMove}: Props) {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    // Don't let the browser focus us. We're a div, after all.
    event.preventDefault();

    setDragging(true);
  };

  useEffect(() => {
    if (dragging) {
      const onMouseUp = (_event: MouseEvent) => {
        setDragging(false);
      };

      const cleanUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.classList.remove('grabbing');
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.classList.add('grabbing');

      return cleanUp;
    }
  }, [dragging, onMouseMove]);

  return (
    <div
      className="separator"
      onMouseDown={handleMouseDown}
      style={styles.root}
      tabIndex={-1}
    />
  );
}
