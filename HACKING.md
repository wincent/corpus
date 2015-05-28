# Development environment bootstrap

```
# install to /usr/local/lib/node_modules/electron-prebuilt
npm install electron-prebuilt -g
```

# Running

```
# NOTE: due to https://github.com/gulpjs/gulp/issues/810
# you may have to install gulp globally:
npm install -g gulp

gulp # transforms "src" to "dist" and enters watch mode
./corpus.sh
```
