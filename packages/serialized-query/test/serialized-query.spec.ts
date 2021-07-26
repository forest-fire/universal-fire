import {
  RealTimeAdmin,
  RealTimeClient,
  FirestoreAdmin,
  FirestoreClient,
} from 'universal-fire';
import { Database } from '@forest-fire/types';
import { SerializedQuery, SerializedRealTimeQuery } from '../src';

describe('SerializedQuery', () => {
  it('create() initializer returns proper class for the db passed', async () => {
    const db = RealTimeClient.create({ mocking: true });
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
    const db = FirestoreClient.create({ mocking: true });
    const query = SerializedQuery.create(db);
    expect(db.dbType).toBe(Database.RTDB);
    expect(query).toBeInstanceOf(SerializedRealTimeQuery);
  });
  it('create() initializer returns proper class for the db passed', async () => {
    const db = FirestoreAdmin.create({ mocking: true });
    const query = SerializedQuery.create(db);
    expect(db.dbType).toBe(Database.RTDB);
    expect(query).toBeInstanceOf(SerializedRealTimeQuery);
  });
});
