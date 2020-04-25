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
const src_1 = require("../src/");
const helpers = __importStar(require("./testing/helpers"));
const chai_1 = require("chai");
helpers.setupEnv();
describe("Admin Auth API", () => {
    it("before connecting throws error", async () => {
        const db = new src_1.DB();
        try {
            const fail = await db.auth();
            throw new Error("Should have failed");
        }
        catch (e) {
            chai_1.expect(e.code, `Expected error code to be "not-ready" [ ${e.message} ]`).to.equal("not-ready");
        }
    });
    it("after connecting can reference auth", async () => {
        const db = await src_1.DB.connect();
        const success = await db.auth();
        chai_1.expect(success).to.be.an("object");
        chai_1.expect(success.createCustomToken).to.be.a("function");
    });
});
//# sourceMappingURL=auth-spec.js.map