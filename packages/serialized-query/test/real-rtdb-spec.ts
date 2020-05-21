import { expect } from 'chai';
import { List, Mock } from 'firemodel';
import { RealTimeAdmin, IRealTimeAdmin } from 'universal-fire';
import { Person } from './testing/Person';
import * as helpers from './testing/helpers';
import { SerializedRealTimeQuery } from '../src/index';
import { hashToArray } from 'typed-conversions';
import { DeepPerson } from './testing/DeepPerson';
import { peopleDataset } from './data/people';

helpers.setupEnv();

describe('Tests using REAL RealTimeAdmin =>’', () => {
  let db: IRealTimeAdmin;
  before(async () => {
    db = await RealTimeAdmin();
    // @ts-ignore
    List.defaultDb = db;
    await db.set('/', peopleDataset());
  });
  after(async () => {
    await db.remove(`/authenticated/fancyPeople`, true);
    db.remove('/authenticated');
  });

  it('equalTo() deserializes into valid response', async () => {
    const q = new SerializedRealTimeQuery(List.dbPath(Person))
      .orderByChild('favoriteColor')
      .equalTo('green');

    const deserializedQuery = q.deserialize(db);
    const manualQuery = db
      .ref('/authenticated/people')
      .orderByChild('favoriteColor')
      .equalTo('green');

    const manualJSON = hashToArray((await manualQuery.once('value')).toJSON());
    const deserializedJSON = hashToArray(
      (await deserializedQuery.once('value')).toJSON()
    );

    expect(manualJSON.length).to.equal(deserializedJSON.length);
    expect(deserializedJSON.length).to.be.greaterThan(0);
    deserializedJSON.forEach((i) => expect(i.favoriteColor).to.equal('green'));
  });

  it('limit query reduces result set', async () => {
    const q = new SerializedRealTimeQuery(List.dbPath(Person))
      .orderByChild('age')
      .limitToFirst(2);

    const deserializedJson: Person[] = hashToArray(
      (await q.execute(db)).toJSON() as any
    );
    const sortedPeople = hashToArray<Person>(
      peopleDataset().authenticated.people
    ).sort((a, b) => (a.age > b.age ? 1 : -1));

    expect(deserializedJson.length).to.equal(2);
    expect(deserializedJson[0].age).to.equal(sortedPeople[0].age);
  });

  it('Firemodel List.where() reduces the result set to appropriate records', async () => {
    const peeps = await List.where(Person, 'favoriteColor', 'green');
    const people = hashToArray<Person>(
      peopleDataset().authenticated.people
    ).filter((p) => p.favoriteColor === 'green');
    expect(peeps.length).to.equal(people.length);
  });

  it.skip('Firemodel List.where() reduces the result set to appropriate records (with a dynamic path)', async () => {
    const mockDb = await RealTimeAdmin({ mocking: true });
    // TODO: remove the comment below when we update FireModel to use the new
    // version if `universal-fire`.
    // @ts-ignore
    await Mock(DeepPerson, mockDb).generate(5, {
      favoriteColor: 'green',
      group: 'group1',
    });
    // TODO: remove the comment below when we update FireModel to use the new
    // version if `universal-fire`.
    // @ts-ignore
    await Mock(DeepPerson, mockDb).generate(5, {
      favoriteColor: 'blue',
      group: 'group1',
    });
    const peeps = await List.where(Person, 'favoriteColor', 'green');
    const people = hashToArray<Person>(
      peopleDataset().authenticated.people
    ).filter((p) => p.favoriteColor === 'green');
    expect(peeps.length).to.equal(people.length);
  });
});
