/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

type Note = {
  title: string;
  body: string;
};

type Store = {
  notes: Note[];
  // TODO: add filtered notes
  // TODO: add selected notes
};

type Action = {
  type: 'load';
  notes: Note[];
};
