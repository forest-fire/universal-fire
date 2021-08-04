import {
  FireModel,
  FmEvents,
  IReduxAction,
  List,
  Record,
  Watch,
} from "~/index";
import { IDatabaseSdk, ISdk, SDK } from "@forest-fire/types";
import { Mock } from "@forest-fire/fixture";
import { firstKey, firstRecord, lastRecord } from "./testing/helpers";
import { RealTimeAdmin } from "universal-fire";
import Company from "./testing/dynamicPaths/Company";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";
import Hobby from "./testing/dynamicPaths/Hobby";
import { HumanAttribute } from "./testing/dynamicPaths/HumanAttribute";
import { IDictionary } from "common-types";

describe("Dynamic offsets reflected in path", () => {
  let db: IDatabaseSdk;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("A single dynamic offset is added to dynamic offset", async () => {
    const person = await Record.add(DeepPerson, {
      name: {
        first: "Bob",
        last: "Marley",
      },
      age: 60,
      group: "foobar",
      phoneNumber: "555-1212",
    });

    expect(person.META.dbOffset).toBe("/group/:group/testing");
    expect(person.dynamicPathComponents).toContain("group");
    expect(person.dbPath).toContain(`${person.data.group}/testing`);
  });

  it("Multiple dynamic offsets are included in dbPath", async () => {
    const person = await Record.add(DeeperPerson, {
      name: {
        first: "Bob",
        last: "Marley",
      },
      age: 60,
      group: "foo",
      subGroup: "bar",
      phoneNumber: "555-1212",
    });

    expect(person.META.dbOffset).toBe(":group/:subGroup/testing");
    expect(person.dynamicPathComponents).toContain("subGroup");
    expect(person.dbPath).toContain(
      `${person.data.group}/${person.data.subGroup}/testing`
    );
  });

  it("Multiple dynamic offsets are used to set and get the correct path in the DB", async () => {
    const person = await Record.add(DeeperPerson, {
      name: {
        first: "Bob",
        last: "Marley",
      },
      age: 60,
      group: "foo",
      subGroup: "bar",
      phoneNumber: "555-1212",
    });


    expect(typeof db.mock.store.state.foo.bar.testing).toEqual("object");
    const pathToRecord =
      db.mock.store.state.foo.bar.testing.deeperPeople[person.id];
    expect(typeof pathToRecord).toEqual("object");
    expect(pathToRecord.age).toBe(person.data.age);

    const p2 = await Record.get(DeeperPerson, {
      id: person.id,
      group: person.data.group,
      subGroup: person.data.subGroup,
    });

    expect(p2.id).toBe(person.id);
    expect(p2.data.age).toBe(person.data.age);
  });
});

