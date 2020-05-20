// tslint:disable:no-implicit-dependencies
import { expect } from 'chai';
import { IDictionary } from 'common-types';
import type { IMockConfig } from '@forest-fire/types';

import { RealTimeClient } from '../src/private';
import * as helpers from './testing/helpers';

const config: IMockConfig = {
  mocking: true,
};

helpers.setupEnv();
describe('Connecting to MOCK Database', () => {
  it('can instantiate', async () => {
    const db = new RealTimeClient(config);
    expect(db).to.be.an('object');
    expect(db).to.be.instanceof(RealTimeClient);
    expect(db.getValue).to.be.a('function');
  });

  it('RealTimeClient.connect() static initializer returns a connected database', async () => {
    const db = await RealTimeClient.connect(config);
    expect(db.isConnected).to.equal(true);
  });

  it('isConnected is true once connect() returns', async () => {
    const db = new RealTimeClient(config);
    await db.connect();
    expect(db.isConnected).to.equal(true);
  });

  it('adding an onConnect callback with context works', async () => {
    const db = new RealTimeClient(config);
    const itHappened: IDictionary<boolean> = { status: false };

    const notificationId: string = db.notifyWhenConnected(
      (database) => {
        expect(database).to.be.an('object');
        expect(database.isConnected).to.be.a('boolean');
        itHappened.status = true;
      },
      'my-test',
      { itHappened }
    );

    await db.connect();
    expect(itHappened.status).to.equal(true);
    expect(db.isConnected).to.equal(true);
    db.removeNotificationOnConnection(notificationId);
    expect((db as any)._onConnected).to.have.lengthOf(0);
  });
});

describe('Read operations: ', () => {
  // tslint:disable-next-line:one-variable-per-declaration
  let db: RealTimeClient;
  const personMockGenerator = (h: any) => () => ({
    name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
    age: h.faker.random.number({ min: 10, max: 99 }),
  });
  before(async () => {
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
    expect(data.val()).to.be.an('object');
    expect(data.val().one).to.be.equal('foo');
    expect(data.val().two).to.be.equal('bar');
    expect(data.val().three).to.be.equal('baz');
    expect(data.key).to.equal('client-test-data');
  });

  it('getValue() gets statically set data in test DB', async () => {
    const data = await db.getValue('client-test-data');
    expect(data).to.be.an('object');
    expect(data.one).to.be.equal('foo');
    expect(data.two).to.be.equal('bar');
    expect(data.three).to.be.equal('baz');
  });

  it('getRecord() gets statically set data in test DB', async () => {
    interface ITest {
      id: string;
      age: number;
      name: string;
    }

    const record = await db.getRecord<ITest>('/client-test-records/123456');

    expect(record).to.be.an('object');
    expect(record.id).to.be.equal('123456');
    expect(record.name).to.be.equal('Chris');
    expect(record.age).to.be.equal(50);
  });
});

describe('Write Operations', () => {
  let db: RealTimeClient;
  beforeEach(async () => {
    db = await RealTimeClient.connect(config);
    try {
      await db.remove('client-test-data/pushed');
    } catch (e) {}
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
    expect(Object.keys(users).length).to.equal(2);
    expect(helpers.valuesOf(users, 'name')).to.include('Charlie');
    expect(helpers.valuesOf(users, 'name')).to.include('Sandy');
  });

  it('set() sets data at a given path in DB', async () => {
    await db.set<INameAndAge>('client-test-data/set/user', {
      name: 'Charlie',
      age: 25,
    });
    const user = await db.getValue<INameAndAge>('client-test-data/set/user');
    expect(user.name).to.equal('Charlie');
    expect(user.age).to.equal(25);
  });

  it('update() can "set" and then "update" contents', async () => {
    await db.update('client-test-data/update/user', {
      name: 'Charlie',
      age: 25,
    });
    let user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).to.equal('Charlie');
    expect(user.age).to.equal(25);
    await db.update('client-test-data/update/user', {
      name: 'Charles',
      age: 34,
    });
    user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).to.equal('Charles');
    expect(user.age).to.equal(34);
  });

  it('update() leaves unchanged attributes as they were', async () => {
    await db.update('client-test-data/update/user', {
      name: 'Rodney',
      age: 25,
    });
    let user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).to.equal('Rodney');
    expect(user.age).to.equal(25);
    await db.update('client-test-data/update/user', {
      age: 34,
    });
    user = await db.getValue<INameAndAge>('client-test-data/update/user');
    expect(user.name).to.equal('Rodney');
    expect(user.age).to.equal(34);
  });

  it('remove() eliminates a path -- and all children -- in DB', async () => {
    await db.set('client-test-data/removal/user', {
      name: 'Rodney',
      age: 25,
    });
    let user = await db.getValue<INameAndAge>('client-test-data/removal/user');
    expect(user.name).to.equal('Rodney');
    await db.remove('client-test-data/removal/user');
    user = await db.getValue<INameAndAge>('client-test-data/removal/user');
    expect(user).to.equal(null);
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
    expect(exists).to.equal(true);
    await db.remove('/client-test-data/existance');
    exists = await db.exists('/client-test-data/existance');
    expect(exists).to.equal(false);
  });
});
