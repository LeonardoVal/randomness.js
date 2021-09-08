import { Sermat } from 'sermat';
import Randomness from '../../src/Randomness';
import LinearCongruential from '../../src/generators/LinearCongruential';
import MersenneTwister from '../../src/generators/MersenneTwister';

/** Generic pseudorandom generator testing procedure. See: <http://www.johndcook.com/Beautiful_Testing_ch10.pdf>.
*/
function testRandomGenerator(name, constructor) {
  const seeds = [123, 123456, 978654, (new Date()).getTime()];
  const SAMPLE_COUNT = 100;
  seeds.forEach((seed) => {
    const generator = constructor(seed);
    const values = [];
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      const value = generator.random();
      values.push(value);
      // Range tests.
      expect(value).not.toBeLessThan(0);
      expect(value).toBeLessThan(1);
    }
    values.sort((x, y) => x - y);
    const dPlus = values.reduce(
      (max, value, i) => Math.max(max, (i + 1) / SAMPLE_COUNT - value),
      -Infinity,
    );
    const dMinus = values.reduce(
      (max, value, i) => Math.max(max, value - i / SAMPLE_COUNT),
      -Infinity,
    );
    const dCritical = 1.63 / Math.sqrt(SAMPLE_COUNT); // alpha 1%
    expect(Math.max(dPlus, dMinus)).toBeLessThan(dCritical);
  });
}

