/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import stringFinder from '../util/stringFinder';

import type {Note} from '../Store';

export type FilteredNote = {|
  ...Note,
  index: number, // The index within the primary notes array.
|};

export default function filter(
  value: ?string,
  notes: $ReadOnlyArray<Note>,
): $ReadOnlyArray<FilteredNote> {
  // TODO: compare against prev
  // const previous = store.get('filteredNotes');
  const patterns =
    value != null &&
    value
      .trim()
      .split(/\s+/)
      .map(string => {
        if (string.startsWith('#')) {
          return {
            tag: string.slice(1),
            type: 'tag',
          };
        } else {
          return {
            finder: stringFinder(string),
            type: 'string',
          };
        }
      });
  if (patterns && patterns.length) {
    const indices = [];
    return notes
      .filter((note, index) => {
        // TODO: only return new array if the filtering operation excluded any items
        if (
          patterns.every(pattern => {
            if (pattern.type === 'tag') {
              return note.tags.has(pattern.tag);
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
      })
      .map((note, index) => ({
        // Augment note with its index.
        ...note,
        index: indices[index],
      }));
  } else {
    return notes.map((note, index) => ({
      // Augment note with its index.
      ...note,
      index,
    }));
  }
}
