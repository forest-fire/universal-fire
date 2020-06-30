// tslint:disable:no-implicit-dependencies
import { expect } from 'chai';
import * as helpers from './testing/helpers';
import { SchemaHelper, Mock, Reference } from '../src';
import {
  updateDB,
  removeDB,
  pushDB,
  setDB,
  multiPathUpdateDB,
  clearDatabase,
  listenerCount,
  reset,
} from '../src/rtdb';
import { IDictionary } from 'common-types';
import type { IRtdbDataSnapshot } from '@forest-fire/types';

describe('Listener events ->', () => {
  it('listening on "on_child" events', async () => {
    reset();
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

    updateDB('userProfile/abcd/name', 'Bob Marley');
    events.map((e) => expect(e.key).to.equal('abcd'));
    expect(events.map((e) => e.eventType)).includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_updated');
    expect(events.map((e) => e.eventType)).includes('child_moved');
    events = [];

    pushDB('userProfile', { name: 'Jane Doe' });
    events.map((e) => {
      expect(e.key).to.be.a('string');
      expect(e.key.slice(0, 1)).to.equal('-');
    });
    expect(events.map((e) => e.eventType)).includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_removed');
    expect(events.map((e) => e.eventType)).includes('child_moved');
    events = [];

    setDB('userProfile/jjohnson', { name: 'Jack Johnson', age: 45 });
    events.map((e) => expect(e.key).to.equal('jjohnson'));
    expect(events.map((e) => e.eventType)).includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_removed');
    expect(events.map((e) => e.eventType)).includes('child_moved');
    events = [];

    updateDB('userProfile/jjohnson/age', 99);
    events.map((e) => expect(e.key).to.equal('jjohnson'));
    expect(events.map((e) => e.eventType)).not.includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_removed');
    expect(events.map((e) => e.eventType)).not.includes('child_moved');
    events = [];

    pushDB('userProfile', { name: 'Chris Christy' });
    events.map((e) => {
      expect(e.key).to.be.a('string');
      expect(e.key.slice(0, 1)).to.equal('-');
    });
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).includes('child_added');
    events = [];

    setDB('userProfile/jjohnson/age', { name: 'Jack Johnson', age: 88 });
    events.map((e) => expect(e.key).to.equal('jjohnson'));
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_added');
  });

  it('removing a record that exists sends child_removed event', async () => {
    reset();
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
    events.map((e) => expect(e.key).to.equal('p-tosh'));
    expect(events.map((e) => e.eventType)).includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_removed');
    expect(events.map((e) => e.eventType)).includes('child_moved');
    events = [];
    removeDB('userProfile/p-tosh');
    events.map((e) => expect(e.key).to.equal('p-tosh'));
    expect(events.map((e) => e.eventType)).includes('child_removed');
    expect(events.map((e) => e.eventType)).not.includes('child_changed');
    expect(events.map((e) => e.eventType)).not.includes('child_added');
    events = [];
  });

  it('removing a record that was not there; results in no events', async () => {
    reset();
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
    expect(events).to.have.lengthOf(0);
  });

  it('updating DB in a watcher path does not return child_added, does return child_changed', async () => {
    clearDatabase();
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

    events.map((e) => expect(e.key).to.equal('jjohnson'));
    expect(events.map((e) => e.eventType)).includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    events = [];

    updateDB('userProfile/jjohnson/age', 99);
    events.map((e) => expect(e.key).to.equal('jjohnson'));
    expect(events.map((e) => e.eventType)).not.includes('child_added');
    expect(events.map((e) => e.eventType)).includes('child_changed');
    events = [];
  });

  it('dispatch works for a MPS', async () => {
    clearDatabase();
    const m = await Mock.prepare();
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

    const firstEmployee = helpers.firstKey(m.db.employees);
    const firstCompany = helpers.firstKey(m.db.companies);
    expect(m.db.employees[firstEmployee]).to.be.an('object');
    expect(m.db.companies[firstCompany]).to.be.an('object');

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

    expect(events).to.have.lengthOf(2);
    expect(events.map((i) => i.eventType)).to.include('employee');
    expect(events.map((i) => i.eventType)).to.include('company');
  });
});
