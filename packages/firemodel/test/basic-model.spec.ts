import { AuditLog, Model } from "@/models";

describe("basic tests on a model", () => {

  it("Model itself can be instantiated", () => {
    const m = new Model();
    expect(m.id).toBe(undefined);
  });

  it.only("AuditLog META", () => {
    const a = new AuditLog();
    expect(a.META.property("modelName").property).toBe("modelName");
  });

});

