
import { RealTimeAdmin } from '../src';
import { setupEnv } from './testing/helpers';

setupEnv();

function envVarsReady() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn(
      `Certain tests will be skipped in FirestoreAdmin because the Firebase service account is not provided by ENV variables.`
    );
    return false;
  }
  return true;
}
describe(`Connect to the database but don't re-connect`, () => {
  if (envVarsReady()) {
    it('Connecting once works fine and isConnected() getter reports connection', async () => {
      const db = await RealTimeAdmin.connect();
      expect(db).to.be.an.instanceof(RealTimeAdmin);
      expect(db.isConnected).to.be.true;
      expect(db.app).is.not.undefined;
      expect(db.database).is.not.undefined;
    });

    it('Connecting right after the first connection has the same result', async () => {
      const db = await RealTimeAdmin.connect();
      expect(db).to.be.an.instanceof(RealTimeAdmin);
      expect(db.isConnected).to.be.true;
      expect(db.app).is.not.undefined;
      expect(db.app.name).to.equal('[DEFAULT]');
      expect(db.database).is.not.undefined;
    });

    it('The firebase apps array has a single app setup', async () => {
      const db = await RealTimeAdmin.connect();
      expect(RealTimeAdmin.connections).to.have.lengthOf(1);
    });

    it.skip(`Connection with a different name but same DB, doesn't increase count of connections`, async () => {
      const db = await RealTimeAdmin.connect({
        name: 'foobar',
        serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      expect(RealTimeAdmin.connections).lengthOf.to.equal(1);
    });

    it.skip('Going offline disconnects', async () => {
      let db = await RealTimeAdmin.connect();
      db.goOffline();
      expect(RealTimeAdmin.connections).to.have.lengthOf(0);
    });

    it('Accessing database after connection and reconnection works without error', async () => {
      const db = await RealTimeAdmin.connect();
      const testData = await db.getValue('/test-data');
      const db2 = await RealTimeAdmin.connect();
      const testData2 = await db.getValue('/test-data');
      expect(RealTimeAdmin.connections).to.have.lengthOf(1);
      expect(testData).to.be.an('object');
      expect(testData2).to.be.an('object');
      const keys = Object.keys(testData);
      keys.forEach((key) => expect(testData[key]).to.equal(testData2[key]));
    });
  }
});
