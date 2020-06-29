import { RealTimeClient } from '../src/index';
import { expect } from 'chai';

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

    expect(auth).to.be.an('object');
    expect(auth.signInAnonymously).to.be.a('function');
    expect(auth.signInWithEmailAndPassword).to.be.a('function');
    expect(auth.onAuthStateChanged).to.be.a('function');
  });
});
