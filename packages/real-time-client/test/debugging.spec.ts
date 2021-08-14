import * as helpers from './testing/helpers';

import { RealTimeClient } from '../src/';
import config from './testing/fb-config';

helpers.setupEnv();

describe.skip('Debugging: ', () => {
  it('"debugging: true" results in logging to STDOUT', async () => {
    const restore = helpers.captureStdout();
    const db = new RealTimeClient({ ...{ debugging: true }, ...config });
    await db.connect();
    const output: string[] = restore();
    expect(output).toBeInstanceOf('array');

    // 'expected FIREBASE to be in stdout'
    expect(output.some((el) => el.indexOf('[FIREBASE]') !== -1)).toBe(true);
  });

  it('"debugging: callback" sends results to callback', async () => {
    const restore = helpers.captureStdout();
    let count = 0;
    const callback = (message: string) => {
      expect(typeof message).toEqual('string');
      count++;
    };
    const db = new RealTimeClient({ ...{ debugging: callback }, ...config });
    await db.connect();
    const output: string[] = restore();
    expect(output.some((el) => el.indexOf('[FIREBASE]') !== -1)).toBe(false);
    expect(count).toBeGreaterThan(0);
  });
});
