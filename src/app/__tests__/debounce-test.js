/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

'use strict';

jest.dontMock('../debounce');

const debounce = require('../debounce');

describe('debounce()', () => {
  let mockFunction;

  beforeEach(() => {
    mockFunction = jest.genMockFunction();
  });

  it('does nothing when the debounced function is not called', () => {
    debounce(mockFunction, 100);
    jest.runAllTimers();
    expect(mockFunction).not.toBeCalled();
  });

  it('calls the debounced function after an interval', () => {
    const debounced = debounce(mockFunction, 100);
    debounced();
    expect(mockFunction).not.toBeCalled();
    jest.runAllTimers();
    expect(mockFunction).toBeCalled();
  });

  it('uses the last-passed arguments when debouncing multiple calls', () => {
    const debounced = debounce(mockFunction, 100);
    debounced(1);
    debounced(2);
    expect(mockFunction).not.toBeCalled();
    jest.runAllTimers();
    expect(mockFunction).toBeCalledWith(2);
    expect(mockFunction.mock.calls.length).toBe(1);
  });

  it('uses the last-employed context when debouncing multiple calls', () => {
    let context;
    const debounced = debounce(function() {
      context = this;
    }, 100);
    const context1 = {};
    const context2 = {};
    debounced.call(context1);
    debounced.call(context2);
    jest.runAllTimers();
    expect(context).toBe(context2);
  });
});
