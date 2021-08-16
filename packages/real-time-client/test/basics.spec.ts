import * as helpers from './testing/helpers';

// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '~/index';
import config from './testing/fb-config';
import { wait } from 'common-types';

helpers.setupEnv();

describe('Basics: ', () => {
  it('Can connect to Firebase mock DB', async () => {
    const db = new RealTimeClient({ mocking: true, mockData: { foo: 'bar' } });
    await db.connect();
    expect(typeof db.mock.db === 'object').toBeTruthy();
    expect(db.mock.store.state.foo).toBe('bar');
    expect(db.isConnected).toBe(true);
  });
  it('Can connect to a real Firebase DB', async () => {
    const db = await RealTimeClient.connect(config);
    await wait(1000);
    expect(db.isConnected).toBe(true);
  });
  it("can list connected DB's", () => {
    const dbs = RealTimeClient.connectedTo();
    expect(dbs).toEqual(expect.arrayContaining(['abstracted-admin']));
  });
});
