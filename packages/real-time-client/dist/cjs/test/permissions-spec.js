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
describe('Permissions', () => {
    it('setting to a path where write permissions are not allowed fails', async () => {
        const db = await src_1.RealTimeClient.connect(config);
        try {
            const result = await db.set('/no-write/foobar', "this shouldn't work");
            throw new Error('should not have reached this point due to permissions error');
        }
        catch (e) {
            chai_1.expect(e.message).to.include('no-write/foobar');
            chai_1.expect(e.name).to.equal('abstracted-firebase/permission-denied');
            chai_1.expect(e.code).to.equal('permission-denied');
        }
    });
    it('updating to a path where write permissions are not allowed fails', async () => {
        const db = await src_1.RealTimeClient.connect(config);
        try {
            const result = await db.update('/no-write/foobar', {
                message: "this shouldn't work"
            });
            throw new Error('should not have reached this point due to permissions error');
        }
        catch (e) {
            chai_1.expect(e.code).to.equal('permission-denied');
            chai_1.expect(e.name).to.equal('abstracted-firebase/permission-denied');
            chai_1.expect(e.message).to.include('no-write/foobar');
        }
    });
});
//# sourceMappingURL=permissions-spec.js.map