"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const src_1 = require("../src");
const chai = __importStar(require("chai"));
const helpers = __importStar(require("./testing/helpers"));
const expect = chai.expect;
helpers.setupEnv();
describe('Basics: ', () => {
    it('Can connect to mock DB', async () => {
        const db = await src_1.RealTimeAdmin.connect({ mocking: true });
        expect(db.isConnected).to.equal(false);
        await db.connect();
        expect(db.isConnected).to.equal(true);
    });
    it('Can connect to Firebase DB', async () => {
        const db = new src_1.RealTimeAdmin();
        expect(db.isConnected).to.be.a('boolean');
        await db.connect();
        expect(db.isConnected).to.equal(true);
    });
});
//# sourceMappingURL=basics-spec.js.map