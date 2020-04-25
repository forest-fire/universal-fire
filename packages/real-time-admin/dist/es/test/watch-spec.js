// tslint:disable:no-implicit-dependencies
import { DB as Admin } from "../src/db";
import { setupEnv } from "./testing/helpers";
import * as chai from "chai";
const expect = chai.expect;
setupEnv();
describe("Watch →", () => {
    it("watcher picks up events", async () => {
        const db = await Admin.connect();
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