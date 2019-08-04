/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

export default function useStyles<T extends string>(
  callback: () => Readonly<
    {
      [name in T]: React.CSSProperties;
    }
  >,
): Readonly<
  {
    [name in T]: React.CSSProperties;
  }
> {
  return callback();
}
