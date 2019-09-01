/* global Randomness, LinearCongruential, MersenneTwister */
// See `__prologue__.js`.
export default {
  Randomness,
  LinearCongruential,
  MersenneTwister,
  id: 'randomness',
  SERMAT: {
    include: [Randomness, LinearCongruential, MersenneTwister],
  },
};
