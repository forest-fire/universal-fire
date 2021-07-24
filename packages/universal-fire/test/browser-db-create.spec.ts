// import { RealTimeAdmin } from '../src';
import {
  FirestoreClient,
  RealTimeClient,
  RealTimeAdmin,
  FirestoreAdmin,
} from '../src/index.browser';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { Database } from '@forest-fire/types';
describe('browser: create client sdk databases', () => {
  it('RealTimeClient.create() initializer returns proper class', async () => {
    const db = RealTimeClient.create({ mocking: true });
    expect(db.dbType).toBe(Database.RTDB);
    expect(db).toBeInstanceOf(RTC);
  });
  it('FirestoreClient.create() initializer returns proper class', async () => {
    const db = FirestoreClient.create({ mocking: true });
    expect(db.dbType).toBe(Database.Firestore);
    expect(db).toBeInstanceOf(FC);
  });
  it('RealTimeAdmin.create() initializer should throw error', async () => {
    try {
      const db = RealTimeAdmin.create({ mocking: true });
      throw new Error();
    } catch (e) {
      expect(e.message).toEqual(
        'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
      );
    }
  });
  it('FirestoreAdmin.create() initializer should throw error', async () => {
    try {
      const db = FirestoreAdmin.create({ mocking: true });
      throw new Error();
    } catch (e) {
      expect(e.message).toEqual(
        'You are using the client/browser entry point for universal-fire; use FirestoreClient instead.'
      );
    }
  });
});
