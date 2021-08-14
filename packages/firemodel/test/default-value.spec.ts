import { FireModel, List, Record } from "../src";

import { Person } from "./testing/default-values/Person";
import { IDatabaseSdk, RealTimeAdmin } from "universal-fire";
import { Mock } from "@forest-fire/fixture";

describe("defaultValue() → ", () => {
  let db: IDatabaseSdk<"RealTimeAdmin">
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("defaultValue is used when not set with add()", async () => {
    const p = await Record.add(Person, {
      age: 34,
    });
    expect(p.data.age).toBe(34);
    expect(p.data.currentDeliveryAddress).toBe("home");
    expect(p.data.priorDeliveryAddress).toBe("work");
  });

  it("defaultValue is ignored when not set with add()", async () => {
    const p = await Record.add(Person, {
      age: 34,
      priorDeliveryAddress: "foo",
    });
    expect(p.data.age).toBe(34);
    expect(p.data.currentDeliveryAddress).toBe("home");
    expect(p.data.priorDeliveryAddress).toBe("foo");
  });

  // TODO: Look at this test, it is exhibiting odd async behaviour
  it("mocking ignores defaultValue", async () => {
    const mockData = await Mock(Person).generate(10);
    mockData.forEach((m) => {
      db.mock.store.updateDb(m.dbPath, m.data);
    });
    const people = await List.all(Person);
    people.map((person) => {
      expect(person.currentDeliveryAddress).toBe("work");
      expect(person.priorDeliveryAddress).toBe("home");
      return person;
    });
  });
});
