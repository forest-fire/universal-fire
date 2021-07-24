// import { RealTimeAdmin } from '../src';
import { FirestoreClient, RealTimeClient } from '../../src/index.browser';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { Database } from '@forest-fire/types';
describe('create client sdk databases', () => {
  it('RealTimeClient.create() initializer returns proper class', async () => {
    const db = RealTimeClient.create({ mocking: true });
    expect(db).toBeInstanceOf(RTC);
    expect(db.dbType).toBe(Database.RTDB);
  });
  it('FirestoreClient.create() initializer returns proper class', async () => {
    try {
      const db = FirestoreClient.create({ mocking: true });
      // expect(db.dbType).toBe(Database.Firestore);
      // expect(db).toBeInstanceOf(FC);
    } catch (e) {
      expect(e.code).toEqual('not-implemented');
    }
  });
});
