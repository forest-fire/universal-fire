import { SerializedRealTimeQuery } from "../src/index";
import * as chai from "chai";
import { DB, RealTimeAdmin } from "universal-fire";
import { FireModel } from "firemodel";
import * as helpers from "./testing/helpers";
helpers.setupEnv();

helpers.setupEnv();
const expect = chai.expect;

describe("SerializedRealTimeQuery", () => {
  let mockDb: RealTimeAdmin;
  before(async () => {
    mockDb = await DB.connect(RealTimeAdmin, { mocking: true });
    // TODO: remove the comment below when we update FireModel to use the new
    // version if `universal-fire`.
    // @ts-ignore
    FireModel.defaultDb = mockDb;
  });
  it("instantiates", () => {
    const q = new SerializedRealTimeQuery("foo");
    expect(q).to.be.an.instanceOf(SerializedRealTimeQuery);
  });
  it("instantiate with path()", () => {
    const q = SerializedRealTimeQuery.path("foo");
    expect(q).to.be.an.instanceOf(SerializedRealTimeQuery);
  });

  it("instantiate without path, path set later", () => {
    const q = new SerializedRealTimeQuery();
    expect(q.path).to.equal("/");
    q.setPath("/foobar");
    expect(q.path).to.equal("/foobar");
  });

  it("same query structure gives same hashCode", async () => {
    const foo = new SerializedRealTimeQuery("/foo/bar").orderByChild("goober");
    const bar = new SerializedRealTimeQuery("/foo/bar").orderByChild("goober");
    expect(foo.hashCode()).to.equal(bar.hashCode());
    const foo2 = new SerializedRealTimeQuery("/foo/bar2")
      .orderByChild("goober")
      .limitToFirst(5);
    const bar2 = new SerializedRealTimeQuery("/foo/bar2")
      .orderByChild("goober")
      .limitToFirst(5);
    expect(foo2.hashCode()).to.equal(bar2.hashCode());
  });

  it("different query structure gives different hashCode", async () => {
    const foo2 = new SerializedRealTimeQuery("/foo/bar")
      .orderByChild("goober")
      .limitToFirst(5);
    const bar2 = new SerializedRealTimeQuery("/foo/bar").orderByChild("goober");
    expect(foo2.hashCode()).to.not.equal(bar2.hashCode());
  });

  it("identity property provides appropriate details", () => {
    const foo = new SerializedRealTimeQuery("/foo/bar").orderByChild("goober");
    expect(foo.identity).to.be.an("object");
    expect(foo.identity.orderBy).to.equal("orderByChild");
    expect(foo.identity.orderByKey).to.equal("goober");
    expect(foo.identity.limitToFirst).to.equal(undefined);
    expect(foo.identity.startAt).to.equal(undefined);
  });

  it("setting different props for equalTo and orderByChild behaves as expected", async () => {
    const q = new SerializedRealTimeQuery()
      .orderByChild("foobar")
      .equalTo("foo", "bar");
    expect(q.identity.equalToKey).is.equal("bar");
  });

  it("limitToFirst sets identity()", async () => {
    const q = new SerializedRealTimeQuery().orderByValue().limitToFirst(3);
    expect(q.identity.limitToFirst).is.equal(3);
  });

  it("limitToLast sets identity()", async () => {
    const q = new SerializedRealTimeQuery().orderByValue().limitToLast(3);
    expect(q.identity.limitToLast).is.equal(3);
  });
});