/** Example seeds to use in tests.
*/
export const seeds = [123, 123456, 978654, 7489153, (new Date()).getTime()];

/** Test randomness with Kolmogorov-Smirnovs goodness-of-fit (1% alpha).
*/
export function testRandomGenerator(_name, constructor) {
  const SAMPLE_COUNT = 200;
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
