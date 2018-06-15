/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {remote} from 'electron';

const {app} = remote;

/**
 * Show an error to the user.
 *
 * This function is intended for handling serious errors, because it prompts the
 * user to exit.
 */
function handleError(error: Error, context: string): void {
  const result = confirm(
    `${context}\n\n${String(error)}\n\nDo you want to exit?`,
  );
  if (result) {
    app.quit();
  }
}

export default handleError;
