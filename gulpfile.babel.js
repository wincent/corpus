// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

import babel from 'gulp-babel';
import child_process from 'child_process';
import eslint from 'gulp-eslint';
import flow from 'gulp-flowtype';
import gulp from 'gulp';
import gutil from 'gulp-util';
import minifyHTML from 'gulp-minify-html';
import path from 'path';

const electronBase = 'node_modules/electron/dist';
let watching = false;

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
  stream.on('error', err => {
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

gulp.task('html', () => {
  return gulp.src('src/**/*.html')
    .pipe(wrap(minifyHTML()))
    .pipe(gulp.dest('dist'));
});

gulp.task('js', () => {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(wrap(babel()))
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
});

gulp.task('typecheck', () => {
  return gulp.src('src/**/*.js')
    .pipe(flow())
});

function copyApp(env) {
  return () => {
    const source = path.join(electronBase, 'Electron.app');
    return exec(`cp -pR ${source} ${env}/`);
  };
}

gulp.task('copy-app', copyApp('release'));
gulp.task('copy-debug-app', copyApp('debug'));

function renameApp(env) {
  return () => {
    return exec(`mv ${env}/Electron.app ${env}/Corpus.app`);
  };
}

gulp.task('rename-app', ['copy-app'], renameApp('release'));
gulp.task('rename-debug-app', ['copy-debug-app'], renameApp('debug'));

function copyIcon(env) {
  return () => {
    return gulp.src(`gfx/${env}/corpus.icns`)
      .pipe(gulp.dest(`${env}/Corpus.app/Contents/Resources/`));
  }
}

gulp.task('copy-icon', ['rename-app'], copyIcon('release'));
gulp.task('copy-debug-icon', ['rename-debug-app'], copyIcon('debug'));

// TODO put version number from package.json in plist
function copyPlist(env) {
  return () => {
    return gulp.src('pkg/Info.plist')
      .pipe(gulp.dest(`${env}/Corpus.app/Contents/`));
  };
}

gulp.task('copy-plist', ['rename-app'], copyPlist('release'));
gulp.task('copy-debug-plist', ['rename-debug-app'], copyPlist('debug'));

gulp.task('copy-resources', ['rename-app'], () => {
  return gulp.src([
      'package.json',
      '*dist/**/*',
      '*vendor/**/*',
    ]).pipe(gulp.dest('release/Corpus.app/Contents/Resources/app/'));
});

gulp.task('link-debug-resources', ['rename-debug-app'], () => {
  return exec(
    'mkdir -p debug/Corpus.app/Contents/Resources/app && ' +
    'cd debug/Corpus.app/Contents/Resources/app && ' +
    'ln -s ../../../../../package.json && ' +
    'ln -s ../../../../../dist && ' +
    'ln -s ../../../../../vendor'
  );
});

gulp.task('copy-node-modules', ['rename-app'], () => {
  return exec(
    'yarn install --prod --no-bin-links --modules-folder release/Corpus.app/Contents/Resources/app/node_modules && yarn'
  );
});

gulp.task('link-debug-node-modules', ['rename-debug-app'], () => {
  return exec(
    'mkdir -p debug/Corpus.app/Contents/Resources/app && ' +
    'cd debug/Corpus.app/Contents/Resources/app && ' +
    'ln -s ../../../../../node_modules'
  );
});

gulp.task('asar', ['rename-app', 'copy-resources', 'copy-node-modules'], () => {
  return exec(
    'asar pack release/Corpus.app/Contents/Resources/app release/Corpus.app/Contents/Resources/app.asar'
  );
});

gulp.task('prune-app', ['asar'], () => {
  return exec('rm -r release/Corpus.app/Contents/Resources/app');
});

gulp.task('release', ['copy-app', 'rename-app', 'copy-plist', 'copy-icon', 'copy-resources', 'copy-node-modules', 'asar', 'prune-app']);

gulp.task('debug', ['copy-debug-app', 'rename-debug-app', 'copy-debug-plist', 'copy-debug-icon', 'link-debug-resources', 'link-debug-node-modules']);

gulp.task('watch', () => {
  watching = true;
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.js', ['js']);
});
