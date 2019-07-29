/** @ignore */
let __DEFAULT_SINGLETON__ = null;

/** Randomness is the base class for pseudorandom number generation algorithms 
 * and related functions. A limitation with Javascript's `Math.random` function 
 * is that it cannot be seeded. This hinders its use for simulations and similar 
 * purposes.
 */
class Randomness {
	/** The `Randomness` instances are build with a `generator` function. This 
	 * is a function that is called without any parameters and returns a random
	 * number between 0 (inclusive) and 1 (exclusive). If none is given the
	 * standard `Math.random´ is used.
	 * 
	 * @param {function} [generator] - Random generator function.
	 */
	constructor(generator) {
		if (typeof generator === 'function') {
			this.__generator__ = generator;
		} else if (typeof generator !== 'undefined') {
			throw new TypeError(`Unsupported random number generator ${generator}!`);
		}
	}

	/** By default this base class uses `Math.random` as a generator.
	 * 
	 * @private
	 */
	__generator__() {
		return Math.random();
	}

	/** `DEFAULT` is a singleton that uses `Math.random`, provided as a shotcut
	 * for convenience.
	 */
	static get DEFAULT() {
		if (!__DEFAULT_SINGLETON__) {
			__DEFAULT_SINGLETON__ = new Randomness();
		}
		return __DEFAULT_SINGLETON__;
	}

	/** Generate a random number.
	 * 
	 * @param {number} [x=NaN] - The left bound for the resulting random 
	 * 	number's range (inclusive).
	 * @param {number} [y=NaN] - The right bound for the resulting random
	 * 	number's range (exclusive).
	 * @returns {number} If both arguments are `NaN` returns a random number in 
	 * 	[0,1). If the second argument is `NaN`, returns a random number in 
	 * 	[0, x). If both arguments are numbers return a random number in [x,y).
	 */
	random(x = NaN, y = NaN) {
		let n = this.__generator__();
		if (isNaN(y)) {
			if (isNaN(x)) {
				return n;
			} else {
				return n * x;
			}
		} else {
			return (1 - n) * x + n * y;
		}
	}

	/** Generate a random integer value in a similar way `random` does.
	 * 
	 * @param {number} [x=NaN] - The left bound for the resulting random 
	 * 	number's range (inclusive).
	 * @param {number} [y=NaN] - The right bound for the resulting random
	 * 	number's range (exclusive).
	 * @returns {number} If both arguments are `NaN` returns a random number in 
	 * 	[0,100). If the second argument is `NaN`, returns a random number in 
	 * 	[0, x). If both arguments are numbers return a random number in [x,y).
	 * @see Randomness.random
	 */
	randomInt(x = NaN, y = NaN) {
		if (isNaN(x) && isNaN(y)) {
			x = 0;
			y = 100;
		}
		return Math.floor(this.random(x, y));
	}

	/** Generate a random boolean value with a given probability (50% by 
	 * default).
	 * 
	 * @param {number} [prob=0.5] - The chance of returning `true`.
	 * @returns {boolean} 
	 */
	randomBool(prob = 0.5) {
		return this.random() < +prob;
	}

	// Sequence handling //////////////////////////////////////////////////////

	/** Generate an array of random numbers. Numbers are generated calling 
	 * `random` many times.
	 * 
	 * @param {integer} n - The amount of random values required.
	 * @yields {number}
	 */
	*randoms(n, x, y) {
		n = +n;
		for (let i = 0; i < n; i++) {
			yield this.random(this, x, y);
		}
	}

	/** Randomnly choose a value from an array.
	 * 
	 * @param {T[]} from - An array of values to choose from.
	 * @returns {T} A randomly chose value from the given array.
	 */
	choice(from) {
		return from.length < 1 ? undefined : from[this.randomInt(from.length)];
	}

	/** Randomly choose `n` values from an array.
	 * 
	 * @param {integer} n - The amount of values required.
	 * @param {T[]} from - An array of values to choose from.
	 * @returns {T[]} An array of `n` randomly chosen value from the given 
	 * 	array.
	 */
	choices(n, from) {
		return this.split(n, from)[0];
	}
	
	/** Split an array randomnly in two arrays, one with `n` elements.
	 * 
	 * @param {integer} n - The amount of value of the first array.
	 * @param {T[]} from - An array of value to choose from.
	 * @returns {T[][]} The result is an array `[A, B]`, with `A` being the 
	 * 	taken elements and `B` the remaining ones.
	 */
	split(n, from) {
		from = [...from]; // Array conversion and shallow copy.
		let result = [];
		for (n = Math.min(from.length, Math.max(+n, 0)); n > 0; n--) {
			result = result.concat(from.splice(this.randomInt(from.length), 1));
		}
		return [result, from];
	}

