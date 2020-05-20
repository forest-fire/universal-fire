import { expect } from 'chai';
import { DB, SDK } from '../src/index';
import { RealTimeAdmin } from '@forest-fire/real-time-admin';
import { RealTimeClient } from '@forest-fire/real-time-client';

describe('DB class provides ability to instantiate and connect to SDKs', async () => {
  it('RealTimeAdmin can be instantiated', async () => {
    const db = await DB.connect(SDK.RealTimeAdmin, { mocking: true });
    expect(db).to.be.instanceOf(RealTimeAdmin);
  });
  it('RealTimeClient can be instantiated', async () => {
    const db = await DB.connect(SDK.RealTimeClient, { mocking: true });
    expect(db).to.be.instanceOf(RealTimeClient);
  });
  it('FirestoreClient can not (YET) be instantiated as a mock DB', async () => {
    try {
      const db = await DB.connect(SDK.FirestoreClient, { mocking: true });
      throw new Error(
        'The FirestoreClient can not be instantiated as a mock DB until the mock DB is implimented!'
      );
    } catch (e) {
      expect(e.code).is.equal('invalid-configuration');
    }
  });
});
