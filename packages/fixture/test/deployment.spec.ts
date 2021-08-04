import { createDatabase } from 'firemock';
import { SchemaCallback, Fixture } from '~/index';

describe('Deployment', () => {
  const animalMock: SchemaCallback<any> = (h) => () => ({
    name: h.faker.name.firstName(),
    age: h.faker.helpers.randomize([1, 2, 4]),
    home: h.faker.address.streetAddress(),
  });

  it('Overriding the mock at deployment works', async () => {
    const f = Fixture.prepare();
    f.addSchema('animal', animalMock);
    f.queueSchema('animal', 2, { age: 12 });
    f.queueSchema('animal', 2, { age: 14 });
    f.queueSchema('animal', 2, { age: 16 });
    const fixtures = f.generate() as Record<string, { age: number }>;
    const mockDatabase = createDatabase('RealTimeAdmin', {}, fixtures);

    const results = await mockDatabase.db.ref('/animals').once('value');
    const filtered = await mockDatabase.db
      .ref('/animals')
      .orderByChild('age')
      .equalTo(12, 'age')
      .once('value');

    expect(results.numChildren()).toBe(6);
    expect(filtered.numChildren()).toBe(2);
  });

  it('orderByChild() simulates ordering on server side', async () => {
    // Note that ordering is useful when combined with limits or startAt/End
    // as the sorting is all done on the server and then the filtering is applied
    // the actually returned resultset may not be sorted by the stated criteria.
    // This test is meant to represent this.
    const m = Fixture.prepare();
    m.addSchema('animal', animalMock);
    m.queueSchema('animal', 10, { age: 16 });
    m.queueSchema('animal', 10, { age: 14 });
    m.queueSchema('animal', 10, { age: 12 });
    m.queueSchema('animal', 10, { age: 16 });
    const fixtures = m.generate();
    const mockDatabase = createDatabase('RealTimeAdmin', {}, fixtures);

    const orderedOnServer = await mockDatabase.db
      .ref('/animals')
      .orderByChild('age')
      .limitToFirst(30)
      .once('value');

    const animals = orderedOnServer.val();
    expect(orderedOnServer.numChildren()).toBe(30); // housekeeping
    // correct ages were filtered by server query
    Object.keys(animals).map((animal) => {
      expect(animals[animal].age).toBeGreaterThan(13);
    });
    // the order of the returned list, however, does not follow the sort
    const sequence = Object.keys(animals).map((animal) => animals[animal].age);
    const sorted = sequence.reduce((prev, curr) =>
      typeof prev === 'number' && curr < prev ? curr : false
    );
    expect(sorted).toBe(false);
  });

  it('startAt(x, y) filter works', async () => {
    // Note that ordering is useful when combined with limits or startAt/End
    // as the sorting is all done on the server and then the filtering is applied
    // the actually returned resultset may not be sorted by the stated criteria.
    // This test is meant to represent this.
    const m = Fixture.prepare();
    m.addSchema('animal', animalMock);
    m.queueSchema('animal', 10, { age: 16 });
    m.queueSchema('animal', 10, { age: 14 });
    m.queueSchema('animal', 10, { age: 12 });
    m.queueSchema('animal', 10, { age: 15 });
    const fixtures = m.generate();
    const mockDatabase = createDatabase('RealTimeAdmin', {}, fixtures);

    const orderedOnServer = await mockDatabase.db
      .ref('/animals')
      .orderByValue()
      .startAt(14, 'age')
      .once('value');

    const animals = orderedOnServer.val();
    expect(orderedOnServer.numChildren()).toBe(30); // housekeeping
    // correct ages were filtered by server query
    Object.keys(animals).map((animal) => {
      expect(animals[animal].age).toBeGreaterThan(13);
    });
    // the order of the returned list, however, does not follow the sort
    const sequence = Object.keys(animals).map((animal) => animals[animal].age);
    const sorted = sequence.reduce((prev, curr) =>
      typeof prev === 'number' && curr < prev ? curr : false
    );
    expect(sorted).toBe(false);
  });

  it('using modelName() changes path in DB', async () => {
    const m = Fixture.prepare();
    m.addSchema('cat', animalMock);
    m.addSchema('dog', animalMock).modelName('animal');
    m.queueSchema('cat', 10);
    m.queueSchema('dog', 10);
    const fixtures = m.generate();
    const mockDatabase = createDatabase('RealTimeAdmin', {}, fixtures);

    expect(mockDatabase.store.state.cats).toHaveLength(10);
    expect(mockDatabase.store.state.dogs).toHaveLength(0);
    expect(mockDatabase.store.state.animals).toHaveLength(10);
  });

  it('offset property is incorporated into DB path', async () => {
    const m = Fixture.prepare();
    m.addSchema('cat', animalMock)
      .modelName('animal')
      .pathPrefix('auth/anonymous');

    m.addSchema('dog', animalMock)
      .modelName('animal')
      .pathPrefix('auth/anonymous/');
    m.queueSchema('cat', 10, { kind: 'cat' });
    m.queueSchema('dog', 10, { kind: 'dog' });
    const fixtures = m.generate();
    const mockDatabase = createDatabase('RealTimeAdmin', {}, fixtures);

    expect(mockDatabase.store.state.dogs).toHaveLength(0);
    expect(mockDatabase.store.state.cats).toHaveLength(0);
    expect(mockDatabase.store.state.animals).toHaveLength(0);
    expect(mockDatabase.store.state.auth).toHaveLength(1);
    expect(mockDatabase.store.state.auth.anonymous).toHaveLength(1);
    expect(mockDatabase.store.state.auth.anonymous.animals).toHaveLength(20);
  });
});
