import { expect } from 'chai';
import { DB } from '../src/index';
import { RealTimeAdmin } from '@forest-fire/real-time-admin';

describe('DB class provides ability to instantiate and connect to SDKs', async () => {
  it('RealTimeAdmin can be instantiated', async () => {
    const db = await DB.connect(RealTimeAdmin, { mocking: true });
    expect(db).to.be.instanceOf(RealTimeAdmin);
  });
});
