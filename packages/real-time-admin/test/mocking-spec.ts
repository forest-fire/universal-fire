import { RealTimeAdmin } from '../src/index';

import * as helpers from './testing/helpers';
import type { IMockConfig } from '@forest-fire/types';
helpers.setupEnv();
type SchemaCallback = import('firemock').SchemaCallback;

const animalMocker: SchemaCallback = (h) => () => ({
  type: h.faker.random.arrayElement(['cat', 'dog', 'parrot']),
  name: h.faker.name.firstName(),
  age: h.faker.datatype.number({ min: 1, max: 15 }),
});

const config: IMockConfig = {
  mocking: true,
};

describe('Mocking', async () => {
  it('ref() returns a mock reference', async () => {
    const db = new RealTimeAdmin(config);
    await db.connect();
    expect(db.ref('foo')).toHaveProperty('once');
    const mockDb = await RealTimeAdmin.connect({ mocking: true });
    await mockDb.connect();
    expect(mockDb.ref('foo')).toHaveProperty('once');
  });

  it('getSnapshot() returns a mock snapshot', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    await db.connect();
    addAnimals(db, 10);
    const animals = await db.getSnapshot('/animals');
    expect(animals.numChildren()).toBe(10);
    db.mock.queueSchema('animal', 5).generate();
    const moreAnimals = await db.getSnapshot('/animals');
    expect(moreAnimals.numChildren()).toBe(15);
  });

  it('getValue() returns a value from mock DB', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    await db.connect();
    addAnimals(db, 10);
    const animals = await db.getValue('/animals');
    expect(animals).toBeInstanceOf('object');
    expect(helpers.length(animals)).toBe(10);
    expect(helpers.firstRecord(animals)).toHaveProperty('id');
    expect(helpers.firstRecord(animals)).toHaveProperty('name');
    expect(helpers.firstRecord(animals)).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    addAnimals(db, 10);
    const firstKey = helpers.firstKey(db.mock.db.animals);
    const animal = await db.getRecord(`/animals/${firstKey}`);
    expect(animal).toBeInstanceOf('object');
    expect(animal.id).toBe(firstKey);
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB with bespoke id prop', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    addAnimals(db, 10);
    const firstKey = helpers.firstKey(db.mock.db.animals);
    const animal = await db.getRecord(`/animals/${firstKey}`, 'key');

    expect(animal).toBeInstanceOf('object');
    expect(animal).toHaveProperty('key');
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getList() returns an array of records', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    addAnimals(db, 10);
    const animals = await db.getList('/animals');
    expect(animals).toBeInstanceOf('array');
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('id');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('getList() returns an array of records, with bespoke "id" property', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    addAnimals(db, 10);
    const animals = await db.getList('/animals', 'key');
    expect(animals).toBeInstanceOf('array');
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('key');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('set() sets to the mock DB', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    db.set('/people/abcd', {
      name: 'Frank Black',
      age: 45,
    });
    const people = await db.getRecord('/people/abcd');
    expect(people).toHaveProperty('id');
    expect(people).toHaveProperty('name');
    expect(people).toHaveProperty('age');
  });

  it('update() updates the mock DB', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    db.mock.updateDB({
      people: {
        abcd: {
          name: 'Frank Black',
          age: 45,
        },
      },
    });
    db.update('/people/abcd', { age: 14 });
    const people = await db.getRecord('/people/abcd');
    expect(people).toBeInstanceOf('object');
    expect(people).toHaveProperty('id');
    expect(people).toHaveProperty('name');
    expect(people).toHaveProperty('age');
    expect(people.name).toBe('Frank Black');
    expect(people.age).toBe(14);
  });

  it('push() pushes records into the mock DB', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    db.push('/people', {
      name: 'Frank Black',
      age: 45,
    });
    const people = await db.getList('/people');
    expect(people).toBeInstanceOf('array');
    expect(people).toHaveLength(1);
    expect(helpers.firstRecord(people)).toHaveProperty('id');
    expect(helpers.firstRecord(people)).toHaveProperty('name');
    expect(helpers.firstRecord(people)).toHaveProperty('age');
    expect(helpers.firstRecord(people).age).toBe(45);
  });

  it('read operations on mock with a schema prefix are offset correctly', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    db.mock
      .addSchema('meal', (h) => () => ({
        name: h.faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
        datetime: h.faker.date.recent(),
      }))
      .pathPrefix('authenticated');
    db.mock.queueSchema('meal', 10);
    db.mock.generate();

    expect(db.mock.db.authenticated).toBeInstanceOf('object');
    expect(db.mock.db.authenticated.meals).toBeInstanceOf('object');
    const list = await db.getList('/authenticated/meals');
    expect(list.length).toBe(10);
  });
});

function addAnimals(db: RealTimeAdmin, count: number) {
  db.mock.addSchema('animal', animalMocker as any);
  db.mock.queueSchema('animal', count);
  db.mock.generate();
}
