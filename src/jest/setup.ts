/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * See types.d.ts in this directory for type declarations.
 */

let counter = 1000;

global.makeNote = (template = {}) => ({
  body: 'note body/text',
  mtime: 1565214488000,
  path: '/fake/path.md',
  id: counter++ as UUID,
  tags: new Set(),
  text: 'note body/text',
  title: 'note title',
  version: 1,
  ...template,
});
