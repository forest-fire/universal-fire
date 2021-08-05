import { RealTimeAdmin, FirestoreAdmin } from 'universal-fire';
import { RealTimeClient } from '@forest-fire/real-time-client';
import { FirestoreClient } from '@forest-fire/firestore-client';
import { Database } from '@forest-fire/types';
import {
  SerializedFirestoreQuery,
  SerializedQuery,
  SerializedRealTimeQuery,
} from '../src';

describe('SerializedQuery', () => {
  it('create() initializer returns proper class for the db passed', async () => {
    const db = await RealTimeClient.connect({ mocking: true });
    const query = SerializedQuery.create(db);
    expect(db.dbType).toBe(Database.RTDB);
    expect(query).toBeInstanceOf(SerializedRealTimeQuery);
  });
  it('create() initializer returns proper class for the db passed', async () => {
    const db = RealTimeAdmin.create({ mocking: true });
    const query = SerializedQuery.create(db);
    expect(db.dbType).toBe(Database.RTDB);
    expect(query).toBeInstanceOf(SerializedRealTimeQuery);
  });
  it('create() initializer returns proper class for the db passed', async () => {
    const db = new FirestoreClient({ mocking: true });
    const query = SerializedQuery.create(db);
    expect(db.dbType).toBe(Database.Firestore);
    expect(query).toBeInstanceOf(SerializedFirestoreQuery);
  });
  it('create() initializer returns proper class for the db passed', async () => {
    const db = FirestoreAdmin.create({
      serviceAccount: 'foo',
      name: 'foo',
      databaseURL: 'foo',
    });
    const query = SerializedQuery.create(db);
    expect(db.dbType).toBe(Database.Firestore);
    expect(query).toBeInstanceOf(SerializedFirestoreQuery);
  });
});
