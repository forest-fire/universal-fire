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
describe("DB Read operations: ", () => {
    helpers.setupEnv();
    const db = new src_1.DB();
    const dbMock = new src_1.DB({ mocking: true });
    before(async () => {
        await db.set("test-data", {
            one: "foo",
            two: "bar",
            three: "baz"
        });
        await db.set("test-records", {
            123456: {
                name: "Chris",
                age: 50
            },
            654321: {
                name: "Bob",
                age: 68
            }
        });
    });
    it("getSnapshot() gets statically set data in test DB", async () => {
        const data = await db.getSnapshot("test-data");
        expect(data.val()).to.be.an("object");
        expect(data.val().one).to.be.equal("foo");
        expect(data.val().two).to.be.equal("bar");
        expect(data.val().three).to.be.equal("baz");
        expect(data.key).to.equal("test-data");
    });
    it("getValue() gets statically set data in test DB", async () => {
        const data = await db.getValue("test-data");
        expect(data).to.be.an("object");
        expect(data.one).to.be.equal("foo");
        expect(data.two).to.be.equal("bar");
        expect(data.three).to.be.equal("baz");
    });
    it("getRecord() gets statically set data in test DB", async () => {
        const record = await db.getRecord("/test-records/123456");
        expect(record).to.be.an("object");
        expect(record.id).to.be.equal("123456");
        expect(record.name).to.be.equal("Chris");
        expect(record.age).to.be.equal(50);
    });
});
//# sourceMappingURL=db-read-ops-spec.js.map