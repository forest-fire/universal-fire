import { expect } from 'chai';
import {
  DB,
  RealTimeClient,
  FirestoreClient,
  RealTimeAdmin
} from '../src/index';

describe('DB class provides ability to instantiate and connect to SDKs', async () => {
  it('RealTimeAdmin can be instantiated', async () => {
    const db = await DB.connect(RealTimeAdmin, { mocking: true });
    expect(db).to.be.instanceOf(RealTimeAdmin);
  });
  it('RealTimeClient can be instantiated', async () => {
    const db = await DB.connect(RealTimeClient, { mocking: true });
    expect(db).to.be.instanceOf(RealTimeClient);
  });
  it('FirestoreClient can be instantiated', async () => {
    const db = await DB.connect(FirestoreClient, { mocking: true });
    expect(db).to.be.instanceOf(FirestoreClient);
  });
});
