import * as helpers from './testing/helpers';

import {
  GenericEventHandler,
  HandleValueEvent,
  IFirebaseEventHandler,
} from '../src';

import { firstKey } from 'native-dash';
import { SchemaCallback, Fixture } from '@forest-fire/fixture';
import { wait } from 'common-types';
import { createDatabase } from '~/databases/createDatabase';
import { IDatabaseSdk, IMockStore, SDK } from '~/auth/admin-sdk';

interface IPerson {
  name: string;
  age: number;
}
const personMock: SchemaCallback<IPerson> = (h) => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.datatype.number({ min: 1, max: 70 }),
  foo: 'bar',
  baz: 'baz',
});

describe('Database', () => {
  let store: IMockStore<SDK>;
  beforeEach(() => {
    const mockingDatabase = createDatabase(
      { config: { mocking: true } } as IDatabaseSdk<SDK>,
      {}
    );
    store = mockingDatabase[1];
  });
  describe('Basics', () => {
    it('can clear database', () => {
      store.setDb('foo', 'bar');
      expect(Object.keys(store.getDb()).length).toBe(1);
      store.clearDb();
      expect(Object.keys(store.getDb()).length).toBe(0);
    });
  });

  describe('Listeners', () => {
    it('can add listeners', () => {
      const callback: GenericEventHandler = (snap) => null;
      store.addListener('/path/to/node', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(1);
      store.addListener('/path/to/node', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(2);
    });

    it('can remove all listeners', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      store.removeAllListeners();
      store.addListener('/path/to/node', 'value', callback);
      store.addListener('/path/to/node', 'value', callback);
      store.addListener('/path/to/node', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(3);
      store.removeAllListeners();
      expect(store.getAllListeners()).toHaveLength(0);
      store.addListener('/path/to/node', 'value', callback);
      store.addListener('/path/to/node', 'value', callback);
      store.addListener('/path/to/node', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(3);
      store.removeAllListeners();
    });

    it('can remove all listeners of given eventType', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      store.removeAllListeners();
      store.addListener('/path/to/value1', 'value', callback);
      store.addListener('/path/to/added', 'child_added', callback);
      store.addListener('/path/to/value2', 'value', callback);
      store.addListener('/path/to/moved', 'child_moved', callback);
      store.removeListener('child_added');
      expect(store.getAllListeners()).toHaveLength(3);
      store
        .getAllListeners()
        .forEach((p) =>
          expect(p).toEqual(expect.not.arrayContaining(['added']))
        );
      store.removeListener('value');
      expect(store.getAllListeners()).toHaveLength(1);

      store
        .getAllListeners()
        .forEach((p) => expect(p.eventType.includes('moved')).toBeTrue());
    });

    it('can remove listeners of same eventType, callback', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      const callback2: GenericEventHandler = (snap) => undefined;
      store.removeAllListeners();
      store.addListener('/path/to/value1', 'value', callback);
      store.addListener('/path/to/value2', 'value', callback);
      store.addListener('/path/to/added', 'child_added', callback);
      store.addListener('/path/to/value3', 'value', callback2);
      store.addListener('/path/to/moved', 'child_moved', callback);
      store.removeListener('value');
      expect(store.getAllListeners()).toHaveLength(3);
      expect(store.getAllListeners().filter(l => l.eventType ==='value')).toBe(1);
      store.getAllListeners().filter(l => l.eventType ==='value').forEach((l) => {
        expect(l).toContain('value3');
      });
    });

    it('can remove listeners of same eventType, callback, and context', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      const callback2: GenericEventHandler = (snap) => undefined;
      const context = { foo: 'bar' };
      const context2 = { foo: 'baz' };
      store.removeAllListeners();
      store.addListener('/path/to/value1', 'value', callback, null, context);
      store.addListener('/path/to/value2', 'value', callback2, null, context);
      store.addListener(
        '/path/to/added',
        'child_added',
        callback,
        null,
        context
      );
      store.addListener('/path/to/value3', 'value', callback2, null, context2);
      store.addListener(
        '/path/to/moved',
        'child_moved',
        callback,
        null,
        context
      );
      expect(store.getAllListeners()).toHaveLength(5);
      store.removeListener('value', callback2);
      expect(store.getAllListeners()).toHaveLength(4);
      expect(listenerPaths('value')).toHaveLength(2);
    });

    it('cancel callbacks are called when set', () => {
      let count = 0;
      const callback: GenericEventHandler = (snap) => undefined;
      const callback2: GenericEventHandler = (snap) => undefined;
      const cancelCallback = () => count++;
      store.removeAllListeners();
      store.addListener('/path/to/value1', 'value', callback, cancelCallback);
      store.addListener('/path/to/value2', 'value', callback2, cancelCallback);
      store.addListener(
        '/path/to/added',
        'child_added',
        callback,
        cancelCallback
      );
      store.addListener('/path/to/value3', 'value', callback2);
      store.addListener('/path/to/moved', 'child_moved', callback);
      let howMany = store.removeAllListeners();
      expect(howMany).toBe(3);
      expect(count).toBe(3);
      store.addListener('/path/to/value1', 'value', callback, cancelCallback);
      store.addListener('/path/to/value2', 'value', callback2, cancelCallback);
      store.addListener(
        '/path/to/added',
        'child_added',
        callback,
        cancelCallback
      );
      store.addListener('/path/to/value3', 'value', callback2);
      store.addListener('/path/to/moved', 'child_moved', callback);
      howMany = store.removeListener('value');
      expect(howMany).toBe(2);
      expect(count).toBe(5);
    });
  });

  describe('Writing to DB', () => {
    it('pushDB() works', () => {
      store.clearDb();
      const pushKey = store.pushDb('/people', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      // check directly in DB
      expect(pushKey).toBeString();
      expect(pushKey.includes('-')).toBeTruthy();
      expect(store.getDb().people[pushKey]).toBeInstanceOf(Object);
      expect(store.getDb().people[pushKey].name).toBe('Humpty Dumpty');
    });

    it('setDB() works', () => {
      store.clearDb();
      store.setDb('/people/abc', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      expect(store.getDb().people.abc).toBeInstanceOf(Object);
      expect(store.getDb().people.abc.name).toBe('Humpty Dumpty');
    });

    it('updateDB() works', () => {
      store.clearDb();
      store.updateDb('/people/update', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      expect(store.getDb().people.update).toBeInstanceOf(Object);
      expect(store.getDb().people.update.name).toBe('Humpty Dumpty');
      expect(store.getDb().people.update.age).toBe(5);
      store.updateDb('/people/update', {
        age: 6,
        nickname: 'Humpty',
      });
      expect(store.getDb().people.update.name).toBe('Humpty Dumpty');
      expect(store.getDb().people.update.age).toBe(6);
      expect(store.getDb().people.update.nickname).toBe('Humpty');
    });

    it('removeDB() works', () => {
      store.clearDb();
      store.setDb('/people/remove', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      expect(store.getDb().people.remove.name).toBe('Humpty Dumpty');
      expect(store.getDb().people.remove.age).toBe(5);
      store.removeDb('/people/remove');

      expect(store.getDb().people.remove).toBeUndefined();
    });
  });

  describe('Find Listeners', () => {
    // it('find all child listeners at a path', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   store.removeAllListeners();
    //   store.addListener('/auth/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'child_added', callback);
    //   store.addListener('/auth/people', 'child_moved', callback);
    //   store.addListener('/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'value', callback);
    //   store.addListener('/auth/company', 'child_removed', callback);
    //   const listeners = store.findChildListeners('/auth/people');

    //   expect(listeners).toHaveLength(3);
    // });

    // it('find all child listeners at a path below the listening path', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   store.removeAllListeners();
    //   store.addListener('/auth/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'child_added', callback);
    //   store.addListener('/auth/people', 'child_moved', callback);
    //   store.addListener('/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'value', callback);
    //   store.addListener('/auth/company', 'child_removed', callback);
    //   const listeners = findChildListeners('/auth/people/1234');

    //   expect(listeners).toHaveLength(3);
    // });

    // it('find all child listeners at a path and event type', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   store.removeAllListeners();
    //   store.addListener('/auth/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'child_added', callback);
    //   store.addListener('/auth/people', 'child_moved', callback);
    //   store.addListener('/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'value', callback);
    //   store.addListener('/auth/company', 'child_removed', callback);
    //   const listeners = findChildListeners('/auth/people', 'child_added');
    //   expect(listeners).toHaveLength(1);
    // });

    // it('find all value listeners at a path', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   store.removeAllListeners();
    //   store.addListener('/auth/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'child_added', callback);
    //   store.addListener('/auth/people', 'child_moved', callback);
    //   store.addListener('/people', 'child_removed', callback);
    //   store.addListener('/auth/people', 'value', callback);
    //   store.addListener('/auth', 'value', callback);
    //   store.addListener('/auth/company', 'child_removed', callback);
    //   const listenAtpeople = findValueListeners('/auth/people');
    //   expect(listenAtpeople).toHaveLength(2);
    //   const listenAtAuth = findValueListeners('/auth');
    //   expect(listenAtAuth).toHaveLength(1);
    // });
  });

  describe('Handle Events', () => {
    it('"value" responds to NEW child', async () => {
      store.reset();
      const callback: HandleValueEvent = (snap) => {
        if (snap.val()) {
          const record = helpers.firstRecord(snap.val());
          expect(record.name).toBe('Humpty Dumpty');
          expect(record.age).toBe(5);
        }
      };
      store.addListener('/people', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(1);
      const pushKey = store.pushDb('/people', {
        name: 'Humpty Dumpty',
        age: 5,
      });
    });

    it('"value" responds to UPDATED child', async () => {
      store.reset();
      const m = await Mock.prepare();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      let status = 'no-listener';
      let firstRecord: any;
      let firstKey: any;

      const callback: HandleValueEvent = (snap) => {
        if (status === 'has-listener') {
          const list: any = snap.val();
          const first: any = list[firstKey];
          expect(first.age).toBe(firstRecord.age + 1);
        }
      };

      store.addListener('/people', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(1);

      status = 'has-listener';
      const people = await m.ref('/people').once('value');

      firstKey = helpers.firstKey(people.val());
      firstRecord = helpers.firstRecord(people.val());

      store.updateDb(`/people/${firstKey}`, { age: firstRecord.age + 1 });
    });

    it('"value" responds to deeply nested CHANGE', async () => {
      store.reset();
      const callback: HandleValueEvent = (snap) => {
        const record = snap.val();
        if (record) {
          expect(record.a.b.c.d.name).toBe('Humpty Dumpty');
          expect(record.a.b.c.d.age).toBe(5);
        } else {
          // during initialization
          expect(snap.val()).toBe(null);
        }
      };
      await store.addListener('/people', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(1);
      store.setDb('/people/a/b/c/d', {
        name: 'Humpty Dumpty',
        age: 5,
      });
    });

    it('"value" responds to REMOVED child', async () => {
      store.reset();
      const m = await Mock.prepare();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      let status = 'starting';
      const people = (await m.ref('/people').once('value')).val();
      expect(Object.keys(people)).toHaveLength(10);
      const firstPerson = firstKey(people);

      const callback: IFirebaseEventHandler = (snap) => {
        const list = snap.val();
        if (list) {
          expect(snap.numChildren()).toBe(status === 'starting' ? 10 : 9);
          if (status === 'starting') {
            expect(Object.keys(list)).toEqual(
              expect.arrayContaining([firstPerson])
            );
          } else {
            expect(Object.keys(list)).toEqual(
              expect.not.arrayContaining([firstPerson])
            );
          }
        }
      };

      store.addListener('/people', 'value', callback);
      expect(store.getAllListeners()).toHaveLength(1);

      status = 'after';
      store.removeDb(`/people/${firstPerson}`);

      const andThen = (await m.ref('/people').once('value')).val();

      expect(Object.keys(andThen)).toHaveLength(9);
      expect(Object.keys(andThen)).toEqual(
        expect.not.arrayContaining([firstPerson])
      );
    });
  });

  describe('Initialing DB state', () => {
    it('passing in dictionary for db config initializes the DB', async () => {
      store.reset();
      const m = await Fixture.prepare({
        db: { foo: { bar: true, baz: true } },
        
      });

      expect(store.getDb()).toBeInstanceOf(Object);
      expect(store.getDb().foo).toBeInstanceOf(Object);
      expect(store.getDb().foo.bar).toBe(true);
      expect(store.getDb().foo.baz).toBe(true);
    });

    // it('passing in an async function to db config initializes the DB', async () => {
    //   store.reset();
    //   const fixture = await Fixture.prepare<SDK>();
    //   const m = await Mock.prepare({
    //     db: async () => {
    //       await wait(5);
    //       return {
    //         foo: { bar: true, baz: true },
    //       };
    //     },
    //   });

    //   expect(store.getDb()).toBeInstanceOf(Object);
    //   expect(store.getDb().foo).toBeInstanceOf(Object);
    //   expect(store.getDb().foo.bar).toBe(true);
    //   expect(store.getDb().foo.baz).toBe(true);
    // });
  });

  describe('Other', () => {
    it('"value" responds to scalar value set', async () => {
      store.reset();
      let status = 'no-listener';
      const callback: IFirebaseEventHandler = (snap) => {
        if (status === 'listener') {
          const scalar = snap.val();
          expect(scalar).toBe(53);
        }
      };
       store.addListener('/scalar', 'value', callback);
      status = 'listener';
      store.setDb('/scalar', 53);
    });

    it('"child_added" responds to NEW child', async () => {
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          const person = snap.val();
          expect(person.name).toBe('Chris Christy');
          expect(person.age).toBe(100);
        }
      };
      store.addListener('/people', 'child_added', callback);
      ready = true;
      store.pushDb('/people', {
        name: 'Chris Christy',
        age: 100,
      });
    });

    it('"child_added" ignores changed child', async () => {
      store.reset();
      store.setDb('people.abcd', { name: 'Chris Chisty', age: 100 });
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          throw new Error('Should NOT have called callback!');
        }
      };
       store.addListener('/people', 'child_added', callback);
      ready = true;
      const christy = helpers.firstKey(store.getDb('people'));
      store.updateDb(`/people/abcd`, {
        age: 150,
      });
    });

    it('"child_added" ignores removed child', async () => {
      store.reset();
      store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          throw new Error('Should NOT have called callback!');
        }
      };
       store.addListener('/people', 'child_added', callback);
      ready = true;
      store.removeDb(`/people/abcd`);
    });

    it('"child_removed" responds to removed child', async () => {
      store.reset();
      store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          expect(store.getDb().people).toBeInstanceOf(Object);
          expect(Object.keys(store.getDb().people)).toHaveLength(0);
        } else {
          expect(Object.keys(store.getDb().people)).toHaveLength(1);
        }
      };
      store.addListener('/people', 'child_removed', callback);
      ready = true;
      store.removeDb(`/people/abcd`);
    });

    it('"child_removed" ignores added child', async () => {
      store.reset();
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          throw new Error('Should NOT have called callback!');
        }
      };

       store.addListener('/people', 'child_removed', callback);
      ready = true;
      store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
    });

    it('"child_removed" ignores removal of non-existing child', async () => {
      store.reset();
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          throw new Error(
            `Should NOT have called callback! [ ${snap.key}, ${snap.val()} ]`
          );
        }
      };

       store.addListener('/people', 'child_removed', callback);
      ready = true;
      store.removeDb('people.abcdefg');
    });

    it('"child_changed" responds to a new child', async () => {
      store.reset();
      store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          expect(store.getDb('people')).toBeInstanceOf(Object);
          expect(store.getDb('people')).toHaveProperty('abcd');
          expect(store.getDb('people')).toHaveProperty(snap.key);

          expect(helpers.length(store.getDb('people'))).toBe(2);
          expect(snap.val().name).toBe('Barbara Streisand');
        }
      };
       store.addListener('/people', 'child_changed', callback);
      ready = true;
      store.pushDb(`/people`, {
        name: 'Barbara Streisand',
        age: 70,
      });
    });

    it('"child_changed" responds to a removed child',  () => {
      store.reset();
      store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });

      const callback: HandleValueEvent = (snap) => {
        expect(store.getDb('people')).toBeInstanceOf(Object);
        expect(store.getDb('people')).not.toHaveProperty('abcd');
      };

      store.removeDb(`/people.abcd`);
      store.addListener('/people', 'child_removed', callback);

      expect(store.getDb('people')).not.toHaveProperty('abcd');
    });
  });
});
