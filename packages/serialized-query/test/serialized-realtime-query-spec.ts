import { DB } from 'universal-fire';
import { expect } from 'chai';
import { FireModel, List } from 'firemodel';
import { hashToArray } from 'typed-conversions';
import { RealTimeAdmin } from '@forest-fire/real-time-admin';

import { setupEnv } from './testing/helpers';
import { peopleDataset } from './data/people';
import { Person } from './testing/Person';
import { SerializedRealTimeQuery } from '../src/SerializedRealTimeQuery';

setupEnv();

describe('SerializedRealTimeQuery', () => {
  let mockDb: RealTimeAdmin;

  before(async () => {
    mockDb = await DB.connect(RealTimeAdmin, { mocking: true });
    // TODO: remove the comment below when we update FireModel to use the new
    // DB abstraction.
    // @ts-ignore
    FireModel.defaultDb = mockDb;
  });

  it('should be defined', () => {
    expect(SerializedRealTimeQuery).to.exist;
  });

  it('instantiates', () => {
    const q = new SerializedRealTimeQuery('foo');
    expect(q).to.be.an.instanceOf(SerializedRealTimeQuery);
  });

  it('instantiate with path()', () => {
    const q = SerializedRealTimeQuery.path('foo');
    expect(q).to.be.an.instanceOf(SerializedRealTimeQuery);
  });

  it('instantiate without path, path set later', () => {
    const q = new SerializedRealTimeQuery();
    expect(q.path).to.equal('/');
    q.setPath('/foobar');
    expect(q.path).to.equal('/foobar');
  });

  it('same query structure gives same hashCode', async () => {
    const foo = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    const bar = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    expect(foo.hashCode()).to.equal(bar.hashCode());
    const foo2 = new SerializedRealTimeQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedRealTimeQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    expect(foo2.hashCode()).to.equal(bar2.hashCode());
  });

  it('different query structure gives different hashCode', async () => {
    const foo2 = new SerializedRealTimeQuery('/foo/bar')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    expect(foo2.hashCode()).to.not.equal(bar2.hashCode());
  });

  it('identity property provides appropriate details', () => {
    const foo = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    expect(foo.identity).to.be.an('object');
    expect(foo.identity.orderBy).to.equal('orderByChild');
    expect(foo.identity.orderByKey).to.equal('goober');
    expect(foo.identity.limitToFirst).to.equal(undefined);
    expect(foo.identity.startAt).to.equal(undefined);
  });

  it('equalTo() works when done manually', async () => {
    mockDb.mock.updateDB(peopleDataset());
    expect(List.dbPath(Person)).to.equal('authenticated/people');
    const sq = new SerializedRealTimeQuery(List.dbPath(Person)).orderByChild(
      'age'
    );
  });

  it('equalTo() query filters down to right results for static pathed model', async () => {
    mockDb.mock.updateDB(peopleDataset());
    const foo = new SerializedRealTimeQuery<Person>()
      .orderByChild('age')
      .equalTo('green', 'favoriteColor');
    foo.setPath(List.dbPath(Person));
  });
});

describe('SerializedRealTimeQuery with REAL database', () => {
  let db: RealTimeAdmin;

  before(async () => {
    // TODO: remove the comment below when we update DB to allow no config
    // to be passed.
    // @ts-ignore
    db = await DB.connect(RealTimeAdmin);
    // TODO: remove the comment below when we update FireModel to use the new
    // DB abstraction.
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

    const query = await q.execute(db);
    const deserializedJson: Person[] = hashToArray(query.toJSON() as any);
    const sortedPeople = hashToArray<Person>(
      peopleDataset().authenticated.people
    ).sort((a, b) => (a.age > b.age ? 1 : -1));

    expect(deserializedJson.length).to.equal(2);
    expect(deserializedJson[0].age).to.equal(sortedPeople[0].age);
  });
});
