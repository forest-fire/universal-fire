/* eslint-disable @typescript-eslint/unbound-method */
import { RealTimeClient } from '../src/index';

const config = {
  apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
  authDomain: 'abstracted-admin.firebaseapp.com',
  databaseURL: 'https://abstracted-admin.firebaseio.com',
  projectId: 'abstracted-admin',
  storageBucket: 'abstracted-admin.appspot.com',
  messagingSenderId: '547394508788',
};

describe('Authentication', () => {
  it('auth property returns a working authentication object', async () => {
    const db = await RealTimeClient.connect(config);
    const auth = await db.auth();

    expect(typeof auth === 'object').toBeTrue();
    expect(typeof auth.signInAnonymously === 'function').toBeTrue();
    expect(typeof auth.signInWithEmailAndPassword === 'function').toBeTrue();
    expect(typeof auth.onAuthStateChanged === 'function').toBeTrue();
  });
});
