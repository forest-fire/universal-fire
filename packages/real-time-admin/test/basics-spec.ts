// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src/index';

import * as helpers from './testing/helpers';
helpers.setupEnv();

describe('Basics: ', () => {
  it('Can connect to mock DB', async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    expect(db.isConnected).to.equal(true);
  });

  it('Can connect to real DB', async () => {
    const db = await RealTimeAdmin.connect();
    expect(db.isConnected).to.be.a('boolean');
    expect(db.isConnected).to.equal(true, 'isConnected returns true');
  });

  it('Connecting provides access to all API endpoints that are expected', async () => {
    const db = await RealTimeAdmin.connect();
    const root = await db.getRecord('/');
    expect(root).to.be.an('object');
  });
});
