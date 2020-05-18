import { expect } from 'chai';
import { setupEnv } from './testing/helpers';
import { SerializedFirestoreQuery } from '../src/index';

setupEnv();

describe('SerializedFirestoreQuery', () => {
  it('should be defined', () => {
    expect(SerializedFirestoreQuery).to.exist;
  });

  it('instantiates', () => {
    const q = new SerializedFirestoreQuery('foo');
    expect(q).to.be.an.instanceOf(SerializedFirestoreQuery);
  });

  it('instantiate with path()', () => {
    const q = SerializedFirestoreQuery.path('foo');
    expect(q).to.be.an.instanceOf(SerializedFirestoreQuery);
  });

  it('instantiate without path, path set later', () => {
    const q = new SerializedFirestoreQuery();
    expect(q.path).to.equal('/');
    q.setPath('/foobar');
    expect(q.path).to.equal('/foobar');
  });

  it('same query structure gives same hashCode', async () => {
    const foo = new SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
    const bar = new SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
    expect(foo.hashCode()).to.equal(bar.hashCode());
    const foo2 = new SerializedFirestoreQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedFirestoreQuery('/foo/bar2')
      .orderByChild('goober')
      .limitToFirst(5);
    expect(foo2.hashCode()).to.equal(bar2.hashCode());
  });

  it('different query structure gives different hashCode', async () => {
    const foo2 = new SerializedFirestoreQuery('/foo/bar')
      .orderByChild('goober')
      .limitToFirst(5);
    const bar2 = new SerializedFirestoreQuery('/foo/bar').orderByChild(
      'goober'
    );
    expect(foo2.hashCode()).to.not.equal(bar2.hashCode());
  });

  it('identity property provides appropriate details', () => {
    const foo = new SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
    expect(foo.identity).to.be.an('object');
    expect(foo.identity.orderBy).to.equal('orderByChild');
    expect(foo.identity.orderByKey).to.equal('goober');
    expect(foo.identity.limitToFirst).to.equal(undefined);
    expect(foo.identity.startAt).to.equal(undefined);
  });
});
