/* eslint-disable valid-typeof */
/* global jasmine, beforeEach */
(() => {
  beforeEach(() => { // Add custom matchers.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 8000; // 8 seconds.
    jasmine.addMatchers({
      toBeOfType: () => ({
        compare: (actual, expected) => {
          switch (typeof expected) {
            case 'function': return {
              pass: actual instanceof expected,
              message: `Expected type ${expected.name} but got ${actual.constructor.name}.`,
            };
            case 'string': return {
              pass: typeof actual === expected,
              message: `Expected type '${expected}' but got '${typeof actual}'.`,
            };
            default: return {
              pass: false,
              message: `Unknown type ${expected}!`,
            };
          }
        },
      }),
    });
  });
})();
