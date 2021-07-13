import { RealTimeAdmin } from '../src/index';
// tslint:disable-next-line:no-implicit-dependencies

import * as helpers from './testing/helpers';

helpers.setupEnv();

describe.skip('Debugging: ', () => {
  it('debugging set to "true" results in logging to STDOUT', async () => {
    const restore = helpers.captureStdout();
    const db = await RealTimeAdmin.connect({ debugging: true, mocking: true });
    await db.getValue('foo');
    const output: string[] = restore();
    expect(output).toBeInstanceOf('array');

    // 'expected FIREBASE to be in stdout'
    expect(output.some(el => el.indexOf('FIREBASE') !== -1)).toBe(true);
  });

  it.skip('debugging callback sends results to callback', async () => {
    const restore = helpers.captureStdout();
    let count = 0;
    const callback = (message: string) => {
      expect(message).toBeInstanceOf('string');
      count++;
    };
    const db = await RealTimeAdmin.connect({
      debugging: callback,
      mocking: true
    });
    db.getValue('foo');
    db.set('foo2', 'happy happy');
    const output: string[] = restore();
    expect(output.some(el => el.indexOf('FIREBASE') !== -1)).toBe(false);
    expect(count).toBeGreaterThan(0);
  });
});
