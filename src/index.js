import { Randomness } from './Randomness';
import { LinearCongruential } from './generators/LinearCongruential';
import { MersenneTwister } from './generators/MersenneTwister';

const id = 'randomness';
const SERMAT = {
  include: [Randomness, LinearCongruential, MersenneTwister],
};

// eslint-disable-next-line import/prefer-default-export
export {
  id,
  Randomness,
  LinearCongruential,
  MersenneTwister,
  SERMAT,
};

export default {
  id,
  Randomness,
  LinearCongruential,
  MersenneTwister,
  SERMAT,
};
