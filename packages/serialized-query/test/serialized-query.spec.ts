import { expect } from "chai";
import { BaseSerializer } from "../src/index";

describe("SerializedQuery", () => {
  it("should be defined", () => {
    expect(BaseSerializer).to.exist;
  });
});
