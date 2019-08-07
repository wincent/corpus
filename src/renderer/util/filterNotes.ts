/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import stringFinder from './stringFinder';

type Matcher =
  | Readonly<{
      value: string;
      type: 'literal';
    }>
  | Readonly<{
      finder: RegExp;
      type: 'pattern';
    }>;

function getMatcher(word: string): Matcher {
  if (word.startsWith('#')) {
    return {
      value: word.slice(1),
      type: 'literal',
    };
  } else {
    return {
      finder: stringFinder(word),
      type: 'pattern',
    };
  }
}

export default function filterNotes(
  query: string | null,
  notes: readonly Note[],
): readonly Note[] {
  const matchers: Matcher[] = (query || '')
    .trim()
    .split(/\s+/)
    .map(getMatcher);

  if (matchers.length) {
    const indices: number[] = [];
    return notes.filter((note, index) => {
      // TODO: only return new array if the filtering operation excluded any items
      if (
        matchers.every(pattern => {
          if (pattern.type === 'literal') {
            return note.tags.has(pattern.value);
          } else {
            // Plain text search.
            return (
              note.title.search(pattern.finder) !== -1 ||
              note.text.search(pattern.finder) !== -1
            );
          }
        })
      ) {
        // TODO: re-use pre-existing objects if they haven't changed
        // (will need a version number property to make change detection
        // cheap).
        indices.push(index);
        return true;
      }
      return false;
    });
  } else {
    return notes;
  }
}
