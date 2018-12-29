/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

module.exports = function(api) {
  api.cache(false);

  return {
    plugins: [
      [
        'minify-replace',
        {
          replacements: [
            {
              identifierName: '__DEV__',
              replacement: {
                type: 'booleanLiteral',
                value: process.env.NODE_ENV === 'development',
              },
            },
          ],
        },
      ],
      [
        './scripts/babel/debug',
        {
          strip: process.env.NODE_ENV !== 'development',
        },
      ],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-syntax-object-rest-spread',
      '@babel/plugin-transform-react-constant-elements',
      '@babel/plugin-transform-react-inline-elements',
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          debug: false,
          targets: 'electron 4.0',
          useBuiltIns: 'entry',
        },
      ],
      '@babel/preset-flow',
      '@babel/preset-react',
    ],
  };
};
