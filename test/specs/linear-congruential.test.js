import LinearCongruential from '../../src/generators/LinearCongruential';
import { testRandomGenerator } from './test-utils';

describe('LinearCongruential', () => {
  it('works like a random number generator', () => {
    expect(LinearCongruential).toBeOfType('function');

    const nr = LinearCongruential.numericalRecipies;
    expect(nr).toBeOfType('function');
    testRandomGenerator('LinearCongruential.numericalRecipies', nr);

    const bc = LinearCongruential.borlandC;
    expect(bc).toBeOfType('function');
    testRandomGenerator('LinearCongruential.borlandC', bc);

    const gc = LinearCongruential.glibc;
    expect(gc).toBeOfType('function');
    testRandomGenerator('LinearCongruential.glibc', gc);
  });
}); // describe 'LinearCongruential'
