import { mockRandom, resetMockRandom  } from 'jest-mock-random';
import { random, code } from '../src/Generator';

describe('Generator.ts', () => {

  it('should is [1,4)', () => {
    mockRandom([0, .4, .9])

    expect(random(1,4)).toBe(1)
    expect(random(1,4)).toBe(2)
    expect(random(1,4)).toBe(3)
    resetMockRandom()

  });

  it('should is 4567', () => {
    mockRandom([.4, .5, .6, .7])
    expect(code()).toBe('4567')
    resetMockRandom()
  });
});