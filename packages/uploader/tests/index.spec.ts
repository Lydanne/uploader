import sum from '../src/index'

describe('index.ts', () => {
  it('should ok', () => {
      expect(sum(1,2)).toBe(3)
  });
});