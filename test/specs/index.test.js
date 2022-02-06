import {
  id,
  LinearCongruential,
  MersenneTwister,
  Randomness,
  SERMAT,
} from '../../src/index';

describe('Package index', () => {
  it('has the expected layout', () => {
    expect(id).toBeOfType('string');
    expect(LinearCongruential).toBeOfType('function');
    expect(MersenneTwister).toBeOfType('function');
    expect(Randomness).toBeOfType('function');
    expect(SERMAT).toBeOfType('object');
  });
}); // describe 'Package index'
