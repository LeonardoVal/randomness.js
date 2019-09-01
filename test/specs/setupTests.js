/* global describe it expect */
/* eslint-disable valid-typeof */
expect.extend({
  /** Tests the type of the received value. If `type` is a string the `typeof`
   * operator is used. Else it is assumed `type` is a function, and the
   * `instanceof` operator is used.
  */
  toBeOfType(received, type) {
    const pass = typeof type === 'string'
      ? (typeof received === type)
      : (received instanceof type);
    if (pass) {
      return {
        message: () => `expected ${received} not to be of type ${type}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be of type ${type}`,
      pass: false,
    };
  },
});

describe('Custom matchers', () => {
  it('toBeOfType', () => {
    expect(typeof expect(1).toBeOfType).toBe('function');
    expect(1).toBeOfType('number');
    expect('1').toBeOfType('string');
    expect(new Date()).toBeOfType(Date);
    expect(/\d+/).toBeOfType(RegExp);
    expect([1, 2, 3]).toBeOfType(Array);
    expect([]).toBeOfType(Array);
  });
}); // describe 'Custom matchers'
