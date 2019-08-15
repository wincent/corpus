/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import filterNotes from '../filterNotes';

describe('filterNotes()', () => {
  let notes: Note[];

  beforeEach(() => {
    notes = [
      makeNote({
        text: 'lovering ophthalmagra Sakha phylacteried',
        title: 'Cylindrosporium mastigure microsomatous photohyponastic',
        tags: new Set(['dixie', 'intervale', 'rammerman', 'cannabic']),
      }),
      makeNote({
        text: 'sectional cropsickness Thebaid broadloom',
        title: 'testiere piacaba Phanerocarpous Zutugil',
      }),
      makeNote({
        text: 'pul odontohyperesthesia paraenesis phaneromania',
        title: 'unaccounted postclavicula overregulate winterdykes',
        tags: new Set(['unresentful', 'knockout', 'Coropo', 'versificatory']),
      }),
      makeNote({
        text: 'flameproof powwower overbitter Wedgwood',
        title: 'evangelicity reliquidation dicaryotic Hemiramphinae',
      }),
    ];
  });

  it('returns the original notes, given a null query', () => {
    expect(filterNotes(null, notes)).toStrictEqual(notes);
  });

  it('returns the original notes, given an empty string query', () => {
    expect(filterNotes('', notes)).toStrictEqual(notes);
  });

  it('returns notes with a title matching a word', () => {
    expect(filterNotes('overregulate', notes)).toEqual([notes[2]]);
  });

  it('returns notes with a body matching a word', () => {
    expect(filterNotes('sectional', notes)).toEqual([notes[1]]);
  });

  it('returns notes matching multiple words', () => {
    expect(filterNotes('flameproof dicaryotic', notes)).toEqual([notes[3]]);
  });

  it('returns notes matching a tag', () => {
    expect(filterNotes('#dixie', notes)).toEqual([notes[0]]);
  });

  it('returns notes matching multiple tags', () => {
    expect(filterNotes('#knockout #unresentful', notes)).toEqual([notes[2]]);
  });

  it('returns nothing if nothing matches', () => {
    expect(filterNotes('overregulate skirmisher', notes)).toEqual([]);
  });
});
