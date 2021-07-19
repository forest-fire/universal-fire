// tslint:disable-next-line:no-implicit-dependencies

import { RealTimeAdmin } from '../src/index';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import * as helpers from './testing/helpers';
import { Fixture, SchemaCallback } from '@forest-fire/fixture';
import { IModel, SDK } from '@forest-fire/types';

interface IPerson extends IModel {
  name: string;
  age: number;
}
helpers.setupEnv();

describe('Query based Read ops:', () => {
  let db: RealTimeAdmin;
  const personMockGenerator: SchemaCallback<any> = (h) => () => {
    return {
      name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
      age: h.faker.datatype.number({ min: 10, max: 99 }),
    };
  };
  beforeAll(async () => {
    const f = await Fixture.prepare();
    f.addSchema('person', personMockGenerator);
    f.queueSchema('person', 20);
    f.queueSchema('person', 5, { age: 100 });
    f.queueSchema('person', 5, { age: 1 });
    f.queueSchema('person', 3, { age: 3 });
    const fixture = f.generate();
    db = await RealTimeAdmin.connect({ mocking: true, mockData: fixture });
  });

  it('getSnapshot() works with query passed in', async () => {
    let data = await db.getSnapshot('people');
    expect(data.numChildren()).toBe(33); // baseline check
    const q = new SerializedRealTimeQuery<SDK.RealTimeAdmin, IPerson>('people')
      .orderByChild('age')
      .limitToFirst(5);
    data = await db.getSnapshot(q);
    expect(data.numChildren()).toBe(5);
    // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
    expect(helpers.firstRecord(data.val()).age).toBe(100);
    expect(helpers.lastRecord(data.val()).age).toBe(100);
    const q2 = new SerializedRealTimeQuery<SDK.RealTimeAdmin, IPerson>('people')
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getSnapshot(q2);
    expect(data.numChildren()).toBe(5);
    expect(helpers.firstRecord(data.val()).age).toBe(1);
    expect(helpers.lastRecord(data.val()).age).toBe(1);
    const q3 = new SerializedRealTimeQuery<SDK.RealTimeAdmin, IPerson>('people')
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

    const q = new SerializedRealTimeQuery<SDK.RealTimeAdmin, IPerson>('people')
      .orderByChild('age')
      .limitToFirst(5);
    data = await db.getList<IPerson>(q);
    expect(data.length).toBe(5);
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(100));

    const q2 = new SerializedRealTimeQuery<SDK.RealTimeAdmin, IPerson>('people')
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getList<IPerson>(q2);
    expect(data.length).toBe(5);
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(1));

    const q3 = new SerializedRealTimeQuery<SDK.RealTimeAdmin, IPerson>('people')
      .orderByChild('age')
      .equalTo(3);
    data = await db.getList<IPerson>(q3);
    expect(data.length).toBe(3);
    data.map((d: any) => d.age).map((age: any) => expect(age).toBe(3));

    // test serialized query can be built with DB's exposed API
    const qPrime = db.query<IPerson>('people').orderByChild('age').limitToFirst(4);
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
    db.mock.store.updateDb('hash', {
      '-LFsnvrP4aDu3wcbxfVk': 1529961496026,
      '-LFsnvrvoavTDlWzdoPL': 1529961496059,
      '-LFsnvsq2FDo48xxRzmO': 1529961496118,
      '-LFsnvswzAKs8hgu6B7R': 1529961496124,
      '-LFsnvt2hq28zZHeddyn': 1529961496131,
    });

    const list = await db.getList('hash');
    expect(list).toHaveLength(5);
    expect(typeof list[0] === "object").toBeTruthy();
  });

  it('getList() brings back a simple array when presented with a hashArray', async () => {
    db.mock.store.updateDb('hash', {
      '-LFsnvrP4aDu3wcbxfVk': true,
      '-LFsnvrvoavTDlWzdoPL': true,
      '-LFsnvsq2FDo48xxRzmO': true,
      '-LFsnvswzAKs8hgu6B7R': true,
      '-LFsnvt2hq28zZHeddyn': true,
    });

    const list = await db.getList('hash');
    expect(list).toHaveLength(5);
    expect(typeof list[0] === "string").toBeTruthy();
  });
});
