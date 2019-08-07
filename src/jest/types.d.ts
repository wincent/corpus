/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * See `setup.ts` for implementation.
 */

/**
 * These ones for unqualified (implicit) access.
 */
declare var makeNote: (template?: Partial<Note>) => Note;

/**
 * These ones for access as properties on `global`.
 */
declare namespace NodeJS {
  interface Global {
    makeNote: typeof makeNote;
  }
}
