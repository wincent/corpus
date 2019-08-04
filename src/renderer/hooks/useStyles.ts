/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

export default function useStyles<T extends string>(
  callback: () => Styles<T>,
): Styles<T> {
  return callback();
}
