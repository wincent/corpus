var babel = require('gulp-babel');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyHTML = require('gulp-minify-html');

gulp.task('default', ['watch']);

gulp.task('watch', function() {
  fatalLevel = 'off'; // provided by gutil; don't crash during watch
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.js', ['js']);
});

gulp.task('build', ['html', 'js']);

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(minifyHTML({}))
    .pipe(gulp.dest('dist'));
});

gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});
