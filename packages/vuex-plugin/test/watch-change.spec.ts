import { Store } from 'vuex';
import { FireModel, Record, Watch } from '~/index';
import { Product } from './models/Product';
import { IRootState, setupStore } from './store';
import { stub } from 'sinon';
import { productData } from './data/productData';

describe('watching local change triggers @firemodel and its module mutations', () => {
  let store: Store<IRootState>;
  beforeEach(async () => {
    const task = new Promise((resolve) => {
      store = setupStore({ ...productData });
      const expectedMutations = [
        '@firemodel/LIFECYCLE_EVENT_COMPLETED',
        '@firemodel/CONFIGURE',
        '@firemodel/CORE_SERVICES_STARTED',
      ];
      const mutationsCommited: string[] = [];
      store.subscribe((payload, state) => {
        if (expectedMutations.includes(payload.type)) {
          mutationsCommited.push(payload.type);
        }
        if (expectedMutations.every((a) => mutationsCommited.includes(a))) {
          resolve(true);
        }
      });
    });

    await task;
    await Watch.list(Product).start();
  });
  afterEach(async () => {
    store = undefined;
    FireModel.defaultDb = undefined;
  });
  it('adding a new record triggers ADDED mutation and its confirmation', async () => {
    const action = () => Record.add(Product, { name: 'fooProduct', price: 10, store: 'fooStore' });
    store.subscribe((payload, state) => {
      expect([
        '@firemodel/ADDED_LOCALLY',
        '@firemodel/ADD_CONFIRMATION',
        'products/ADD_CONFIRMATION',
        'products/ADDED_LOCALLY',
        'products/SERVER_ADD',
        'products/SERVER_CHANGE',
      ]).toContain(payload.type);
    });
    await action();
  });

  it('error in adding a new record triggers ROLLBACK mutations next to ADDED mutation', async () => {
    const action = () => Record.add(Product, { name: 'foo', store: 'fooStore', price: 10 });
    const db = FireModel.defaultDb;

    db.set = stub().throwsException({ message: 'This is a custom error' });
    store.subscribe((payload, state) => {
      expect([
        '@firemodel/ADDED_LOCALLY',
        'products/ADDED_LOCALLY',
        '@firemodel/ROLLBACK_ADD',
      ]).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      expect(error.name).toBe('firemodel/set-db');
      expect(error.message).toContain('This is a custom error');
    }
  });

  it('updating a record trigger CHANGED mutation and its confirmation', async () => {
    const action = () =>
      Record.update(Product, 'abcd', { name: 'fooProduct', price: 10, store: 'fooStore' });
    store.subscribe((payload, state) => {
      expect([
        '@firemodel/CHANGED_LOCALLY',
        '@firemodel/CHANGE_CONFIRMATION',
        'products/CHANGE_CONFIRMATION',
        'products/CHANGED_LOCALLY',
        'products/SERVER_ADD',
        'products/SERVER_CHANGE',
      ]).toContain(payload.type);
    });
    await action();
  });

  it('error in updating a record triggers a ROLLBACK mutation next to CHANGED', async () => {
    const action = () =>
      Record.update(Product, 'abcd', { name: 'foo', store: 'fooStore', price: 10 });
    const db = FireModel.defaultDb;

    db.update = stub().throwsException({ message: 'This is a custom error' });
    store.subscribe((payload, state) => {
      expect([
        '@firemodel/CHANGED_LOCALLY',
        'products/CHANGED_LOCALLY',
        '@firemodel/ROLLBACK_CHANGE',
      ]).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      expect(error.name).toBe('firemodel/error');
      expect(error.message).toContain('This is a custom error');
    }
  });

  it('removing a record triggers REMOVE_CONFIRMATION', async () => {
    const action = () => Record.remove(Product, 'abcd');
    store.subscribe((payload, state) => {
      console.log(payload.type);
      expect([
        '@firemodel/ROLLBACK_REMOVE',
        'products/ROLLBACK_REMOVE',
        'products/SERVER_REMOVE',
        'products/ROLLBACK_CHANGE',
        '@firemodel/REMOVE_CONFIRMATION',
      ]).toContain(payload.type);
    });
    await action();
  });

  it('error in removing a record triggers ROLLBACK mutation', async () => {
    const action = () => Record.remove(Product, 'abcd');
    const db = FireModel.defaultDb;

    db.remove = stub().throwsException({ message: 'This is a custom error' });
    store.subscribe((payload, state) => {
      console.log(payload.type);
      expect(['@firemodel/ROLLBACK_REMOVE', 'products/ROLLBACK_REMOVE']).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      expect(error.name).toBe('firemodel/error');
      expect(error.message).toContain('This is a custom error');
    }
  });
});
