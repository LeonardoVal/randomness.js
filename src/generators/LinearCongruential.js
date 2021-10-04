import { packageName } from '../utils';
import Randomness from '../Randomness';

/** Class for pseudorandom number generator implemented with the
 * [linear congruential algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator).
 * It also contain the following shortcuts to build common variants.
 *
 * @class
 * @extends Randomness
*/
class LinearCongruential extends Randomness {
  /** Builds a linear congruential pseudo random number generator.
   *
   * @param {number} m
   * @param {number} a
   * @param {number} c
   * @param {number} seed
  */
  constructor(m, a, c, seed) {
    const i = Number.isNaN(seed) ? Date.now() : Math.floor(seed);
    super();
    Object.defineProperty(this, 'arguments', { value: [m, a, c, seed] });
    this.current = i;
  }

  /** @ignore */
  generator() {
    const [m, a, c] = this.arguments;
    this.current = (a * this.current + c) % m;
    return this.current / m;
  }

  /** [Numerical Recipies](http://www.nr.com/) recommends these arguments for
   * a linear congruential generator: `0xFFFFFFFF`, `1664525`, `1013904223`.
   *
   * @param {number} seed - The seed to use with the pseudorandom generator.
   * @return {LinearCongruential}
  */
  static numericalRecipies(seed) {
    return new LinearCongruential(0xFFFFFFFF, 1664525, 1013904223, seed);
  }

  /** The Borland C/C++ RTL uses these arguments for the linear congruential
   * pseudorandom number generator: `0xFFFFFFFF`, `22695477`, `1`.
   *
   * @param {number} seed - The seed to use with the pseudorandom generator.
   * @return {LinearCongruential}
  */
  static borlandC(seed) {
    return new LinearCongruential(0xFFFFFFFF, 22695477, 1, seed);
  }

  /** The [glibc](http://www.mscs.dal.ca/~selinger/random/) library uses
   * these arguments for the linear congruential pseudorandom number
   * generator: `0xFFFFFFFF`, `1103515245`, `12345`.
   *
   * @param {number} seed - The seed to use with the pseudorandom generator.
   * @return {LinearCongruential}
  */
  static glibc(seed) {
    return new LinearCongruential(0xFFFFFFFF, 1103515245, 12345, seed);
  }

  // Utilities //////////////////////////////////////////////////////////////

  /** Serialization and materialization using Sermat.
   * @ignore
  */
  static __SERMAT__ = {
    identifier: `${packageName}.LinearCongruential`,
    serializer(obj) {
      return [...obj.arguments];
    },
    materializer(_obj, args) {
      return args && (new LinearCongruential(...args));
    },
  }
} // class LinearCongruential

export default LinearCongruential;
