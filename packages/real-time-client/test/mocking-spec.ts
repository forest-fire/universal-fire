// tslint:disable:no-implicit-dependencies
import { DB } from "../src/db";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
helpers.setupEnv();
const config = {
  apiKey: "AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM",
  authDomain: "abstracted-admin.firebaseapp.com",
  databaseURL: "https://abstracted-admin.firebaseio.com",
  projectId: "abstracted-admin",
  storageBucket: "abstracted-admin.appspot.com",
  messagingSenderId: "547394508788",
};

const animalMocker = (h) => () => ({
  type: h.faker.random.arrayElement(["cat", "dog", "parrot"]),
  name: h.faker.name.firstName(),
  age: h.faker.random.number({ min: 1, max: 15 }),
});

describe("Mocking", () => {
  let mockDb: DB;
  beforeEach(async () => {
    mockDb = new DB({ mocking: true });
    await mockDb.waitForConnection();
  });
  it("ref() returns a mock reference", () => {
    expect(mockDb.ref("foo")).to.have.property("once");
  });

  it("getSnapshot() returns a mock snapshot", async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getSnapshot("/animals");
    expect(animals.numChildren()).to.equal(10);
    mockDb.mock.queueSchema("animal", 5).generate();
    const moreAnimals = await mockDb.getSnapshot("/animals");
    expect(moreAnimals.numChildren()).to.equal(15);
  });

  it("getValue() returns a value from mock DB", async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getValue("/animals");
    expect(animals).to.be.an("object");
    expect(helpers.length(animals)).to.equal(10);
    expect(helpers.firstRecord(animals)).to.have.property("id");
    expect(helpers.firstRecord(animals)).to.have.property("name");
    expect(helpers.firstRecord(animals)).to.have.property("age");
  });

  it("getRecord() returns a record from mock DB", async () => {
    addAnimals(mockDb, 10);
    const firstKey = helpers.firstKey(mockDb.mock.db.animals);
    const animal = await mockDb.getRecord(`/animals/${firstKey}`);
    expect(animal).to.be.an("object");
    expect(animal.id).to.equal(firstKey);
    expect(animal).to.have.property("name");
    expect(animal).to.have.property("age");
  });

  it("getRecord() returns a record from mock DB with bespoke id prop", async () => {
    addAnimals(mockDb, 10);
    const firstKey = helpers.firstKey(mockDb.mock.db.animals);
    const animal = await mockDb.getRecord(`/animals/${firstKey}`, "key");

    expect(animal).to.be.an("object");
    expect(animal).to.have.property("key");
    expect(animal).to.have.property("name");
    expect(animal).to.have.property("age");
  });

  it("getList() returns an array of records", async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getList("/animals");
    expect(animals).to.be.an("array");
    expect(animals).has.lengthOf(10);
    expect(animals[0]).to.have.property("id");
    expect(animals[0]).to.have.property("name");
    expect(animals[0]).to.have.property("age");
  });

  it('getList() returns an array of records, with bespoke "id" property', async () => {
    addAnimals(mockDb, 10);
    const animals = await mockDb.getList("/animals", "key");
    expect(animals).to.be.an("array");
    expect(animals).has.lengthOf(10);
    expect(animals[0]).to.have.property("key");
    expect(animals[0]).to.have.property("name");
    expect(animals[0]).to.have.property("age");
  });

  it("set() sets to the mock DB", async () => {
    mockDb.set("/people/abcd", {
      name: "Frank Black",
      age: 45,
    });
    const people = await mockDb.getRecord("/people/abcd");
    expect(people).to.have.property("id");
    expect(people).to.have.property("name");
    expect(people).to.have.property("age");
  });

  it("update() updates the mock DB", async () => {
    mockDb.mock.updateDB({
      people: {
        abcd: {
          name: "Frank Black",
          age: 45,
        },
      },
    });
    mockDb.update("/people/abcd", { age: 14 });
    const people = await mockDb.getRecord("/people/abcd");
    expect(people).to.be.an("object");
    expect(people).to.have.property("id");
    expect(people).to.have.property("name");
    expect(people).to.have.property("age");
    expect(people.name).to.equal("Frank Black");
    expect(people.age).to.equal(14);
  });

  it("push() pushes records into the mock DB", async () => {
    mockDb.push("/people", {
      name: "Frank Black",
      age: 45,
    });
    const people = await mockDb.getList("/people");
    expect(people).to.be.an("array");
    expect(people).has.lengthOf(1);
    expect(helpers.firstRecord(people)).to.have.property("id");
    expect(helpers.firstRecord(people)).to.have.property("name");
    expect(helpers.firstRecord(people)).to.have.property("age");
    expect(helpers.firstRecord(people).age).to.equal(45);
  });

  it("read operations on mock with a schema prefix are offset correctly", async () => {
    mockDb.mock
      .addSchema("meal", (h) => () => ({
        name: h.faker.random.arrayElement(["breakfast", "lunch", "dinner"]),
        datetime: h.faker.date.recent(),
      }))
      .pathPrefix("authenticated");
    mockDb.mock.queueSchema("meal", 10);
    mockDb.mock.generate();

    expect(mockDb.mock.db.authenticated).to.be.an("object");
    expect(mockDb.mock.db.authenticated.meals).to.be.an("object");
    const list = await mockDb.getList("/authenticated/meals");
    expect(list.length).to.equal(10);
  });

  it("setting initial DB state works", async () => {
    const db2 = await DB.connect({
      mocking: true,
      mockData: {
        foo: "bar",
      },
    });
    expect(db2.mock.db.foo).to.equal("bar");
  });

  it("setting auth() to accept anonymous works", async () => {
    const db3 = await DB.connect({
      mocking: true,
      mockAuth: {
        providers: ["anonymous"],
      },
    });
    const auth = await db3.auth();
    const user = await auth.signInAnonymously();
    expect(user.user.uid).to.be.a("string");
  });
});

function addAnimals(db: DB, count: number) {
  db.mock.addSchema("animal", animalMocker);
  db.mock.queueSchema("animal", count);
  db.mock.generate();
}