describe("Dynamic offsets work with relationships", () => {
  let person: Record<ISdk, DeepPerson>;
  let db: IDatabaseSdk;
  let hobbies: List<SDK.RealTimeAdmin, Hobby>;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });

    FireModel.defaultDb = db;
    person = await Record.add(DeepPerson, {
      name: {
        first: "Joe",
        last: "Blow",
      },
      age: 30,
      group: "test",
      phoneNumber: "555-1234",
    });
    const mockData = await Mock(Hobby).generate(4);
    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    hobbies = await List.all(Hobby);
  });

  it("addToRelationship works for M:M (where FK is without dynamic segment)", async () => {
    await person.addToRelationship("hobbies", hobbies.data[0].id);
    // FK reference should be standard ID key
    expect(person.data.hobbies).toHaveProperty(hobbies.data[0].id);
    const hobby = await Record.get(Hobby, hobbies.data[0].id);
    // FK model should have composite key pointing back to DeepPerson
    expect(firstKey(hobby.data.practitioners)).toBe(`${person.id}::group:test`);
  });

  it("addToRelationship works for M:M (FK has shared dynamic segment; using implicit composite key)", async () => {
    const motherId = (
      await Mock(DeepPerson).generate(1, {
        age: 55,
        group: "test",
      })
    ).pop();
    const fatherId = (
      await Mock(DeepPerson).generate(1, {
        age: 61,
        group: "test",
      })
    ).pop();

    console.log(fatherId, motherId);

    await person.addToRelationship("parents", [
      motherId.compositeKey,
      fatherId.compositeKey,
    ]);
  });

  it("addToRelationshipo works for M:M (FK has shared dynamic segment; using explicit composite key)", async () => {
    const motherId = (
      await Mock(DeepPerson).generate(1, {
        age: 55,
        group: "test",
      })
    ).pop();
    const fatherId = (
      await Mock(DeepPerson).generate(1, {
        age: 61,
        group: "test",
      })
    ).pop();
    let mother = await Record.get(DeepPerson, {
      id: motherId.id,
      group: "test",
    });
    let father = await Record.get(DeepPerson, {
      id: fatherId.id,
      group: "test",
    });

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey,
    ]);

    // refresh records
    person = await Record.get(DeepPerson, `${person.id}::group:test`);
    mother = await Record.get(DeepPerson, mother.compositeKey);
    father = await Record.get(DeepPerson, father.compositeKey);

    // test
    expect(person.data.parents).toHaveProperty(mother.compositeKeyRef);
    expect(person.data.parents).toHaveProperty(father.compositeKeyRef);

    expect(mother.data.children).toHaveProperty(person.compositeKeyRef);
    expect(father.data.children).toHaveProperty(person.compositeKeyRef);
  });

  it("addToRelationshipo works for M:M (FK has different dynamic segment; using explicit composite key)", async () => {
    const motherId = (
      await Mock(DeepPerson).generate(1, {
        age: 55,
        group: "test",
      })
    ).pop();
    const fatherId = (
      await Mock(DeepPerson).generate(1, {
        age: 61,
        group: "test",
      })
    ).pop();
    let mother = await Record.get(DeepPerson, `${motherId.id}::group:test2`);
    let father = await Record.get(DeepPerson, `${fatherId.id}::group:test2`);

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey,
    ]);

    // refresh records
    person = await Record.get(DeepPerson, `${person.id}::group:test`);
    mother = await Record.get(DeepPerson, mother.compositeKey);
    father = await Record.get(DeepPerson, father.compositeKey);

    // test
    expect(person.data.parents).toHaveProperty(mother.compositeKeyRef);
    expect(person.data.parents).toHaveProperty(father.compositeKeyRef);

    expect(mother.data.children).toHaveProperty(person.compositeKeyRef);
    expect(father.data.children).toHaveProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is on same dynamic path)", async () => {
    let company = await Record.add(Company, {
      name: "acme",
      state: "CA",
      group: "test",
      employees: {},
    });
    person.setRelationship("employer", company.compositeKeyRef);

    company = await Record.get(Company, company.compositeKey);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.employer).toBe(company.compositeKeyRef);
    expect(company.data.employees).toHaveProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is on different dynamic path)", async () => {
    let company = await Record.add(Company, {
      name: "acme",
      state: "CA",
      group: "test2",
      employees: {},
    });
    person.setRelationship("employer", company.compositeKeyRef);

    company = await Record.get(Company, company.compositeKeyRef);
    person = await Record.get(DeepPerson, person.compositeKeyRef);

    expect(person.data.employer).toBe(company.compositeKeyRef);
    expect(company.data.employees).toHaveProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is not on a dynamic path)", async () => {
    let attribute = await Record.add(HumanAttribute, {
      attribute: "smart",
      category: "abc",
    });

    person.addToRelationship("attributes", attribute.compositeKeyRef);

    attribute = await Record.get(HumanAttribute, attribute.compositeKeyRef);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.attributes).toHaveProperty(attribute.compositeKeyRef);
  });
});

describe("LIST uses static offsets() with static API methods", () => {
  let db: IDatabaseSdk;
  beforeAll(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
    db.mock.store.reset();
  });

  it("List.all works with offsets", async () => {
    const test1 = await Mock(DeepPerson).generate(3, { group: "test" });
    const test2 = await Mock(DeepPerson).generate(5, { group: "test2" });
    const test3 = await Mock(DeepPerson).generate(5, { group: "test3" });
    const mockData = [...test1, ...test2, ...test3];

    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });

    const people = await List.all(DeepPerson, { offsets: { group: "test" } });
    expect(people.length).toBe(3);
  });

  it("List.where works with offsets", async () => {
    const test1 = await Mock(DeepPerson).generate(3, {
      group: "test",
      age: 32,
    });
    const test2 = await Mock(DeepPerson).generate(6, {
      group: "test",
      age: 45,
    });
    const test3 = await Mock(DeepPerson).generate(5, {
      group: "test2",
      age: 45,
    });

    const mockData = [...test1, ...test2, ...test3];

    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });

    const people = await List.where(DeepPerson, "age", 45, {
      offsets: { group: "test" },
    });

    expect(people.length).toEqual(6);
    expect(people.filter((i) => i.age === 45)).toHaveLength(6);
  });
});

