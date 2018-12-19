/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

/**
 * @file Logging utilities
 *
 * These are low-level logging utilities for producing messages of differing
 * severities. The `debug()`, `error()`, `info()` and `warn()` functions log to
 * the console and additionally notify subscribers registered via the
 * `subscribe()` function.
 *
 * In the context of Corpus, we want the log messages to appear in
 * the Undux store for debuggability, but Undux is tightly coupled
 * to the React lifecycle, and we might want to log messages before
 * Undux is bootstrapped.  We avoid this chicken-and-egg problem by
 * holding pending messages in a queue and releasing them to the first
 * registered subscriber. In this way, messages logged before the app
 * mounts and the Undux store is initialized still get handled (see
 * OmniBar.react.js).
 */

/**
 * Log levels, based on syslog severity levels.
 *
 * @see https://en.wikipedia.org/wiki/Syslog#Severity_level
 */
export const LOG_LEVEL = {
  EMERGENCY: 0,
  ALERT: 1,
  CRITICAL: 2,
  ERROR: 3,
  WARNING: 4,
  NOTICE: 5,
  INFORMATIONAL: 6,
  DEBUG: 7,
};

export type LogMessage = {|
  +level: $Keys<typeof LOG_LEVEL>,
  +message: string,
|};

let pending = [];
const subscribers = new Map();
let id = 0;

/**
 * @internal
 *
 * Adds log message to pending queue and notifies subscribers.
 */
function log(logMessage: LogMessage): void {
  pending.push(logMessage);
  publish();
}

/**
 * @internal
 *
 * Notifies subscribers of availability of pending message(s) in the
 * queue, emptying the queue in the process. If there are no
 * subscribers, no action is taken, effectively accumulating messages in
 * the queue until the first subscriber registers.
 */
function publish() {
  if (subscribers.size) {
    for (let i = 0; i < pending.length; i++) {
      const logMessage = pending[i];
      for (const subscriber of subscribers.values()) {
        subscriber(logMessage);
      }
    }
    pending = [];
  }
}

export function subscribe(callback: LogMessage => void): {dispose: () => void} {
  const nextId = id++;
  subscribers.set(nextId, callback);
  publish();
  return {
    dispose() {
      subscribers.delete(nextId);
    },
  };
}

/**
 * NOTE: Calls to this function get compiled away to nothing by Babel
 * outside of __DEV__.
 */
export function debug(message: string) {
  console.log(message); // eslint-disable-line no-console
  log({
    level: 'DEBUG',
    message,
  });
}

export function error(message: string) {
  console.error(message); // eslint-disable-line no-console
  log({
    level: 'ERROR',
    message,
  });
}

export function info(message: string) {
  console.info(message); // eslint-disable-line no-console
  log({
    level: 'INFORMATIONAL',
    message,
  });
}

export function warn(message: string) {
  console.warn(message); // eslint-disable-line no-console
  log({
    level: 'WARNING',
    message,
  });
}
