import { SerializedRealTimeQuery } from '../src/index';
import { RealTimeAdmin } from 'universal-fire';
import * as helpers from './testing/helpers';

helpers.setupEnv();

describe('SerializedRealTimeQuery', () => {
  let mockDb: RealTimeAdmin;
  beforeAll(async () => {
    mockDb = await RealTimeAdmin({ mocking: true });
    // TODO: remove the comment below when we update FireModel to use the new
    // version if `universal-fire`.
  });
  it('instantiates', () => {
    const q = new SerializedRealTimeQuery('foo');
    expect(q).toBeInstanceOf(SerializedRealTimeQuery);
  });
  it('instantiate with path()', () => {
    const q = new SerializedRealTimeQuery('foo');
    expect(q).toBeInstanceOf(SerializedRealTimeQuery);
  });

  it('instantiate without path, path set later', () => {
    const q = new SerializedRealTimeQuery();
    expect(q.path).toEqual('/');
    q.setPath('/foobar');
    expect(q.path).toEqual('/foobar');
  });

  it('same query structure gives same hashCode', () => {
    const foo = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    const bar = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    expect(foo.hashCode()).toEqual(bar.hashCode());
    const foo2 = new SerializedRealTimeQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedRealTimeQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    expect(foo2.hashCode()).toEqual(bar2.hashCode());
  });

  it('different query structure gives different hashCode', () => {
    const foo2 = new SerializedRealTimeQuery('/foo/bar')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    expect(foo2.hashCode()).not.toEqual(bar2.hashCode());
  });

  it('identity property provides appropriate details', () => {
    const foo = new SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
    expect(typeof foo.identity).toEqual('object');
    expect(foo.identity.orderBy).toEqual('orderByChild');
    expect(foo.identity.orderByKey).toEqual('goober');
    expect(foo.identity.limitToFirst).toEqual(undefined);
    expect(foo.identity.startAt).toEqual(undefined);
  });
});
