/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

type Config = {
  notesDirectory: string;
  noteFontFamily: string;
  noteFontSize: string;
};

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
