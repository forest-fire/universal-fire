import { Person } from './testing/Person';
import * as helpers from './testing/helpers';
import { SerializedRealTimeQuery } from '../src/index';
import { hashToArray } from 'typed-conversions';
import { DeepPerson } from './testing/DeepPerson';
import { peopleDataset } from './data/people';
import { RealTimeAdmin } from '@forest-fire/real-time-admin';
import { Mock } from '@forest-fire/fixture';
import { List } from 'firemodel';
import { SDK } from '@forest-fire/types';
import { IDictionary } from 'common-types';

helpers.setupEnv();

describe('Tests using REAL RealTimeAdmin =>', () => {
  let db: RealTimeAdmin;
  beforeAll(async () => {
    db = await RealTimeAdmin.connect();
    List.defaultDb = db;
    await db.set('/', peopleDataset());
  });
  afterAll(async () => {
    await db.remove(`/authenticated/fancyPeople`, true);
    await db.remove('/authenticated');
  });

  it('equalTo() deserializes into valid response', async () => {
    const q = new SerializedRealTimeQuery<SDK.RealTimeAdmin, Person>('/authenticated/people')
      .orderByChild('favoriteColor')
      .equalTo('green');

    const deserializedQuery = q.deserialize(db.database);
    const manualQuery = db
      .ref('/authenticated/people')
      .orderByChild('favoriteColor')
      .equalTo('green');

    const manualJSON = hashToArray((await manualQuery.once('value')).toJSON());
    const deserializedJSON = hashToArray(
      (await deserializedQuery.once('value')).toJSON()
    );

    expect(manualJSON.length).toEqual(deserializedJSON.length);
    expect(deserializedJSON.length).toBeGreaterThan(0);
    deserializedJSON.forEach((i) => expect(i.favoriteColor).toEqual('green'));
  });

  it('limit query reduces result set', async () => {
    const q = new SerializedRealTimeQuery('/authenticated/people')
      .orderByChild('age')
      .limitToFirst(2);

    const deserializedJson: Person[] = hashToArray(
      (await q.execute(db.database)).toJSON() as IDictionary
    );
    const sortedPeople = hashToArray<Person>(
      peopleDataset().authenticated.people as IDictionary
    ).sort((a, b) => (a.age > b.age ? 1 : -1));

    expect(deserializedJson.length).toEqual(2);
    expect(deserializedJson[0].age).toEqual(sortedPeople[0].age);
  });

  it('Firemodel List.where() reduces the result set to appropriate records', async () => {
    const peeps = await List.where(Person, 'favoriteColor', 'green');
    const people = hashToArray<Person>(
      peopleDataset().authenticated.people as IDictionary
    ).filter((p) => p.favoriteColor === 'green');
    expect(peeps.length).toEqual(people.length);
  });

  it.skip('Firemodel List.where() reduces the result set to appropriate records (with a dynamic path)', async () => {
    const mockDb = await RealTimeAdmin.connect({ mocking: true });

    await Mock(DeepPerson, mockDb).generate(5, {
      favoriteColor: 'green',
      group: 'group1',
    });
    await Mock(DeepPerson, mockDb).generate(5, {
      favoriteColor: 'blue',
      group: 'group1',
    });

    const peeps = await List.where(Person, 'favoriteColor', 'green');
    const people = hashToArray<Person>(
      peopleDataset().authenticated.people as IDictionary
    ).filter((p) => p.favoriteColor === 'green');
    expect(peeps.length).toEqual(people.length);
  });
});
