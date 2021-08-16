import { SerializedRealTimeQuery } from '../src/index';
import * as helpers from './testing/helpers';

helpers.setupEnv();

describe('SerializedRealTimeQuery', () => {
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
    expect(typeof foo.identity === 'object').toBeTruthy();
    expect(foo.identity.orderBy).toEqual('orderByChild');
    expect(foo.identity.orderByKey).toEqual('goober');
    expect(foo.identity.limitToFirst).toEqual(undefined);
    expect(foo.identity.startAt).toEqual(undefined);
  });

  it('setting different props for equalTo and orderByChild behaves as expected', () => {
    const q = new SerializedRealTimeQuery()
      .orderByChild('foobar')
      .equalTo('foo', 'bar');
    expect(q.identity.equalToKey).toEqual('bar');
  });

  it('limitToFirst sets identity()', () => {
    const q = new SerializedRealTimeQuery().orderByValue().limitToFirst(3);
    expect(q.identity.limitToFirst).toEqual(3);
  });

  it('limitToLast sets identity()', () => {
    const q = new SerializedRealTimeQuery().orderByValue().limitToLast(3);
    expect(q.identity.limitToLast).toEqual(3);
  });
});
