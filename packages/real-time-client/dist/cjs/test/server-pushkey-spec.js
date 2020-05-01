"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const src_1 = require("../src");
const chai_1 = require("chai");
const config = {
    apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
    authDomain: 'abstracted-admin.firebaseapp.com',
    databaseURL: 'https://abstracted-admin.firebaseio.com',
    projectId: 'abstracted-admin',
    storageBucket: 'abstracted-admin.appspot.com',
    messagingSenderId: '547394508788'
};
describe('getPushKey() => ', () => {
    let db;
    before(async () => {
        db = await src_1.RealTimeClient.connect(config);
    });
    after(async () => {
        await db.remove('/pushKey');
    });
    it('getting pushkey retrieves a pushkey from the server', async () => {
        const key = await db.getPushKey('/pushKey/test');
        chai_1.expect(key).to.be.a('string');
        chai_1.expect(key.slice(0, 1)).to.equal('-');
    });
    it('pushing multiple keys with pushkey works and do not collide', async () => {
        const keys = ['one', 'two', 'three'];
        for await (const i of keys) {
            const key = await db.getPushKey('/pushKey/test');
            await db.set(`/pushKey/test/${key}`, Math.random());
        }
        const list = await db.getList('/pushKey/test');
        chai_1.expect(list)
            .to.be.an('array')
            .and.have.lengthOf(3);
    });
});
//# sourceMappingURL=server-pushkey-spec.js.map