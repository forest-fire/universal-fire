// tslint:disable:no-implicit-dependencies
import { IDictionary } from 'common-types';
import { SnapShot } from '../src/rtdb';
import { expect } from 'chai';

describe('SnapShot:', () => {
  it('a snapshot key property only returns last part of path', () => {
    const s = new SnapShot('people/-Keyre2234as', { name: 'foobar' });
    expect(s.key).to.equal('-Keyre2234as');
  });
});
