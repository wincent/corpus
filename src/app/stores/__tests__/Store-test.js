/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 */

jest.dontMock('../Store');

describe('Store', () => {
  let Dispatcher;
  let Store;

  beforeEach(() => {
    jest.resetModuleRegistry();

    Dispatcher = require('../../Dispatcher');
    Store = require('../Store');

    Dispatcher.register = jest.genMockFunction();
  });

  xit("registers the class's handleDispatch method", () => {
    new Store(); // eslint-disable-line no-new
    expect(Dispatcher.register).toBeCalled();
  });

  xit('stores the dispatch token', () => {
    Dispatcher.register.mockReturnValue('the-token');
    const store = new Store();
    expect(store.dispatchToken).toBe('the-token');
  });

  xit('inherits EventEmitter methods', () => {
    const store = new Store();
    expect(typeof store.emit).toBe('function');
  });

  xit('complains when handleDispatch is not overridden', () => {
    // Using the abstract class directly.
    let store = new Store();
    expect(() => store.handleDispatch({}))
      .toThrow('Store does not implement handleDispatch');

    // Making an invalid subclass.
    class MyStore extends Store {}
    store = new MyStore();
    expect(() => store.handleDispatch({}))
      .toThrow('MyStore does not implement handleDispatch');
  });
});
