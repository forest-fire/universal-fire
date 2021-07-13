import { RealTimeDb } from '../../real-time-db/dist/types';
import { RealTimeAdmin } from '../src';

describe('RealTimeAdmin => Inheritance => ', () => {
  it('RealTimeAdmin inherits from RealTimeDb', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    expect(db).toBeInstanceOf(RealTimeAdmin);
  });

  it('RealTimeAdmin inherits from RealTimeDb', async () => {
    const db = new RealTimeAdmin({ mocking: true });
    expect(db).toBeInstanceOf(RealTimeDb);
  });
});
