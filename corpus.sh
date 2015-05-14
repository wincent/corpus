#!/bin/sh
# Copyright 2015-present Greg Hurrell. All rights reserved.
# Licensed under the terms of the MIT license.

ELECTRON_DIST=/usr/local/lib/node_modules/electron-prebuilt/dist
ELECTRON_EXECUTABLE=Electron.app/Contents/MacOS/Electron

# Check if NODE_ENV is set (http://stackoverflow.com/a/13864829/2103996).
if [ -z ${NODE_ENV+unset} ]; then
  # Fast by default, to override, start with:
  #
  #   NODE_ENV= ./corpus.sh
  #   NODE_ENV=anything_but_production ./corpus.sh
  #
  NODE_ENV=production $ELECTRON_DIST/$ELECTRON_EXECUTABLE .
else
  NODE_ENV="${NODE_ENV}" $ELECTRON_DIST/$ELECTRON_EXECUTABLE .
fi
