/** Class for pseudorandom number generator implemented with the 
 * [linear congruential algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator).
 * It also contain the following shortcuts to build common variants.
 * 
 * @see Randomness
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
		let i = isNaN(seed) ? Date.now() : Math.floor(seed);
		super();
		this.__arguments__ = [m, a, c, seed];
		this.current = i;
	}

	/** @ignore */
	__generator__() {
		let [m, a, c, _seed] = this.__arguments__;
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
	static get __SERMAT__() {
		return {
			identifier: exports.__package__ +'.LinearCongruential',
			serializer: function serialize_LinearCongruential(obj) {
				return obj.__arguments__;
			},
			materializer: function materialize_LinearCongruential(obj, args) {
				return args && (new LinearCongruential(...args));
			}
		};
	}
} // class LinearCongruential

exports.LinearCongruential = LinearCongruential;