	/** Randomly shuffle the elements of a given array.
	 * 
	 * @params {T[]} elems - An array of values to shuffle.
	 * @returns {T[]} A copy of the given array with the elements randomly
	 * 	arranged.
	 */
	shuffle(elems) { //TODO This can be optimized by making random swaps.
		return this.choices(elems.length, elems);
	}

	// Weighted choices ///////////////////////////////////////////////////////
	
	/** Given a map of `weightedValues` a normalization scales all weights 
	 * proportionally, so they add up to 1 and hence can be treated as 
	 * probabilities. If any weight is negative, an error is raised.
	 * 
	 * @param {Map<T,number>} weightedValues - A Map of any type of value to 
	 * 	numbers.
	 * @returns {Map<T,number>} A copy of the given map, where all numbers have
	 *   been scaled to add up to one.
	 * @throws {Error} If any of the numbers in the map is negative. 
	 */
	normalizeWeights(weightedValues) {
		let weightSum = 0;
		for (let [, weight] of weightedValues) {
			if (isNaN(weight) || weight < 0) {
				throw new Error(`Cannot normalize with weight ${weight}!`);
			}
			weightSum += weight;
		}
		let result = new Map(),
			size = weightedValues.size;
		for (let [value, weight] of weightedValues) {
			result.set(value, weightSum === 0 ? 1 / size : weight / weightSum);
		}
		return result;
	}
	
	/** Choose a value from a set of values, where each value has its own 
	 * probability. 
	 * 
	 * @param {Map<T,number>} weightedValues - A Map that defines both the set
	 * 	of values to choose from, and each of these values' probabilities.
	 * @param {T} defaultValue - A default value to return if the random 
	 * 	selection fails. This can happen when the given probabilities do not 
	 * 	add up to 1.
	 * @returns {T} The randomly selected value.
	 * @throws {Error} Raised when random selection fails and no default value
	 * 	is given.
	 */
	weightedChoice(weightedValues, defaultValue) {
		let chance = this.random(), 
			result;
		for (let [value, weight] of weightedValues) {
			chance -= weight;
			if (chance <= 1e-15) {
				return value;
			} 
		}
		if (arguments.length < 2) {
			throw new Error(`Weighted choice failed. Are weights normalized?`);
		} else {
			return defaultValue;
		}
	}
	
	/** Choose `n` values from a set of values, where each value has its own 
	 * probability. 
	 * 
	 * @param {integer} n - The amount of values required.
	 * @param {Map<T,number>} weightedValues - A Map that defines both the set
	 * 	of values to choose from, and each of these values' probabilities.
	 * @param {T} defaultValue - A default value to return if the random 
	 * 	selection fails. This can happen when the given probabilities do not 
	 * 	add up to 1.
	 * @returns {T} The randomly selected value.
	 * @throws {Error} Raised when random selection fails and no default value
	 * 	is given.
	 */
	*weightedChoices(n, weightedValues) {
		if (n >= weightedValues.size) {
			yield *weightedValues.values();
		} else {
			weightedValues = new Map(weightedValues); // Shallow copy.
			let maxProb = 1.0,
				chance;
			for (var i = 0; i < n; ++i) {
				chance = this.random(maxProb);
				for (let [value, weight] of weightedValues) {
					chance -= weight;
					if (chance <= 0) {
						maxProb -= weight;
						weightedValues.delete(value);
						yield value;
					} 
				}
			}
		}
	}

	// Distributions //////////////////////////////////////////////////////////

	/** Builds a new `Randomness` instance with a generator that follows an 
	 * averaged distribution of this instance's generator. This means that the
	 * random numbers of the new generator are averages of the numbers of this
	 * generator.
	 * 
	 * @param {integer} [n=2] - The number of values averaged by the new 
	 * 	generator.
	 * @return {Randomness}
	 */
	averagedDistribution(n) {
		n = Math.max(+n, 2);
		let randomFunc = () => { 
			let sum = 0.0;
			for (let i = 0; i < n; i++) {
				sum += this.__generator__();
			}
			return sum / n;
		};
		return new Randomness(randomFunc);
	}
	
	// Utilities //////////////////////////////////////////////////////////////
	
	/** Serialization and materialization using Sermat.
	 * @ignore 
	 */
	static get __SERMAT__() {
		return { //FIXME singleton
			identifier: exports.__package__ +'.Randomness',
			serializer: function serialize_Randomness(obj) {
				if (obj.hasOwnProperty('__generator__')) {
					return [obj.__generator__];
				} else {
					return [];
				}
			},
			materializer: function materialize_Randomness(obj, args) {
				return args && (args.length < 1 ? new Randomness() : new Randomness(args[0]));
			}
		};
	}

} // class Randomness

exports.Randomness = Randomness;