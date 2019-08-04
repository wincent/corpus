import {useCallback} from 'react';

export default function useStyles<T extends string>(callback: (...args: any[]) => Readonly<{
  [name in T]: React.CSSProperties
}>, args: readonly any[]): Readonly<{
  [name in T]: React.CSSProperties
}> {
  return (
    useCallback(
      () => callback(...args),
      args
    )
  )();
}
