// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

var babel = require('gulp-babel');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyHTML = require('gulp-minify-html');

var watching = false;

var babelOptions = {
  optional: [
    'es7.classProperties',
    'es7.decorators',
    'es7.objectRestSpread',
  ],
};

function ringBell() {
  process.stderr.write("\x07");
}

// Wrap a stream in an error-handler (needed until Gulp 4).
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

gulp.task('watch', function() {
  watching = true;
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.js', ['js']);
});

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
