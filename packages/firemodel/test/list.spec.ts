import "reflect-metadata";

import * as helpers from "./testing/helpers";

import { IFmWatchEvent, IReduxAction, List, Record } from "~/index";
import { RealTimeAdmin, SerializedQuery, IDatabaseSdk } from "universal-fire";
import { Fixture } from "@forest-fire/fixture";
import { Car } from "./testing/Car";
import Company from "./testing/dynamicPaths/Company";
import { FireModel } from "~/index";
import { FmEvents } from "~/index";
import { Mock } from "@forest-fire/fixture";
import { Person } from "./testing/Person";

describe("List class: ", () => {
  let db: IDatabaseSdk<"RealTimeAdmin">;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
    List.defaultDb = db;
  });
  it("can instantiate with new operator", () => {
    const list = new List(Person);
    expect(list).toBeInstanceOf(List);
    expect(list.length).toBe(0);
    expect(list.modelName).toBe("person");
    expect(list.pluralName).toBe("people");
    expect(list.dbPath).toBe(`${list.META.dbOffset}/people`);
  });

  it("can instantiate with create() method", () => {
    const list = List.create(Person);
    expect(list).toBeInstanceOf(List);
    expect(list.length).toBe(0);
    expect(list.modelName).toBe("person");
    expect(list.pluralName).toBe("people");
    expect(list.dbPath).toBe(`${list.META.dbOffset}/people`);
  });

  it("Static dbPath() provides appropriate database path for Models", async () => {
    const car = List.dbPath(Car);
    expect(car).toBe("car-offset/cars");

    const dynamic = List.dbPath(Company, { group: "123" });
    expect(dynamic).toBe("123/testing/companies");
  });

  it("List can SET a dictionary of records", async () => {
    const list = (
      await List.set(Person, {
        joe: {
          name: "Joe",
          age: 14,
        },
        roger: {
          age: 22,
          name: "Roger",
        },
      })
    ).data;

    expect(list).toHaveLength(2);
    expect(list.map((i) => i.name)).toEqual(expect.arrayContaining(["Joe"]));
    expect(list.map((i) => i.name)).toEqual(expect.arrayContaining(["Roger"]));
    expect(list.map((i) => i.age)).toEqual(expect.arrayContaining([14]));
    expect(list.map((i) => i.age)).toEqual(expect.arrayContaining([22]));
    expect(typeof list[0].createdAt).toBe("number");
    expect(typeof list[1].createdAt).toBe("number");
  });

  it("can instantiate with all() method", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 25).generate();
    db.mock.store.setDb("", mockData);
    const list = await List.all(Person, { db });
    expect(list).toBeInstanceOf(List);
    expect(list.length).toBe(25);
    expect(list.modelName).toBe("person");
    expect(list.pluralName).toBe("people");
    expect(list.dbPath).toBe(`${list.META.dbOffset}/people`);
  });

  it("can instantiate with from() method", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 25).generate();
    db.mock.store.setDb("", mockData);

    const q = SerializedQuery.create<"RealTimeAdmin", Person>(db).limitToLast(
      5
    );
    const results = await List.fromQuery(Person, q, { db });
    expect(results.length).toBe(5);
  });

  it("can instantiate with a where() method", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture
      .queueSchema("person", 10)
      .queueSchema("person", 2, { age: 99 })
      .generate();
    db.mock.store.setDb("", mockData);

    const oldFolks = await List.where(Person, "age", 99);
    const youngFolks = await List.where(Person, "age", ["<", 90]);

    expect(oldFolks).toBeInstanceOf(List);
    expect(youngFolks).toBeInstanceOf(List);
    expect(oldFolks.length).toBe(2);
    expect(youngFolks.length).toBe(10);
  });

  it("can instantiate with first() and last() methods", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 30).generate();
    db.mock.store.setDb("", mockData);

    const first = await List.first(Person, 5);
    const last = await List.last(Person, 5);
    const firstCreatedDate = first.data[0].createdAt;
    const lastCreatedDate = last.data[0].createdAt;

    expect(first).toHaveLength(5);
    expect(last).toHaveLength(5);
    expect(firstCreatedDate).toBeLessThan(lastCreatedDate);
  });

  it("can instantiate with recent(), and inactive() methods", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 30).generate();
    db.mock.store.setDb("", mockData);

    const recent = await List.recent(Person, 6);
    const inactive = await List.inactive(Person, 4);
    const recentCreatedDate = recent.data[0].lastUpdated;
    const inactiveCreatedDate = inactive.data[0].lastUpdated;

    expect(recent).toHaveLength(6);
    expect(inactive).toHaveLength(4);
    expect(recentCreatedDate).toBeGreaterThan(inactiveCreatedDate);
  });

  it("can instantiate with since() returns correct results", async () => {
    const timestamp = new Date().getTime();
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 49 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: timestamp,
      }))
      .pathPrefix("authenticated");
    const mockData = fixture
      .queueSchema("person", 30, { lastUpdated: timestamp - 5000 })
      .generate();
    const mockData2 = fixture
      .queueSchema("person", 8, { lastUpdated: timestamp + 1000 })
      .generate();
    db.mock.store.setDb("", mockData);
    db.mock.store.setDb("", mockData2);

    const since = await List.since(Person, timestamp);

    expect(since).toHaveLength(8);
  });

  it("an instantiated List can call get() with a valid ID and get a Record", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 30).generate();
    db.mock.store.setDb("", mockData);

    const firstPersonId = helpers.firstKey(
      db.mock.store.state.authenticated.people
    );
    const list = await List.all(Person);
    const record = list.getRecord(firstPersonId);
    expect(typeof record).toEqual("object");
    expect(record).toBeInstanceOf(Record);
    expect(record.data).toBeInstanceOf(Person);
    expect(typeof record.data.name).toEqual("string");
  });

  it("list.get() with a valid ID retrieves the model data for that record", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 30).generate();
    db.mock.store.setDb("", mockData);

    const firstPersonId = helpers.firstKey(
      db.mock.store.state.authenticated.people
    );
    const list = await List.all(Person);
    const person = list.get(firstPersonId);
    expect(typeof person).toEqual("object");
    expect(typeof person.name).toEqual("string");
  });

  it("an instantiated List calling get() with an invalid ID throws an error", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 30).generate();
    db.mock.store.setDb("", mockData);
    const list = await List.all(Person);
    try {
      const record = list.getRecord("not-there");
      throw new Error("Invalid ID should have thrown error");
    } catch (e) {
      expect(e.code).toBe("not-found");
    }
  });

  it("list.get() returns undefined when non-existent id is passed", async () => {
    const fixture = Fixture.prepare();
    fixture
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    const mockData = fixture.queueSchema("person", 30).generate();
    db.mock.store.setDb("", mockData);
    const list = await List.all(Person);
    const record = list.get("not-there");
    expect(record).toBe(undefined);
  });

  it("using remove() able to change local state, db state, and state mgmt", async () => {
    const mockData = await Mock(Person).generate(10);
    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    const events: Array<IFmWatchEvent> = [];
    Record.dispatch = async (evt: IFmWatchEvent) => events.push(evt) as IReduxAction;
    const peeps = await List.all(Person);
    const id = peeps.data[1].id;
    const removed = await peeps.remove(id);
    expect(peeps).toHaveLength(9);
    const eventTypes = new Set(events.map((e) => e.type));

    expect(eventTypes).toContain(FmEvents.RECORD_REMOVED_CONFIRMATION);
    expect(eventTypes).toContain(FmEvents.RECORD_REMOVED_LOCALLY);

    const peeps2 = await List.all(Person);
    expect(peeps2).toHaveLength(9);
    const ids = new Set(peeps2.data.map((p) => p.id));
    expect(ids.has(id)).toBe(false);
  });

  it("using add() changes local state, db state, and state mgmt", async () => {
    const mockData = await Mock(Person).generate(10);
    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    const events: Array<IFmWatchEvent> = [];
    Record.dispatch = async (evt: IFmWatchEvent) => events.push(evt) as IReduxAction;
    const peeps = await List.all(Person);
    expect(peeps).toHaveLength(10);
    const newRec = await peeps.add({
      name: "Christy Brinkley",
      age: 50,
    });
    expect(peeps).toHaveLength(11);
    const ids = new Set(peeps.data.map((p) => p.id));
    expect(ids.has(newRec.id)).toBe(true);

    const eventTypes = events.map((e) => e.type);
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION])
    );
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_LOCALLY])
    );
  });
});
