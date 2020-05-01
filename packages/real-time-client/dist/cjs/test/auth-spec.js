"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const index_1 = require("../src/index");
const chai_1 = require("chai");
const config = {
    apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
    authDomain: 'abstracted-admin.firebaseapp.com',
    databaseURL: 'https://abstracted-admin.firebaseio.com',
    projectId: 'abstracted-admin',
    storageBucket: 'abstracted-admin.appspot.com',
    messagingSenderId: '547394508788'
};
describe('Authentication', () => {
    it('auth property returns a working authentication object', async () => {
        const db = await index_1.RealTimeClient.connect(config);
        const auth = await db.auth();
        chai_1.expect(auth).to.be.an('object');
        chai_1.expect(auth.signInAnonymously).to.be.a('function');
        chai_1.expect(auth.signInWithEmailAndPassword).to.be.a('function');
        chai_1.expect(auth.onAuthStateChanged).to.be.a('function');
    });
});
//# sourceMappingURL=auth-spec.js.map