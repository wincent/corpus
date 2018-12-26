/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

import colors from 'ansi-colors';
import log from 'fancy-log';
import babel from 'gulp-babel';
import child_process from 'child_process';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import path from 'path';
import through2 from 'through2';

const electronBase = 'node_modules/electron/dist';
let watching = false;

const {NODE_ENV} = process.env;
if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  const warning = `Expected NODE_ENV of "production" or "development"; got ${JSON.stringify(
    NODE_ENV,
  )}`;
  // prettier-ignore
  [
    '*'.repeat(warning.length),
    warning,
    '*'.repeat(warning.length),
  ].forEach(
    line => log(colors.red(line)),
  );
}

/**
 * Ring the terminal bell.
 */
function ringBell() {
  process.stderr.write('\x07');
}

/**
 * Convenience wrapper for `child_process.exec` that logs using `log`.
 */
function exec(command) {
  return new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      log(stdout);
      log(stderr);
      error ? reject(error) : resolve();
    });
  });
}

/**
 * Convenience wrapper around `child_process.execSync` that captures subcommand
 * stdout and optionally provides input over stdin as well.
 *
 * The non-sync version is generally preferable but you can't pipe anything into
 * stdin with it.
 */
function execSync(command, input) {
  const options = input != null ? {input} : {};
  return child_process.execSync(command, options).toString();
}

/**
 * Wrap a stream in an error-handler (until Gulp 4, needed to prevent "watch"
 * task from dying on error).
 */
function wrap(stream) {
  stream.on('error', error => {
    log(colors.red(error.message));
    log(error.stack);
    if (watching) {
      log(colors.yellow('[aborting]'));
      stream.end();
    } else {
      log(colors.yellow('[exiting]'));
      process.exit(1);
    }
    ringBell();
  });
  return stream;
}

gulp.task('default', watch);

gulp.task('build', gulp.parallel(html, js));

function html() {
  return gulp
    .src('src/**/*.html')
    .pipe(wrap(htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
}

function js() {
  return gulp
    .src(['src/**/*.js', '!**/__tests__/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(wrap(babel()))
    .pipe(gulp.dest('dist'));
}

const LINT_GLOBS = ['*.js', 'scripts/**/*.js', 'src/**/*.js'];
function lint() {
  return gulp
    .src(LINT_GLOBS)
    .pipe(eslint())
    .pipe(eslint.format());
}

function fix() {
  // Fix lints in place with `base` trickery.
  return gulp
    .src(LINT_GLOBS, {base: './'})
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(
      through2.obj(function(file, _, cb) {
        // Based on: https://stackoverflow.com/a/52303073/2103996
        // Without this, modification date won't get updated and Vim won't pick
        // up changes.
        if (file.eslint && file.eslint.fixed) {
          const date = new Date();
          file.stat.atime = date;
          file.stat.mtime = date;
        }
        cb(null, file);
      }),
    )
    .pipe(gulp.dest('./'));
}

function flow() {
  return exec('flow check --color=always src');
}

function clean() {
  return exec(`rm -rf debug/* dist/* release/*`);
}

function copyApp(env) {
  return function copyApp() {
    const source = path.join(electronBase, 'Electron.app');
    return exec(`cp -pR ${source} ${env}/`);
  };
}

function renameApp(env) {
  return function renameApp() {
    return exec(`mv ${env}/Electron.app ${env}/Corpus.app`);
  };
}

function copyIcon(env) {
  return function copyIcon() {
    return gulp
      .src(`gfx/${env}/corpus.icns`)
      .pipe(gulp.dest(`${env}/Corpus.app/Contents/Resources/`));
  };
}

function createPlist(env) {
  return function createPlist() {
    const version = require('./package').version;
    const json = JSON.parse(
      execSync('plutil -convert json -o - pkg/Info.plist'),
    );
    const updated = JSON.stringify({
      ...json,
      CFBundleShortVersionString: version,
      CFBundleVersion: version,
    });
    const target = `${env}/Corpus.app/Contents/Info.plist`;
    execSync(`plutil -convert xml1 -o ${target} -`, updated);
    return Promise.resolve();
  };
}

function watch() {
  watching = true;
  gulp.watch('src/**/*.html', html);
  gulp.watch('src/**/*.js', js);
}

function copyOrLinkResources(env) {
  return function copyOrLinkResources() {
    if (env === 'release') {
      return gulp
        .src(['package.json', '*dist/**/*', '*vendor/**/*'])
        .pipe(gulp.dest('release/Corpus.app/Contents/Resources/app/'));
    } else if (env === 'debug') {
      return exec(
        'mkdir -p debug/Corpus.app/Contents/Resources/app && ' +
          'cd debug/Corpus.app/Contents/Resources/app && ' +
          'ln -s ../../../../../package.json && ' +
          'ln -s ../../../../../dist && ' +
          'ln -s ../../../../../vendor',
      );
    }
  };
}

function copyOrLinkNodeModules(env) {
  return function copyOrLinkNodeModules() {
    if (env === 'release') {
      // Beware! Yarn blows away top-level node_modules despite
      // --modules-folder, requiring some song and dance:
      //   https://github.com/yarnpkg/yarn/issues/6839
      return exec(
        'mv node_modules node_modules.backup && ' +
          'yarn install ' +
          '--production ' +
          '--frozen-lockfile ' +
          '--no-bin-links ' +
          '--modules-folder ' +
          'release/Corpus.app/Contents/Resources/app/node_modules; ' +
          'mv node_modules.backup node_modules',
      );
    } else if (env === 'debug') {
      return exec(
        'mkdir -p debug/Corpus.app/Contents/Resources/app && ' +
          'cd debug/Corpus.app/Contents/Resources/app && ' +
          'ln -s ../../../../../node_modules',
      );
    }
  };
}

function asar() {
  return exec(
    'yarn run asar pack ' +
      'release/Corpus.app/Contents/Resources/app ' +
      'release/Corpus.app/Contents/Resources/app.asar',
  );
}

function pruneApp() {
  return exec(
    'rm -rf release/Corpus.app/Contents/Resources/app ' +
      'release/Corpus.app/Contents/Resources/default_app.asar ' +
      'release/Corpus.app/Contents/Resources/electron.icns',
  );
}

module.exports = {
  clean,
  html,
  js,
  lint,
  fix,
  flow,
  watch,
  release: gulp.series(
    'build',
    copyApp('release'),
    renameApp('release'),
    createPlist('release'),
    copyIcon('release'),
    copyOrLinkResources('release'),
    copyOrLinkNodeModules('release'),
    asar,
    pruneApp,
  ),
  debug: gulp.series(
    'build',
    copyApp('debug'),
    renameApp('debug'),
    createPlist('debug'),
    copyIcon('debug'),
    copyOrLinkResources('debug'),
    copyOrLinkNodeModules('debug'),
  ),
};
