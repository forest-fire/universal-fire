import { RealTimeAdmin } from '../src/index';

import * as helpers from './testing/helpers';
import { IMockConfig, SDK } from '@forest-fire/types';
import { Fixture, SchemaCallback } from '@forest-fire/fixture';
helpers.setupEnv();

const animalMocker: SchemaCallback<any> = (h) => () => ({
  type: h.faker.random.arrayElement(['cat', 'dog', 'parrot']),
  name: h.faker.name.firstName(),
  age: h.faker.datatype.number({ min: 1, max: 15 }),
});

const config: IMockConfig = {
  mocking: true,
};

describe('Mocking', () => {
  it('ref() returns a mock reference', async () => {
    const db = new RealTimeAdmin(config);
    await db.connect();
    expect(db.ref('foo')).toHaveProperty('once');
    const mockDb = await RealTimeAdmin.connect({ mocking: true });
    await mockDb.connect();
    expect(mockDb.ref('foo')).toHaveProperty('once');
  });

  it('getSnapshot() returns a mock snapshot', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });

    const animals = await db.getSnapshot('/animals');
    expect(animals.numChildren()).toBe(10);
    fixture.queueSchema('animal', 5).generate();
    const moreAnimals = await db.getSnapshot('/animals');
    expect(moreAnimals.numChildren()).toBe(15);
  });

  it('getValue() returns a value from mock DB', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });

    const animals = await db.getValue('/animals');
    expect(typeof animals === 'object').toBeTruthy();
    expect(helpers.length(animals)).toBe(10);
    expect(helpers.firstRecord(animals)).toHaveProperty('id');
    expect(helpers.firstRecord(animals)).toHaveProperty('name');
    expect(helpers.firstRecord(animals)).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });

    const firstKey = helpers.firstKey(db.mock.store.state.animals);
    const animal = await db.getRecord(`/animals/${firstKey}`);
    expect(typeof animal === 'object').toBeTruthy();
    expect(animal.id).toBe(firstKey);
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB with bespoke id prop', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });

    const firstKey = helpers.firstKey(db.mock.store.state.animals);
    const animal = await db.getRecord(`/animals/${firstKey}`, 'key');

    expect(typeof animal === 'object').toBeTruthy();
    expect(animal).toHaveProperty('key');
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getList() returns an array of records', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });
    const animals = await db.getList('/animals');
    expect(Array.isArray(animals)).toBeTruthy();
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('id');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('getList() returns an array of records, with bespoke "id" property', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });
    const animals = await db.getList('/animals', 'key');
    expect(Array.isArray(animals)).toBeTruthy();
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('key');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it.only('set() sets to the mock DB', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    db.set('/people/abcd', {
      name: 'Frank Black',
      age: 45,
    });
    const person = await db.getRecord<{ name: string; age: number; id: any }>('/people/abcd');
    expect(person).toHaveProperty('id');
    expect(person).toHaveProperty('name');
    expect(person).toHaveProperty('age');
    expect(person.id).toBe("abcd");
  });

  it('update() updates the mock DB', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    await db.connect();
    db.mock.store.updateDb('people', {
      abcd: {
        name: 'Frank Black',
        age: 45,
      },
    });
    db.update('/people/abcd', { age: 14 });
    const people = await db.getRecord('/people/abcd');
    expect(typeof people === 'object').toBeTruthy();
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
    expect(Array.isArray(people)).toBeTruthy();
    expect(people).toHaveLength(1);
    expect(helpers.firstRecord(people)).toHaveProperty('id');
    expect(helpers.firstRecord(people)).toHaveProperty('name');
    expect(helpers.firstRecord(people)).toHaveProperty('age');
    expect(helpers.firstRecord(people).age).toBe(45);
  });

  it('read operations on mock with a schema prefix are offset correctly', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true, mockData: addAnimals(10) });

    const fixture = new Fixture()
      .addSchema('meal', (h) => () => ({
        name: h.faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
        datetime: h.faker.date.recent(),
      })).pathPrefix('authenticated')
      .queueSchema('meal', 10)
      .generate();

    expect(typeof db.mock.store.state.authenticated === 'object').toBeTruthy();
    expect(typeof db.mock.store.state.authenticated.meals === 'object').toBeTruthy();
    const list = await db.getList('/authenticated/meals');
    expect(list.length).toBe(10);
  });
});

async function addAnimals(count: number) {
  const fixture = new Fixture();
  fixture.addSchema('animal', animalMocker);
  fixture.queueSchema('animal', count);
  return fixture.generate();
}
