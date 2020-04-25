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
const db_1 = require("../src/db");
const helpers_1 = require("./testing/helpers");
const chai = __importStar(require("chai"));
const expect = chai.expect;
helpers_1.setupEnv();
describe("Watch →", () => {
    it("watcher picks up events", async () => {
        const db = await db_1.DB.connect();
        const events = [];
        const dispatch = (evt) => events.push(evt);
        db.watch("/foo2/bar4", "value", dispatch);
        await db.set("/foo2/bar4", {
            name: "Henry",
            age: 55
        });
        await db.update("/foo2/bar4", {
            age: 65
        });
        await db.remove("/foo2/bar4");
        expect(events).to.have.lengthOf(3);
    });
});
//# sourceMappingURL=watch-spec.js.map