declare global {
  var __DEV__: boolean;
}

declare global {
  namespace NodeJS {
    interface Global {
      __DEV__: boolean;
    }
  }
}

// https://stackoverflow.com/questions/47736473/how-to-define-global-function-in-typescript
export {}
