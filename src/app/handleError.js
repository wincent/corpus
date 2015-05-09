// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import remote from 'remote';

const app = remote.require('app');

function handleError(error, context) {
  const result = confirm(
    `${context}\n\n${error}\n\nDo you want to exit?`
  );
  if (result) {
    app.quit();
  }
}

export default handleError;