describe("MOCK uses dynamic dbOffsets", () => {
  let db: IDatabaseSdk;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
    db.mock.store.reset();
  });

  it("Mock() by default does not build out relationships", async () => {
    const mockData = await Mock(DeepPerson).generate(2, { group: "test" });

    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });

    const first = firstRecord(
      db.mock.store.state.group.test.testing.deepPeople
    );
    const last = lastRecord(db.mock.store.state.group.test.testing.deepPeople);
    expect(typeof first.hobbies).toEqual("object");
    expect(Object.keys(first.hobbies)).toHaveLength(0);
    expect(typeof last.hobbies).toEqual("object");
    expect(Object.keys(last.hobbies)).toHaveLength(0);
  });

  it("Mock() with 'createRelationshipLinks' adds fks but records it points does not exist", async () => {
    const mockData = await Mock(DeepPerson)
      .createRelationshipLinks()
      .generate(2, { group: "test" });

    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });

    const first = firstRecord(
      db.mock.store.state.group.test.testing.deepPeople
    );
    const last = lastRecord(db.mock.store.state.group.test.testing.deepPeople);
    expect(typeof first.hobbies).toEqual("object");
    expect(Object.keys(first.hobbies)).toHaveLength(2);
    expect(typeof last.hobbies).toEqual("object");
    expect(Object.keys(last.hobbies)).toHaveLength(2);
  });

  it("Mock() generates mocks on dynamic path", async () => {
    const mockData = await Mock(DeepPerson)
      .followRelationshipLinks()
      .generate(2, { group: "test" });

    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });

    expect(typeof db.mock.store.state.group.test.testing.deepPeople).toEqual(
      "object"
    );
    expect(typeof db.mock.store.state.hobbies).toEqual("object");
    expect(typeof db.mock.store.state.attributes).toEqual("object");
    const attributeKey = firstKey(db.mock.store.state.attributes);
    const attributes =
      db.mock.store.state.attributes[attributeKey].humanAttributes;
    const firstAttribute = attributes[firstKey(attributes)];
    // eslint-disable-next-line no-prototype-builtins
    expect(firstAttribute.hasOwnProperty("attribute")).toBeTruthy();
    expect(typeof db.mock.store.state.test.testing.companies).toEqual("object");
  });

  it("Mock() mocks on dynamic path without relationships rendered", async () => {
    const mockData = await Mock(DeepPerson).generate(2, { group: "test" });
    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    expect(
      typeof firstRecord(db.mock.store.state.group.test.testing.deepPeople).age
    ).toBe("number");
    fkStructuralChecksForHasMany(
      db.mock.store.state.group.test.testing.deepPeople
    );
  });

  it("Mock() mocks on dynamic path and creates appropriate FK with using createRelationshipLinks()", async () => {
    const mockData = await Mock(DeepPerson)
      .createRelationshipLinks()
      .generate(2, { group: "test" });
    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    fkStructuralChecksForHasMany(
      db.mock.store.state.group.test.testing.deepPeople
    );
  });

  it("Mock() mocks on dynamic path and creates appropriate FK bi-directionally with using followRelationshipLinks()", async () => {
    const mockData = await Mock(DeepPerson)
      .followRelationshipLinks()
      .generate(2, { group: "test" });

    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    // basics
    expect(typeof db.mock.store.state.group.test.testing.deepPeople).toBe(
      "object"
    );
    expect(typeof db.mock.store.state.hobbies).toBe("object");
    expect(typeof db.mock.store.state.test.testing.companies).toBe("object");
    // FK checks
    fkStructuralChecksForHasMany(
      db.mock.store.state.group.test.testing.deepPeople
    );

    fkPropertyStructureForHasMany(
      db.mock.store.state.group.test.testing.deepPeople,
      ["parents", "children", "practitioners"],
      true
    );
    fkPropertyStructureForHasMany(
      db.mock.store.state.group.test.testing.deepPeople,
      ["hobby"],
      false
    );
    fkPropertyStructureForHasOne(
      db.mock.store.state.group.test.testing.deepPeople,
      ["employer"],
      true
    );
    fkPropertyStructureForHasOne(
      db.mock.store.state.group.test.testing.deepPeople,
      ["school"],
      false
    );
  });

  it("Mock() throws an error if dynamic props aren't set", async () => {
    try {
      await Mock(DeeperPerson).generate(3);
      throw new Error("Should have failed");
    } catch (e) {
      expect(e.code).toBe("firemodel/mock-not-ready");
    }
  });
});

