// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src/RealTimeAdmin';


describe('CRUD Testing > ', () => {
  let db: RealTimeAdmin;
  beforeAll(async () => {
    db = new RealTimeAdmin({ mocking: true });
    await db.connect();
  });

  describe('Multi-path operations', () => {
    it('Adding unprefixed paths is reflected in paths getter', async () => {
      await db.multiPathSet({
        foofoo: 'foo',
        foobar: 'bar',
        foobaz: 'baz'
      });

      expect(Object.keys(db.mock.store.state).length).toBe(3);
      expect(Object.keys(db.mock.store.state)).toEqual(expect.arrayContaining(['foofoo']));
      expect(Object.keys(db.mock.store.state)).toEqual(expect.arrayContaining(['foobar']));
      expect(Object.keys(db.mock.store.state)).toEqual(expect.arrayContaining(['foobaz']));
    });

    it('sets value at all paths using mock DB', async () => {
      const updates = {
        '/foofoo': 1,
        '/foobar': 2,
        '/foo/bar': 25
      };

      await db.multiPathSet(updates);

      const foofoo = await db.getValue('/foofoo');
      const foobar = await db.getValue('/foobar');
      const foobar2 = await db.getValue('/foo/bar');

      expect(foofoo).toBe(1);
      expect(foobar).toBe(2);
      expect(foobar2).toBe(25);
    });
  });
});
