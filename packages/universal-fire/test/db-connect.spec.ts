// import { RealTimeAdmin } from '../src';
import { FirestoreClient, RealTimeClient } from '../src/index.browser';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { Database } from '@forest-fire/types';
describe('DB class provides ability to instantiate and connect to SDKs', () => {
  it.skip('RealTimeAdmin can be instantiated', async () => {
    // const db = await RealTimeAdmin({ mocking: true });
    // expect(db).to.be.instanceOf(RTA);
  });
  it('RealTimeClient can be instantiated', async () => {
    const db = RealTimeClient.create({ mocking: true });
    expect(db).toBeInstanceOf(RTC);
    expect(db.dbType).toBe(Database.RTDB);
  });
  it('FirestoreClient be instantiated', async () => {
    try {
      const db = FirestoreClient.create({ mocking: true });
      expect(db).toBeInstanceOf(FC);
    } catch (e) {
      expect(e.code).toEqual('invalid-configuration');
    }
  });
});
