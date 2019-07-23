define(['randomness'], function (randomness) {
	/**	Generic pseudorandom generator testing procedure. See: <http://www.johndcook.com/Beautiful_Testing_ch10.pdf>.
	*/
	function testRandomGenerator(name, constructor) {
		let seeds = [123, 123456, 978654, (new Date()).getTime()],
			SAMPLE_COUNT = 1000;
		seeds.forEach(function (seed) {
			let generator = constructor(seed), 
				sum = 0.0;
			for (let i = 0; i < SAMPLE_COUNT; i++) {
				let value = generator.random();
				sum += value;
				// Range tests.
				expect(value).not.toBeLessThan(0);
				expect(value).toBeLessThan(1);
			}
			// Mean test. Warning! May fail upto 0.3% of the times.
			let mean = sum / SAMPLE_COUNT;
			expect(Math.abs(0.5 - mean) <= 3 * 0.5 / Math.sqrt(SAMPLE_COUNT))
				.toBe(true);
			//TODO Variance test?
			//TODO Chi2 test aka bucket test?
			//TODO Kolomogorov-Smirnov.
		});
	}

	describe("Randomness", function () { ///////////////////////////////////////
		it("core", function () {
			let Randomness = randomness.Randomness;
			expect(typeof Randomness).toBe('function');
			expect(new Randomness().__generator__).toBeDefined();
			let DEFAULT = Randomness.DEFAULT;
			expect(DEFAULT).toBeDefined();
			for (var i = 0; i < 30; i++) {
				var r = DEFAULT.random();
				expect(0 <= r && r < 1).toBe(true);
			}
		});

		it("constant generators", function () {
			let Randomness = randomness.Randomness,
				rand0 = new Randomness(() => 0),
				rand1 = new Randomness(() => 1);
			for (let i = 0; i < 30; i++) {
				expect(rand0.random()).toBe(0);
				expect(rand0.random(3)).toBe(0);
				expect(rand0.random(3, 7)).toBe(3);
				expect(rand1.random()).toBe(1);
				expect(rand1.random(3)).toBe(3);
				expect(rand1.random(3, 7)).toBe(7);
			}
		});

		it("random()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT,
				min, max, r;
			expect(typeof DEFAULT.random).toBe('function');
			for (let i = 0; i < 30; i++) {
				min = DEFAULT.random() * 10;
				max = min + DEFAULT.random() * 10;
				r = DEFAULT.random(max);
				expect(0 <= r).toBe(true);
				expect(0 < max ? r < max : r <= max).toBe(true);
				r = DEFAULT.random(min, max);
				expect(min <= r).toBe(true);
				expect(min < max ? r < max : r <= max).toBe(true);
			}
		});

		it("randomInt()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT,
				min, max, r;
			expect(typeof DEFAULT.randomInt).toBe('function');
			for (var i = 0; i < 30; i++) {
				min = Math.floor(DEFAULT.random() * 10);
				max = Math.floor(min + DEFAULT.random() * 10);
				r = DEFAULT.randomInt(max);
				expect(r).toEqual(Math.floor(r));
				expect(0 <= r).toBe(true);
				expect(0 < max ? r < max : r <= max).toBe(true);
				r = DEFAULT.randomInt(min, max);
				expect(r).toEqual(Math.floor(r));
				expect(min <= r).toBe(true);
				expect(min < max ? r < max : r <= max).toBe(true);
			}
		});

		it("randomBool()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT;
			expect(typeof DEFAULT.randomBool).toBe('function');
			for (let i = 0; i < 30; i++) {
				expect(DEFAULT.randomBool()).toBeOfType('boolean');
			}
			let rand0 = new Randomness(() => 0),
				rand0_4 = new Randomness(() => 0.4),
				rand0_6 = new Randomness(() => 0.6),
				rand1 = new Randomness(() => 1);
			for (let i = 0; i < 30; i++) {
				expect(rand0.randomBool()).toBe(true);
				expect(rand1.randomBool()).toBe(false);
				expect(rand0_4.randomBool()).toBe(true); // Default probability should be 0.5.
				expect(rand0_6.randomBool()).toBe(false);
				expect(rand0_4.randomBool(0.4)).toBe(false);
				expect(rand0_6.randomBool(0.6)).toBe(false);
				expect(rand0_4.randomBool(0.3)).toBe(false);
				expect(rand0_6.randomBool(0.5)).toBe(false);
				expect(rand0_4.randomBool(0.5)).toBe(true);
				expect(rand0_6.randomBool(0.7)).toBe(true);
			}
		});

		it("choice()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT;
			expect(typeof DEFAULT.choice).toBe('function');
			expect(() => DEFAULT.choice(undefined)).toThrow();
			expect(() => DEFAULT.choice(null)).toThrow();
			expect(DEFAULT.choice(''), 'Randomness.choice("") is not undefined!').toBeUndefined();
			expect(DEFAULT.choice([]), 'Randomness.choice([]) is not undefined!').toBeUndefined();
			expect(DEFAULT.choice({}), 'Randomness.choice({}) is not undefined!').toBeUndefined();

			let test = [1,2,3,4,5];
			for (let i = 0; i < 30; i++) {
				let choice = DEFAULT.choice(test);
				expect(test.indexOf(choice)).not.toBeLessThan(0);
			}
			test = 'abcde';
			for (let i = 0; i < 30; i++) {
				let choice = DEFAULT.choice(test);
				expect(test.indexOf(choice)).not.toBeLessThan(0);
			}
			let obj = {a:1, b:2, c:3, d:4, e:5};
			test = Object.entries(obj);
			for (let i = 0; i < 30; i++) {
				let choice = DEFAULT.choice(test);
				expect(choice[1]).toBe(obj[choice[0]]);
			}
		});

		it("choices()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT;
			expect(() => DEFAULT.choices(undefined)).toThrow();
			expect(() => DEFAULT.choices(null)).toThrow();

			['', [], 'a', [1], 'abc', [1,2,3,4,5]
			].forEach(function (test) {
				let testArray = [...test];
				for (let i = 0; i < 30; i++) {
					let choices = DEFAULT.choices(i % (testArray.length + 1), testArray);
					expect(Array.isArray(choices)).toBe(true);
					choices.forEach(function (x) {
						expect(testArray).toContain(x);
					});
				}
			});
		});

		it("split()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT;
			expect(() => DEFAULT.split(undefined)).toThrow();
			expect(() => DEFAULT.split(null)).toThrow();

			['', [], 'a', [1], 'abc', [1,2,3,4,5]
			].forEach(function (test) {
				let testArray = [...test];
				for (let i = 0; i < 30; i++) {
					let split = DEFAULT.split(i % (testArray.length + 1), test);
					expect(Array.isArray(split)).toBe(true);
					expect(2, split.length).toBe(2);
					expect(Array.isArray(split[0])).toBe(true);
					expect(Array.isArray(split[1])).toBe(true);
					split[0].forEach(function (x) {
						expect(testArray).toContain(x);
						expect(split[1]).not.toContain(x);
					});
					split[1].forEach(function (x) {
						expect(testArray).toContain(x);
						expect(split[0]).not.toContain(x);
					});
				}
			});
		});

		it("shuffle()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT;
			expect(() => DEFAULT.shuffle(undefined)).toThrow();
			expect(() => DEFAULT.shuffle(null)).toThrow();

			['', [], 'a', [1], 'abc', [1,2,3,4,5]
			].forEach(function (test) {
				let testArray = [...test];
				for (let i = 0; i < 30; i++) {
					let shuffled = DEFAULT.shuffle(test);
					expect(Array.isArray(shuffled)).toBe(true);
					shuffled.forEach(function (x) {
						expect(testArray).toContain(x);
					});
					expect(shuffled.length).toBe(testArray.length);
				}
			});
		});

		it("normalizeWeights()", function () {
			let Randomness = randomness.Randomness,
				DEFAULT = Randomness.DEFAULT;
			expect(() => DEFAULT.normalizeWeights(undefined)).toThrow();
			expect(() => DEFAULT.normalizeWeights(null)).toThrow();
			
			[	{ input: {}, output: {} },
				{ input: {a:1}, output: {a:1} },
				{ input: {a:1, b:0}, output: {a:1, b:0} },
				{ input: {a:1, b:1}, output: {a:0.5, b:0.5} },
				{ input: {a:1, b:3}, output: {a:0.25, b:0.75} },
				{ input: {a:1, b:2, c:1}, output: {a:0.25, b:0.5, c:0.25} },
				// Fail with negative weights.
				{ fail: true, input: {a:-1} },
				{ fail: true, input: {a:1, b:-0.5}}
			].forEach((testCase) => {
				let input = Object.entries(testCase.input);
				if (testCase.fail) {
					expect(() => DEFAULT.normalizeWeights(input)).toThrow();
				} else {
					let output = Object.entries(testCase.output);
					expect([...DEFAULT.normalizeWeights(input)])
						.toEqual(output);
				}
			});
		});

		it("linearCongruential generators", function () {
			let LinearCongruential = randomness.LinearCongruential;
			expect(LinearCongruential).toBeOfType('function');

			var nr = LinearCongruential.numericalRecipies;
			expect(nr).toBeOfType('function');
			testRandomGenerator('LinearCongruential.numericalRecipies', nr);

			var bc = LinearCongruential.borlandC;
			expect(bc).toBeOfType('function');
			testRandomGenerator('LinearCongruential.borlandC', bc);

			var gc = LinearCongruential.glibc;
			expect(gc).toBeOfType('function');
			testRandomGenerator('LinearCongruential.glibc', gc);
		});

		it("Mersenne Twister generator", function () {
			let MersenneTwister = randomness.MersenneTwister;
			expect(MersenneTwister).toBeOfType('function');
			testRandomGenerator('MersenneTwister', 
				(seed) => new MersenneTwister(seed)
			);
		});
	}); //// describe.
}); //// define.
