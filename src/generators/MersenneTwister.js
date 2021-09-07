import Randomness from '../Randomness';

/** Bit operations in Javascript deal with signed 32 bit integers. This
 * algorithm deals with unsigned 32 bit integers. That is why this function is
 * necessary.
 * @ignore
*/
function unsigned(n) {
  return n < 0 ? n + 0x100000000 : n;
}

/** Class for for pseudorandom number generator implemented with the
 * [Mersenne Twister algorithm](http://en.wikipedia.org/wiki/Mersenne_twister#Pseudocode).
 *
 * @class
 * @extends Randomness
*/
class MersenneTwister extends Randomness {
  constructor(seed) {
    super();
    this.seed = Number.isNaN(seed) ? Date.now() : Math.floor(seed);
    this.numbers = MersenneTwister.initialize(this.seed);
    this.index = 0;
  }

  /** @ignore */
  generate() {
    const { numbers } = this;
    if (this.index === 0) {
      MersenneTwister.generate(numbers);
    }
    let y = numbers[this.index];
    y = unsigned(y ^ (y << 11));
    y = unsigned(y ^ ((y >>> 7) & 0x9D2C5680));
    y = unsigned(y ^ ((y >>> 15) & 0xEFC60000));
    y = unsigned(y ^ (y << 18));
    this.index = (this.index + 1) % 624;
    return y / 0xFFFFFFFF;
  }

  /** @ignore */
  static initialize(seed) {
    const numbers = new Array(624);
    let last = seed;
    numbers[0] = last;
    for (let i = 1; i < 624; i += 1) {
      last = (0x6C078965 * unsigned(last ^ (last << 30)) + i) % 0xFFFFFFFF;
      numbers[i] = last;
    }
    return numbers;
  }

  /** @ignore */
  static generate(numbers) {
    for (let i = 0; i < 624; i += 1) {
      const y = (numbers[i] & 0x80000000) | (numbers[(i + 1) % 624] & 0x7FFFFFFF);
      numbers[i] = unsigned(numbers[(i + 397) % 624] ^ (y * 2));
      if ((y & 1) !== 0) {
        numbers[i] = unsigned(numbers[i] ^ 0x9908B0DF);
      }
    }
  }

  // Utilities //////////////////////////////////////////////////////////////

  /** Serialization and materialization using Sermat.
   * @ignore
  */
  static SERMAT = {
    identifier: `${exports.id}.MersenneTwister`,
    serializer(obj) {
      return [obj.seed];
    },
    materializer(obj, args) {
      return args && (new MersenneTwister(args[0]));
    },
  }
} // class MersenneTwister

export default MersenneTwister;
