import { expect } from 'chai';
import { RealTimeAdmin } from '../src';
import { RealTimeClient } from '../dist/es';
import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { FirestoreClient as FSC } from '@forest-fire/firestore-client';

describe('DB class provides ability to instantiate and connect to SDKs', async () => {
  it('RealTimeAdmin can be instantiated', async () => {
    const db = await RealTimeAdmin({ mocking: true });
    expect(db).to.be.instanceOf(RTA);
  });
  it('RealTimeClient can be instantiated', async () => {
    const db = await RealTimeClient({ mocking: true });
    expect(db).to.be.instanceOf(RTC);
  });
  it('FirestoreClient can not (YET) be instantiated as a mock DB', async () => {
    try {
      const db = await RealTimeAdmin({ mocking: true });
      throw new Error(
        'The FirestoreClient can not be instantiated as a mock DB until the mock DB is implimented!'
      );
    } catch (e) {
      expect(e.code).is.equal('invalid-configuration');
    }
  });
});
