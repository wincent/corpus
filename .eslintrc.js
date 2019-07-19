/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/* eslint-env node */

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'notice', 'react-hooks'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // One of the benefits of TypeScript is that inference works well. Seeing
    // the inferred type is easy enough in any case.
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Freedom to choose.
    '@typescript-eslint/prefer-interface': 'off',

    // If it wasn't `foo!` it would be an assertion in the form of
    // `nullthrows(foo)`. Used sparingly anyway.
    '@typescript-eslint/no-non-null-assertion': 'off',

    '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],

    'notice/notice': [
      'error',
      {
        messages: {
          whenFailedToMatch: 'Missing copyright notice',
        },
        mustMatch: 'Copyright \\(c\\) 20[1-9][0-9]-present Greg Hurrell',
        template:
          '/**\n * @copyright Copyright (c) <%= YEAR %>-present Greg Hurrell\n * @license MIT\n */\n\n',
      },
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
