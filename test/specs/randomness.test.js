import Randomness from '../../src/Randomness';
import packageJson from '../../package.json';
import { packageName } from '../../src/utils';
import { testRandomGenerator } from './test-utils';

describe('Randomness', () => {
  const TEST_COUNT = 31;

  it('core', () => {
    const { DEFAULT } = Randomness;
    expect(typeof Randomness).toBe('function');
    expect(typeof (new Randomness()).generator).toBe('function');
    expect(() => new Randomness('error!')).toThrow();
    expect(DEFAULT).toBeDefined();
    for (let i = 0; i < TEST_COUNT; i += 1) {
      const r = DEFAULT.random();
      expect(r >= 0 && r < 1).toBe(true);
    }
    expect(packageName).toEqual(packageJson.name.replace(/@creatartis\//, ''));
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
      { input: { a: 0, b: 0 }, output: { a: 0.5, b: 0.5 } },
      { input: { a: 1, b: 2, c: 1 }, output: { a: 0.25, b: 0.5, c: 0.25 } },
      // Fail with negative weights.
      { fail: true, input: { a: -1 } },
      { fail: true, input: { a: 1, b: -0.5 } },
    ].forEach((testCase) => {
      const input = new Map(Object.entries(testCase.input));
      if (testCase.fail) {
        expect(() => Randomness.normalizeWeights(input)).toThrow();
      } else {
        const output = Object.entries(testCase.output);
        expect([...Randomness.normalizeWeights(input)]).toEqual(output);
      }
    });
  });

  it('weightedChoice()', () => {
    const { DEFAULT } = Randomness;
    expect(() => DEFAULT.weightedChoice(undefined)).toThrow();
    expect(() => DEFAULT.weightedChoice(null)).toThrow();
    [
      { a: 1, b: 0 },
      { a: 0.5, b: 0.4, c: 0.1 },
    ].forEach((choices) => {
      const choiceMap = new Map(Object.entries(choices));
      const choiceValues = Object.entries(choices)
        .filter(([, p]) => p > 0).map(([v]) => v);
      for (let i = 0; i < TEST_COUNT; i += 1) {
        expect(choiceValues).toContain(DEFAULT.weightedChoice(choiceMap));
      }
    });
    expect(() => DEFAULT.weightedChoice(new Map())).toThrow();
    expect(DEFAULT.weightedChoice(new Map(), 'default')).toBe('default');
  });

  it('weightedChoices()', () => {
    const { DEFAULT } = Randomness;
    expect([...DEFAULT.weightedChoices(0, new Map())]).toEqual([]);
    expect([...DEFAULT.weightedChoices(-1, new Map())]).toEqual([]);
    [
      { a: 1, b: 0 },
      { a: 0.5, b: 0.4, c: 0.1 },
    ].forEach((choices) => {
      const choiceMap = new Map(Object.entries(choices));
      const choiceValues = Object.entries(choices)
        .filter(([, p]) => p > 0).map(([v]) => v);
      for (let n = 1; n < choiceValues.length; n += 1) {
        const values = [...DEFAULT.weightedChoices(n, choiceMap)];
        values.forEach((value) => {
          expect(choiceValues).toContain(value);
        });
      }
    });
  });

  it('works like a random number generator', () => {
    testRandomGenerator('Randomness', () => new Randomness());
  });
}); // describe 'Randomness'
