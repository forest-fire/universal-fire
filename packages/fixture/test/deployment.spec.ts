import { SchemaCallback, Fixture } from "~/index""

describe('Deployment', () => {
  const animalMock: SchemaCallback<any> = (h) => () => ({
    name: h.faker.name.firstName(),
    age: h.faker.helpers.randomize([1, 2, 4]),
    home: h.faker.address.streetAddress(),
  });

  it('Overriding the mock at deployment works', async () => {
    const f = await Fixture.prepare();
    f.addSchema('animal', animalMock);
    f.queueSchema('animal', 2, { age: 12 });
    f.queueSchema('animal', 2, { age: 14 });
    f.queueSchema('animal', 2, { age: 16 });
    const fixtures = f.generate() as Record<string, { age: number }>;
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

    const results = await f.ref('/animals').once('value');
    const filtered = await f
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
    const m = await Fixture.prepare();
    m.addSchema('animal', animalMock);
    m.queueSchema('animal', 10, { age: 16 });
    m.queueSchema('animal', 10, { age: 14 });
    m.queueSchema('animal', 10, { age: 12 });
    m.queueSchema('animal', 10, { age: 16 });
    m.generate();

    const orderedOnServer = await m
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
    const m = await Fixture.prepare();
    m.addSchema('animal', animalMock);
    m.queueSchema('animal', 10, { age: 16 });
    m.queueSchema('animal', 10, { age: 14 });
    m.queueSchema('animal', 10, { age: 12 });
    m.queueSchema('animal', 10, { age: 15 });
    m.generate();

    const orderedOnServer = await m
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
    const m = await Fixture.prepare();
    m.addSchema('cat', animalMock);
    m.addSchema('dog', animalMock).modelName('animal');
    m.queueSchema('cat', 10);
    m.queueSchema('dog', 10);
    m.generate();
    expect((m.db.cats)).toHaveLength(10);
    expect((m.db.dogs)).toHaveLength(0);
    expect((m.db.animals)).toHaveLength(10);
  });

  it('offset property is incorporated into DB path', async () => {
    const m = await Fixture.prepare();
    m.addSchema('cat', animalMock)
      .modelName('animal')
      .pathPrefix('auth/anonymous');

    m.addSchema('dog', animalMock)
      .modelName('animal')
      .pathPrefix('auth/anonymous/');
    m.queueSchema('cat', 10, { kind: 'cat' });
    m.queueSchema('dog', 10, { kind: 'dog' });
    m.generate();

    expect((m.db.dogs)).toHaveLength(0);
    expect((m.db.cats)).toHaveLength(0);
    expect((m.db.animals)).toHaveLength(0);
    expect((m.db.auth)).toHaveLength(1);
    expect((m.db.auth.anonymous)).toHaveLength(1);
    expect((m.db.auth.anonymous.animals)).toHaveLength(20);
  });
});
