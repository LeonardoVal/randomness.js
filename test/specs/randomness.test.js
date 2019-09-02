﻿/* global describe it expect */
/* eslint-disable no-mixed-operators */
/* eslint-disable import/no-unresolved */
import randomness from '../randomness-umd';
import './setupTests';

/** Generic pseudorandom generator testing procedure. See: <http://www.johndcook.com/Beautiful_Testing_ch10.pdf>.
*/
function testRandomGenerator(name, constructor) {
  const seeds = [123, 123456, 978654, (new Date()).getTime()];
  const SAMPLE_COUNT = 1000;
  seeds.forEach((seed) => {
    const generator = constructor(seed);
    let sum = 0.0;
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      const value = generator.random();
      sum += value;
      // Range tests.
      expect(value).not.toBeLessThan(0);
      expect(value).toBeLessThan(1);
    }
    // Mean test. Warning! May fail upto 0.3% of the times.
    const mean = sum / SAMPLE_COUNT;
    expect(Math.abs(0.5 - mean) <= 3 * 0.5 / Math.sqrt(SAMPLE_COUNT))
      .toBe(true);
    // TODO Variance test?
    // TODO Chi2 test aka bucket test?
    // TODO Kolomogorov-Smirnov.
  });
}

describe('Randomness', () => {
  it('core', () => {
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(typeof Randomness).toBe('function');
    expect(typeof (new Randomness()).generator).toBe('function');
    expect(DEFAULT).toBeDefined();
    for (let i = 0; i < 30; i += 1) {
      const r = DEFAULT.random();
      expect(r >= 0 && r < 1).toBe(true);
    }
  });

  it('constant generators', () => {
    const { Randomness } = randomness;
    const rand0 = new Randomness(() => 0);
    const rand1 = new Randomness(() => 1);
    for (let i = 0; i < 30; i += 1) {
      expect(rand0.random()).toBe(0);
      expect(rand0.random(3)).toBe(0);
      expect(rand0.random(3, 7)).toBe(3);
      expect(rand1.random()).toBe(1);
      expect(rand1.random(3)).toBe(3);
      expect(rand1.random(3, 7)).toBe(7);
    }
  });

  it('random()', () => {
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.random).toBe('function');
    for (let i = 0; i < 30; i += 1) {
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
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.randomInt).toBe('function');
    for (let i = 0; i < 30; i += 1) {
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

  it('randomBool()', () => {
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.randomBool).toBe('function');
    for (let i = 0; i < 30; i += 1) {
      expect(DEFAULT.randomBool()).toBeOfType('boolean');
    }
    const rand0 = new Randomness(() => 0);
    // eslint-disable-next-line camelcase
    const rand0_4 = new Randomness(() => 0.4);
    // eslint-disable-next-line camelcase
    const rand0_6 = new Randomness(() => 0.6);
    const rand1 = new Randomness(() => 1);
    for (let i = 0; i < 30; i += 1) {
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
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(typeof DEFAULT.choice).toBe('function');
    expect(() => DEFAULT.choice(undefined)).toThrow();
    expect(() => DEFAULT.choice(null)).toThrow();
    expect(DEFAULT.choice('')).toBeUndefined();
    expect(DEFAULT.choice([])).toBeUndefined();
    expect(DEFAULT.choice({})).toBeUndefined();

    let test = [1, 2, 3, 4, 5];
    for (let i = 0; i < 30; i += 1) {
      const choice = DEFAULT.choice(test);
      expect(test.indexOf(choice)).not.toBeLessThan(0);
    }
    test = 'abcde';
    for (let i = 0; i < 30; i += 1) {
      const choice = DEFAULT.choice(test);
      expect(test.indexOf(choice)).not.toBeLessThan(0);
    }
    const obj = {
      a: 1, b: 2, c: 3, d: 4, e: 5,
    };
    test = Object.entries(obj);
    for (let i = 0; i < 30; i += 1) {
      const choice = DEFAULT.choice(test);
      expect(choice[1]).toBe(obj[choice[0]]);
    }
  });

  it('choices()', () => {
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.choices(undefined)).toThrow();
    expect(() => DEFAULT.choices(null)).toThrow();
    [
      '', [], 'a', [1], 'abc', [1, 2, 3, 4, 5],
    ].forEach((test) => {
      const testArray = [...test];
      for (let i = 0; i < 30; i += 1) {
        const choices = DEFAULT.choices(i % (testArray.length + 1), testArray);
        expect(Array.isArray(choices)).toBe(true);
        choices.forEach((x) => {
          expect(testArray).toContain(x);
        });
      }
    });
  });

  it('split()', () => {
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.split(undefined)).toThrow();
    expect(() => DEFAULT.split(null)).toThrow();

    [
      '', [], 'a', [1], 'abc', [1, 2, 3, 4, 5],
    ].forEach((test) => {
      const testArray = [...test];
      for (let i = 0; i < 30; i += 1) {
        const split = DEFAULT.split(i % (testArray.length + 1), test);
        expect(split).toBeOfType(Array);
        expect(split.length).toBe(2);
        expect(split[0]).toBeOfType(Array);
        expect(split[1]).toBeOfType(Array);
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
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.shuffle(undefined)).toThrow();
    expect(() => DEFAULT.shuffle(null)).toThrow();

    [
      '', [], 'a', [1], 'abc', [1, 2, 3, 4, 5],
    ].forEach((test) => {
      const testArray = [...test];
      for (let i = 0; i < 30; i += 1) {
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
    const { Randomness } = randomness;
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.normalizeWeights(undefined)).toThrow();
    expect(() => DEFAULT.normalizeWeights(null)).toThrow();

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
        expect(() => DEFAULT.normalizeWeights(input)).toThrow();
      } else {
        const output = Object.entries(testCase.output);
        expect([...DEFAULT.normalizeWeights(input)])
          .toEqual(output);
      }
    });
  });

  it('linearCongruential generators', () => {
    const { LinearCongruential } = randomness;
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
    const { MersenneTwister } = randomness;
    expect(MersenneTwister).toBeOfType('function');
    testRandomGenerator('MersenneTwister',
      (seed) => new MersenneTwister(seed));
  });
}); // describe 'Randomness'