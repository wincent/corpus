/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

module.exports = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/jest/setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
