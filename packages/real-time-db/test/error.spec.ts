import { AbstractedProxyError, PermissionDenied } from '../src/errors';

describe('Errors => ', () => {
  it('AbstractedErrorProxy works',  () => {
    const e = new Error('this is an abstracted error proxy');
    const e2 = new AbstractedProxyError(e, `test/msg`);
    expect(e2.code).toBe('msg');
    expect(e2.name).toBe('test/msg');
    console.log(e2);
    expect(Array.isArray(e2.stackFrames)).toBeTruthy();
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
    expect(err.name).toBe('RealTimeDb/permission-denied');
    expect(err.code).toBe('permission-denied');
  });
});
