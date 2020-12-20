import { setupEnv } from './testing/helpers';
import { SerializedFirestoreQuery } from '../src/index';

setupEnv();

describe('SerializedFirestoreQuery', () => {
  it('should be defined', () => {
    expect(SerializedFirestoreQuery).toBeDefined();
  });

  it('instantiates', () => {
    const q = new SerializedFirestoreQuery('foo');
    expect(q).toBeInstanceOf(SerializedFirestoreQuery);
  });

  it('instantiate with path()', () => {
    const q = SerializedFirestoreQuery.path('foo');
    expect(q).toBeInstanceOf(SerializedFirestoreQuery);
  });

  it('instantiate without path, path set later', () => {
    const q = new SerializedFirestoreQuery();
    expect(q.path).toEqual('/');
    q.setPath('/foobar');
    expect(q.path).toEqual('/foobar');
  });

  it('same query structure gives same hashCode', () => {
    const foo = new SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
    const bar = new SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
    expect(foo.hashCode()).toEqual(bar.hashCode());
    const foo2 = new SerializedFirestoreQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedFirestoreQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    expect(foo2.hashCode()).toEqual(bar2.hashCode());
  });

  it('different query structure gives different hashCode', () => {
    const foo2 = new SerializedFirestoreQuery('/foo/bar')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedFirestoreQuery('/foo/bar').orderByChild(
      'goober'
    );
    expect(foo2.hashCode()).not.toEqual(bar2.hashCode());
  });

  it('identity property provides appropriate details', () => {
    const foo = new SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
    expect(typeof foo.identity).toEqual('object');
    expect(foo.identity.orderBy).toEqual('orderByChild');
    expect(foo.identity.orderByKey).toEqual('goober');
    expect(foo.identity.limitToFirst).toEqual(undefined);
    expect(foo.identity.startAt).toEqual(undefined);
  });
});
