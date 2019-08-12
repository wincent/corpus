/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * @file Logging utilities
 */

/**
 * NOTE: Calls to this function should get compiled away to nothing by Babel
 * when `process.env.NODE_ENV` is "production".
 */
export const debug = console.debug.bind(console);

export const error = console.error.bind(console);

export const info = console.info.bind(console);

export const warn = console.warn.bind(console);
