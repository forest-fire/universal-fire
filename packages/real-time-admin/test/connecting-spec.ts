
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
      expect(db).toBeInstanceOf(RealTimeAdmin);
      expect(db.isConnected).toBe(true);
      expect(db.app).toBeDefined();
      expect(db.database).toBeDefined();
    });

    it('Connecting right after the first connection has the same result', async () => {
      const db = await RealTimeAdmin.connect();
      expect(db).toBeInstanceOf(RealTimeAdmin);
      expect(db.isConnected).toBe(true);
      expect(db.app).toBeDefined();
      expect(db.app.name).toBe('[DEFAULT]');
      expect(db.database).toBeDefined();
    });

    it('The firebase apps array has a single app setup', async () => {
      const db = await RealTimeAdmin.connect();
      expect(RealTimeAdmin.connections).toHaveLength(1);
    });

    it.skip(`Connection with a different name but same DB, doesn't increase count of connections`, async () => {
      const db = await RealTimeAdmin.connect({
        name: 'foobar',
        serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      expect(RealTimeAdmin.connections).lengthOf.toBe(1);
    });

    it.skip('Going offline disconnects', async () => {
      let db = await RealTimeAdmin.connect();
      db.goOffline();
      expect(RealTimeAdmin.connections).toHaveLength(0);
    });

    it('Accessing database after connection and reconnection works without error', async () => {
      const db = await RealTimeAdmin.connect();
      const testData = await db.getValue('/test-data');
      const db2 = await RealTimeAdmin.connect();
      const testData2 = await db.getValue('/test-data');
      expect(RealTimeAdmin.connections).toHaveLength(1);
      expect(testData).toBeInstanceOf('object');
      expect(testData2).toBeInstanceOf('object');
      const keys = Object.keys(testData);
      keys.forEach((key) => expect(testData[key]).toBe(testData2[key]));
    });
  }
});
