import { Store } from 'vuex';
import { FireModel, Record, Watch } from '~/index';
import { Product } from './models/Product';
import { IRootState, setupStore } from './store';
import { stub } from 'sinon';
import { productData } from './data/productData';

describe('local change effects @firemodel state', () => {
  let store: Store<IRootState>;
  beforeEach(() => {
    store = setupStore({ ...productData });
  });
  afterEach(() => {
    FireModel.defaultDb = undefined;
    store = undefined;
  });
  it('adding a new record results in addition to "onlyLocal"', async () => {
    const action = () => Record.add(Product, { name: 'fooProduct', price: 10, store: 'fooStore' });
    store.subscribe((payload, state) => {
      expect(['@firemodel/ADDED_LOCALLY', '@firemodel/ADD_CONFIRMATION']).toContain(payload.type);
    });
    await action();
  });

  it('adding a new record results in addition to "onlyLocal"', async () => {
    const action = () => Record.add(Product, { name: 'foo', store: 'fooStore', price: 10 });
    const db = FireModel.defaultDb;

    db.set = stub().throwsException({ message: 'This is a custom error' });
    store.subscribe((payload, state) => {
      expect(['@firemodel/ADDED_LOCALLY', '@firemodel/ROLLBACK_ADD']).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      expect(error.name).toBe('firemodel/set-db');
      expect(error.message).toContain('This is a custom error');
    }
  });

  it('adding a new record results in addition to "onlyLocal"', async () => {
    const action = () =>
      Record.update(Product, 'abcd', { name: 'fooProduct', price: 10, store: 'fooStore' });
    store.subscribe((payload, state) => {
      expect(['@firemodel/CHANGED_LOCALLY', '@firemodel/CHANGE_CONFIRMATION']).toContain(
        payload.type
      );
    });
    await action();
  });

  it('adding a new record results in addition to "onlyLocal"', async () => {
    const action = () =>
      Record.update(Product, 'abcd', { name: 'foo', store: 'fooStore', price: 10 });
    const db = FireModel.defaultDb;

    db.update = stub().throwsException({ message: 'This is a custom error' });
    store.subscribe((payload, state) => {
      expect(['@firemodel/CHANGED_LOCALLY', '@firemodel/ROLLBACK_CHANGE']).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      expect(error.name).toBe('firemodel/error');
      expect(error.message).toContain('This is a custom error');
    }
  });

  it('adding a new record results in addition to "onlyLocal"', async () => {
    const action = () => Record.remove(Product, 'abcd');
    store.subscribe((payload, state) => {
      console.log(payload.type);
      expect(['@firemodel/ROLLBACK_REMOVE', '@firemodel/REMOVE_CONFIRMATION']).toContain(
        payload.type
      );
    });
    await action();
  });

  it('adding a new record results in addition to "onlyLocal"', async () => {
    const action = () => Record.remove(Product, 'abcd');
    const db = FireModel.defaultDb;

    db.remove = stub().throwsException({ message: 'This is a custom error' });
    store.subscribe((payload, state) => {
      console.log(payload.type);
      expect(['@firemodel/ROLLBACK_REMOVE']).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      console.log(error);
      expect(error.name).toBe('firemodel/error');
      expect(error.message).toContain('This is a custom error');
    }
  });
});

