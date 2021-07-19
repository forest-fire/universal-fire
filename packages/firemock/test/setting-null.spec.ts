import { Fixture, SchemaCallback } from '@forest-fire/fixture';
import { SDK } from '~/auth/admin-sdk';
import { createDatabase } from '~/databases';

const animalMock: SchemaCallback = (h) => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.helpers.randomize([1, 2, 4]),
  home: h.faker.address.streetAddress(),
});

describe('Setting null to db path →', () => {
  it('when set() to null path should be removed', async () => {
    const fixture = Fixture.prepare();
    fixture.addSchema('animal', animalMock);
    fixture.queueSchema('animal', 1, { id: '1234' });
    fixture.queueSchema('animal', 2, { age: 12 });
    fixture.queueSchema('animal', 2, { age: 16 });
    const mockData = fixture.generate();
    const {db} = createDatabase(SDK.RealTimeClient, { db: { mockData, mocking: true } });
    const results = await db.ref('/animals').once('value');

    expect(results.numChildren()).toBe(5);
    await db.ref('/animals/1234').set(null);
    const results2 = await db.ref('/animals').once('value');
    expect(results2.numChildren()).toBe(4);
  });
});
