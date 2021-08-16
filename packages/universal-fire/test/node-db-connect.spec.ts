import { Database } from '@forest-fire/types';
import { FirestoreClient, RealTimeAdmin, RealTimeClient, FirestoreAdmin } from '../src/index.node';
import { FirestoreAdmin as FD } from '@forest-fire/firestore-admin';
import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';

describe('node: connect client sdks databases', () => {
  it('RealTimeClient.connect() initializer should throw error', async () => {
    try {
      const db = await RealTimeClient.connect({ mocking: true });
      throw new Error();
    } catch (e) {
      expect(e.message).toEqual(
        'You are using the node entry point for universal-fire; use RealTimeAdmin instead.'
      );
    }
  });
  it('FirestoreClient.connect() initializer should throw error', async () => {
    try {
      const db = await FirestoreClient.connect({ mocking: true });
      throw new Error();
    } catch (e) {
      expect(e.message).toEqual(
        'You are using the node entry point for universal-fire; use FirestoreAdmin instead.'
      );
    }
  });
  it('RealTimeAdmin.connect() initializer returns proper class', async () => {
    const db = await RealTimeAdmin.create({ mocking: true });
    expect(db).toBeInstanceOf(RTA);
    expect(db.dbType).toBe(Database.RTDB);
  });
  it('FirestoreAdmin.connect() initializer with mock configuration should thrown invalid-configuration error', async () => {
    try {
      const db = await FirestoreAdmin.create({ mocking: true });
      throw new Error();
      // expect(db).toBeInstanceOf(FC);
      // expect(db.dbType).toBe(Database.Firestore);
    } catch (e) {
      expect(e.code).toEqual('invalid-configuration');
    }
  });
});
