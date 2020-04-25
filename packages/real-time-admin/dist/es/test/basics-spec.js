// tslint:disable:no-implicit-dependencies
import { DB } from "../src";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
helpers.setupEnv();
describe("Basics: ", () => {
    it("Can connect to mock DB", async () => {
        const db = new DB({ mocking: true });
        expect(db.isConnected).to.equal(false);
        await db.waitForConnection();
        expect(db.isConnected).to.equal(true);
    });
    it("Can connect to Firebase DB", async () => {
        const db = new DB();
        expect(db.isConnected).to.be.a("boolean");
        await db.waitForConnection();
        expect(db.isConnected).to.equal(true);
    });
});
//# sourceMappingURL=basics-spec.js.map