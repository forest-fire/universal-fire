// tslint:disable-next-line:no-implicit-dependencies

import { RealTimeAdmin } from '../src/index';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import * as helpers from './testing/helpers';
type SchemaCallback = import('firemock').SchemaCallback;

interface IPerson {
  name: string;
  age: number;
}
helpers.setupEnv();

describe('Query based Read ops:', async () => {
  let db: RealTimeAdmin;
  before(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    const personMockGenerator: SchemaCallback = h => () => {
      return {
        name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
        age: h.faker.datatype.number({ min: 10, max: 99 })
      };
    };
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
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(100));

    const q2 = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getList<IPerson>(q2);
    expect(data.length).toBe(5);
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(1));

    const q3 = SerializedRealTimeQuery.path('people')
      .orderByChild('age')
      .equalTo(3);
    data = await db.getList<IPerson>(q3);
    expect(data.length).toBe(3);
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(3));

    // test serialized query can be built with DB's exposed API
    const qPrime = db
      .query('people')
      .orderByChild('age')
      .limitToFirst(4);
    data = await db.getList<IPerson>(qPrime);
    expect(data).toHaveLength(4);
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(100));
  });

  /**
   * hashLookups have a meaningful value as the value prop;
   * this is in contrast to the "hashArray" where the value
   * is set to TRUE only
   */
  it('getList() works with a hashLookup list', async () => {
    db.mock.updateDB({
      hash: {
        '-LFsnvrP4aDu3wcbxfVk': 1529961496026,
        '-LFsnvrvoavTDlWzdoPL': 1529961496059,
        '-LFsnvsq2FDo48xxRzmO': 1529961496118,
        '-LFsnvswzAKs8hgu6B7R': 1529961496124,
        '-LFsnvt2hq28zZHeddyn': 1529961496131
      }
    });

    const list = await db.getList('hash');
    expect(list).toHaveLength(5);
    expect(list[0]).toBeInstanceOf('object');
  });

  it('getList() brings back a simple array when presented with a hashArray', async () => {
    db.mock.updateDB({
      hash: {
        '-LFsnvrP4aDu3wcbxfVk': true,
        '-LFsnvrvoavTDlWzdoPL': true,
        '-LFsnvsq2FDo48xxRzmO': true,
        '-LFsnvswzAKs8hgu6B7R': true,
        '-LFsnvt2hq28zZHeddyn': true
      }
    });

    const list = await db.getList('hash');
    expect(list).toHaveLength(5);
    expect(list[0]).toBeInstanceOf('string');
  });
});
