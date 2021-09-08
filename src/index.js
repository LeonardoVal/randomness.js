import { packageName as id } from './utils';
import Randomness from './Randomness';
import LinearCongruential from './generators/LinearCongruential';
import MersenneTwister from './generators/MersenneTwister';

const SERMAT = {
  include: [Randomness, LinearCongruential, MersenneTwister],
};

export {
  id,
  LinearCongruential,
  MersenneTwister,
  Randomness,
  SERMAT,
};
