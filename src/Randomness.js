/** # Randomness

Randomness is the base class for pseudorandom number generation algorithms and 
related functions. A limitation with Javascript's `Math.random` function is that 
it cannot be seeded. This hinders its use for simulations and simular purposes.
*/
let __DEFAULT_SINGLETON__ = null;

class Randomness {
	/** The `Randomness` instances are build with a `generator` function. This 
	 * is a function that is called without any parameters and returns a random
	 * number between 0 (inclusive) and 1 (exclusive). If none is given the 
	 * standard `Math.random´ is used.
	 */
	constructor(generator) {
		if (typeof generator === 'function') {
			this.__generator__ = generator;
		} else if (typeof generator !== 'undefined') {
			throw new TypeError(`Unsupported random number generator ${generator}!`);
		}
	}

	/** By default this base class uses `Math.random` as a generator. 
	 */
	__generator__() {
		return Math.random();
	}

	static get DEFAULT() {
		if (!__DEFAULT_SINGLETON__) {
			__DEFAULT_SINGLETON__ = new Randomness();
		}
		return __DEFAULT_SINGLETON__;
	}

	/** The basic use of the pseudorandom number generator is through the 
	 * method `random`. Called without arguments returns a random number in 
	 * [0,1). Called with only the first argument x, returns a random number in
	 * [0, x). Called with two arguments (x, y) return a random number in 
	 * [x,y).
	 */
	random(x, y) {
		let n = this.__generator__();
		switch (arguments.length) {
			case 0: return n;
			case 1: return n * x;
			default: return (1 - n) * x + n * y;
		}
	}

	/** The method `randomInt` behaves the same way `random` does, but returns 
	 * an integer instead.
	 */
	randomInt() {
		return Math.floor(this.random(...arguments));
	}

	/** The method `randomBool` tests against a probability (50% by default), 
	 * yielding true with the given chance, or else false.
	*/
	randomBool(prob = 0.5) {
		return this.random() < +prob;
	}

	// ## Sequence handling ###################################################

	/** A shortcut for building a sequence of n random numbers calling is 
	 * `randoms`. Numbers are generated calling `random` many times.
	*/
	*randoms(n, ...args) {
		n = +n;
		for (let i = 0; i < n; i++) {
			yield this.random(this, ...args);
		}
	}

	/** To randomnly selects an element from an array `from` use 
	 * `choice(from)`. If more than one argument is given, the element is 
	 * chosen from the argument list.
	 */
	choice(from) {
		return from.length < 1 ? undefined : from[this.randomInt(from.length)];
	}

	/** To randomnly selects `n` elements from an array `from` use 
	 * `choices(n, from)`. If more than two arguments are given, the elements
	 * are taken from the second arguments on.
	 */
	choices(n, from) {
		return this.split(n, from)[0];
	}
	
	/** To take `n` elements from an array `from` randomnly use 
	 * `split(n, from)`. It returns an array `[A, B]`, with `A` being the taken 
	 * elements and `B` the remaining ones. If more than two arguments are 
	 * given, elements are taken from the second argument on.
	 */
	split(n, from) {
		from = [...from]; // Array conversion and shallow copy.
		let result = [];
		for (n = Math.min(from.length, Math.max(+n, 0)); n > 0; n--) {
			result = result.concat(from.splice(this.randomInt(from.length), 1));
		}
		return [result, from];
	}

	/** The method `shuffle(xs)` randomnly rearranges elements in `xs`; 
	 * returning a copy.
	 */
	shuffle(elems) { //TODO This can be optimized by making random swaps.
		return this.choices(elems.length, elems);
	}

	// ## Weighted choices ####################################################
	
	/** Given a map of `weightedValues` a normalization scales all weights 
	 * proportionally, so they add up to 1 and hence can be treated as 
	 * probabilities. If any weight is negative, an error is raised.
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
	
	/** A `weightedChoice` is a choice where each value has its own 
	 * probability. The given `weightedValues` must be normalized, i.e. the 
	 * weights must add up to 1.
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
	
	/** The method `weightedChoices` performs `n` weighted choices, without 
	 * repeating values.
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

	// ## Distributions #######################################################

	/** An `averagedDistribution(times)` of a `Randomness` instance is another 
	 * `Randomness` instance based on this one, but generating numbers by 
	 * averaging its random values a given number of `times` (2 by default). 
	 * The result is an aproximation of the normal distribution as times 
	 * increases.
	 */
	averagedDistribution(n) {
		n = Math.max(+n, 2);
		let randomFunc = () => { 
			let sum = 0.0;
			for (let i = 0; i < n; i++) {
				sum += this.__random__();
			}
			return sum / n;
		};
		return new Randomness(randomFunc);
	}
	
	// ## Utilities ###########################################################
	
	/** Serialization and materialization using Sermat.
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