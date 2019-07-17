import * as React from 'react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
  } as React.CSSProperties,
};

interface Props {
  children?: React.ReactNode;
}

export default function Viewport({children}: Props) {
  return <div style={styles.root}>{children}</div>;
}
