import 'jest-extended';

import * as helpers from './testing/helpers';

// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '../src';

helpers.setupEnv();
const config = {
  apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
  authDomain: 'abstracted-admin.firebaseapp.com',
  databaseURL: 'https://abstracted-admin.firebaseio.com',
  projectId: 'abstracted-admin',
  storageBucket: 'abstracted-admin.appspot.com',
  messagingSenderId: '547394508788',
};

const animalMocker = (h: any) => () => ({
  type: h.faker.random.arrayElement(['cat', 'dog', 'parrot']),
  name: h.faker.name.firstName(),
  age: h.faker.random.number({ min: 1, max: 15 }),
});

describe('Mocking', () => {
  let mockDb: RealTimeClient;
  beforeEach(async () => {
    mockDb = new RealTimeClient({ mocking: true });
    await mockDb.connect();
  });
  it('ref() returns a mock reference', () => {
    expect(mockDb.ref('foo')).toHaveProperty('once');
  });

  it('getSnapshot() returns a mock snapshot', async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getSnapshot('/animals');
    expect(animals.numChildren()).toBe(10);
    mockDb.mock.queueSchema('animal', 5).generate();
    const moreAnimals = await mockDb.getSnapshot('/animals');
    expect(moreAnimals.numChildren()).toBe(15);
  });

  it('getValue() returns a value from mock DB', async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getValue('/animals');
    expect(animals).toBeInstanceOf(Object);
    expect(helpers.length(animals)).toBe(10);
    expect(helpers.firstRecord(animals)).toHaveProperty('id');
    expect(helpers.firstRecord(animals)).toHaveProperty('name');
    expect(helpers.firstRecord(animals)).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB', async () => {
    addAnimals(mockDb, 10);
    const firstKey = helpers.firstKey(mockDb.mock.db.animals);
    const animal = await mockDb.getRecord(`/animals/${firstKey}`);
    expect(animal).toBeInstanceOf(Object);
    expect(animal.id).toBe(firstKey);
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB with bespoke id prop', async () => {
    addAnimals(mockDb, 10);
    const firstKey = helpers.firstKey(mockDb.mock.db.animals);
    const animal = await mockDb.getRecord(`/animals/${firstKey}`, 'key');

    expect(animal).toBeInstanceOf(Object);
    expect(animal).toHaveProperty('key');
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getList() returns an array of records', async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getList('/animals');
    expect(animals).toBeArray();
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('id');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('getList() returns an array of records, with bespoke "id" property', async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getList('/animals', 'key');
    expect(animals).toBeArray();
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('key');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('set() sets to the mock DB', async () => {
    mockDb.set('/people/abcd', {
      name: 'Frank Black',
      age: 45,
    });
    const people = await mockDb.getRecord('/people/abcd');
    expect(people).toHaveProperty('id');
    expect(people).toHaveProperty('name');
    expect(people).toHaveProperty('age');
  });

  it('update() updates the mock DB', async () => {
    mockDb.mock.updateDB({
      people: {
        abcd: {
          name: 'Frank Black',
          age: 45,
        },
      },
    });
    mockDb.update('/people/abcd', { age: 14 });
    const people = await mockDb.getRecord('/people/abcd');
    expect(people).toBeInstanceOf(Object);
    expect(people).toHaveProperty('id');
    expect(people).toHaveProperty('name');
    expect(people).toHaveProperty('age');
    expect(people.name).toBe('Frank Black');
    expect(people.age).toBe(14);
  });

  it('push() pushes records into the mock DB', async () => {
    mockDb.push('/people', {
      name: 'Frank Black',
      age: 45,
    });
    const people = await mockDb.getList('/people');
    expect(Array.isArray(people)).toBeTruthy();
    expect(people).toHaveLength(1);
    expect(helpers.firstRecord(people)).toHaveProperty('id');
    expect(helpers.firstRecord(people)).toHaveProperty('name');
    expect(helpers.firstRecord(people)).toHaveProperty('age');
    expect(helpers.firstRecord(people).age).toBe(45);
  });

  it('read operations on mock with a schema prefix are offset correctly', async () => {
    mockDb.mock
      .addSchema('meal', (h: any) => () => ({
        name: h.faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
        datetime: h.faker.date.recent(),
      }))
      .pathPrefix('authenticated');
    mockDb.mock.queueSchema('meal', 10);
    mockDb.mock.generate();

    expect(mockDb.mock.db.authenticated).toBeInstanceOf(Object);
    expect(mockDb.mock.db.authenticated.meals).toBeInstanceOf(Object);
    const list = await mockDb.getList('/authenticated/meals');
    expect(list.length).toBe(10);
  });

  it('setting initial DB state works', async () => {
    const db2 = new RealTimeClient({
      mocking: true,
      mockData: {
        foo: 'bar',
      },
    });
    await db2.connect();
    expect(db2.mock.db.foo).toBe('bar');
  });

  it('setting auth() to accept anonymous works', async () => {
    const db3 = await RealTimeClient.connect({
      mocking: true,
      mockAuth: {
        providers: ['anonymous'],
      },
    });
    const auth = await db3.auth();
    const user = await auth.signInAnonymously();
    expect(typeof user.user.uid).toEqual('string');
  });
});

function addAnimals(db: RealTimeClient, count: number) {
  db.mock.addSchema('animal', animalMocker);
  db.mock.queueSchema('animal', count);
  db.mock.generate();
}
