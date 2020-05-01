"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const src_1 = require("../src");
const chai = __importStar(require("chai"));
const helpers = __importStar(require("./testing/helpers"));
const fb_config_1 = __importDefault(require("./testing/fb-config"));
const expect = chai.expect;
helpers.setupEnv();
describe.skip('Debugging: ', () => {
    it('"debugging: true" results in logging to STDOUT', async () => {
        const restore = helpers.captureStdout();
        const db = new src_1.RealTimeClient({ ...{ debugging: true }, ...fb_config_1.default });
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
        const db = new src_1.RealTimeClient({ ...{ debugging: callback }, ...fb_config_1.default });
        await db.connect();
        const output = restore();
        expect(output.some(el => el.indexOf('[FIREBASE]') !== -1)).to.equal(false);
        expect(count).to.greaterThan(0);
    });
});
//# sourceMappingURL=debugging-spec.js.map