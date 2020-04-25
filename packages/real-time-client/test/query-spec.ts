import { DB } from "../src/db";
// tslint:disable-next-line:no-implicit-dependencies
import * as chai from "chai";
import { SerializedQuery } from "serialized-query";
import * as helpers from "./testing/helpers";
import { RealTimeDB } from "abstracted-firebase";

const expect = chai.expect;

interface IPerson {
  name: string;
  age: number;
}

describe("Query based Read ops:", () => {
  helpers.setupEnv();
  let db: RealTimeDB;
  const personMockGenerator = h => () => ({
    name: h.faker.name.firstName() + " " + h.faker.name.lastName(),
    age: h.faker.random.number({ min: 10, max: 99 })
  });
  beforeEach(async () => {
    db = await DB.connect({ mocking: true });
    db.mock.addSchema("person", personMockGenerator);
    db.mock.queueSchema("person", 20);
    db.mock.queueSchema("person", 5, { age: 100 });
    db.mock.queueSchema("person", 5, { age: 1 });
    db.mock.queueSchema("person", 3, { age: 3 });
    db.mock.generate();
    if (!process.env.MOCK) {
      await db.set("people", db.mock.db);
    }
  });

  it("getSnapshot() works with query passed in", async () => {
    let data = await db.getSnapshot("people");
    expect(data.numChildren()).to.equal(33); // baseline check
    const q = SerializedQuery.path("people")
      .orderByChild("age")
      .limitToFirst(5);
    data = await db.getSnapshot(q);
    expect(data.numChildren()).to.equal(5);
    // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
    expect(helpers.firstRecord(data.val()).age).to.equal(100);
    expect(helpers.lastRecord(data.val()).age).to.equal(100);
    const q2 = SerializedQuery.path("people")
      .orderByChild("age")
      .limitToLast(5);
    data = await db.getSnapshot(q2);
    expect(data.numChildren()).to.equal(5);
    expect(helpers.firstRecord(data.val()).age).to.equal(1);
    expect(helpers.lastRecord(data.val()).age).to.equal(1);
    const q3 = SerializedQuery.path("people")
      .orderByChild("age")
      .equalTo(3);
    data = await db.getSnapshot(q3);
    expect(data.numChildren()).to.equal(3);
    expect(helpers.firstRecord(data.val()).age).to.equal(3);
    expect(helpers.lastRecord(data.val()).age).to.equal(3);
  });

  it("getList() works with query passed in", async () => {
    let data = await db.getList<IPerson>("people");
    expect(data.length).to.equal(33); // baseline check

    const q = SerializedQuery.path("people")
      .orderByChild("age")
      .limitToFirst(5);
    data = await db.getList<IPerson>(q);
    expect(data.length).to.equal(5);
    data.map(d => d.age).map(age => expect(age).to.equal(100));

    const q2 = SerializedQuery.path("people")
      .orderByChild("age")
      .limitToLast(5);
    data = await db.getList<IPerson>(q2);
    expect(data.length).to.equal(5);
    data.map(d => d.age).map(age => expect(age).to.equal(1));

    const q3 = SerializedQuery.path("people")
      .orderByChild("age")
      .equalTo(3);
    data = await db.getList<IPerson>(q3);
    expect(data.length).to.equal(3);
    data.map(d => d.age).map(age => expect(age).to.equal(3));
  });

  it("getList() with limit query on orderByKey of scalar values", async () => {
    db.mock.updateDB({
      ages: {
        asdfasdfas: 13,
        dfddffdfd: 5,
        adsffdffdfd: 26,
        ddfdfdfd: 1,
        werqerqer: 2,
        erwrewrw: 100
      }
    });
    const query = SerializedQuery.path("ages")
      .orderByKey()
      .limitToFirst(3);
    const ages = await db.getList(query);

    expect(ages).to.have.lengthOf(3);
  });

  it("getList() with limit query on orderByValue", async () => {
    db.mock.updateDB({
      ages: {
        asdfasdfas: 13,
        dfddffdfd: 5,
        adsffdffdfd: 26,
        ddfdfdfd: 1,
        werqerqer: 2,
        erwrewrw: 100
      }
    });
    const query = SerializedQuery.path("ages")
      .orderByValue()
      .limitToFirst(3);
    const ages = await db.getList(query);
    expect(ages).to.have.lengthOf(3);
  });
});
