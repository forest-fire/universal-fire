import { Person } from './testing/Person';
import * as helpers from './testing/helpers';
import { SerializedRealTimeQuery } from '../src/index';
import { hashToArray } from 'typed-conversions';
import { DeepPerson } from './testing/DeepPerson';
import { peopleDataset } from './data/people';
import { RealTimeAdmin } from 'universal-fire';
import { Mock } from '@forest-fire/fixture';
import { List } from 'firemodel';
import { IDatabaseSdk, SDK } from '@forest-fire/types';
import { IDictionary } from 'common-types';

helpers.setupEnv();

describe('Tests using REAL RealTimeAdmin =>', () => {
  let db: IDatabaseSdk<'RealTimeAdmin'>;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    List.defaultDb = db;
    await db.set('/', peopleDataset());
  });
  afterAll(async () => {
    await db.remove(`/authenticated/fancyPeople`, true);
    await db.remove('/authenticated');
  });

  it('equalTo() deserializes into valid response', async () => {
    const q = new SerializedRealTimeQuery<SDK.RealTimeAdmin, any>(
      '/authenticated/people'
    )
      .orderByChild('favoriteColor')
      .equalTo('green');

    const deserializedQuery = q.deserialize(db.mock.db);
    const manualQuery = db
      .ref('/authenticated/people')
      .orderByChild('favoriteColor')
      .equalTo('green');

    const manualJSON = hashToArray((await manualQuery.once('value')).val());
    const deserializedJSON = hashToArray(
      (await deserializedQuery.once('value')).val()
    );

    expect(manualJSON.length).toEqual(deserializedJSON.length);
    expect(deserializedJSON.length).toBeGreaterThan(0);
    deserializedJSON.forEach((i) => expect(i.favoriteColor).toEqual('green'));
  });

  it('limit query reduces result set', async () => {
    const q = new SerializedRealTimeQuery('/authenticated/people')
      .orderByChild('age')
      .limitToFirst(2);

    const a = await q.execute(db.mock.db);

    const deserializedJson: Person[] = hashToArray(a.val());
    const sortedPeople = hashToArray<Person>(
      db.mock.store.state.authenticated.people
    ).sort((a, b) => (a.age > b.age ? 1 : -1));
    expect(deserializedJson.length).toEqual(2);
    expect(deserializedJson[0].age).toEqual(sortedPeople[0].age);
  });

  it('Firemodel List.where() reduces the result set to appropriate records', async () => {
    const peeps = await List.where(Person, 'favoriteColor', 'green');
    const people = hashToArray<Person>(
      db.mock.store.state.authenticated.people
    ).filter((p) => p.favoriteColor === 'green');
    expect(peeps.length).toEqual(people.length);
  });

  it.skip('Firemodel List.where() reduces the result set to appropriate records (with a dynamic path)', async () => {
    const mockDb = await RealTimeAdmin.connect({ mocking: true });

    const greenGroup = await Mock(DeepPerson).generate(5, {
      favoriteColor: 'green',
      group: 'group1',
    });
    const blueGroup = await Mock(DeepPerson).generate(5, {
      favoriteColor: 'blue',
      group: 'group1',
    });
    console.log(greenGroup);
    mockDb.mock.store.updateDb('/', { ...greenGroup, ...blueGroup });

    const peeps = await List.where(Person, 'favoriteColor', 'green');
    const people = hashToArray<Person>(
      peopleDataset().authenticated.people as IDictionary
    ).filter((p) => p.favoriteColor === 'green');
    expect(peeps.length).toEqual(people.length);
  });
});
