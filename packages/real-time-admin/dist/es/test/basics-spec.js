// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
helpers.setupEnv();
describe('Basics: ', () => {
    it('Can connect to mock DB', async () => {
        const db = new RealTimeAdmin({ mocking: true });
        expect(db.isConnected).to.equal(false);
        await db.connect();
        expect(db.isConnected).to.equal(true);
    });
    it('Can connect to Firebase DB', async () => {
        const db = new RealTimeAdmin();
        expect(db.isConnected).to.be.a('boolean');
        await db.connect();
        expect(db.isConnected).to.equal(true);
    });
});
//# sourceMappingURL=basics-spec.js.map