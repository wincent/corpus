#!/bin/sh
# Copyright 2015-present Greg Hurrell. All rights reserved.
# Licensed under the terms of the MIT license.

if [ -n "$TMUX" ]; then
  echo "error: clipboard (copy/paste) won't work if launched from inside tmux"
  echo "(bailing: relaunch with \`env TMUX= ./corpus.sh\` to proceed anyway)"
  exit 1
fi

if [ -d debug/Corpus.app ]; then
  ELECTRON_DIST=debug
  ELECTRON_EXECUTABLE=Corpus.app/Contents/MacOS/Electron
else
  echo 'error: debug application not found; please run `yarn run gulp debug`'
  exit 1
fi

# Check if NODE_ENV is set (http://stackoverflow.com/a/13864829/2103996).
if [ -z ${NODE_ENV+unset} ]; then
  NODE_ENV=development $ELECTRON_DIST/$ELECTRON_EXECUTABLE .
elif [[ $NODE_ENV = 'development' ]]; then
  NODE_ENV="${NODE_ENV}" CORPUSRC=./corpusrc.sample.json $ELECTRON_DIST/$ELECTRON_EXECUTABLE .
else
  # Anything else. To go fast, run with `NODE_ENV=production ./corpus.sh`.
  NODE_ENV="${NODE_ENV}" $ELECTRON_DIST/$ELECTRON_EXECUTABLE .
fi
