import * as util from '../src/util/other';

describe('Utilities', () => {
  describe('join', () => {
    it('parses a / string', () => {
      const path = '/usr/local/bin/';
      const path2 = '/usr/local/bin';
      const path3 = 'usr/local/bin';
      expect(util.join(path)).toBe('usr.local.bin');
      expect(util.join(path2)).toBe('usr.local.bin');
      expect(util.join(path3)).toBe('usr.local.bin');
    });

    it('parses a . string', () => {
      const path = '.usr.local.bin.';
      const path2 = '.usr.local.bin';
      const path3 = 'usr.local.bin';
      expect(util.join(path)).toBe('usr.local.bin');
      expect(util.join(path2)).toBe('usr.local.bin');
      expect(util.join(path3)).toBe('usr.local.bin');
    });

    it('parses two / strings', () => {
      const path = '/usr/local/bin/';
      const path2 = '/usr/local/bin';
      const path3 = 'usr/local/bin';
      expect(util.join(path, path2)).toBe('usr.local.bin.usr.local.bin');
      expect(util.join(path2, path3)).toBe('usr.local.bin.usr.local.bin');
    });

    it('parses two . strings', () => {
      const path = '.usr.local.bin.';
      const path2 = '.usr.local.bin';
      const path3 = 'usr.local.bin';
      expect(util.join(path, path2)).toBe('usr.local.bin.usr.local.bin');
      expect(util.join(path2, path3)).toBe('usr.local.bin.usr.local.bin');
    });

    it('parses two hybrid strings', () => {
      const path = '.usr.local/bin.';
      const path2 = '.usr.local.bin';
      const path3 = '/usr/local.bin';
      expect(util.join(path, path3)).toBe('usr.local.bin.usr.local.bin');
      expect(util.join(path2, path3)).toBe('usr.local.bin.usr.local.bin');
    });
  });

  describe('pathDiff', () => {
    it('a true subset is correctly passed back', () => {
      const path = 'people.a.b.c';
      const subset = 'people';

      expect(util.pathDiff(path, subset)).toBe('a.b.c');
    });

    it('a subset which is same as path is correctly passed back', () => {
      const path = 'people.a.b.c';
      const subset = 'people.a.b.c';
      expect(util.pathDiff(path, subset)).toBe('');
    });

    it('an invalid subset throws error', () => {
      const subset = 'people.a.b.c';
      const path = 'people';
      try {
        util.pathDiff(path, subset);
        throw new Error(`Error should have been thrown but was not`);
      } catch (e) {
        expect(true);
      }
    });
  });
});
