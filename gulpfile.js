// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
var exec = require('child_process').exec;
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyHTML = require('gulp-minify-html');
var path = require('path');

var babelOptions = {
  optional: [
    'es7.classProperties',
    'es7.decorators',
    'es7.objectRestSpread',
  ],
};
var electronBase = '/usr/local/lib/node_modules/electron-prebuilt/dist';
var watching = false;

/**
 * Ring the terminal bell.
 */
function ringBell() {
  process.stderr.write("\x07");
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

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(wrap(minifyHTML()))
    .pipe(gulp.dest('dist'));
});

gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(wrap(babel(babelOptions)))
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('copy-app', function(callback) {
  var source = path.join(electronBase, 'Electron.app');
   exec(
     'cp -pR ' + source + ' release/',
     function(error, stdout, stderr) {
       gutil.log(stdout);
       gutil.log(stderr);
       callback(error);
     }
   );
});

gulp.task('rename-app', ['copy-app'], function(callback) {
   exec(
     'mv release/Electron.app release/Corpus.app',
     function(error, stdout, stderr) {
       gutil.log(stdout);
       gutil.log(stderr);
       callback(error);
     }
   );
});

gulp.task('copy-icon', ['rename-app'], function() {
  return gulp.src('gfx/corpus.icns')
    .pipe(gulp.dest('release/Corpus.app/Contents/Resources/'));
});

gulp.task('copy-plist', ['rename-app'], function() {
  return gulp.src('pkg/Info.plist')
    .pipe(gulp.dest('release/Corpus.app/Contents/'));
});

/*
  1. Copy app from /usr/local/lib/node_modules/electron-prebuilt/dist to
     release/Corpus.app
  2. Copy icon
  3. Copy plist
  4. Move app sources into right place under Resources
  5. Bundle node_modules (eg. NODE_ENV=production + uglify for React)
*/
gulp.task('release', ['copy-app', 'rename-app', 'copy-plist', 'copy-icon']);

gulp.task('watch', function() {
  watching = true;
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.js', ['js', 'lint']);
});
