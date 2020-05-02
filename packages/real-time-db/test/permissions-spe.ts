// tslint:disable:no-implicit-dependencies
import { DB } from 'abstracted-client';
import { expect } from 'chai';

const clientConfig = {
  apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
  authDomain: 'abstracted-admin.firebaseapp.com',
  databaseURL: 'https://abstracted-admin.firebaseio.com',
  projectId: 'abstracted-admin',
  storageBucket: 'abstracted-admin.appspot.com',
  messagingSenderId: '547394508788'
};

describe('Check that permissions errors work when using client library', () => {
  it('can not write to a protected path', () => {
    const db = DB.connect(clientConfig);
  });
});
