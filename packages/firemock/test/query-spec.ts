import { Mock } from '../src/mocking';

const ages = () => ({
  asdfasdfas1: 13,
  asdfasdfas4: 1,
  asdfasdfas2: 5,
  asdfasdfas3: 26,
  asdfasdfas5: 2,
  asdfasdfas6: 100,
});

const MyPony = () => ({
  foo: {
    id: 'foo',
    name: 'my pony',
    favoriteColor: 'black',
  },
  bar: {
    id: 'bar',
    name: 'my pony 2',
    favoriteColor: 'red',
  },
  baz: {
    id: 'baz',
    name: 'my pony 3',
    favoriteColor: 'green',
  },
});

describe('Query →', () => {
  it('limit queries with orderByKey() on scalar valued dictionary', async () => {
    const m = await Mock.prepare();
    m.updateDB({ ages: ages() });
    const result = await m
      .ref('ages')
      .orderByKey()
      .limitToFirst(3)
      .once('value');
    const values = result.val();
    expect(Object.keys(values)).toHaveLength(3);
    const ids = new Set(['asdfasdfas1', 'asdfasdfas2', 'asdfasdfas3']);
    Object.keys(values).map((key) => {
      expect(ids.has(key)).toBe(true);
    });
  });

  it('limit queries with orderByChild() on Firemodel model', async () => {
    const m = await Mock.prepare();

    m.updateDB({ ponies: MyPony() });
    const result = await m
      .ref('ponies')
      .orderByChild('favoriteColor')
      .equalTo('green')
      .once('value');
    const values = result.val();
    expect(Object.keys(values)).toHaveLength(1);
    expect(values.baz.favoriteColor).toBe('green');
  });

  it('limit queries with orderByValue() on scalar valued dictionary', async () => {
    const m = await Mock.prepare();
    m.updateDB({ ages: ages() });

    const result = await m
      .ref('ages')
      .orderByValue()
      .limitToLast(3)
      .once('value');

    const values = result.val();

    expect(Object.keys(values)).toHaveLength(3);
    const resultValues = Object.values(values);
    const validAges = [100, 26, 13];
    resultValues.forEach((v) =>
      expect(validAges).toEqual(expect.arrayContaining([v]))
    );
    // Object.keys(values).map(key => {
    //   expect(validAges.has(values[key])).to.equal(true);
    // });
  });

  it('getValue() of a scalar returns a scalar', async () => {
    const m = await Mock.prepare();
    m.updateDB({
      foo: 5,
      bar: 10,
      baz: {
        bar: 'monkey',
      },
    });
    const snap = await m.ref(`/foo`).once('value');
    expect(snap.val()).toBe(5);
  });
});
