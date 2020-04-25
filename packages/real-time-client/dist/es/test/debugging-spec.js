// tslint:disable:no-implicit-dependencies
import { RealTimeClient } from '../src';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import config from './testing/fb-config';
const expect = chai.expect;
helpers.setupEnv();
describe.skip('Debugging: ', () => {
    it('"debugging: true" results in logging to STDOUT', async () => {
        const restore = helpers.captureStdout();
        const db = new RealTimeClient({ ...{ debugging: true }, ...config });
        await db.connect();
        const output = restore();
        expect(output).to.be.an('array');
        expect(output.some(el => el.indexOf('[FIREBASE]') !== -1), 'expected FIREBASE to be in stdout').to.equal(true);
    });
    it('"debugging: callback" sends results to callback', async () => {
        const restore = helpers.captureStdout();
        let count = 0;
        const callback = (message) => {
            expect(message).to.be.a('string');
            count++;
        };
        const db = new RealTimeClient({ ...{ debugging: callback }, ...config });
        await db.connect();
        const output = restore();
        expect(output.some(el => el.indexOf('[FIREBASE]') !== -1)).to.equal(false);
        expect(count).to.greaterThan(0);
    });
});
//# sourceMappingURL=debugging-spec.js.map