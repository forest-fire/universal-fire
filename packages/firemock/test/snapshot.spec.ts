import { SnapShot } from '../src/rtdb';

describe('SnapShot:', () => {
  it('a snapshot key property only returns last part of path', () => {
    const s = new SnapShot('people/-Keyre2234as', { name: 'foobar' });
    expect(s.key).toBe('-Keyre2234as');
  });
});
