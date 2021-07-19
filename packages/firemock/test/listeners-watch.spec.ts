/* eslint-disable @typescript-eslint/no-unsafe-return */

import { SchemaHelper } from '@forest-fire/fixture';

import { IDictionary } from 'common-types';
import { IRtdbDataSnapshot, IRtdbReference, SDK } from '@forest-fire/types';
import 'jest-extended';
import { firstKey } from 'native-dash';
import { createDatabase } from '~/databases/createDatabase';

describe('Listener events ->', () => {
  it('listening on "on_child" events', () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    const { store } = m;
    // reset();
    const queryRef = (Reference.createQuery(
      'userProfile',
      10
    ) as unknown) as IRtdbReference;
    let events: IDictionary[] = [];
    const cb = (eventType: string) => (
      snap: IRtdbDataSnapshot,
      prevKey?: string
    ) => {
      events.push({ eventType, val: snap.val(), key: snap.key, prevKey, snap });
    };
    queryRef.on('child_added', cb('child_added'));
    queryRef.on('child_moved', cb('child_moved'));
    queryRef.on('child_changed', cb('child_changed'));
    queryRef.on('child_removed', cb('child_removed'));

    store.updateDb('userProfile/abcd/name', 'Bob Marley');
    events.map((e) => expect(e.key).toBe('abcd'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_updated'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_moved'])
    );
    events = [];

    store.pushDb('userProfile', { name: 'Jane Doe' });
    events.map((e) => {
      expect(e.key).toBeString();
      expect(e.key.slice(0, 1)).toBe('-');
    });
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_removed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_moved'])
    );
    events = [];

    store.setDb('userProfile/jjohnson', { name: 'Jack Johnson', age: 45 });
    events.map((e) => expect(e.key).toBe('jjohnson'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_removed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_moved'])
    );
    events = [];

    store.updateDb('userProfile/jjohnson/age', 99);
    events.map((e) => expect(e.key).toBe('jjohnson'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_removed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_moved'])
    );
    events = [];

    store.pushDb('userProfile', { name: 'Chris Christy' });
    events.map((e) => {
      expect(e.key).toBeString();
      expect(e.key.slice(0, 1)).toBe('-');
    });
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_added'])
    );
    events = [];

    store.setDb('userProfile/jjohnson/age', { name: 'Jack Johnson', age: 88 });
    events.map((e) => expect(e.key).toBe('jjohnson'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_added'])
    );
  });

  it('removing a record that exists sends child_removed event', () => {
    // reset();
    const queryRef = Reference.createQuery('userProfile', 10);
    let events: IDictionary[] = [];
    const cb = (eventType: string) => (
      snap: IRtdbDataSnapshot,
      prevKey?: any
    ) => {
      events.push({ eventType, val: snap.val(), key: snap.key, prevKey, snap });
    };
    queryRef.on('child_added', cb('child_added'));
    queryRef.on('child_moved', cb('child_moved'));
    queryRef.on('child_changed', cb('child_changed'));
    queryRef.on('child_removed', cb('child_removed'));

    updateDB('userProfile/p-tosh', { name: 'Peter Tosh' });
    events.map((e) => expect(e.key).toBe('p-tosh'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_removed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_moved'])
    );
    events = [];
    removeDB('userProfile/p-tosh');
    events.map((e) => expect(e.key).toBe('p-tosh'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_removed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_changed'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_added'])
    );
    events = [];
  });

  it('removing a record that was not there; results in no events', () => {
    // reset();
    const queryRef = Reference.createQuery('userProfile', 10);
    const events: IDictionary[] = [];
    const cb = (eventType: string) => (
      snap: IRtdbDataSnapshot,
      prevKey?: any
    ) => {
      events.push({ eventType, val: snap.val(), key: snap.key, prevKey, snap });
    };
    queryRef.on('child_added', cb('child_added'));
    queryRef.on('child_moved', cb('child_moved'));
    queryRef.on('child_changed', cb('child_changed'));
    queryRef.on('child_removed', cb('child_removed'));
    removeDB('userProfile/p-tosh');
    expect(events).toHaveLength(0);
  });

  it('updating DB in a watcher path does not return child_added, does return child_changed', () => {
    // clearDatabase();s
    const queryRef = Reference.createQuery('userProfile', 10);
    let events: IDictionary[] = [];
    const cb = (eventType: string) => (
      snap: IRtdbDataSnapshot,
      prevKey?: any
    ) => {
      events.push({ eventType, val: snap.val(), key: snap.key, prevKey, snap });
    };
    queryRef.on('child_added', cb('child_added'));
    queryRef.on('child_changed', cb('child_changed'));
    setDB('userProfile/jjohnson', { name: 'Jack Johnson', age: 45 });

    events.map((e) => expect(e.key).toBe('jjohnson'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    events = [];

    updateDB('userProfile/jjohnson/age', 99);
    events.map((e) => expect(e.key).toBe('jjohnson'));
    expect(events.map((e) => e.eventType)).toEqual(
      expect.not.arrayContaining(['child_added'])
    );
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(['child_changed'])
    );
    events = [];
  });

  it('dispatch works for a MPS', async () => {
    clearDatabase();
    const m = await Fixture.prepare();
    m.addSchema('company')
      .mock((h: SchemaHelper) => () => {
        return { name: h.faker.company.companyName() };
      })
      .hasMany('employee');
    m.addSchema('employee').mock((h: SchemaHelper) => () => {
      return {
        first: h.faker.name.firstName(),
        last: h.faker.name.lastName(),
      };
    });
    m.deploy
      .queueSchema('employee', 5)
      .queueSchema('company')
      .quantifyHasMany('employee', 10)
      .generate();

    const firstEmployee = firstKey(m.db.employees);
    const firstCompany = firstKey(m.db.companies);
    expect(m.db.employees[firstEmployee]).toBeInstanceOf(Object);
    expect(m.db.companies[firstCompany]).toBeInstanceOf(Object);

    const qEmployee = Reference.createQuery('employees', 10);
    const qCompany = Reference.createQuery('companies', 10);

    const events: Array<{
      eventType: string;
      key: string;
      value: IDictionary;
    }> = [];
    const cb = (eventType: string) => (event: IRtdbDataSnapshot) =>
      events.push({ eventType, key: event.key, value: event.val() });

    qEmployee.on('child_changed', cb('employee'));
    qCompany.on('child_changed', cb('company'));

    const mps = {
      [`employees/${firstEmployee}/age`]: 45,
      [`companies/${firstCompany}/address`]: '123 Nowhere Ave',
    };
    multiPathUpdateDB(mps);

    expect(events).toHaveLength(2);
    expect(events.map((i) => i.eventType)).toEqual(
      expect.arrayContaining(['employee'])
    );
    expect(events.map((i) => i.eventType)).toEqual(
      expect.arrayContaining(['company'])
    );
  });
});
