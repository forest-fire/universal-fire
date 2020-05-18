// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src/';
import * as helpers from './testing/helpers';
import { expect } from 'chai';
import { auth } from 'firebase-admin';
helpers.setupEnv();

describe('Admin Auth API', () => {
  it('Real Auth: before connecting to DB, can still access admin API', async () => {
    const db = new RealTimeAdmin();
    const auth = await db.auth();
    expect(auth.updateUser).to.be.a('function', 'updateUser is a function');
    expect(auth.createUser).to.be.a('function', 'createUser is a function');
  });

  it('Real Auth: after connecting can also reference auth', async () => {
    const db = await RealTimeAdmin.connect();
    const auth: auth.Auth = await db.auth();
    expect(auth.updateUser).to.be.a('function', 'updateUser is a function');
    expect(auth.createUser).to.be.a('function', 'createUser is a function');
  });

  it('Mock Auth: can access the mocked Admin Auth API', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    const auth: auth.Auth = await db.auth();
    expect(auth.updateUser).to.be.a('function', 'updateUser is a function');
    expect(auth.createUser).to.be.a('function', 'createUser is a function');
  });
});
