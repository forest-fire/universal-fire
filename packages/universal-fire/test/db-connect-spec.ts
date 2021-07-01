// import { RealTimeAdmin } from '../src';
import { FirestoreClient, RealTimeClient } from '../dist/es/index';


describe('DB class provides ability to instantiate and connect to SDKs', async () => {
  it.skip('RealTimeAdmin can be instantiated', async () => {
    // const db = await RealTimeAdmin({ mocking: true });
    // expect(db).to.be.instanceOf(RTA);
  });
  it('RealTimeClient can be instantiated', async () => {
    const db = new RealTimeClient();
    expect(db).to.be.instanceOf(RealTimeClient);
  });
  it('FirestoreClient be instantiated', async () => {
    try {
      const db = new FirestoreClient();
      expect(db).to.be.instanceOf(FirestoreClient);
    } catch (e) {
      expect(e.code).is.equal('invalid-configuration');
    }
  });
});
