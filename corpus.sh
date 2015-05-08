#!/bin/sh
# Copyright 2015-present Greg Hurrell. All rights reserved.
# Licensed under the terms of the MIT license.

ELECTRON_DIST=/usr/local/lib/node_modules/electron-prebuilt/dist
ELECTRON_EXECUTABLE=Electron.app/Contents/MacOS/Electron

$ELECTRON_DIST/$ELECTRON_EXECUTABLE .
