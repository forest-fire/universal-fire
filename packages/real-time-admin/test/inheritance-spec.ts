import { RealTimeAdmin } from '../src';

import { AbstractedDatabase } from '@forest-fire/abstracted-database';

describe('RealTimeAdmin => Inheritance => ', () => {
  it('RealTimeAdmin inherits from RealTimeDb', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    expect(db).toBeInstanceOf(RealTimeAdmin);
  });

  it('RealTimeAdmin inherits from AbstractedDatabase', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    expect(db).toBeInstanceOf(AbstractedDatabase);
  });
});
