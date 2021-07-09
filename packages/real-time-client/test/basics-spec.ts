import * as helpers from './testing/helpers';

// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '../src';
import config from './testing/fb-config';
import { wait } from 'common-types';

helpers.setupEnv();

describe('Basics: ', () => {
  it('Can connect to Firebase mock DB', async () => {
    const db = new RealTimeClient({ mocking: true, mockData: { foo: 'bar' } });
    await db.connect();
    expect(db.mock.db).toBeInstanceOf(Object);
    expect((db.mock.db as any).foo).toBe('bar');
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
