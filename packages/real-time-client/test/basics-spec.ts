// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '../src';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import config from './testing/fb-config';

const expect = chai.expect;
helpers.setupEnv();

describe('Basics: ', () => {
  it('Can connect to Firebase mock DB', async () => {
    const db = new RealTimeClient({ mocking: true, mockData: { foo: 'bar' } });
    await db.connect();
    expect(db.mock.db).to.be.an('object');
    expect(db.mock.db.foo).to.equal('bar');
    expect(db.isConnected).to.equal(true);
  });
  it('Can connect to a real Firebase DB', async () => {
    const db = new RealTimeClient(config);
    expect(db.isConnected).to.equal(false);
    await db.connect();
    expect(db.isConnected).to.equal(true);
  });
  it("can list connected DB's", async () => {
    const dbs = await RealTimeClient.connectedTo();
    expect(dbs).to.contain('abstracted-admin');
  });
});
