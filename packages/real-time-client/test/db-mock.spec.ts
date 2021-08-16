/* eslint-disable @typescript-eslint/unbound-method */
// tslint:disable:no-implicit-dependencies
import { IDictionary } from 'common-types';
import type { IMockConfig } from '@forest-fire/types';

import { RealTimeClient } from '../src/';
import * as helpers from './testing/helpers';

const config: IMockConfig = {
  mocking: true,
};

helpers.setupEnv();
describe('Connecting to MOCK Database', () => {
  it('can instantiate', () => {
    const db = new RealTimeClient(config);
    expect(db).toBeInstanceOf(Object);
    expect(db).toBeInstanceOf(RealTimeClient);
    expect(db.getValue).toBeInstanceOf(Function);
  });

  it('RealTimeClient.connect() static initializer returns a connected database', async () => {
    const db = await RealTimeClient.connect(config);
    expect(db.isConnected).toEqual(true);
  });

  it('isConnected is true once connect() returns', async () => {
    const db = new RealTimeClient(config);
    await db.connect();
    expect(db.isConnected).toEqual(true);
  });

  it('adding an onConnect callback with context works', async () => {
    const db = new RealTimeClient(config);
    const itHappened: IDictionary<boolean> = { status: false };

    const notificationId: string = db.notifyWhenConnected(
      (database) => {
        expect(database).toBeInstanceOf(Object);
        expect(typeof database.isConnected).toEqual('boolean');
        itHappened.status = true;
      },
      'my-test',
      { itHappened }
    );

    await db.connect();
    expect(itHappened.status).toEqual(true);
    expect(db.isConnected).toEqual(true);
    db.removeNotificationOnConnection(notificationId);
    expect((db as any)._onConnected).toHaveLength(0);
  });
});

describe('Read operations: ', () => {
  // tslint:disable-next-line:one-variable-per-declaration
  let db: RealTimeClient;
  const personMockGenerator = (h: any) => () => ({
    name: `${h.faker.name.firstName() as string} ${
      h.faker.name.lastName() as string
    }`,
    age: h.faker.datatype.number({ min: 10, max: 99 }),
  });
  beforeAll(async () => {
    db = await RealTimeClient.connect(config);
    await db.set('client-test-data', {
      one: 'foo',
      two: 'bar',
      three: 'baz',
    });
    await db.set('client-test-records', {
      123456: {
        name: 'Chris',
        age: 50,
      },
      654321: {
        name: 'Bob',
        age: 68,
      },
    });
  });

  it('getSnapshot() gets statically set data in test DB', async () => {
    console.log('starting snapshot', db.isConnected);
    const data = await db.getSnapshot('client-test-data');
    expect(data.val()).toBeInstanceOf(Object);
    expect(data.val().one).toBe('foo');
    expect(data.val().two).toBe('bar');
    expect(data.val().three).toBe('baz');
    expect(data.key).toBe('client-test-data');
  });

  it('getValue() gets statically set data in test DB', async () => {
    const data = await db.getValue('client-test-data');
    expect(data).toBeInstanceOf(Object);
    expect(data.one).toBe('foo');
    expect(data.two).toBe('bar');
    expect(data.three).toBe('baz');
  });

  it('getRecord() gets statically set data in test DB', async () => {
    interface ITest {
      id: string;
      age: number;
      name: string;
    }

    const record = await db.getRecord<ITest>('/client-test-records/123456');

    expect(record).toBeInstanceOf(Object);
    expect(record.id).toBe('123456');
    expect(record.name).toBe('Chris');
    expect(record.age).toBe(50);
  });
});

describe('Write Operations', () => {
  let db: RealTimeClient;
  beforeEach(async () => {
    db = await RealTimeClient.connect(config);
    await db.remove('client-test-data/pushed');
  });

  interface INameAndAge {
    name: string;
    age: number;
  }

  it('push() variables into database', async () => {
    await db.push<INameAndAge>('client-test-data/pushed', {
      name: 'Charlie',
      age: 25,
    });
    await db.push('client-test-data/pushed', {
      name: 'Sandy',
      age: 32,
    });
    const users = await db
      .getValue('client-test-data/pushed')
      .catch((e) => new Error(e.message));
    expect(Object.keys(users).length).toBe(2);
    expect(helpers.valuesOf(users, 'name')).toEqual(
      expect.arrayContaining(['Charlie'])
    );
    expect(helpers.valuesOf(users, "name")).toContain('Sandy');
  });

  it('set() sets data at a given path in DB', async () => {
    await db.set<INameAndAge>('client-test-data/set/user', {
      name: 'Charlie',
      age: 25,
    });
    const user = await db.getValue<INameAndAge>('client-test-data/set/user');
    expect(user.name).toBe('Charlie');
    expect(user.age).toBe(25);
  });

  it('update() can "set" and then "update" contents', async () => {
    await db.update('client-test-data/update/user', {
      name: 'Charlie',
      age: 25,
    });
    let user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).toBe('Charlie');
    expect(user.age).toBe(25);
    await db.update('client-test-data/update/user', {
      name: 'Charles',
      age: 34,
    });
    user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).toBe('Charles');
    expect(user.age).toBe(34);
  });

  it('update() leaves unchanged attributes as they were', async () => {
    await db.update('client-test-data/update/user', {
      name: 'Rodney',
      age: 25,
    });
    let user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).toBe('Rodney');
    expect(user.age).toBe(25);
    await db.update('client-test-data/update/user', {
      age: 34,
    });
    user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).toBe('Rodney');
    expect(user.age).toBe(34);
  });

  it('remove() eliminates a path -- and all children -- in DB', async () => {
    await db.set('client-test-data/removal/user', {
      name: 'Rodney',
      age: 25,
    });
    let user = await db.getValue<INameAndAge>('client-test-data/removal/user');
    expect(user.name).toBe('Rodney');
    await db.remove('client-test-data/removal/user');
    user = await db.getValue<INameAndAge>('client-test-data/removal/user');
    expect(user).toBe(null);
  });
});

describe('Other Operations', () => {
  let db: RealTimeClient;
  beforeEach(async () => {
    db = new RealTimeClient(config);
    await db.connect();
  });

  it('exists() tests to true/false based on existance of data', async () => {
    await db.set('/client-test-data/existance', 'foobar');
    let exists = await db.exists('/client-test-data/existance');
    expect(exists).toEqual(true);
    await db.remove('/client-test-data/existance');
    exists = await db.exists('/client-test-data/existance');
    expect(exists).toBe(false);
  });
});
