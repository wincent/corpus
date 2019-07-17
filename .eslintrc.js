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
  plugins: ['notice', '@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
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
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
