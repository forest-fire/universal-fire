import { RealTimeAdmin } from "universal-fire";

import { FireModel } from "~/index";

describe("Rolling back a record => ", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({ mocking: true });
  });

  // TODO: write test
  it.todo("local Record value is reset to the rolled-back state when handling the error");

  // TODO: write test
  it.todo("dispatch() sends the original value on rollback");
});
