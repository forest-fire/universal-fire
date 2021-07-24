// import { RealTimeAdmin } from '../src';
import { FirestoreClient, RealTimeClient } from '../../src/index.browser';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { Database } from '@forest-fire/types';
describe('DB class provides ability to instantiate and connect to SDKs', () => {
  it('RealTimeClient can be instantiated', async () => {
    const db = await RealTimeClient.connect({ mocking: true });
    expect(db).toBeInstanceOf(RTC);
    expect(db.dbType).toBe(Database.RTDB);
  });
  it('FirestoreClient be instantiated', async () => {
    try {
      const db = await FirestoreClient.connect({ mocking: true });
      throw new Error();
      // expect(db).toBeInstanceOf(FC);
      // expect(db.dbType).toBe(Database.Firestore);
    } catch (e) {
      expect(e.code).toEqual('not-implemented');
    }
  });
});
