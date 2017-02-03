// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

var babel = require('gulp-babel');
var child_process = require('child_process');
var eslint = require('gulp-eslint');
var flow = require('gulp-flowtype');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyHTML = require('gulp-minify-html');
var path = require('path');

var electronBase = 'node_modules/electron/dist';
var watching = false;

/**
 * Ring the terminal bell.
 */
function ringBell() {
  process.stderr.write("\x07");
}

/**
 * Convenience wrapper for `child_process.exec` that logs using `gutil.log`.
 */
function exec(command) {
  return new Promise((resolve, reject) => {
    child_process.exec(
      command,
      (error, stdout, stderr) => {
        gutil.log(stdout);
        gutil.log(stderr);
        error ? reject(error) : resolve();
      }
    );
  });
}

/**
 * Wrap a stream in an error-handler (until Gulp 4, needed to prevent "watch"
 * task from dying on error).
 */
function wrap(stream) {
  stream.on('error', function(error) {
    gutil.log(gutil.colors.red(error.message));
    gutil.log(error.stack);
    if (watching) {
      gutil.log(gutil.colors.yellow('[aborting]'));
      stream.end();
    } else {
      gutil.log(gutil.colors.yellow('[exiting]'));
      process.exit(1);
    }
    ringBell();
  });
  return stream;
}

gulp.task('default', ['watch']);

gulp.task('build', ['html', 'js']);

gulp.task('flow', ['typecheck']);

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(wrap(minifyHTML()))
    .pipe(gulp.dest('dist'));
});

gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(wrap(babel()))
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
});

gulp.task('typecheck', function() {
  return gulp.src('src/**/*.js')
    .pipe(flow())
});

gulp.task('copy-app', () => {
  var source = path.join(electronBase, 'Electron.app');
  return exec('cp -pR ' + source + ' release/');
});

gulp.task('copy-debug-app', () => {
  var source = path.join(electronBase, 'Electron.app');
  return exec('cp -pR ' + source + ' debug/');
});

gulp.task('rename-app', ['copy-app'], () => {
  return exec('mv release/Electron.app release/Corpus.app');
});

gulp.task('rename-debug-app', ['copy-debug-app'], () => {
  return exec('mv debug/Electron.app debug/Corpus.app');
});

gulp.task('copy-icon', ['rename-app'], function() {
  return gulp.src('gfx/corpus.icns')
    .pipe(gulp.dest('release/Corpus.app/Contents/Resources/'));
});

gulp.task('copy-debug-icon', ['rename-debug-app'], function() {
  return gulp.src('gfx/debug/corpus.icns')
    .pipe(gulp.dest('debug/Corpus.app/Contents/Resources/'));
});

gulp.task('copy-plist', ['rename-app'], function() {
  return gulp.src('pkg/Info.plist')
    .pipe(gulp.dest('release/Corpus.app/Contents/'));
});

gulp.task('copy-debug-plist', ['rename-debug-app'], function() {
  return gulp.src('pkg/Info.plist')
    .pipe(gulp.dest('debug/Corpus.app/Contents/'));
});

gulp.task('copy-resources', ['rename-app'], function() {
  return gulp.src([
      'package.json',
      '*dist/**/*',
      '*vendor/**/*',
    ]).pipe(gulp.dest('release/Corpus.app/Contents/Resources/app/'));
});

// TODO: DRY these debug vs non-debug tasks up
gulp.task('copy-debug-resources', ['rename-debug-app'], function() {
  return gulp.src([
      'package.json',
      '*dist/**/*',
      '*vendor/**/*',
    ]).pipe(gulp.dest('debug/Corpus.app/Contents/Resources/app/'));
});

gulp.task('copy-node-modules', ['rename-app'], () => {
  return exec(
    'yarn install --prod --no-bin-links --modules-folder release/Corpus.app/Contents/Resources/app/node_modules'
  );
});

gulp.task('copy-debug-node-modules', ['rename-debug-app'], () => {
  return exec(
    'yarn install --prod --no-bin-links --modules-folder debug/Corpus.app/Contents/Resources/app/node_modules'
  );
});

gulp.task('asar', ['rename-app', 'copy-resources', 'copy-node-modules'], () => {
  return exec(
    'asar pack release/Corpus.app/Contents/Resources/app release/Corpus.app/Contents/Resources/app.asar'
  );
});

gulp.task('debug-asar', ['rename-debug-app', 'copy-debug-resources', 'copy-debug-node-modules'], () => {
  return exec(
    'asar pack debug/Corpus.app/Contents/Resources/app debug/Corpus.app/Contents/Resources/app.asar'
  );
});

gulp.task('prune-app', ['asar'], () => {
  return exec('rm -r release/Corpus.app/Contents/Resources/app');
});

gulp.task('prune-debug-app', ['debug-asar'], () => {
  return exec('rm -r debug/Corpus.app/Contents/Resources/app');
});

gulp.task('release', ['copy-app', 'rename-app', 'copy-plist', 'copy-icon', 'copy-resources', 'copy-node-modules', 'asar', 'prune-app']);
gulp.task('debug', ['copy-debug-app', 'rename-debug-app', 'copy-debug-plist', 'copy-debug-icon', 'copy-debug-resources', 'copy-debug-node-modules', 'debug-asar', 'prune-debug-app']);

gulp.task('watch', function() {
  watching = true;
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.js', ['js']);
});
