import { RealTimeAdmin } from '../src/index';
// tslint:disable-next-line:no-implicit-dependencies
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
helpers.setupEnv();

describe.skip('Debugging: ', () => {
  it('debugging set to "true" results in logging to STDOUT', async () => {
    const restore = helpers.captureStdout();
    const db = await RealTimeAdmin.connect({ debugging: true, mocking: true });
    await db.getValue('foo');
    const output: string[] = restore();
    expect(output).to.be.an('array');

    expect(
      output.some(el => el.indexOf('FIREBASE') !== -1),
      'expected FIREBASE to be in stdout'
    ).to.equal(true);
  });

  it.skip('debugging callback sends results to callback', async () => {
    const restore = helpers.captureStdout();
    let count = 0;
    const callback = (message: string) => {
      expect(message).to.be.a('string');
      count++;
    };
    const db = await RealTimeAdmin.connect({
      debugging: callback,
      mocking: true
    });
    db.getValue('foo');
    db.set('foo2', 'happy happy');
    const output: string[] = restore();
    expect(output.some(el => el.indexOf('FIREBASE') !== -1)).to.equal(false);
    expect(count).to.greaterThan(0);
  });
});
