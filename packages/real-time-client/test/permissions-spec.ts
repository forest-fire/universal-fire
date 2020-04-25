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

describe("Permissions", () => {
  it("setting to a path where write permissions are not allowed fails", async () => {
    const db = await DB.connect(config);

    try {
      const result = await db.set("/no-write/foobar", "this shouldn't work");
      throw new Error("should not have reached this point due to permissions error");
    } catch (e) {
      expect(e.message).to.include("no-write/foobar");
      expect(e.name).to.equal("abstracted-firebase/permission-denied");
      expect(e.code).to.equal("permission-denied");
    }
  });

  it("updating to a path where write permissions are not allowed fails", async () => {
    const db = await DB.connect(config);

    try {
      const result = await db.update("/no-write/foobar", {
        message: "this shouldn't work"
      });
      throw new Error("should not have reached this point due to permissions error");
    } catch (e) {
      expect(e.code).to.equal("permission-denied");
      expect(e.name).to.equal("abstracted-firebase/permission-denied");
      expect(e.message).to.include("no-write/foobar");
    }
  });
});
