import * as convert from 'typed-conversions';
import * as helpers from './testing/helpers';

import {
  Delays,
  firstKey,
  firstProp,
  lastKey,
  lastProp,
} from '../src/util/other';
import { Mock, SchemaHelper } from '../src/mocking';

import { IDictionary } from 'common-types';
import { SchemaCallback } from '../src';
import { difference } from 'lodash';
import { reset } from '../src/rtdb';

describe('Reference functions', () => {
  const mocker: SchemaCallback = (h) => () => ({
    name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
    gender: h.faker.helpers.randomize(['male', 'female']),
    age: h.faker.random.number({ min: 1, max: 10 }),
  });
  interface IMocker {
    name: string;
    gender: string;
    age: number;
  }

  describe('Basic DB Querying: ', () => {
    beforeEach(() => {
      reset();
    });

    it.skip('with default 5ms delay, querying returns an asynchronous result', async () => {
      const m = await Mock.prepare();
      m.addSchema<IMocker>('foo', mocker);
      m.queueSchema('foo', 5).generate();
      return m
        .ref('/foos')
        .once('value')
        .then((results) => {
          expect(results.numChildren()).toBe(5);
          expect(helpers.firstRecord(results.val()).name).toBeInstanceOf(
            'string'
          );
          expect(helpers.firstRecord(results.val()).age).toBeInstanceOf(
            'number'
          );
        });
    });

    it.skip('with numeric delay, querying returns an asynchronous result', async () => {
      const m = await Mock.prepare();
      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay(100);
      const results = await m.ref('/foos').once('value');
      expect(results.numChildren()).toBe(5);
      expect(helpers.firstRecord(results.val()).name).toBeString();
      expect(helpers.firstRecord(results.val()).age).toBeNumber();
    });

    it.skip('with named delay, querying returns an asynchronous result', async () => {
      const m = await Mock.prepare();

      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5);
      m.queueSchema('bar', 5);
      m.generate();

      m.setDelay(Delays.mobile);
      return m
        .ref('/foos')
        .once('value')
        .then((results) => {
          expect(results.numChildren()).toBe(5);
          expect(helpers.firstRecord(results.val()).name).toBeInstanceOf(
            'string'
          );
          expect(helpers.firstRecord(results.val()).age).toBeInstanceOf(
            'number'
          );
        });
    });

    it.skip('with delay range, querying returns an asynchronous result', async () => {
      const m = await Mock.prepare();
      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay([50, 80]);
      return m
        .ref('/foos')
        .once('value')
        .then((results: any) => {
          expect(results.numChildren()).toBe(5);
          expect(helpers.firstRecord(results.val()).name).toBeInstanceOf(
            'string'
          );
          expect(helpers.firstRecord(results.val()).age).toBeInstanceOf(
            'number'
          );
        });
    });

    // TODO: Fix up the forEach mocking
    // it.skip("querying results can be iterated over with forEach()", () => {
    //   const m = await Mock.prepare();
    //   m.addSchema("user").mock(h => () => ({
    //     name: h.faker.name.firstName() + " " + h.faker.name.lastName(),
    //     gender: h.faker.helpers.randomize(["male", "female"])
    //   }));
    //   m.deploy.queueSchema("user", 5).generate();
    //   m.setDelay([50, 80]);
    //   return m
    //     .ref("/users")
    //     .once("value")
    //     .then(snap => {
    //       snap.forEach(r => {
    //         expect(r.val()).to.be.an("object");
    //         expect(r.val().name).to.be.a("string");
    //       });
    //     });
    // });
  });

  describe('Filtered querying', () => {
    beforeEach(() => {
      reset();
    });

    /**
     * Note: limitToFirst is cullening the key's which are biggest/newest which is
     * the end of the list (wrt to natural sort order).
     */
    it('query list with limitToFirst() set', async () => {
      const m = await Mock.prepare();
      m.addSchema('monkey').mock(mocker);
      m.queueSchema('monkey', 15).generate();
      const snap = await m.ref('/monkeys').limitToFirst(10).once('value');

      const filteredMonkeys = snap.val();
      const allMonkeys = await m.ref('/monkeys').once('value');
      const sortedMonkeys = convert.hashToArray(allMonkeys.val());
      expect(snap.numChildren()).toBe(10);
      expect(Object.keys(m.db.monkeys).length).toBe(15);
      expect(
        Object.keys(m.db.monkeys).indexOf(firstKey(filteredMonkeys))
      ).not.toBe(-1);
      expect(
        Object.keys(m.db.monkeys).indexOf(lastKey(filteredMonkeys))
      ).not.toBe(-1);
      expect(Object.keys(filteredMonkeys)).toEqual(
        expect.arrayContaining([lastKey(m.db.monkeys)])
      );
      expect(Object.keys(filteredMonkeys).indexOf(firstKey(m.db.monkeys))).toBe(
        -1
      );
      expect(Object.keys(filteredMonkeys).indexOf(lastKey(sortedMonkeys))).toBe(
        -1
      );
    });

    it('limitToFirst() an equalTo() query', async () => {
      const m = await Mock.prepare();
      m.addSchema('monkey').mock(mocker);
      m.queueSchema('monkey', 15);
      m.queueSchema('monkey', 3, { name: 'Space Monkey' });
      m.generate();
      let snap = await m
        .ref('/monkeys')
        .orderByChild('name')
        .limitToFirst(1)
        .equalTo('Space Monkey', 'name')
        .once('value');

      expect(snap.numChildren()).toBe(1);
      expect(helpers.firstRecord(snap.val()).name).toBe('Space Monkey');

      snap = await m
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
      const m = await Mock.prepare();
      m.addSchema('monkey').mock(mocker);
      m.deploy.queueSchema('monkey', 15).generate();
      return m
        .ref('/monkeys')
        .limitToLast(10)
        .once('value')
        .then((snap) => {
          const listOf = snap.val();
          expect(snap.numChildren()).toBe(10);
          expect(Object.keys(m.db.monkeys).length).toBe(15);
          expect(Object.keys(m.db.monkeys).indexOf(lastKey(listOf))).not.toBe(
            -1
          );
          expect(Object.keys(m.db.monkeys).indexOf(firstKey(listOf))).not.toBe(
            -1
          );
          expect(Object.keys(listOf).indexOf(lastKey(m.db.monkeys))).toBe(-1);
        });
    });

    it('equalTo() and orderByChild() work', async () => {
      const m = await Mock.prepare();
      // await m.getMockHelper(); // imports faker lib
      const young = (h: SchemaHelper) => () => ({
        first: h.faker.name.firstName(),
        age: 12,
      });
      const old = (h: SchemaHelper) => () => ({
        first: h.faker.name.firstName(),
        age: 75,
      });

      m.addSchema('oldPerson', old).modelName('person');
      m.addSchema('youngPerson', young).modelName('person');
      m.deploy
        .queueSchema('oldPerson', 10)
        .queueSchema('youngPerson', 10)
        .generate();

      const snap = await m
        .ref('/people')
        .orderByChild('name')
        .equalTo(12, 'age')
        .once('value');

      expect(Object.keys(m.db.people).length).toBe(20);
      expect(snap.numChildren()).toBe(10);
    });

    it('startAt() filters a numeric property', async () => {
      const m = await Mock.prepare();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        age: 3,
        desc: h.faker.random.words(),
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { age: 5 });
      m.queueSchema('dog', 10, { age: 10 });
      m.generate();

      const results = await m.ref('/dogs').once('value');
      const gettingMature = await m
        .ref('/dogs')
        .orderByValue()
        .startAt(5, 'age')
        .once('value');

      const mature = await m
        .ref('/dogs')
        .orderByValue()
        .startAt(9, 'age')
        .once('value');

      expect(results.numChildren()).toBe(30);
      expect(gettingMature.numChildren()).toBe(20);
      expect(mature.numChildren()).toBe(10);
    });

    it('startAt() filters a string property', async () => {
      const m = await Mock.prepare();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        born: '2014-09-08T08:02:17-05:00',
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { born: '2014-11-08T08:02:17-05:00' });
      m.queueSchema('dog', 10, { born: '2016-12-08T08:02:17-05:00' });
      m.generate();

      const all = await m.ref('/dogs').once('value');

      const nov14 = await m
        .ref('/dogs')
        .orderByChild('born')
        .startAt('2014-11-01T01:00:00-05:00', 'born')
        .once('value');

      const pupsOnly = await m
        .ref('/dogs')
        .orderByValue()
        .startAt('2016-12-01T08:02:17-05:00', 'born')
        .once('value');

      expect(all.numChildren()).toBe(30);
      expect(nov14.numChildren()).toBe(20);
      expect(pupsOnly.numChildren()).toBe(10);
    });

    it.skip('startAt() filters sort by value when using value sort', async () =>
      undefined);
    it.skip('endAt() filters result by key by default', async () => undefined);
    it('endAt() filters a numeric property', async () => {
      const m = await Mock.prepare();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        age: 1,
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { age: 5 });
      m.queueSchema('dog', 10, { age: 10 });
      m.generate();

      const results = await m.ref('/dogs').once('value');
      const pups = await m
        .ref('/dogs')
        .orderByValue()
        .endAt(2, 'age')
        .once('value');

      expect(results.numChildren()).toBe(30);
      expect(pups.numChildren()).toBe(10);
    });
    it.skip('endAt() filters sort by value when using value sort', async () =>
      undefined);
    it('startAt() combined with endAt() filters correctly', async () => {
      const m = await Mock.prepare();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        age: 1,
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { age: 5 });
      m.queueSchema('dog', 10, { age: 10 });
      m.generate();

      const results = await m.ref('/dogs').once('value');
      const middling = await m
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

    it.skip('startAt(), endAt(), orderByValue() filters correctly', async () =>
      undefined);
  }); // End Filtered Querying

  describe('Sort Order', () => {
    beforeEach(() => {
      reset();
    });

    const personMock = (h: SchemaHelper) => () => ({
      name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
      age: h.faker.random.number({ min: 1, max: 80 }),
      inUSA: h.faker.random.boolean(),
    });

    const numbers = [123, 456, 7878, 9999, 10491, 15000, 18345, 20000];
    const strings = ['abc', 'def', 'fgh', '123', '999', 'ABC', 'DEF'];

    it('orderByChild() -- where child is a string -- sorts correctly', async () => {
      const m = await Mock.prepare();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      const results = await m.ref('/people').orderByChild('name').once('value');

      const orderedPeople = convert.hashToArray(results.val());
      for (let i = 1; i <= 8; i++) {
        expect(orderedPeople[i].name >= orderedPeople[i + 1].name).toBe(true);
      }

      const orderedKeys = orderedPeople.map((p) => p.id);
      const unorderedKeys = Object.keys(m.db.people);

      expect(orderedKeys.join('.')).not.toBe(unorderedKeys.join('.'));
      expect(difference(orderedKeys, unorderedKeys).length).toBe(0);
    });

    it('orderByChild() -- where child is a boolean -- sorts correctly', async () => {
      const m = await Mock.prepare();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      const results = await m
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
      const unorderedKeys = Object.keys(m.db.people);

      expect(JSON.stringify(orderedKeys)).not.toBe(
        JSON.stringify(unorderedKeys)
      );
      expect(difference(orderedKeys, unorderedKeys).length).toBe(0);
    });

    it('orderByKey() sorts correctly', async () => {
      const m = await Mock.prepare();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      const people = await m.ref('/people').orderByKey().once('value');
      const defaultPeople = await m.ref('/people').once('value');
      expect(JSON.stringify(people)).toBe(JSON.stringify(defaultPeople));
      const orderedPeople = convert.hashToArray(people.val());

      const orderedKeys = orderedPeople.map((p) => p.id);
      const unorderedKeys = Object.keys(m.db.people);

      expect(JSON.stringify(orderedKeys)).not.toBe(
        JSON.stringify(unorderedKeys)
      );
      expect(difference(orderedKeys, unorderedKeys).length).toBe(0);
    });

    it('orderByValue() sorts on server correctly', async () => {
      const m = await Mock.prepare();
      m.addSchema('number', (h) => () =>
        h.faker.random.number({ min: 0, max: 10 })
      );
      m.addSchema('number2', (h) => () =>
        h.faker.random.number({ min: 20, max: 30 })
      ).modelName('number');
      m.queueSchema('number', 10);
      m.queueSchema('number2', 10);
      m.generate();

      const snap = await m
        .ref('/numbers')
        .orderByValue()
        .limitToLast(5)
        .once('value');

      const naturalSort = Object.keys(m.db.numbers);
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
      const m = await Mock.prepare();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.queueSchema('person', 10, { age: 99 });
      m.generate();
      const results = await m
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
      const m = await Mock.prepare();
      // m.getMockHelper();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.queueSchema('person', 10, { age: 1 });
      m.generate();

      const results = await m
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
  });

  describe('CRUD actions', () => {
    beforeEach(() => {
      reset();
    });

    it('push() can push record', async () => {
      const m = await Mock.prepare();
      await m.ref('/people').push({
        name: 'Happy Jack',
        age: 26,
      });
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).toBe(1);
      expect(helpers.firstRecord(people).name).toBe('Happy Jack');
    });

    it('push() can push scalar', async () => {
      const m = await Mock.prepare();
      await m.ref('/data').push(444);
      const data = (await m.ref('/data').once('value')).val();
      expect(helpers.firstRecord(data)).toBe(444);
    });

    it('push() will call callback after pushing to DB', async () => {
      const m = await Mock.prepare();
      let count = 0;
      const callback = () => count++;
      await m.ref('/data').push(444, callback);
      const data = (await m.ref('/data').once('value')).val();
      expect(helpers.firstRecord(data)).toBe(444);
      expect(count).toBe(1);
    });

    it('set() will set referenced path', async () => {
      const m = await Mock.prepare();
      await m.ref('/people/abcd').set({
        name: 'Happy Jack',
        age: 26,
      });
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).toBe(1);
      expect(helpers.firstKey(people)).toBe('abcd');
      expect(helpers.firstRecord(people).name).toBe('Happy Jack');
    });

    it('set() will call callback after setting referenced path ', async () => {
      const m = await Mock.prepare();
      let count = 0;
      const callback = () => count++;
      await m.ref('/people/abcd').set(
        {
          name: 'Happy Jack',
          age: 26,
        },
        callback
      );
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.firstRecord(people).name).toBe('Happy Jack');
      expect(count).toBe(1);
    });

    it('update() will update referenced path', async () => {
      const m = await Mock.prepare({
        db: {
          people: {
            abcd: {
              name: 'Happy Jack',
              age: 35,
            },
          },
        },
      });
      await m.ref('/people/abcd').update({
        age: 26,
      });
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).toBe(1);
      expect(helpers.firstKey(people)).toBe('abcd');
      expect(helpers.firstRecord(people).name).toBe('Happy Jack');
      expect(helpers.firstRecord(people).age).toBe(26);
    });

    it('multi-path updates are reconized and set correctly', async () => {
      const now = new Date().toISOString();
      const m = await Mock.prepare({
        db: {
          people: {
            abcd: {
              name: 'Happy Jack',
              age: 35,
            },
          },
        },
      });
      const updated: IDictionary = {};
      updated['/people/abcd/age'] = 40;
      updated['/people/abcd/lastUpdated'] = now;
      await m.ref('/').update(updated);
      const person = (await m.ref('/people/abcd').once('value')).val();

      expect(person.age).toBe(40);
      expect(person.lastUpdated).toBe(now);
      expect(person.name).toBe('Happy Jack');
    });

    it("multi-path 'updates' behaves non-destructively like 'set' operations", async () => {
      const now = new Date().toISOString();
      const m = await Mock.prepare({
        db: {
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
        },
      });
      const updated: IDictionary = {};
      updated['/people/abcd/foo'] = { bar: 5 };
      updated['/people/abcd/lastUpdated'] = now;
      await m.ref('/').update(updated);
      const person = (await m.ref('/people/abcd').once('value')).val();

      expect(person.age).toBe(35);
      expect(person.lastUpdated).toBe(now);
      expect(person.foo.bar).toBe(5);
      expect(person.foo.baz).toBeUndefined();
    });

    it('remove() will remove data at referenced path', async () => {
      const m = await Mock.prepare({
        db: {
          people: {
            abcd: {
              name: 'Happy Jack',
              age: 35,
            },
          },
        },
      });
      await m.ref('/people/abcd').remove();
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).toBe(0);
    });
  });
});
