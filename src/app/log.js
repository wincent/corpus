/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

let store = null;

export type LogMessage = {|
  +level: 'ERROR' | 'WARNING',
  +message: string,
|};

function log(logMessage: LogMessage): void {
  if (!store) {
    store = require('./store').default;
  }
  const previous = store.get('log');
  store.set('log')([...previous, logMessage]);
}

export function debug(message: string) {
  console.log(message);
}

export function error(message: string) {
  console.error(message); // eslint-disable-line no-console
  log({
    level: 'ERROR',
    message,
  });
}

export function info(message: string) {
  console.log(message); // eslint-disable-line no-console
}

export function warn(message: string) {
  console.warn(message); // eslint-disable-line no-console
  log({
    level: 'WARNING',
    message,
  });
}
