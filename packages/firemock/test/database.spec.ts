/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { firstKey } from 'native-dash';
import {
  GenericEventHandler,
  HandleValueEvent,
  IFirebaseEventHandler,
  listenerPaths,
} from '~/index';
import { IMockDatabase, SDK } from '@forest-fire/types';

import * as helpers from './testing/helpers';

import { SchemaCallback, Fixture } from '@forest-fire/fixture';
import { createDatabase } from '~/databases/createDatabase';

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
  let db: IMockDatabase<SDK.RealTimeAdmin>;
  beforeEach(() => {
    db = createDatabase(SDK.RealTimeAdmin);
  });
  describe('Basics', () => {
    it('can clear database', () => {
      db.store.setDb('foo', 'bar');
      expect(Object.keys(db.store.getDb()).length).toBe(1);
      db.store.clearDb();
      expect(Object.keys(db.store.getDb()).length).toBe(0);
    });
  });

  describe('Listeners', () => {
    it('can add listeners', () => {
      const callback: GenericEventHandler = () => null;
      db.store.addListener('/path/to/node', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(1);
      db.store.addListener('/path/to/node', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(2);
    });

    it('can remove all listeners', () => {
      const callback: GenericEventHandler = () => undefined;
      db.store.removeAllListeners();
      db.store.addListener('/path/to/node', 'value', callback);
      db.store.addListener('/path/to/node', 'value', callback);
      db.store.addListener('/path/to/node', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(3);
      db.store.removeAllListeners();
      expect(db.store.getAllListeners()).toHaveLength(0);
      db.store.addListener('/path/to/node', 'value', callback);
      db.store.addListener('/path/to/node', 'value', callback);
      db.store.addListener('/path/to/node', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(3);
      db.store.removeAllListeners();
    });

    it('can remove all listeners of given eventType', () => {
      const callback: GenericEventHandler = () => undefined;
      db.store.removeAllListeners();
      db.store.addListener('/path/to/value1', 'value', callback);
      db.store.addListener('/path/to/added', 'child_added', callback);
      db.store.addListener('/path/to/value2', 'value', callback);
      db.store.addListener('/path/to/moved', 'child_moved', callback);
      db.store.removeListener('child_added');
      expect(db.store.getAllListeners()).toHaveLength(3);
      db.store
        .getAllListeners()
        .forEach((p) =>
          expect(p).toEqual(expect.not.arrayContaining(['added']))
        );
      db.store.removeListener('value');
      expect(db.store.getAllListeners()).toHaveLength(1);

      db.store
        .getAllListeners()
        .forEach((p) => expect(p.eventType.includes('moved')).toBeTrue());
    });

    it('can remove listeners of same eventType, callback', () => {
      const callback: GenericEventHandler = () => undefined;
      const callback2: GenericEventHandler = () => undefined;
      db.store.removeAllListeners();
      db.store.addListener('/path/to/value1', 'value', callback);
      db.store.addListener('/path/to/value2', 'value', callback);
      db.store.addListener('/path/to/added', 'child_added', callback);
      db.store.addListener('/path/to/value3', 'value', callback2);
      db.store.addListener('/path/to/moved', 'child_moved', callback);
      db.store.removeListener('value');
      expect(db.store.getAllListeners()).toHaveLength(3);
      expect(
        db.store.getAllListeners().filter((l) => l.eventType === 'value')
      ).toBe(1);
      db.store
        .getAllListeners()
        .filter((l) => l.eventType === 'value')
        .forEach((l) => {
          expect(l).toContain('value3');
        });
    });

    it('can remove listeners of same eventType, callback, and context', () => {
      const callback: GenericEventHandler = () => undefined;
      const callback2: GenericEventHandler = () => undefined;
      const context = { foo: 'bar' };
      const context2 = { foo: 'baz' };
      db.store.removeAllListeners();
      db.store.addListener('/path/to/value1', 'value', callback, null, context);
      db.store.addListener(
        '/path/to/value2',
        'value',
        callback2,
        null,
        context
      );
      db.store.addListener(
        '/path/to/added',
        'child_added',
        callback,
        null,
        context
      );
      const cb2 = db.store.addListener(
        '/path/to/value3',
        'value',
        callback2,
        null,
        context2
      );
      const cb = db.store.addListener(
        '/path/to/moved',
        'child_moved',
        callback,
        null,
        context
      );
      expect(db.store.getAllListeners()).toHaveLength(5);
      db.store.removeListener(cb2.id);
      expect(db.store.getAllListeners()).toHaveLength(4);
      expect(
        db.store.getAllListeners()?.filter((evt) => evt.eventType === 'value')
      ).toHaveLength(2);
    });

    it('cancel callbacks are called when set', () => {
      let count = 0;
      const callback: GenericEventHandler = () => undefined;
      const callback2: GenericEventHandler = () => undefined;
      const cancelCallback = () => count++;
      db.store.removeAllListeners();
      db.store.addListener(
        '/path/to/value1',
        'value',
        callback,
        cancelCallback
      );
      db.store.addListener(
        '/path/to/value2',
        'value',
        callback2,
        cancelCallback
      );
      db.store.addListener(
        '/path/to/added',
        'child_added',
        callback,
        cancelCallback
      );
      db.store.addListener('/path/to/value3', 'value', callback2);
      db.store.addListener('/path/to/moved', 'child_moved', callback);
      let howMany = db.store.removeAllListeners();
      expect(howMany).toBe(3);
      expect(count).toBe(3);
      db.store.addListener(
        '/path/to/value1',
        'value',
        callback,
        cancelCallback
      );
      db.store.addListener(
        '/path/to/value2',
        'value',
        callback2,
        cancelCallback
      );
      db.store.addListener(
        '/path/to/added',
        'child_added',
        callback,
        cancelCallback
      );
      db.store.addListener('/path/to/value3', 'value', callback2);
      db.store.addListener('/path/to/moved', 'child_moved', callback);
      howMany = db.store.removeListener('value');
      expect(howMany).toBe(2);
      expect(count).toBe(5);
    });
  });

  describe('Writing to DB', () => {
    it('pushDB() works', () => {
      db.store.clearDb();
      const pushKey = db.store.pushDb('/people', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      // check directly in DB
      expect(pushKey).toBeString();
      expect(pushKey.includes('-')).toBeTruthy();
      expect(db.store.getDb().people[pushKey]).toBeInstanceOf(Object);
      expect(db.store.getDb().people[pushKey].name).toBe('Humpty Dumpty');
    });

    it('setDB() works', () => {
      db.store.clearDb();
      db.store.setDb('/people/abc', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      expect(db.store.getDb().people.abc).toBeInstanceOf(Object);
      expect(db.store.getDb().people.abc.name).toBe('Humpty Dumpty');
    });

    it('updateDB() works', () => {
      db.store.clearDb();
      db.store.updateDb('/people/update', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      expect(db.store.getDb().people.update).toBeInstanceOf(Object);
      expect(db.store.getDb().people.update.name).toBe('Humpty Dumpty');
      expect(db.store.getDb().people.update.age).toBe(5);
      db.store.updateDb('/people/update', {
        age: 6,
        nickname: 'Humpty',
      });
      expect(db.store.getDb().people.update.name).toBe('Humpty Dumpty');
      expect(db.store.getDb().people.update.age).toBe(6);
      expect(db.store.getDb().people.update.nickname).toBe('Humpty');
    });

    it('removeDB() works', () => {
      db.store.clearDb();
      db.store.setDb('/people/remove', {
        name: 'Humpty Dumpty',
        age: 5,
      });
      expect(db.store.getDb().people.remove.name).toBe('Humpty Dumpty');
      expect(db.store.getDb().people.remove.age).toBe(5);
      db.store.removeDb('/people/remove');

      expect(db.store.getDb().people.remove).toBeUndefined();
    });
  });

  describe('Find Listeners', () => {
    // it('find all child listeners at a path', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   db.store.removeAllListeners();
    //   db.store.addListener('/auth/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'child_added', callback);
    //   db.store.addListener('/auth/people', 'child_moved', callback);
    //   db.store.addListener('/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'value', callback);
    //   db.store.addListener('/auth/company', 'child_removed', callback);
    //   const listeners = db.store.findChildListeners('/auth/people');
    //   expect(listeners).toHaveLength(3);
    // });
    // it('find all child listeners at a path below the listening path', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   db.store.removeAllListeners();
    //   db.store.addListener('/auth/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'child_added', callback);
    //   db.store.addListener('/auth/people', 'child_moved', callback);
    //   db.store.addListener('/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'value', callback);
    //   db.store.addListener('/auth/company', 'child_removed', callback);
    //   const listeners = findChildListeners('/auth/people/1234');
    //   expect(listeners).toHaveLength(3);
    // });
    // it('find all child listeners at a path and event type', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   db.store.removeAllListeners();
    //   db.store.addListener('/auth/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'child_added', callback);
    //   db.store.addListener('/auth/people', 'child_moved', callback);
    //   db.store.addListener('/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'value', callback);
    //   db.store.addListener('/auth/company', 'child_removed', callback);
    //   const listeners = findChildListeners('/auth/people', 'child_added');
    //   expect(listeners).toHaveLength(1);
    // });
    // it('find all value listeners at a path', () => {
    //   const callback: HandleValueEvent = (snap) => undefined;
    //   db.store.removeAllListeners();
    //   db.store.addListener('/auth/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'child_added', callback);
    //   db.store.addListener('/auth/people', 'child_moved', callback);
    //   db.store.addListener('/people', 'child_removed', callback);
    //   db.store.addListener('/auth/people', 'value', callback);
    //   db.store.addListener('/auth', 'value', callback);
    //   db.store.addListener('/auth/company', 'child_removed', callback);
    //   const listenAtpeople = findValueListeners('/auth/people');
    //   expect(listenAtpeople).toHaveLength(2);
    //   const listenAtAuth = findValueListeners('/auth');
    //   expect(listenAtAuth).toHaveLength(1);
    // });
  });

  describe('Handle Events', () => {
    it('"value" responds to NEW child', () => {
      db.store.reset();
      const callback: HandleValueEvent = (snap) => {
        if (snap.val()) {
          const record = helpers.firstRecord(snap.val());
          expect(record.name).toBe('Humpty Dumpty');
          expect(record.age).toBe(5);
        }
      };
      db.store.addListener('/people', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(1);
      const pushKey = db.store.pushDb('/people', {
        name: 'Humpty Dumpty',
        age: 5,
      });
    });

    it('"value" responds to UPDATED child', async () => {
      db.store.reset();
      const f = await Fixture.prepare();
      f.addSchema('person', personMock);
      f.queueSchema('person', 10);
      const fixture = f.generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

      let status = 'no-listener';

      const callback: HandleValueEvent = (snap) => {
        if (status === 'has-listener') {
          const list = snap.val();
          const first = list[firstKey(list) as keyof typeof list];
          expect(first.age).toBe(helpers.firstRecord(fixture).age + 1);
        }
      };

      db.store.addListener('/people', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(1);

      status = 'has-listener';
      const people = await m.db.ref('/people').once('value');

      const _firstKey = helpers.firstKey(people.val());
      const _firstRecord = helpers.firstRecord(people.val());

      db.store.updateDb(`/people/${_firstKey}`, { age: _firstRecord.age + 1 });
    });

    it('"value" responds to deeply nested CHANGE', () => {
      db.store.reset();
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
      db.store.addListener('/people', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(1);
      db.store.setDb('/people/a/b/c/d', {
        name: 'Humpty Dumpty',
        age: 5,
      });
    });

    it('"value" responds to REMOVED child', async () => {
      db.store.reset();
      const f = await Fixture.prepare();
      f.addSchema('person', personMock);
      f.queueSchema('person', 10);
      const fixture = f.generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);
      let status = 'starting';
      const people = (await m.db.ref('/people').once('value')).val();
      expect(Object.keys(people)).toHaveLength(10);
      const firstPerson = firstKey(people) as string;

      const callback: IFirebaseEventHandler<SDK.RealTimeAdmin> = (snap) => {
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

      db.store.addListener('/people', 'value', callback);
      expect(db.store.getAllListeners()).toHaveLength(1);

      status = 'after';
      db.store.removeDb(`/people/${firstPerson}`);

      const andThen = (await m.db.ref('/people').once('value')).val();

      expect(Object.keys(andThen)).toHaveLength(9);
      expect(Object.keys(andThen)).toEqual(
        expect.not.arrayContaining([firstPerson])
      );
    });
  });

  describe('Initialing DB state', () => {
    it('passing in dictionary for db config initializes the DB', () => {
      db.store.reset();
      const m = createDatabase(
        SDK.RealTimeAdmin,
        {},
        {
          db: { foo: { bar: true, baz: true } },
        }
      );

      expect(m.store.getDb()).toBeInstanceOf(Object);
      expect(m.store.getDb().foo).toBeInstanceOf(Object);
      expect(m.store.getDb().foo.bar).toBe(true);
      expect(m.store.getDb().foo.baz).toBe(true);
    });

    // it('passing in an async function to db config initializes the DB', async () => {
    //   db.store.reset();
    //   const fixture = await Fixture.prepare<SDK>();
    //   const m = await Fixture.prepare({
    //     db: async () => {
    //       await wait(5);
    //       return {
    //         foo: { bar: true, baz: true },
    //       };
    //     },
    //   });

    //   expect (db.store.getDb()).toBeInstanceOf(Object);
    //   expect (db.store.getDb().foo).toBeInstanceOf(Object);
    //   expect (db.store.getDb().foo.bar).toBe(true);
    //   expect (db.store.getDb().foo.baz).toBe(true);
    // });
  });

  describe('Other', () => {
    it('"value" responds to scalar value set', () => {
      db.store.reset();
      let status = 'no-listener';
      const callback: IFirebaseEventHandler<SDK.RealTimeAdmin> = (snap) => {
        if (status === 'listener') {
          const scalar = snap.val();
          expect(scalar).toBe(53);
        }
      };
      db.store.addListener('/scalar', 'value', callback);
      status = 'listener';
      db.store.setDb('/scalar', 53);
    });

    it('"child_added" responds to NEW child', () => {
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          const person = snap.val();
          expect(person.name).toBe('Chris Christy');
          expect(person.age).toBe(100);
        }
      };
      db.store.addListener('/people', 'child_added', callback);
      ready = true;
      db.store.pushDb('/people', {
        name: 'Chris Christy',
        age: 100,
      });
    });

    it('"child_added" ignores changed child', () => {
      db.store.reset();
      db.store.setDb('people.abcd', { name: 'Chris Chisty', age: 100 });
      let ready = false;
      const callback: HandleValueEvent = () => {
        if (ready) {
          throw new Error('Should NOT have called callback!');
        }
      };
      db.store.addListener('/people', 'child_added', callback);
      ready = true;
      db.store.updateDb(`/people/abcd`, {
        age: 150,
      });
    });

    it('"child_added" ignores removed child', () => {
      db.store.reset();
      db.store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
      let ready = false;
      const callback: HandleValueEvent = () => {
        if (ready) {
          throw new Error('Should NOT have called callback!');
        }
      };
      db.store.addListener('/people', 'child_added', callback);
      ready = true;
      db.store.removeDb(`/people/abcd`);
    });

    it('"child_removed" responds to removed child', () => {
      db.store.reset();
      db.store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
      let ready = false;
      const callback: HandleValueEvent = () => {
        if (ready) {
          expect(db.store.getDb().people).toBeInstanceOf(Object);
          expect(Object.keys(db.store.getDb().people)).toHaveLength(0);
        } else {
          expect(Object.keys(db.store.getDb().people)).toHaveLength(1);
        }
      };
      db.store.addListener('/people', 'child_removed', callback);
      ready = true;
      db.store.removeDb(`/people/abcd`);
    });

    it('"child_removed" ignores added child', () => {
      db.store.reset();
      let ready = false;
      const callback: HandleValueEvent = () => {
        if (ready) {
          throw new Error('Should NOT have called callback!');
        }
      };

      db.store.addListener('/people', 'child_removed', callback);
      ready = true;
      db.store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
    });

    it('"child_removed" ignores removal of non-existing child', () => {
      db.store.reset();
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          throw new Error(
            `Should NOT have called callback! [ ${snap.key as string}, ${
              snap.val() as string
            } ]`
          );
        }
      };

      db.store.addListener('/people', 'child_removed', callback);
      ready = true;
      db.store.removeDb('people.abcdefg');
    });

    it('"child_changed" responds to a new child', () => {
      db.store.reset();
      db.store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });
      let ready = false;
      const callback: HandleValueEvent = (snap) => {
        if (ready) {
          expect(db.store.getDb('people')).toBeInstanceOf(Object);
          expect(db.store.getDb('people')).toHaveProperty('abcd');
          expect(db.store.getDb('people')).toHaveProperty(snap.key);

          expect(helpers.length(db.store.getDb('people'))).toBe(2);
          expect(snap.val().name).toBe('Barbara Streisand');
        }
      };
      db.store.addListener('/people', 'child_changed', callback);
      ready = true;
      db.store.pushDb(`/people`, {
        name: 'Barbara Streisand',
        age: 70,
      });
    });

    it('"child_changed" responds to a removed child', () => {
      db.store.reset();
      db.store.setDb('people.abcd', {
        name: 'Chris Chisty',
        age: 100,
      });

      const callback: HandleValueEvent = () => {
        expect(db.store.getDb('people')).toBeInstanceOf(Object);
        expect(db.store.getDb('people')).not.toHaveProperty('abcd');
      };

      db.store.removeDb(`/people.abcd`);
      db.store.addListener('/people', 'child_removed', callback);

      expect(db.store.getDb('people')).not.toHaveProperty('abcd');
    });
  });
});
