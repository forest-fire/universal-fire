import {
  FirestoreClient,
  RealTimeClient,
  RealTimeAdmin,
  FirestoreAdmin,
} from '../src/index.browser';
// import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { Database } from '@forest-fire/types';

describe('browser: connect client sdks databases', () => {
  it('RealTimeClient.connect() initializer returns proper class', async () => {
    const db = await RealTimeClient.connect({ mocking: true });
    expect(db).toBeInstanceOf(RTC);
    expect(db.dbType).toBe(Database.RTDB);
  });
  it('FirestoreClient.connect() initializer should throw error', async () => {
    try {
      const db = await FirestoreClient.connect({ mocking: true });
      throw new Error();
      // expect(db).toBeInstanceOf(FC);
      // expect(db.dbType).toBe(Database.Firestore);
    } catch (e) {
      expect(e.code).toEqual('not-implemented');
    }
  });
  it('RealTimeAdmin.connect() initializer should throw error', async () => {
    try {
      const db = await RealTimeAdmin.create({ mocking: true });
      throw new Error();
    } catch (e) {
      expect(e.message).toEqual(
        'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
      );
    }
  });
  it('FirestoreAdmin.connect() initializer should throw error', async () => {
    try {
      const db = await FirestoreAdmin.connect({ mocking: true });
      throw new Error();
    } catch (e) {
      expect(e.message).toEqual(
        'You are using the client/browser entry point for universal-fire; use FirestoreClient instead.'
      );
    }
  });
});
