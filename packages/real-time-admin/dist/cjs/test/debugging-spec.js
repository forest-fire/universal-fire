"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
// tslint:disable-next-line:no-implicit-dependencies
const chai = __importStar(require("chai"));
const helpers = __importStar(require("./testing/helpers"));
const expect = chai.expect;
helpers.setupEnv();
describe("Debugging: ", () => {
    it('debugging set to "true" results in logging to STDOUT', async () => {
        const restore = helpers.captureStdout();
        const db = new index_1.DB({ debugging: true });
        await db.waitForConnection();
        await db.getValue("foo");
        const output = restore();
        expect(output).to.be.an("array");
        expect(output.some(el => el.indexOf("FIREBASE") !== -1), "expected FIREBASE to be in stdout").to.equal(true);
    });
    it.skip("debugging callback sends results to callback", async () => {
        const restore = helpers.captureStdout();
        let count = 0;
        const callback = (message) => {
            expect(message).to.be.a("string");
            count++;
        };
        const db = new index_1.DB({ debugging: callback });
        await db.waitForConnection();
        db.getValue("foo");
        db.set("foo2", "happy happy");
        const output = restore();
        expect(output.some(el => el.indexOf("FIREBASE") !== -1)).to.equal(false);
        expect(count).to.greaterThan(0);
    });
});
//# sourceMappingURL=debugging-spec.js.map