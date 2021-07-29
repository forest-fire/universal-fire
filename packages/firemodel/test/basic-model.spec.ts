import { Model } from "~/models/Model";
import { SimpleCar } from "./fixtures/SimpleCar";
import { Car } from "./fixtures/Car";
import { FmRelationshipType, IFmModelPropertyMeta } from "~/types";
import { Equal, Expect } from "@type-challenges/utils";
import { ExpectExtends } from "inferred-types";

describe("basic tests on a model", () => {
  it("The base Model can be instantiated and has appropriate META properties", () => {
    const m = new Model();
    expect(m.id).toBe(undefined);
    expect(typeof m.META).toBe("object");
    expect(m.META.allProperties).toEqual([
      "id",
      "lastUpdated",
      "createdAt",
    ]);
    expect(m.META.property("id").type).toBe("string");
  });

  it("A Model with no Relationships has appropriate META properties", () => {
    const m = new SimpleCar();
    expect(m.META.allProperties).toEqual([
      "make",
      "model",
      "id",
      "lastUpdated",
      "createdAt",
    ]);
    expect(m.META.property("make").type).toBe("string");
  });

  it("A Model with Relationships has appropriate META properties", () => {
    const m = new Car();
    expect(m.META.allProperties).toEqual([
      "model",
      "id",
      "lastUpdated",
      "createdAt",
      "make"
    ]);
    expect(m.META.relationship("make").relType).toBe(FmRelationshipType.hasOne);
  });

  it("META.property provides correct typing for subclass of Model", () => {
    const car = new Car();
    
    type CarParam = Parameters<typeof car.META.property>[0];
    type CarReturn = ReturnType<typeof car.META.property>;
    type cases = [
      Expect<
        Equal<CarParam, "id" | "lastUpdated" | "createdAt" | "make" | "model">
      >,
      Expect<Equal<CarReturn, IFmModelPropertyMeta<Car>>>,
      Expect<Equal<CarReturn["property"], CarParam>>,
      ExpectExtends<Model<Car>, Car>
    ];
    const c: cases = [true, true, true, true];
    expect(c).toBe(c);
  });
});
