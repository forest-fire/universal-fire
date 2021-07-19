import { createDatabase } from '~/databases/createDatabase';

describe('multiPathSet() => ', () => {
  it('setting properties shallowly works as expected', async () => {
    const m = createDatabase("RealTimeAdmin");
    await m.ref('/').update({
      '/baz': 1,
      '/bar': 2,
      '/foo/baz': 5,
    });
    const db = (await m.ref("/").once("value")).val();

    expect(db.baz).toBe(1);
    expect(db.bar).toBe(2);
    expect(db.foo).toBeInstanceOf(Object);
    expect(db.foo.baz).toBe(5);
  });

  it('setting properties deeply ', async () => {
    const m = createDatabase("RealTimeAdmin");
    await m.ref('/').update({
      '/foo/bar/foo': 1,
      '/foo/bar/bar': 2,
      '/foo/bar/baz': 5,
    });
    const db = (await m.ref("/").once("value")).val();
    expect(db.foo.bar.foo).toBe(1);
    expect(db.foo.bar.bar).toBe(2);
    expect(db.foo.bar.baz).toBe(5);
  });

  it('explicit paths are set destructively but neighboring properties are left untouched', async () => {
    const m = createDatabase("RealTimeAdmin", {
      db: {
        foo: {
          bar: {
            white: true,
            brown: true,
            green: false,
            red: true,
          },
        },
      },
    });

    await m.ref('/').update({
      '/foo/bar/added': true,
      '/foo/bar/white': false,
    });

    const db = (await m.ref("/").once("value")).val();

    expect(db.foo.bar.added).toBe(true);
    expect(db.foo.bar.white).toBe(false);
    expect(db.foo.bar.green).toBe(false);
    expect(db.foo.bar.red).toBe(true);
  });
});
