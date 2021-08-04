import { createDatabase } from 'firemock';
import { SchemaCallback, Fixture } from '~/index';

describe('Deployment', () => {
  const animalMock: SchemaCallback<any> = (h) => ({
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

  it('using modelName() changes path in DB', async () => {
    const m = Fixture.prepare();
    m.addSchema('cat', animalMock);
    m.addSchema('dog', animalMock).modelName('animal');
    m.queueSchema('cat', 10);
    m.queueSchema('dog', 10);
    const fixtures = m.generate();
    const mockDatabase = createDatabase('RealTimeAdmin', {}, fixtures);

    expect(Object.keys(mockDatabase.store.state.cats)).toHaveLength(10);
    expect(mockDatabase.store.state.dogs).toBeUndefined();
    expect(Object.keys(mockDatabase.store.state.animals)).toHaveLength(10);
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
    console.log(mockDatabase.store.state);

    expect(mockDatabase.store.state.dogs).toBeUndefined();
    expect(mockDatabase.store.state.cats).toBeUndefined();
    expect(mockDatabase.store.state.animals).toBeUndefined();
    expect(Object.keys(mockDatabase.store.state.auth)).toHaveLength(1);
    expect(Object.keys(mockDatabase.store.state.auth.anonymous)).toHaveLength(
      1
    );
    expect(
      Object.keys(mockDatabase.store.state.auth.anonymous.animals)
    ).toHaveLength(20);
  });
});
