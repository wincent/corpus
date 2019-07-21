/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * @file Logging utilities
 *
 * These are low-level logging utilities for producing messages of
 * differing severities. The `debug()`, `error()`, `info()` and `warn()`
 * functions log to the console and additionally notify subscribers
 * registered via the `subscribe()` function.
 *
 * In practice, there will only be one listener (the OmniBar component),
 * and when it is first rendered it will check to see whether any log
 * messages were already created before its first mount.
 */

/**
 * Log levels, based on syslog severity levels, but skipping some that we
 * don't use.
 *
 * @see https://en.wikipedia.org/wiki/Syslog#Severity_level
 */
export const LOG_LEVEL = {
  ERROR: 3,
  WARNING: 4,
  INFORMATIONAL: 6,
  DEBUG: 7,
};

type LogLevel = keyof typeof LOG_LEVEL;

const sequenceNumbers: {[K in LogLevel]: number} = {
  ERROR: -1,
  WARNING: -1,
  INFORMATIONAL: -1,
  DEBUG: -1,
};

type LogMessage = {
  level: LogLevel;
  message: string;
  sequence: number;
};

const subscribers = new Map();

let nextSubscriberID = 0;

let sequence = -1;

/**
 * @internal
 *
 * Notifies subscribers.
 */
function log(level: LogLevel, message: string): void {
  sequence++;

  sequenceNumbers[level] = sequence;

  const logMessage = {
    level,
    message,
    sequence,
  };

  for (const subscriber of subscribers.values()) {
    subscriber(logMessage);
  }
}

type LogSubscriber = (message: LogMessage) => void;

type LogSubscription = Readonly<{
  dispose: () => void;
  sequenceNumbers: typeof sequenceNumbers;
}>;

export function subscribe(callback: LogSubscriber): LogSubscription {
  const nextID = nextSubscriberID++;

  subscribers.set(nextID, callback);

  return {
    dispose() {
      subscribers.delete(nextID);
    },

    sequenceNumbers: {
      ...sequenceNumbers,
    },
  };
}

/**
 * NOTE: Calls to this function should get compiled away to nothing by Babel
 * when `process.env.NODE_ENV` is "production".
 */
export function debug(message: string) {
  console.log(message); // eslint-disable-line no-console
  log('DEBUG', message);
}

export function error(message: string) {
  console.error(message); // eslint-disable-line no-console
  log('ERROR', message);
}

export function info(message: string) {
  console.info(message); // eslint-disable-line no-console
  log('INFORMATIONAL', message);
}

export function warn(message: string) {
  console.warn(message); // eslint-disable-line no-console
  log('WARNING', message);
}
