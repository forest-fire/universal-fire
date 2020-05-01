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
const common_types_1 = require("common-types");
const expect = chai.expect;
helpers.setupEnv();
describe('Basics: ', () => {
    it('Can connect to Firebase mock DB', async () => {
        const db = new src_1.RealTimeClient({ mocking: true, mockData: { foo: 'bar' } });
        await db.connect();
        expect(db.mock.db).to.be.an('object');
        expect(db.mock.db.foo).to.equal('bar');
        expect(db.isConnected).to.equal(true);
    });
    it('Can connect to a real Firebase DB', async () => {
        const db = await src_1.RealTimeClient.connect(fb_config_1.default);
        await common_types_1.wait(1000);
        expect(db.isConnected).to.equal(true, 'after using the connect() static initializer, the database should be connected');
    });
    it("can list connected DB's", async () => {
        const dbs = await src_1.RealTimeClient.connectedTo();
        expect(dbs).to.contain('abstracted-admin');
    });
});
//# sourceMappingURL=basics-spec.js.map