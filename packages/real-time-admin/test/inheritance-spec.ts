import { RealTimeAdmin } from '../src';
import { expect } from 'chai';
import { AbstractedDatabase } from '@forest-fire/abstracted-database';

describe('RealTimeAdmin => Inheritance => ', () => {
  it('RealTimeAdmin inherits from RealTimeDb', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    expect(db).to.be.instanceOf(RealTimeAdmin);
  });

  it('RealTimeAdmin inherits from AbstractedDatabase', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    expect(db).to.be.instanceOf(AbstractedDatabase);
  });
});
