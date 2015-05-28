# Development environment bootstrap

```
# install to /usr/local/lib/node_modules/electron-prebuilt
npm install electron-prebuilt -g
```

# Running

```
gulp # transforms "src" to "dist" and enters watch mode; also `npm run build`
./corpus.sh
```


# Adding dependencies to `package.json`

```
npm install --save-dev babel-core gulp gulp-babel gulp-minify-html

# NOTE: due to https://github.com/gulpjs/gulp/issues/810
# I also had to install gulp globally:
npm install -g gulp
```
