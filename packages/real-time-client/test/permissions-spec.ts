import { RealTimeClient } from '../src';

const config = {
  apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
  authDomain: 'abstracted-admin.firebaseapp.com',
  databaseURL: 'https://abstracted-admin.firebaseio.com',
  projectId: 'abstracted-admin',
  storageBucket: 'abstracted-admin.appspot.com',
  messagingSenderId: '547394508788',
};

describe('Permissions', () => {
  it('setting to a path where write permissions are not allowed fails', async () => {
    const db = await RealTimeClient.connect(config);

    try {
      const result = await db.set('/no-write/foobar', "this shouldn't work");
      throw new Error(
        'should not have reached this point due to permissions error'
      );
    } catch (e) {
      expect(e.message).toContain('no-write/foobar');
      expect(e.name).toBe('RealTimeDb/permission-denied');
      expect(e.code).toBe('permission-denied');
    }
  });

  it('updating to a path where write permissions are not allowed fails', async () => {
    const db = await RealTimeClient.connect(config);

    try {
      const result = await db.update('/no-write/foobar', {
        message: "this shouldn't work",
      });
      throw new Error(
        'should not have reached this point due to permissions error'
      );
    } catch (e) {
      expect(e.code).toBe('permission-denied');
      expect(e.name).toBe('RealTimeDb/permission-denied');
      expect(e.message).toContain('no-write/foobar');
    }
  });
});
