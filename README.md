# Corpus: A note-management application for macOS

![](https://raw.githubusercontent.com/wincent/corpus/media/corpus.png)

This is a clone of the fantastic [nvALT](https://brettterpstra.com/projects/nvalt/) application.

The main motivating feature that I wanted to add to nvALT was automatic versioning of the notes directory via Git, but along the way I added some other useful things like the ability to manage notes in multiple directories, or to mark certain notes as "private", or preview Markdown.

It is a ground-up clean-room implementation written in [TypeScript](https://www.typescriptlang.org/) and running on the [Electron](https://electronjs.org/) shell. It turns out that rewriting the app in this way was more appealing and faster than hacking on the existing Objective-C nvALT code-base (and using Xcode etc).

## Status

This is an in-progress rewrite of an original implementation that was itself the earliest of alpha previews.

- I made the original implementation in 2015 and it has been good enough for me to use it as my daily note-management app over a period of about 4 years. It was written in JavaScript using [React](https://reactjs.org/), [Flux](https://facebook.github.io/flux/), [Flow](https://flow.org/), and [ImmutableJS](https://immutable-js.github.io/immutable-js/). As some point, I started moving bits of it away from Flux and onto [Redux](https://redux.js.org/). The latest version of the original implementation roughly corresponds to commit [fc31ed9b](https://github.com/wincent/corpus/commit/fc31ed9b8cd72742088c935c7abdd18fce58860e) ([tree](https://github.com/wincent/corpus/tree/fc31ed9b8cd72742088c935c7abdd18fce58860e)).
- In mid-2018 I gradually started rewriting in-place on [the "next" branch](https://github.com/wincent/corpus/tree/next), replacing Redux with [Undux](https://undux.org/), and removing the dependency on ImmutableJS. This rewrite was incomplete and had some bugs that prevented me from switching to it. The latest state there was commit [f22826dd](https://github.com/wincent/corpus/commit/f22826ddf6daad07dc20cae90493b5d975a76270) ([tree](https://github.com/wincent/corpus/tree/f22826ddf6daad07dc20cae90493b5d975a76270)).
- The current "master" branch contains a from-scratch rewrite, this time in TypeScript and using [React Hooks](https://reactjs.org/docs/hooks-intro.html). In the name of simplicity, the build process has been simplified (no [Gulp](https://gulpjs.com/), no [Babel](https://babeljs.io/), yet). At the time of writing, it is far from complete, but I am confident enough in the suitability of the technology stack that I fully intend to see this rewrite through to the end, unlike the others. 😂

Use at your own risk, or better still, don't use yet. For a partial list of the many known issues, see [the GitHub issue tracker](https://github.com/wincent/corpus/issues).

## License

Licensed under the terms of the MIT license.

See [`LICENSE.md` in this repo](./LICENSE.md) for the full text of the license.