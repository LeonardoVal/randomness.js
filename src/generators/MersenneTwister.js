/** # Mersenne twister
 * 
 * The method `Randomness.mersenneTwister` returns a pseudorandom number 
 * generator constructor implemented with the 
 * [Mersenne Twister algorithm](http://en.wikipedia.org/wiki/Mersenne_twister#Pseudocode).
 */

/** Bit operations in Javascript deal with signed 32 bit integers. This 
 * algorithm deals with unsigned 32 bit integers. That is why this function
 * is necessary.
 */
function unsigned(n) {
	return n < 0 ? n + 0x100000000 : n;
}


class MersenneTwister extends Randomness {
	constructor(seed) {
		super();
		this.__seed__ = isNaN(seed) ? Date.now() : Math.floor(seed);
		this.__numbers__ = MersenneTwister.__initialize__(this.__seed__);
		this.__index__ = 0;
	}
	
	__generate__() {
		let numbers = this.__numbers__;
		if (this.__index__ === 0) {
			MersenneTwister.__generate__(numbers);
		}
		var y = numbers[index];
		y = unsigned(y ^ (y << 11));
		y = unsigned(y ^ ((y >>> 7) & 0x9D2C5680));
		y = unsigned(y ^ ((y >>> 15) & 0xEFC60000));
		y = unsigned(y ^ (y << 18));
		index = (index + 1) % 624;
		return y / 0xFFFFFFFF;
	}

	static __initialize__(seed) {
		let numbers = new Array(624),
			last = seed;
		numbers[0] = last;
		for (let i = 1; i < 624; ++i) {
			last = (0x6C078965 * unsigned(last ^ (last << 30)) + i) % 0xFFFFFFFF;
			numbers[i] = last;
		}
		return numbers;
	}
	
	static __generate__(numbers) {
		for(var i = 0; i < 624; ++i) {
			var y = (numbers[i] & 0x80000000) | (numbers[(i+1) % 624] & 0x7FFFFFFF);
			numbers[i] = unsigned(numbers[(i + 397) % 624] ^ (y * 2));
			if ((y & 1) !== 0) {
				numbers[i] = unsigned(numbers[i] ^ 0x9908B0DF);
			}
		}
	}

	// ## Utilities ###########################################################
	
	/** Serialization and materialization using Sermat.
	*/
	static get __SERMAT__() {
		return {
			identifier: exports.__package__ +'.MersenneTwister',
			serializer: function serialize_MersenneTwister(obj) {
				return [obj.__seed__];
			},
			materializer: function materialize_MersenneTwister(obj, args) {
				return args && (new MersenneTwister(args[0]));
			}
		};
	}
} // class MersenneTwister

exports.MersenneTwister = MersenneTwister;