describe('Randomness', () => {
  const TEST_COUNT = 31;

  it('core', () => {
    const { DEFAULT } = Randomness;
    expect(typeof Randomness).toBe('function');
    expect(typeof (new Randomness()).generator).toBe('function');
    expect(DEFAULT).toBeDefined();
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const r = DEFAULT.random();
      expect(r >= 0 && r < 1).toBe(true);
    }
  });

  it('constant generators', () => {
    const rand0 = new Randomness(() => 0);
    const rand1 = new Randomness(() => 1);
    for (let i = 0; i < TEST_COUNT; i += 1) {
      expect(rand0.random()).toBe(0);
      expect(rand0.random(3)).toBe(0);
      expect(rand0.random(3, 7)).toBe(3);
      expect(rand1.random()).toBe(1);
      expect(rand1.random(3)).toBe(3);
      expect(rand1.random(3, 7)).toBe(7);
    }
  });

  it('random()', () => {
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.random).toBe('function');
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const min = DEFAULT.random() * 10;
      const max = min + DEFAULT.random() * 10;
      let r = DEFAULT.random(max);
      expect(r >= 0).toBe(true);
      expect(max > 0 ? r < max : r <= max).toBe(true);
      r = DEFAULT.random(min, max);
      expect(min <= r).toBe(true);
      expect(min < max ? r < max : r <= max).toBe(true);
    }
  });

  it('randomInt()', () => {
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.randomInt).toBe('function');
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const min = Math.floor(DEFAULT.random() * 10);
      const max = Math.floor(min + DEFAULT.random() * 10);
      let r = DEFAULT.randomInt(max);
      expect(r).toEqual(Math.floor(r));
      expect(r >= 0).toBe(true);
      expect(max > 0 ? r < max : r <= max).toBe(true);
      r = DEFAULT.randomInt(min, max);
      expect(r).toEqual(Math.floor(r));
      expect(min <= r).toBe(true);
      expect(min < max ? r < max : r <= max).toBe(true);
    }
  });

  it('randoms()', () => {
    const { DEFAULT } = Randomness;
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const amount = DEFAULT.randomInt(1, TEST_COUNT);
      const randoms = [...DEFAULT.randoms(amount)];
      expect(randoms.length).toBe(amount);
      for (const n of randoms) {
        expect(n >= 0 && n < 1).toBe(true);
      }
    }
  });

  it('randomBool()', () => {
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.randomBool).toBe('function');
    for (let i = 0; i < TEST_COUNT; i += 1) {
      expect(DEFAULT.randomBool()).toBeOfType('boolean');
    }
    const rand0 = new Randomness(() => 0);
    // eslint-disable-next-line camelcase
    const rand0_4 = new Randomness(() => 0.4);
    // eslint-disable-next-line camelcase
    const rand0_6 = new Randomness(() => 0.6);
    const rand1 = new Randomness(() => 1);
    for (let i = 0; i < TEST_COUNT; i += 1) {
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

  it('choice()', () => {
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.choice).toBe('function');
    expect(() => DEFAULT.choice(undefined)).toThrow();
    expect(() => DEFAULT.choice(null)).toThrow();
    expect(DEFAULT.choice('')).toBeUndefined();
    expect(DEFAULT.choice([])).toBeUndefined();
    expect(DEFAULT.choice({})).toBeUndefined();

    let test = [1, 2, 3, 4, 5];
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const choice = DEFAULT.choice(test);
      expect(test.indexOf(choice)).not.toBeLessThan(0);
    }
    test = 'abcde';
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const choice = DEFAULT.choice(test);
      expect(test.indexOf(choice)).not.toBeLessThan(0);
    }
    const obj = {
      a: 1, b: 2, c: 3, d: 4, e: 5,
    };
    test = Object.entries(obj);
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const choice = DEFAULT.choice(test);
      expect(choice[1]).toBe(obj[choice[0]]);
    }
  });

  it('choices()', () => {
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.choices(undefined)).toThrow();
    expect(() => DEFAULT.choices(null)).toThrow();
    [
      '', [], 'a', [1], 'abc', [1, 2, 3, 4, 5],
    ].forEach((test) => {
      const testArray = [...test];
      for (let i = 0; i < TEST_COUNT; i += 1) {
        const choices = DEFAULT.choices(i % (testArray.length + 1), testArray);
        expect(Array.isArray(choices)).toBe(true);
        choices.forEach((x) => {
          expect(testArray).toContain(x);
        });
      }
    });
  });

  it('split()', () => {
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.split(undefined)).toThrow();
    expect(() => DEFAULT.split(null)).toThrow();
    [
      '', [], 'a', [1], 'abc', [1, 2, 3, 4, 5],
    ].forEach((test) => {
      const testArray = [...test];
      for (let i = 0; i < TEST_COUNT; i += 1) {
        const n = i % (testArray.length + 1);
        const split = DEFAULT.split(n, test);
        expect(split).toBeOfType(Array);
        expect(split.length).toBe(2);
        expect(split[0]).toBeOfType(Array);
        expect(split[0].length).toBe(n);
        expect(split[1].length).toBe(testArray.length - n);
        split[0].forEach((x) => {
          expect(testArray).toContain(x);
          expect(split[1]).not.toContain(x);
        });
        split[1].forEach((x) => {
          expect(testArray).toContain(x);
          expect(split[0]).not.toContain(x);
        });
      }
    });
  });

  it('shuffle()', () => {
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.shuffle(undefined)).toThrow();
    expect(() => DEFAULT.shuffle(null)).toThrow();
    [
      '', [], 'a', [1], 'abc', [1, 2, 3, 4, 5],
    ].forEach((test) => {
      const testArray = [...test];
      for (let i = 0; i < TEST_COUNT; i += 1) {
        const shuffled = DEFAULT.shuffle(test);
        expect(Array.isArray(shuffled)).toBe(true);
        shuffled.forEach((x) => {
          expect(testArray).toContain(x);
        });
        expect(shuffled.length).toBe(testArray.length);
      }
    });
  });

  it('normalizeWeights()', () => {
    expect(() => Randomness.normalizeWeights(undefined)).toThrow();
    expect(() => Randomness.normalizeWeights(null)).toThrow();
    [
      { input: {}, output: {} },
      { input: { a: 1 }, output: { a: 1 } },
      { input: { a: 1, b: 0 }, output: { a: 1, b: 0 } },
      { input: { a: 1, b: 1 }, output: { a: 0.5, b: 0.5 } },
      { input: { a: 1, b: 3 }, output: { a: 0.25, b: 0.75 } },
      { input: { a: 1, b: 2, c: 1 }, output: { a: 0.25, b: 0.5, c: 0.25 } },
      // Fail with negative weights.
      { fail: true, input: { a: -1 } },
      { fail: true, input: { a: 1, b: -0.5 } },
    ].forEach((testCase) => {
      const input = Object.entries(testCase.input);
      if (testCase.fail) {
        expect(() => Randomness.normalizeWeights(input)).toThrow();
      } else {
        const output = Object.entries(testCase.output);
        expect([...Randomness.normalizeWeights(input)])
          .toEqual(output);
      }
    });
  });

  it('linearCongruential generators', () => {
    expect(LinearCongruential).toBeOfType('function');

    const nr = LinearCongruential.numericalRecipies;
    expect(nr).toBeOfType('function');
    testRandomGenerator('LinearCongruential.numericalRecipies', nr);

    const bc = LinearCongruential.borlandC;
    expect(bc).toBeOfType('function');
    testRandomGenerator('LinearCongruential.borlandC', bc);

    const gc = LinearCongruential.glibc;
    expect(gc).toBeOfType('function');
    testRandomGenerator('LinearCongruential.glibc', gc);
  });

  it('Mersenne Twister generator', () => {
    expect(MersenneTwister).toBeOfType('function');
    testRandomGenerator('MersenneTwister',
      (seed) => new MersenneTwister(seed));
  });

  it('Serialization with Sermat', () => {
    const packageName = 'randomness';
    const seed = 7489153;
    const sermat = new Sermat({
      include: [Randomness, LinearCongruential, MersenneTwister],
    });
    [
      [Randomness.DEFAULT, 'Randomness()'],
      [new Randomness(), 'Randomness()'],
      [LinearCongruential.borlandC(seed),
        `LinearCongruential(${0xFFFFFFFF},${22695477},${1},${seed})`],
      [LinearCongruential.glibc(seed),
        `LinearCongruential(${0xFFFFFFFF},${1103515245},${12345},${seed})`],
      [LinearCongruential.numericalRecipies(seed),
        `LinearCongruential(${0xFFFFFFFF},${1664525},${1013904223},${seed})`],
      [new MersenneTwister(seed), `MersenneTwister(${seed})`],
    ].forEach(([obj, serialization]) => {
      expect(sermat.ser(obj)).toBe(`${packageName}.${serialization}`);
      const obj2 = sermat.sermat(obj);
      expect(sermat.ser(obj2)).toBe(`${packageName}.${serialization}`);
    });
    expect(() => sermat.ser(new Randomness(() => 1))).toThrow();
  });
}); // describe 'Randomness'
