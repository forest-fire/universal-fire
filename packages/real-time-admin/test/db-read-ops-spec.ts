// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src';

import * as helpers from './testing/helpers';

helpers.setupEnv();

describe('DB Read operations: ', () => {
  let db: RealTimeAdmin;
  let dbMock: RealTimeAdmin;

  before(async () => {
    db = await RealTimeAdmin.connect();
    dbMock = await RealTimeAdmin.connect({ mocking: true });

    await db.set('test-data', {
      one: 'foo',
      two: 'bar',
      three: 'baz',
    });

    await db.set('test-records', {
      123456: {
        name: 'Chris',
        age: 50,
      },
      654321: {
        name: 'Bob',
        age: 68,
      },
    });
  });

  it('getSnapshot() gets statically set data in test DB', async () => {
    const data = await db.getSnapshot('test-data');
    expect(data.val()).toBeInstanceOf('object');
    expect(data.val().one).toBe('foo');
    expect(data.val().two).toBe('bar');
    expect(data.val().three).toBe('baz');
    expect(data.key).toBe('test-data');
  });

  it('getValue() gets statically set data in test DB', async () => {
    const data = await db.getValue('test-data');
    expect(data).toBeInstanceOf('object');
    expect(data.one).toBe('foo');
    expect(data.two).toBe('bar');
    expect(data.three).toBe('baz');
  });

  it('getRecord() gets statically set data in test DB', async () => {
    interface ITest {
      id: string;
      age: number;
      name: string;
    }

    const record = await db.getRecord<ITest>('/test-records/123456');

    expect(record).toBeInstanceOf('object');
    expect(record.id).toBe('123456');
    expect(record.name).toBe('Chris');
    expect(record.age).toBe(50);
  });
});
