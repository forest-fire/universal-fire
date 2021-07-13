// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src/';
import * as helpers from './testing/helpers';

import { auth } from 'firebase-admin';
helpers.setupEnv();

describe('Admin Auth API', () => {
  it('Real Auth: before connecting to DB, can still access admin API', async () => {
    const db = new RealTimeAdmin();
    const auth = await db.auth();
    expect(auth.updateUser).toBeInstanceOf('function');
    expect(auth.createUser).toBeInstanceOf('function');
  });

  it('Real Auth: after connecting can also reference auth', async () => {
    const db = await RealTimeAdmin.connect();
    const auth: auth.Auth = await db.auth();
    expect(auth.updateUser).toBeInstanceOf('function');
    expect(auth.createUser).toBeInstanceOf('function');
  });

  it('Mock Auth: can access the mocked Admin Auth API', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    const auth: auth.Auth = await db.auth();
    expect(auth.updateUser).toBeInstanceOf('function');
    expect(auth.createUser).toBeInstanceOf('function');
  });
});
