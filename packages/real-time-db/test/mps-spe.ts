// tslint:disable:no-implicit-dependencies
import { DB as Admin } from "abstracted-admin";
import { setupEnv } from "./testing/helpers";
import * as chai from "chai";


setupEnv();

describe("Multi-path Set ?", () => {
  it("duplicate events throw error", async () => {
    const db = await Admin.connect();

    const paths = {
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ": 1530216926118,
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/name/-LG71JibMhlEQ4V_MMfQ": 1530216926118,
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/age/-LG71JibMhlEQ4V_MMfQ": 1530216926118
    }
    
    const result = db.multi

});
