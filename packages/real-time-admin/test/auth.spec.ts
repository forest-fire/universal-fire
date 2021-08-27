// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src';
import * as helpers from './testing/helpers';

helpers.setupEnv();

describe('Admin Auth API', () => {
  it('Real Auth: before connecting to DB, can still access admin API', async () => {
    const db = new RealTimeAdmin();
    const auth = await db.auth();
    expect(typeof auth.updateUser === 'function').toBeTruthy();
    expect(typeof auth.createUser === 'function').toBeTruthy();
  });

  it('Real Auth: after connecting can also reference auth', async () => {
    const db = await RealTimeAdmin.connect();
    const auth = await db.auth();
    expect(typeof auth.updateUser === 'function').toBeTruthy();
    expect(typeof auth.createUser === 'function').toBeTruthy();
  });

  it('Mock Auth: can access the mocked Admin Auth API', async () => {
    const db = await RealTimeAdmin.connect({
      mocking: true,
      mockAuth: { users: [], providers: ['anonymous'] },
    });
    const auth = await db.auth();
    expect(typeof auth.updateUser === 'function').toBeTruthy();
    expect(typeof auth.createUser === 'function').toBeTruthy();
  });
});
