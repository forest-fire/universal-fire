// tslint:disable:no-implicit-dependencies
import { DB } from "../src/db";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import config from "./testing/fb-config";

const expect = chai.expect;
helpers.setupEnv();

describe("Basics: ", () => {
  it("Can connect to Firebase mock DB", async () => {
    const db = new DB({ mocking: true, mockData: { foo: "bar" } });
    await db.waitForConnection();
    expect(db.mock.db).to.be.an("object");
    expect(db.mock.db.foo).to.equal("bar");
    expect(db.isConnected).to.equal(true);
  });
  it("Can connect to a real Firebase DB", async () => {
    const db = new DB(config);
    expect(db.isConnected).to.equal(false);
    await db.waitForConnection();
    expect(db.isConnected).to.equal(true);
  });
  it("can list connected DB's", async () => {
    const dbs = await DB.connectedTo();
    expect(dbs).to.contain("abstracted-admin");
  });
});
