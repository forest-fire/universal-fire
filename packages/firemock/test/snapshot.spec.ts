import { SDK } from "~/auth/admin-sdk";
import { createDatabase, snapshot } from "~/databases";

describe('SnapShot:', () => {
  it('a snapshot key property only returns last part of path', () => {
    const m = createDatabase(SDK.RealTimeClient);
    const s = snapshot(m.store, 'people/-Keyre2234as', { name: 'foobar' });
    expect(s.key).toBe('-Keyre2234as');
  });
});
