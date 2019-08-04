/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

type Action = {
  type: 'load';
  notes: readonly Note[];
};

type Config = {
  notesDirectory: string;
  noteFontFamily: string;
  noteFontSize: string;
};

/**
 * JSON
 *
 * @see https://www.json.org/
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JSONArray extends Array<JSONValue> {}

type JSONObject = {[member: string]: JSONValue};
type JSONValue = JSONArray | JSONObject | boolean | null | number | string;

type Note = {
  body: string;
  mtime: number;
  path: string;
  readonly id: number; // really UUID
  tags: Set<string>;
  text: string;
  title: string;
  version: number;
};

type Store = {
  notes: Readonly<Note[]>;
  // TODO: add filtered notes
  // TODO: add selected notes
};

type Styles<T extends string> = Readonly<
  {
    [name in T]: React.CSSProperties;
  }
>;

// Counterpart to Readonly<T>.
type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};
