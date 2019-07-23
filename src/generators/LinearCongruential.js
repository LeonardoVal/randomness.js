/** # Linear congruential
 * 
 * `Randomness.LinearCongruential` builds a pseudorandom number generator 
 * constructor implemented with the 
 * [linear congruential algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator).
 * 
 * It also contain the following shortcuts to build common variants:
 */
class LinearCongruential extends Randomness {
	constructor(m, a, c, seed) {
		let i = isNaN(seed) ? Date.now() : Math.floor(seed);
		super();
		this.__arguments__ = [m, a, c, seed];
		this.current = i;
	}

	__generator__() {
		let [m, a, c, _seed] = this.__arguments__;
		this.current = (a * this.current + c) % m;
		return this.current / m;
	}
	
	/** 
	 * + `numericalRecipies(seed)`: builds a linear congruential pseudorandom 
	 * number generator as it is specified in [Numerical Recipies](http://www.nr.com/).
	 */
	static numericalRecipies(seed) {
		return new LinearCongruential(0xFFFFFFFF, 1664525, 1013904223, seed);
	}
	
	/** 
	 * + `borlandC(seed)`: builds a linear congruential pseudorandom number 
	 * generator as it used by Borland C/C++.
	 */
	static borlandC(seed) {
		return new LinearCongruential(0xFFFFFFFF, 22695477, 1, seed);
	}
	
	/** 
	 * + `glibc(seed)`: builds a linear congruential pseudorandom number 
	 * generator as it used by [glibc](http://www.mscs.dal.ca/~selinger/random/).
	 */
	static glibc(seed) {
		return new LinearCongruential(0xFFFFFFFF, 1103515245, 12345, seed);
	}

	// ## Utilities ###########################################################
	
	/** Serialization and materialization using Sermat.
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