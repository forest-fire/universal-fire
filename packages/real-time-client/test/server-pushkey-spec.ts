// tslint:disable:no-implicit-dependencies
import { DB } from "../src/db";
import * as chai from "chai";
const expect = chai.expect;

const config = {
  apiKey: "AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM",
  authDomain: "abstracted-admin.firebaseapp.com",
  databaseURL: "https://abstracted-admin.firebaseio.com",
  projectId: "abstracted-admin",
  storageBucket: "abstracted-admin.appspot.com",
  messagingSenderId: "547394508788"
};

describe("getPushKey() => ", () => {
  let db: DB;
  before(async () => {
    db = await DB.connect(config);
  });

  after(async () => {
    await db.remove("/pushKey");
  });

  it("getting pushkey retrieves a pushkey from the server", async () => {
    const key = await db.getPushKey("/pushKey/test");
    expect(key).to.be.a("string");
    expect(key.slice(0, 1)).to.equal("-");
  });

  it("pushing multiple keys with pushkey works and do not collide", async () => {
    const keys = ["one", "two", "three"];
    for await (const i of keys) {
      const key = await db.getPushKey("/pushKey/test");
      await db.set(`/pushKey/test/${key}`, Math.random());
    }

    const list = await db.getList("/pushKey/test");
    expect(list)
      .to.be.an("array")
      .and.have.lengthOf(3);
  });
});
