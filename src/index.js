import Randomness from './Randomness';
import LinearCongruential from './generators/LinearCongruential';
import MersenneTwister from './generators/MersenneTwister';

export const id = 'randomness';
export const SERMAT = {
  include: [Randomness, LinearCongruential, MersenneTwister],
};

export {
  LinearCongruential,
  MersenneTwister,
  Randomness,
};
