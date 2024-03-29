import 'jest-extended';

import * as helpers from './testing/helpers';

// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '../src';
import { Fixture, SchemaHelper } from '@forest-fire/fixture';

helpers.setupEnv();

const animalMocker = (h: any) => ({
  type: h.faker.random.arrayElement(['cat', 'dog', 'parrot']),
  name: h.faker.name.firstName(),
  age: h.faker.datatype.number({ min: 1, max: 15 }),
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
    const mockData = addAnimals(10);
    mockDb.mock.store.updateDb('/animals', mockData.animals);

    const animals = await mockDb.getSnapshot('/animals');
    expect(animals.numChildren()).toBe(10);

    const mockData2 = addAnimals(5);
    mockDb.mock.store.updateDb('/animals', mockData2.animals);
    const moreAnimals = await mockDb.getSnapshot('/animals');
    expect(moreAnimals.numChildren()).toBe(15);
  });

  it('getValue() returns a value from mock DB', async () => {
    const mockData = addAnimals(10);
    mockDb.mock.store.updateDb('/animals', mockData.animals);
    const animals = await mockDb.getValue('/animals');
    expect(animals).toBeInstanceOf(Object);
    expect(helpers.length(animals)).toBe(10);
    expect(helpers.firstRecord(animals)).toHaveProperty('id');
    expect(helpers.firstRecord(animals)).toHaveProperty('name');
    expect(helpers.firstRecord(animals)).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB', async () => {
    const mockData = addAnimals(10);
    mockDb.mock.store.updateDb('/animals', mockData.animals);
    const firstKey: string = helpers.firstKey(mockDb.mock.store.state.animals);
    const animal = await mockDb.getRecord(`/animals/${firstKey}`);
    expect(animal).toBeInstanceOf(Object);
    expect(animal.id).toBe(firstKey);
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getRecord() returns a record from mock DB with bespoke id prop', async () => {
    const mockData = addAnimals(10);
    mockDb.mock.store.updateDb('/animals', mockData.animals);
    const firstKey: string = helpers.firstKey(mockDb.mock.store.state.animals);
    const animal = await mockDb.getRecord(`/animals/${firstKey}`, 'key');

    expect(animal).toBeInstanceOf(Object);
    expect(animal).toHaveProperty('key');
    expect(animal).toHaveProperty('name');
    expect(animal).toHaveProperty('age');
  });

  it('getList() returns an array of records', async () => {
    const mockData = addAnimals(10);
    mockDb.mock.store.updateDb('/animals', mockData.animals);

    const animals = await mockDb.getList('/animals');
    expect(animals).toBeArray();
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('id');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('getList() returns an array of records, with bespoke "id" property', async () => {
    const mockData = addAnimals(10);
    mockDb.mock.store.updateDb('/animals', mockData.animals);
    const animals = await mockDb.getList('/animals', 'key');
    expect(animals).toBeArray();
    expect(animals).toHaveLength(10);
    expect(animals[0]).toHaveProperty('key');
    expect(animals[0]).toHaveProperty('name');
    expect(animals[0]).toHaveProperty('age');
  });

  it('set() sets to the mock DB', async () => {
    await mockDb.set('/people/abcd', {
      name: 'Frank Black',
      age: 45,
    });
    const people = await mockDb.getRecord('/people/abcd');
    expect(people).toHaveProperty('id');
    expect(people).toHaveProperty('name');
    expect(people).toHaveProperty('age');
  });

  it('update() updates the mock DB', async () => {
    mockDb.mock.store.updateDb('/people', {
      abcd: {
        name: 'Frank Black',
        age: 45,
      },
    });
    await mockDb.update('/people/abcd', { age: 14 });
    const people = await mockDb.getRecord('/people/abcd');
    expect(people).toBeInstanceOf(Object);
    expect(people).toHaveProperty('id');
    expect(people).toHaveProperty('name');
    expect(people).toHaveProperty('age');
    expect(people.name).toBe('Frank Black');
    expect(people.age).toBe(14);
  });

  it('push() pushes records into the mock DB', async () => {
    await mockDb.push('/people', {
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
    const fixture = Fixture.prepare();
    fixture
      .addSchema('meal', (h: SchemaHelper<any>) => () => ({
        name: h.faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
        datetime: h.faker.date.recent(),
      }))
      .pathPrefix('authenticated');
    fixture.queueSchema('meal', 10);
    const mockData = fixture.generate() as any;
    mockDb.mock.store.setDb('/authenticated', mockData.authenticated);
    expect(mockDb.mock.store.state.authenticated).toBeInstanceOf(Object);
    expect(mockDb.mock.store.state.authenticated.meals).toBeInstanceOf(Object);
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
    expect(db2.mock.store.state.foo).toBe('bar');
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

function addAnimals(count: number): any {
  const fixture = Fixture.prepare();
  fixture.addSchema('animal', animalMocker);
  fixture.queueSchema('animal', count);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fixture.generate();
}
