import MersenneTwister from '../../src/generators/MersenneTwister';
import { testRandomGenerator } from './test-utils';

describe('MersenneTwister', () => {
  it('works like a random number generator', () => {
    expect(MersenneTwister).toBeOfType('function');
    testRandomGenerator('MersenneTwister',
      (seed) => new MersenneTwister(seed));
  });
}); // describe 'MersenneTwister'
