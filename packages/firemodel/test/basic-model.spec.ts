import { Model } from "~/models/Model";
import { SimpleCar } from "./fixtures/SimpleCar";

describe("basic tests on a model", () => {

  it("The base Model can be instantiated and has appropriate META properties", () => {
    const m = new Model();
    expect(m.id).toBe(undefined);
    expect(typeof m.META).toBe("object");
    expect(m.META.allProperties).toContainAllValues(["id", "lastUpdated", "createdAt"]);
    console.log({ props: m.META.properties });
    expect(m.META.property('id').type).toBe("string")
  });

  it("A Model with no Relationships has appropriate META properties", () => {
    const m = new SimpleCar();
    expect(m.META.allProperties).toContainAllValues(["make", "model", "id", "lastUpdated", "createdAt"]);
    expect(m.META.property("make").type).toBe("string");
  });

});

