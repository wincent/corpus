/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import selectFirst from './selectFirst';
import selectLast from './selectLast';
import clamp from '../clamp';
import getLastInSet from '../getLastInSet';

import type {StoreT} from '../Store';
import type FrozenSet from '../util/FrozenSet';

/**
 * We keep track of the total delta (how far we've moved up/down) when
 * adjusting the selection upwards or downwards. Changing direction
 * (decrementing a positive totalDelta, or incrementing a negative one)
 * and "crossing" past 0 both represent a change of mode (from extending
 * the selection in a particular direction to reducing it).
 */
let totalDelta = 0;

let initialLocation = null;

/**
 * Changing the selection with anything other than `adjustSelection()` should
 * reset our selection tracking; so we keep track of our last updated selection
 * so that we can detect changes made by others.
 */
let lastSelection = null;

function resetSelectionTracking() {
  totalDelta = 0;
  initialLocation = null;
}

function adjust(
  selection: FrozenSet<number>,
  delta: number,
  store: StoreT,
): FrozenSet<number> {
  const lastLocation = getLastInSet(selection);
  if (lastLocation == null) {
    delta ? selectFirst(store) : selectLast(store);
    // BUG?: selection may not reflect the latest here
    return store.get('selection');
  } else if (initialLocation == null) {
    // Starting selection.
    resetSelectionTracking();
    initialLocation = lastLocation;
  }

  const previousDelta = totalDelta;
  const count = store.get('filteredNotes').length;
  totalDelta = clamp(
    totalDelta + delta, // Desired distance from where we started.
    -initialLocation, // Limit of upwards selection.
    count - initialLocation - 1, // Limit of downwards selection.
  );

  if (totalDelta < previousDelta) {
    // Moving upwards.
    if (totalDelta >= 0) {
      // Reducing downwards selection.
      return selection.clone(set => {
        set.delete(initialLocation + totalDelta + 1);
      });
    } else {
      // Extending upwards selection.
      if (selection.has(initialLocation + totalDelta)) {
        // Need to skip already-selected selection; recurse.
        if (initialLocation + totalDelta !== 0) {
          // If we're not already at the top.
          totalDelta = previousDelta;
          return adjust(selection, delta - 1, store);
        }
      } else {
        return selection.clone(set => {
          set.add(initialLocation + totalDelta);
        });
      }
    }
  } else if (totalDelta > previousDelta) {
    // We're moving downwards.
    if (totalDelta > 0) {
      // Extending downwards selection.
      if (selection.has(initialLocation + totalDelta)) {
        // Need to skip already-selected selection; recurse.
        if (initialLocation + totalDelta !== count - 1) {
          // If we're not already at the bottom.
          totalDelta = previousDelta;
          return adjust(selection, delta + 1, store);
        }
      } else {
        return selection.clone(set => {
          set.add(initialLocation + totalDelta);
        });
      }
    } else {
      // Reducing upwards selection.
      return selection.clone(set => {
        set.delete(initialLocation + totalDelta - 1);
      });
    }
  }

  return selection;
}

export default function adjustSelection(
  direction: 'down' | 'up',
  store: StoreT,
) {
  const delta = direction === 'down' ? +1 : -1;

  store.setFrom_EXPERIMENTAL(store => {
    let selection = store.get('selection');
    if (selection !== lastSelection) {
      // Somebody else has changed the selection since our last time here.
      resetSelectionTracking();
    }

    selection = adjust(selection, delta, store);

    if (selection !== lastSelection) {
      lastSelection = selection;
      store.set('selection')(selection);
    }
  });
}
