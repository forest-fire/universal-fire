/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
import { Fixture, SchemaHelper, SchemaCallback } from '@forest-fire/fixture';
import * as convert from 'typed-conversions';
import * as helpers from './testing/helpers';
import { firstProp, lastProp } from '~/util/other';
import { IDictionary } from 'common-types';
import { difference } from 'lodash';
import { firstKey } from 'native-dash';
import { createDatabase } from '~/databases/createDatabase';
import { NetworkDelay, SDK } from '~/auth/admin-sdk';

const animalMock: SchemaCallback<any> = (h) => ({
  name: h.faker.name.firstName(),
  age: h.faker.helpers.randomize([1, 2, 4]),
  home: h.faker.address.streetAddress(),
});

describe('Reference functions', () => {
  const mocker: SchemaCallback<IMocker> = (h) => ({
    name: `${h.faker.name.firstName()} ${h.faker.name.lastName()}`,
    gender: h.faker.helpers.randomize(['male', 'female']),
    age: h.faker.datatype.number({ min: 1, max: 10 }),
  });

  interface IMocker {
    name: string;
    gender: string;
    age: number;
  }

  const mock = createDatabase('RealTimeClient');

  describe('Basic DB Querying: ', () => {
    beforeEach(() => {
      mock.store.clearDb();
    });

    it('with default 5ms delay, querying returns an asynchronous result', async () => {
      const m = new Fixture();
      m.addSchema('foo', mocker);
      const fixture = m.queueSchema('foo', 5).generate();
      mock.store.setDb('/', fixture);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await mock.db
        .ref('/fooes')
        .once('value')
        .then((results) => {
          expect(results.numChildren()).toBe(5);
          expect(typeof helpers.firstRecord(results.val()).name).toEqual(
            'string'
          );
          expect(typeof helpers.firstRecord(results.val()).age).toEqual(
            'number'
          );
          return results;
        });
    });

    it('with numeric delay, querying returns an asynchronous result', async () => {
      const m = Fixture.prepare();
      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      const fixture = m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      mock.store.setDb('/', fixture);
      const results = await mock.db.ref('/fooes').once('value');
      expect(results.numChildren()).toBe(5);
      expect(typeof helpers.firstRecord(results.val()).name).toEqual('string');
      expect(typeof helpers.firstRecord(results.val()).age).toEqual('number');
    });

    it.skip('with named delay, querying returns an asynchronous result', () => {
      const m = Fixture.prepare();

      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5);
      m.queueSchema('bar', 5);
      const fixture = m.generate();
      mock.store.setDb('/', fixture);

      mock.store.setNetworkDelay(NetworkDelay.mobile3g);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mock.db
        .ref('/foos')
        .once('value')
        .then((results) => {
          expect(results.numChildren()).toBe(5);
          expect(typeof helpers.firstRecord(results.val()).name).toEqual(
            'string'
          );
          expect(typeof helpers.firstRecord(results.val()).age).toEqual(
            'number'
          );
          return results;
        });
    });

    it.skip('with delay range, querying returns an asynchronous result', () => {
      const m = new Fixture();
      m.addSchema('foo', mocker).addSchema('bar', mocker);
      const fixture = m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      mock.store.setDb('/', fixture);

      mock.store.setNetworkDelay([50, 80]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mock.db
        .ref('/foos')
        .once('value')
        .then((results) => {
          expect(results.numChildren()).toBe(5);
          expect(typeof helpers.firstRecord(results.val()).name).toEqual(
            'string'
          );
          expect(typeof helpers.firstRecord(results.val()).age).toEqual(
            'number'
          );
          return results;
        });
    });
  });

  describe('Filtered querying', () => {
    beforeEach(() => {
      // reset();
    });

    /**
     * Note: limitToFirst is cullening the key's which are biggest/newest which is
     * the end of the list (wrt to natural sort order).
     */
    it('query list with limitToFirst() set', async () => {
      const f = Fixture.prepare();
      f.addSchema('monkey').mock(mocker);
      const fixture = f.queueSchema('monkey', 15).generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

      const snap = await m.db.ref('/monkeys').limitToFirst(10).once('value');
      const filteredMonkeys = snap.val();

      expect(snap.numChildren()).toBe(10);
      expect(Object.keys((m.store.getDb() as any).monkeys).length).toBe(15);
      expect(helpers.lastKey(m.store.state.monkeys)).toBe(
        helpers.firstKey(filteredMonkeys)
      );
    });

    it('limitToFirst() an equalTo() query', async () => {
      const f = Fixture.prepare();
      f.addSchema('monkey').mock(mocker);
      f.queueSchema('monkey', 15);
      f.queueSchema('monkey', 3, { name: 'Space Monkey' });
      const fixture = f.generate();
      const m = createDatabase(SDK.RealTimeClient, {}, fixture);

      let snap = await m.db
        .ref('/monkeys')
        .orderByChild('name')
        .limitToFirst(1)
        .equalTo('Space Monkey', 'name')
        .once('value');

      expect(snap.numChildren()).toBe(1);
      expect(helpers.firstRecord(snap.val()).name).toBe('Space Monkey');

      snap = await m.db
        .ref('/monkeys')
        .orderByChild('name')
        .limitToFirst(4)
        .equalTo('Space Monkey', 'name')
        .once('value');
      expect(snap.numChildren()).toBe(3);
      expect(helpers.firstRecord(snap.val()).name).toBe('Space Monkey');
    });

    /**
     * Note: limitToLast is cullening the key's which are smallest/oldest which is
     * the start of the list.
     */
    it('query list with limitToLast() set', async () => {
      const f = Fixture.prepare();
      f.addSchema('monkey').mock(mocker);
      f.queueSchema('monkey', 15);
      const fixture = f.generate();
      const m = createDatabase(SDK.RealTimeClient, {}, fixture);
      const snap = await m.db.ref('/monkeys').limitToLast(10).once('value');

      const listOf: Record<string, unknown> = snap.val();
      console.log({ fixture });
      expect(snap.numChildren()).toBe(10);
      expect(Object.keys(m.store.state.monkeys)).toHaveLength(15);
      expect(helpers.firstKey(m.store.state.monkeys)).toBe(
        helpers.lastKey(listOf)
      );
    });
  });

  it('equalTo() and orderByChild() work', async () => {
    const f = Fixture.prepare();
    // await m.getMockHelper(); // imports faker lib
    const young = (h: SchemaHelper) => ({
      first: h.faker.name.firstName(),
      age: 12,
    });
    const old = (h: SchemaHelper) => ({
      first: h.faker.name.firstName(),
      age: 75,
    });

    f.addSchema('oldPerson', old).modelName('person');
    f.addSchema('youngPerson', young).modelName('person');
    const fixture = f.deploy
      .queueSchema('oldPerson', 10)
      .queueSchema('youngPerson', 10)
      .generate();

    const m = createDatabase(SDK.RealTimeClient, {}, fixture);

    const snap = await m.db
      .ref('/people')
      .orderByChild('name')
      .equalTo(12, 'age')
      .once('value');
    expect(Object.keys((m.store.getDb('/') as any).people).length).toBe(20);
    expect(snap.numChildren()).toBe(10);
  });

  it('startAt() filters a numeric property', async () => {
    const f = await Fixture.prepare();
    f.addSchema('dog', (h) => ({
      name: h.faker.name.firstName,
      age: 3,
      desc: h.faker.random.words(),
    }));
    f.queueSchema('dog', 10);
    f.queueSchema('dog', 10, { age: 5 });
    f.queueSchema('dog', 10, { age: 10 });
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    // const results = await m.db.ref('/dogs').once('value');
    const gettingMature = await m.db
      .ref('/dogs')
      .orderByValue()
      .startAt(5, 'age')
      .once('value');

    console.log(gettingMature.val());

    // const mature = await m.db
    //   .ref('/dogs')
    //   .orderByValue()
    //   .startAt(9, 'age')
    //   .once('value');

    // expect(results.numChildren()).toBe(30);
    // expect(gettingMature.numChildren()).toBe(20);
    // expect(mature.numChildren()).toBe(10);
  });

  it('startAt() filters a string property', async () => {
    const f = Fixture.prepare();
    f.addSchema('dog', (h) => ({
      name: h.faker.name.firstName,
      born: '2014-09-08T08:02:17-05:00',
    }));
    f.queueSchema('dog', 10);
    f.queueSchema('dog', 10, { born: '2014-11-08T08:02:17-05:00' });
    f.queueSchema('dog', 10, { born: '2016-12-08T08:02:17-05:00' });
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const all = await m.db.ref('/dogs').once('value');

    const nov14 = await m.db
      .ref('/dogs')
      .orderByChild('born')
      .startAt('2014-11-01T01:00:00-05:00', 'born')
      .once('value');

    const pupsOnly = await m.db
      .ref('/dogs')
      .orderByValue()
      .startAt('2016-12-01T08:02:17-05:00', 'born')
      .once('value');

    expect(all.numChildren()).toBe(30);
    expect(nov14.numChildren()).toBe(20);
    expect(pupsOnly.numChildren()).toBe(10);
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
    console.log(animals);
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

  it.skip('startAt() filters sort by value when using value sort', () =>
    undefined);
  it.skip('endAt() filters result by key by default', () => undefined);
  it('endAt() filters a numeric property', async () => {
    const f = Fixture.prepare();
    f.addSchema('dog', (h) => ({
      name: h.faker.name.firstName,
      age: 1,
    }));
    f.queueSchema('dog', 10);
    f.queueSchema('dog', 10, { age: 5 });
    f.queueSchema('dog', 10, { age: 10 });
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const results = await m.db.ref('/dogs').once('value');
    const pups = await m.db
      .ref('/dogs')
      .orderByValue()
      .endAt(2, 'age')
      .once('value');

    expect(results.numChildren()).toBe(30);
    expect(pups.numChildren()).toBe(10);
  });
  it.skip('endAt() filters sort by value when using value sort', () =>
    undefined);
  it('startAt() combined with endAt() filters correctly', async () => {
    const f = Fixture.prepare();
    f.addSchema('dog', (h) => ({
      name: h.faker.name.firstName,
      age: 1,
    }));
    f.queueSchema('dog', 10);
    f.queueSchema('dog', 10, { age: 5 });
    f.queueSchema('dog', 10, { age: 10 });
    const fixture = f.generate();

    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const results = await m.db.ref('/dogs').once('value');
    const middling = await m.db
      .ref('/dogs')
      .orderByChild('age')
      .startAt(3, 'age')
      .endAt(9, 'age')
      .once('value');

    expect(results.numChildren()).toBe(30);
    expect(middling.numChildren()).toBe(10);
    expect(firstProp(middling.val()).age).toBe(5);
    expect(lastProp(middling.val()).age).toBe(5);
  });

  it.skip('startAt(), endAt(), orderByValue() filters correctly', () =>
    undefined);
}); // End Filtered Querying

describe('Sort Order', () => {
  const personMock = (h: SchemaHelper) => ({
    name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
    age: h.faker.datatype.number({ min: 1, max: 80 }),
    inUSA: h.faker.datatype.boolean(),
  });

  // const numbers = [123, 456, 7878, 9999, 10491, 15000, 18345, 20000];
  // const strings = ['abc', 'def', 'fgh', '123', '999', 'ABC', 'DEF'];

  it('orderByChild() -- where child is a string -- sorts correctly', async () => {
    const f = Fixture.prepare();
    f.addSchema('person', personMock);
    f.queueSchema('person', 10);
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const results = await m.db
      .ref('/people')
      .orderByChild('name')
      .once('value');

    const orderedPeople = convert.hashToArray(results.val());
    for (let i = 1; i <= 8; i++) {
      expect(orderedPeople[i].name >= orderedPeople[i + 1].name).toBe(true);
    }

    const orderedKeys = orderedPeople.map((p) => p.id);
    const unorderedKeys = Object.keys((m.store.getDb() as any).people);

    expect(orderedKeys.join('.')).not.toBe(unorderedKeys.join('.'));
    expect(difference(orderedKeys, unorderedKeys).length).toBe(0);
  });

  it('orderByChild() -- where child is a boolean -- sorts correctly', async () => {
    const f = await Fixture.prepare();
    f.addSchema('person', personMock);
    f.queueSchema('person', 10);
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const results = await m.db
      .ref('/people')
      .orderByChild('inUSA')
      .once('value');

    const orderedPeople = convert.hashToArray(results.val());

    for (let i = 1; i <= 8; i++) {
      const current = orderedPeople[i].inUSA ? 1 : 0;
      const next = orderedPeople[i + 1].inUSA ? 1 : 0;
      expect(current >= next).toBe(true);
    }

    const orderedKeys = orderedPeople.map((p) => p.id);
    const unorderedKeys = Object.keys((m.store.getDb() as any).people);

    expect(JSON.stringify(orderedKeys)).not.toBe(JSON.stringify(unorderedKeys));
    expect(difference(orderedKeys, unorderedKeys).length).toBe(0);
  });

  it('orderByKey() sorts correctly', async () => {
    const f = await Fixture.prepare();
    f.addSchema('person', personMock);
    f.queueSchema('person', 10);
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const people = await m.db.ref('/people').orderByKey().once('value');
    const defaultPeople = await m.db.ref('/people').once('value');
    expect(JSON.stringify(people)).toBe(JSON.stringify(defaultPeople));
    const orderedPeople = convert.hashToArray(people.val());

    const orderedKeys = orderedPeople.map((p) => p.id);
    const unorderedKeys = Object.keys((m.store.getDb() as any).people);

    expect(JSON.stringify(orderedKeys)).not.toBe(JSON.stringify(unorderedKeys));
    expect(difference(orderedKeys, unorderedKeys).length).toBe(0);
  });

  it('orderByValue() sorts on server correctly', async () => {
    const f = Fixture.prepare();
    f.addSchema(
      'number',
      (h) => h.faker.datatype.number({ min: 0, max: 10 }) as any
    );
    f.addSchema(
      'number2',
      (h) => h.faker.datatype.number({ min: 20, max: 30 }) as any
    ).modelName('number');
    f.queueSchema('number', 10);
    f.queueSchema('number2', 10);
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const snap = await m.db
      .ref('/numbers')
      .orderByValue()
      .limitToLast(5)
      .once('value');

    const naturalSort = Object.keys((m.store.getDb() as any).numbers);
    const orderedKeys = Object.keys(snap.val());

    expect(orderedKeys.join('.')).not.toBe(naturalSort.slice(0, 5).join('.'));

    const items = convert.hashToArray(snap.val()).map((i) => i.value);

    expect(items).toHaveLength(5);

    items.forEach((item) => {
      expect(item).toBeGreaterThan(19);
      expect(item).toBeLessThan(31);
    });
  });

  it('orderByChild() combines with limitToFirst() for "server-side" selection', async () => {
    const f = await Fixture.prepare();
    f.addSchema('person', personMock);
    f.queueSchema('person', 10);
    f.queueSchema('person', 10, { age: 99 });
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const results = await m.db
      .ref('/people')
      .orderByChild('age')
      .limitToFirst(10)
      .once('value');
    const orderedPeople = convert.hashToArray(results.val());
    expect(orderedPeople).toHaveLength(10);
    orderedPeople.map((person) => {
      expect(person.age).toBe(99);
    });
  });
  it('orderByChild() combines with limitToLast() for "server-side" selection', async () => {
    const f = await Fixture.prepare();
    // m.getMockHelper();
    f.addSchema('person', personMock);
    f.queueSchema('person', 10);
    f.queueSchema('person', 10, { age: 1 });
    const fixture = f.generate();
    const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

    const results = await m.db
      .ref('/people')
      .orderByChild('age')
      .limitToLast(10)
      .once('value');

    const orderedPeople = convert.hashToArray(results.val());
    expect(orderedPeople).toHaveLength(10);
    orderedPeople.map((person) => {
      expect(person.age).toBe(1);
    });
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
});

describe('CRUD actions', () => {
  beforeEach(() => {
    // reset();
  });

  it('push() can push record', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    await m.db
      .ref('/people')
      .push({
        name: 'Happy Jack',
        age: 26,
      })
      .once('value');
    const people = (await m.db.ref('/people').once('value')).val();
    expect(helpers.length(people)).toBe(1);
    expect(helpers.firstRecord(people).name).toBe('Happy Jack');
  });

  it('push() can push scalar', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    await m.db.ref('/data').push(444).once('value');
    const data = (await m.db.ref('/data').once('value')).val();
    expect(helpers.firstRecord(data)).toBe(444);
  });

  it('push() will call callback after pushing to DB', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    let count = 0;
    const callback = () => count++;
    await m.db.ref('/data').push(444, callback).once('value');
    const data = (await m.db.ref('/data').once('value')).val();
    expect(helpers.firstRecord(data)).toBe(444);
    expect(count).toBe(1);
  });

  it('set() will set referenced path', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    await m.db.ref('/people/abcd').set({
      name: 'Happy Jack',
      age: 26,
    });
    const people = (await m.db.ref('/people').once('value')).val();
    expect(helpers.length(people)).toBe(1);
    expect(firstKey(people)).toBe('abcd');
    expect(helpers.firstRecord(people).name).toBe('Happy Jack');
  });

  it('set() will call callback after setting referenced path ', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    let count = 0;
    const callback = () => count++;
    await m.db.ref('/people/abcd').set(
      {
        name: 'Happy Jack',
        age: 26,
      },
      callback
    );
    const people = (await m.db.ref('/people').once('value')).val();
    expect(helpers.firstRecord(people).name).toBe('Happy Jack');
    expect(count).toBe(1);
  });

  it('update() will update referenced path', async () => {
    const m = createDatabase(
      SDK.RealTimeAdmin,
      {},
      {
        people: {
          abcd: {
            name: 'Happy Jack',
            age: 35,
          },
        },
      }
    );
    await m.db.ref('/people/abcd').update({
      age: 26,
    });
    const people = (await m.db.ref('/people').once('value')).val();
    expect(helpers.length(people)).toBe(1);
    expect(firstKey(people)).toBe('abcd');
    expect(helpers.firstRecord(people).name).toBe('Happy Jack');
    expect(helpers.firstRecord(people).age).toBe(26);
  });

  it('multi-path updates are reconized and set correctly', async () => {
    const now = new Date().toISOString();
    const m = createDatabase(
      SDK.RealTimeAdmin,
      {},
      {
        people: {
          abcd: {
            name: 'Happy Jack',
            age: 35,
          },
        },
      }
    );
    const updated: IDictionary = {};
    updated['/people/abcd/age'] = 40;
    updated['/people/abcd/lastUpdated'] = now;
    await m.db.ref('/').update(updated);
    const person = (await m.db.ref('/people/abcd').once('value')).val();

    expect(person.age).toBe(40);
    expect(person.lastUpdated).toBe(now);
    expect(person.name).toBe('Happy Jack');
  });

  it("multi-path 'updates' behaves non-destructively like 'set' operations", async () => {
    const now = new Date().toISOString();
    const m = createDatabase(
      SDK.RealTimeAdmin,
      {},
      {
        people: {
          abcd: {
            name: 'Happy Jack',
            age: 35,
            foo: {
              bar: 1,
              baz: 2,
            },
          },
        },
      }
    );
    const updated: IDictionary = {};
    updated['/people/abcd/foo'] = { bar: 5 };
    updated['/people/abcd/lastUpdated'] = now;
    await m.db.ref('/').update(updated);
    const person = (await m.db.ref('/people/abcd').once('value')).val();

    expect(person.age).toBe(35);
    expect(person.lastUpdated).toBe(now);
    expect(person.foo.bar).toBe(5);
    expect(person.foo.baz).toBe(undefined);
  });

  it('remove() will remove data at referenced path', async () => {
    const m = createDatabase(
      SDK.RealTimeAdmin,
      {},
      {
        db: {
          people: {
            abcd: {
              name: 'Happy Jack',
              age: 35,
            },
          },
        },
      }
    );
    await m.db.ref('/people/abcd').remove();
    const people = (await m.db.ref('/people').once('value')).val();
    expect(helpers.length(people)).toBe(0);
  });
});
