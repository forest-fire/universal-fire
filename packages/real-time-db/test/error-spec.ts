// tslint:disable:no-implicit-dependencies
import { AbstractedProxyError, PermissionDenied } from '../src/errors';
import { expect } from 'chai';

describe('Errors => ', () => {
  it('AbstractedErrorProxy works', async () => {
    const e = new Error('this is an abstracted error proxy');
    const e2 = new AbstractedProxyError(e, `test/msg`);
    expect(e2.code).to.equal('msg');
    expect(e2.name).to.equal('test/msg');
    expect(e2.stackFrames).to.be.an('array');
  });

  it('Permission Denied', async () => {
    const fakeError: Error & { code: string } = {
      name: 'FIREBASE',
      message: '',
      stack: new Error().stack,
      code: 'PERMISSION_DENIED',
    };
    const e: Error & { code?: string } = new Error('');
    e.code = 'PERMISSION_DENIED';
    const err = new PermissionDenied(
      e,
      'Firebase Database - permission denied'
    );
    expect(err.name).to.equal('RealTimeDb/permission-denied');
    expect(err.code).to.equal('permission-denied');
  });
});
