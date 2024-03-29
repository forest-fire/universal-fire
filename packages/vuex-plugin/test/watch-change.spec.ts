import { Store } from 'vuex';
import { FireModel, List, Record, Watch } from '~/index';
import { Product } from './models/Product';
import { IRootState, setupStore } from './store';
import { stub } from 'sinon';
import { productData } from './data/productData';
import { companyData } from './data/companyData';
import { orderData } from './data/orderData';

describe('watching local change triggers @firemodel and its module mutations', () => {
  let store: Store<IRootState>;
  beforeEach(async () => {
    const task = new Promise((resolve) => {
      store = setupStore(
        { ...productData, ...companyData, ...orderData }
        // {
        //   apiKey: 'AIzaSyBSb9fWAT_0_XWO1_wgmWnCY3L0Lvs6Vmk',
        //   authDomain: 'utran-1b289.firebaseapp.com',
        //   databaseURL: 'https://utran-1b289.firebaseio.com',
        //   projectId: 'utran-1b289',
        //   storageBucket: 'utran-1b289.appspot.com',
        //   messagingSenderId: '1004514286086',
        // }
      );
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
    await Watch.list(Product).all().start();
    await FireModel.defaultDb.update('/', { ...productData, ...companyData, ...orderData });
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
    const action = () => Record.update(Product, 'abcd', { name: 'fooProduct', price: 10 });
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
    const action = () => Record.update(Product, 'abcd', { name: 'foo', price: 30 });
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
      expect([
        '@firemodel/REMOVED_LOCALLY',
        'products/REMOVED_LOCALLY',
        'products/SERVER_REMOVE',
        'products/REMOVE_CONFIRMATION',
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
      expect([
        '@firemodel/REMOVED_LOCALLY',
        'products/REMOVED_LOCALLY',
        '@firemodel/ROLLBACK_REMOVE',
      ]).toContain(payload.type);
    });

    try {
      await action();
    } catch (error) {
      expect(error.name).toBe('firemodel/error');
      expect(error.message).toContain('This is a custom error');
    }
  });
});
