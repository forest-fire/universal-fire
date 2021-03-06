import * as helpers from './testing/helpers';

import { RealTimeClient } from '../src';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';

interface IPerson {
  name: string;
  age: number;
}

describe('Query based Read ops:', () => {
  helpers.setupEnv();
  let db: RealTimeClient;
  const personMockGenerator = (h: any) => () => ({
    name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
    age: h.faker.random.number({ min: 10, max: 99 }),
  });
  beforeEach(async () => {
    db = await RealTimeClient.connect({ mocking: true });
    db.mock.addSchema('person', personMockGenerator);
    db.mock.queueSchema('person', 20);
    db.mock.queueSchema('person', 5, { age: 100 });
    db.mock.queueSchema('person', 5, { age: 1 });
    db.mock.queueSchema('person', 3, { age: 3 });
    db.mock.generate();
  });

  it('getSnapshot() works with query passed in', async () => {
    let data = await db.getSnapshot('people');
    expect(data.numChildren()).toBe(33); // baseline check
    const q = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .limitToFirst(5);
    data = await db.getSnapshot(q);
    expect(data.numChildren()).toBe(5);
    // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
    expect(helpers.firstRecord(data.val()).age).toBe(100);
    expect(helpers.lastRecord(data.val()).age).toBe(100);
    const q2 = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getSnapshot(q2);
    expect(data.numChildren()).toBe(5);
    expect(helpers.firstRecord(data.val()).age).toBe(1);
    expect(helpers.lastRecord(data.val()).age).toBe(1);
    const q3 = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .equalTo(3);
    data = await db.getSnapshot(q3);
    expect(data.numChildren()).toBe(3);
    expect(helpers.firstRecord(data.val()).age).toBe(3);
    expect(helpers.lastRecord(data.val()).age).toBe(3);
  });

  it('getList() works with query passed in', async () => {
    let data = await db.getList<IPerson>('people');
    expect(data.length).toBe(33); // baseline check

    const q = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .limitToFirst(5);
    data = await db.getList<IPerson>(q);
    expect(data.length).toBe(5);
    data.map((d) => d.age).map((age) => expect(age).toBe(100));

    const q2 = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getList<IPerson>(q2);
    expect(data.length).toBe(5);
    data.map((d) => d.age).map((age) => expect(age).toBe(1));

    const q3 = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .equalTo(3);
    data = await db.getList<IPerson>(q3);
    expect(data.length).toBe(3);
    data.map((d) => d.age).map((age) => expect(age).toBe(3));
  });

  it('getList() with limit query on orderByKey of scalar values', async () => {
    db.mock.updateDB({
      ages: {
        asdfasdfas: 13,
        dfddffdfd: 5,
        adsffdffdfd: 26,
        ddfdfdfd: 1,
        werqerqer: 2,
        erwrewrw: 100,
      },
    });
    const query = SerializedRealTimeQuery.path('ages')
      .orderByKey()
      .limitToFirst(3);
    const ages = await db.getList(query);

    expect(ages).toHaveLength(3);
  });

  it('getList() with limit query on orderByValue', async () => {
    db.mock.updateDB({
      ages: {
        asdfasdfas: 13,
        dfddffdfd: 5,
        adsffdffdfd: 26,
        ddfdfdfd: 1,
        werqerqer: 2,
        erwrewrw: 100,
      },
    });
    const query = SerializedRealTimeQuery.path('ages')
      .orderByValue()
      .limitToFirst(3);
    const ages = await db.getList(query);
    expect(ages).toHaveLength(3);
  });
});
