import { Sermat } from 'sermat';
import Randomness from '../../src/Randomness';
import LinearCongruential from '../../src/generators/LinearCongruential';
import MersenneTwister from '../../src/generators/MersenneTwister';
import { packageName } from '../../src/utils';
import { seeds } from './test-utils';

describe('Sermat support', () => {
  it('is defined', () => {
    const identifierRegExp = new RegExp(`^${packageName}\\.\\w+$`);
    [
      Randomness, LinearCongruential, MersenneTwister,
    ].forEach((clazz) => {
      const { __SERMAT__ } = clazz;
      expect(__SERMAT__).toBeTruthy();
      expect(__SERMAT__).toBeOfType('object');
      const {
        identifier, serializer, materializer,
      } = __SERMAT__;
      expect(identifier).toMatch(identifierRegExp);
      expect(serializer).toBeOfType('function');
      expect(materializer).toBeOfType('function');
    });
  });

  it('works as expected', () => {
    const seed = seeds[3];
    const sermat = new Sermat();
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
