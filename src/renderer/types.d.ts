/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

type FrozenSet<T> = import('@wincent/frozen-set').default<T>;

type Action =
  | Readonly<{
      type: 'filter';
      query: string | null;
    }>
  | Readonly<{
      type: 'focus';
      target: FocusTarget;
    }>
  | Readonly<{
      type: 'load';
      notes: readonly Note[];
    }>
  | Readonly<{
      type: 'select-all';
    }>;

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

type JSONValue =
  | boolean
  | null
  | number
  | string
  | {[property: string]: JSONValue}
  | Array<JSONValue>;

type Note = {
  body: string;
  mtime: number;
  path: string;
  readonly id: number; // really UUID; ideally would be an opaque type
  tags: Set<string>;
  text: string;
  title: string;
  version: number;
};

type FocusTarget = 'note' | 'notelist' | 'omnibar' | 'titleinput';

type Store = Readonly<{
  query: string | null;
  filteredNotes: Readonly<Note[]>;
  focus: FocusTarget;
  notes: Readonly<Note[]>;
  selectedNotes: FrozenSet<number>;
}>;

type Styles<T extends string = 'root'> = Readonly<
  {
    [name in T]: React.CSSProperties;
  }
>;

// Counterpart to Readonly<T>.
type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};
