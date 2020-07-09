// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '../src';

const config = {
  apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
  authDomain: 'abstracted-admin.firebaseapp.com',
  databaseURL: 'https://abstracted-admin.firebaseio.com',
  projectId: 'abstracted-admin',
  storageBucket: 'abstracted-admin.appspot.com',
  messagingSenderId: '547394508788',
};

describe('getPushKey() => ', () => {
  let db: RealTimeClient;
  beforeAll(async () => {
    db = await RealTimeClient.connect(config);
  });

  afterAll(async () => {
    await db.remove('/pushKey');
  });

  it('getting pushkey retrieves a pushkey from the server', async () => {
    const key = await db.getPushKey('/pushKey/test');
    expect(typeof key).toEqual('string');
    expect(key.slice(0, 1)).toBe('-');
  });

  it('pushing multiple keys with pushkey works and do not collide', async () => {
    const keys = ['one', 'two', 'three'];
    for await (const i of keys) {
      const key = await db.getPushKey('/pushKey/test');
      await db.set(`/pushKey/test/${key}`, Math.random());
    }

    const list = await db.getList('/pushKey/test');
    expect(list).toBeArray();
    expect(list).toHaveLength(3);
  });
});