describe("WATCHers work with dynamic dbOffsets", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
  });

  afterEach(async () => {
    FireModel.defaultDb.remove("/group", true);
  });

  it("Watching a RECORD with a dbOffset works", async () => {
    const events: IReduxAction[] = [];
    const dispatch = async (evt: IReduxAction) => {
      {
        events.push(evt);
        return evt;
      }
    };
    FireModel.dispatch = dispatch;
    const watchRecord = Watch.record(DeepPerson, {
      id: "12345",
      group: "CA",
    });

    expect(typeof watchRecord.start).toEqual("function");
    expect(typeof watchRecord.dispatch).toEqual("function");

    const watcher = await watchRecord.start();

    expect(watcher).toHaveProperty("watcherId");
    expect(watcher.watcherSource).toBe("record");
    expect(watcher.eventFamily).toBe("value");
    expect(watcher.watcherPaths[0]).toBe("/group/CA/testing/deepPeople/12345");
    await Record.add(DeepPerson, {
      id: "12345",
      group: "CA",
      age: 23,
      name: { first: "Charlie", last: "Chaplin" },
    });

    expect(events.map((i) => i.type)).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION])
    );
  });

  it("Watching a LIST with a dbOffset works", async () => {
    const events: IReduxAction[] = [];
    const dispatch = async (evt: IReduxAction) => {
      events.push(evt);
      return evt;
    };
    FireModel.dispatch = dispatch;

    const watchList = Watch.list(DeepPerson).offsets({ group: "CA" });

    expect(typeof watchList.start).toEqual("function");
    expect(typeof watchList.all).toEqual("function");
    expect(typeof watchList.where).toEqual("function");
    expect(typeof watchList.since).toEqual("function");
    expect(typeof watchList.recent).toEqual("function");
    expect(typeof watchList.before).toEqual("function");
    expect(typeof watchList.after).toEqual("function");

    const watcher = await watchList.all().start();

    expect(watcher).toHaveProperty("watcherId");
    expect(typeof watcher).toBe("object");

    await Record.add(DeepPerson, {
      name: { first: "Robert", last: "Kennedy" },
      age: 55,
      group: "CA",
    });

    expect(events.map((i) => i.type)).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION])
    );
  });
});

function fkStructuralChecksForHasMany(person: IDictionary<DeepPerson>) {
  expect(typeof firstRecord(person).hobbies).toEqual("object");
  expect(typeof firstRecord(person).parents).toEqual("object");
  expect(typeof firstRecord(person).attributes).toEqual("object");
}

function fkPropertyStructureForHasOne<T>(
  record: IDictionary<T>,
  props: Array<keyof T>,
  withDynamicPath: boolean
) {
  props.forEach((prop) => {
    const firstFk = firstRecord(record)[prop];
    const lastFk = lastRecord(record)[prop];
    const fks = [firstFk, lastFk].filter((i) => i);

    fks.forEach((fk) => {
      expect(typeof fk).toEqual("string");
      if (withDynamicPath) {
        expect(fk).toContain("::");
      } else {
        expect(fk).not.toContain("::");
      }
    });
  });
}

function fkPropertyStructureForHasMany<T>(
  record: IDictionary<T>,
  props: Array<keyof T>,
  withDynamicPath: boolean
) {
  props.forEach((prop) => {
    const firstFk = firstRecord(record)[prop];
    const lastFk = lastRecord(record)[prop];
    const fks = [firstFk, lastFk].filter((i) => i).map((i) => firstKey(i));

    fks.forEach((fk) => {
      expect(typeof fk).toEqual("string");
      if (withDynamicPath) {
        expect(fk).toContain("::");
      } else {
        expect(fk).not.toContain("::");
      }
    });
  });
}
