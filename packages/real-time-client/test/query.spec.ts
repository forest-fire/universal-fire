import * as helpers from './testing/helpers';

import { RealTimeClient } from '../src';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { Fixture, ISchemaHelper } from '@forest-fire/fixture';
import { IModel, SDK } from '@forest-fire/types';

interface IPerson extends IModel {
  name: string;
  age: number;
}

describe('Query based Read ops:', () => {
  helpers.setupEnv();
  let db: RealTimeClient;
  const personMockGenerator = (h: ISchemaHelper<any>) => () => ({
    name: `${h.faker.name.firstName()} ${h.faker.name.lastName()}`,
    age: h.faker.datatype.number({ min: 10, max: 99 }),
  });
  beforeEach(async () => {
    const fixture =  Fixture.prepare();
    fixture.addSchema('person', personMockGenerator);
    fixture.queueSchema('person', 20);
    fixture.queueSchema('person', 5, { age: 100 });
    fixture.queueSchema('person', 5, { age: 1 });
    fixture.queueSchema('person', 3, { age: 3 });
    const mockData = fixture.generate();
    db = await RealTimeClient.connect({ mocking: true, mockData });
  });

  it('getSnapshot() works with query passed in', async () => {
    let data = await db.getSnapshot('people');
    expect(data.numChildren()).toBe(33); // baseline check
    // TODO: refactor the class definition in order to fix the type errors
    const q = new SerializedRealTimeQuery<SDK.RealTimeClient, IPerson>('people')
      .orderByChild('age')
      .limitToFirst(5);
    data = await db.getSnapshot(q);
    expect(data.numChildren()).toBe(5);
    // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
    expect(helpers.firstRecord(data.val()).age).toBe(100);
    expect(helpers.lastRecord(data.val()).age).toBe(100);
    const q2 = new SerializedRealTimeQuery<SDK.RealTimeClient, IPerson>(
      'people'
    )
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getSnapshot(q2);
    expect(data.numChildren()).toBe(5);
    expect(helpers.firstRecord(data.val()).age).toBe(1);
    expect(helpers.lastRecord(data.val()).age).toBe(1);
    const q3 = new SerializedRealTimeQuery<SDK.RealTimeClient, IPerson>(
      'people'
    )
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

    const q = new SerializedRealTimeQuery<SDK.RealTimeClient, IPerson>('people')
      .orderByChild('age')
      .limitToFirst(5);
    data = await db.getList<IPerson>(q);
    expect(data.length).toBe(5);
    data.map((d) => d.age).map((age) => expect(age).toBe(100));

    const q2 = new SerializedRealTimeQuery<SDK.RealTimeClient, IPerson>(
      'people'
    )
      .orderByChild('age')
      .limitToLast(5);
    data = await db.getList<IPerson>(q2);
    expect(data.length).toBe(5);
    data.map((d) => d.age).map((age) => expect(age).toBe(1));

    const q3 = new SerializedRealTimeQuery<SDK.RealTimeClient, IPerson>(
      'people'
    )
      .orderByChild('age')
      .equalTo(3);
    data = await db.getList<IPerson>(q3);
    expect(data.length).toBe(3);
    data.map((d) => d.age).map((age) => expect(age).toBe(3));
  });

  it('getList() with limit query on orderByKey of scalar values', async () => {
    db.mock.store.updateDb('/ages', {
      asdfasdfas: 13,
      dfddffdfd: 5,
      adsffdffdfd: 26,
      ddfdfdfd: 1,
      werqerqer: 2,
      erwrewrw: 100,
    });
    const query = new SerializedRealTimeQuery<SDK.RealTimeClient>('ages')
      .orderByKey()
      .limitToFirst(3);
    const ages = await db.getList(query);

    expect(ages).toHaveLength(3);
  });

  it('getList() with limit query on orderByValue', async () => {
    db.mock.store.updateDb('/ages', {
      asdfasdfas: 13,
      dfddffdfd: 5,
      adsffdffdfd: 26,
      ddfdfdfd: 1,
      werqerqer: 2,
      erwrewrw: 100,
    });
    const query = new SerializedRealTimeQuery<SDK.RealTimeClient>('ages')
      .orderByValue()
      .limitToFirst(3);
    const ages = await db.getList(query);
    expect(ages).toHaveLength(3);
  });
});
