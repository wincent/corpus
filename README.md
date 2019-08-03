# Corpus: A note-management application for OS X

![](https://raw.githubusercontent.com/wincent/corpus/media/corpus.png)

This is a clone of the fantastic nvALT application with some features added. So far:

- Automatic versioning of notes directory via Git

But note: it only implements the subset of nvALT features which I personally use. There will be more to come; this is a work in progress.

This is a ground-up clean-room implementation written in JavaScript and running on the Electron shell. It turns out that rewriting the app in JavaScript with React and Flux seemed more appealing than hacking on the existing Objective-C nvALT codebase (and using Xcode etc).

## Status

This is the earliest of alpha previews. Use at your own risk, or better still, don't use yet. For a partial list of the many known issues, see [the GitHub issue tracker](https://github.com/wincent/corpus/issues) and [`TODO.md`](https://github.com/wincent/corpus/blob/master/TODO.md) in this repo.

## License

Copyright 2015-present Greg Hurrell. All rights reserved.
Licensed under the terms of the MIT license.

See `LICENSE.md` in this repo for the full text of the license.
