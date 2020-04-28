// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src/';
import * as helpers from './testing/helpers';
import { expect } from 'chai';
import { auth } from 'firebase-admin';
helpers.setupEnv();

describe('Admin Auth API', () => {
  it('Real Auth: before connecting to DB, can still access admin API', async () => {
    const db = new RealTimeAdmin();
    expect(db.isConnected).to.equal(false);
    const auth = await db.auth();
    expect(auth.createCustomToken).to.be.a('function');
    expect(auth.createUser).to.be.a('function');
  });

  it('Real Auth: after connecting can also reference auth', async () => {
    const db = await RealTimeAdmin.connect();
    const auth: auth.Auth = await db.auth();
    expect(auth).to.be.an('object');
    expect(auth.createCustomToken).to.be.a('function');
    expect(auth.createUser).to.be.a('function');
  });

  it('Mock Auth: can access the mocked Admin Auth API', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    const success: auth.Auth = await db.auth();
    expect(success).to.be.an('object');
    expect(success.createCustomToken).to.be.a('function');
  });
});
