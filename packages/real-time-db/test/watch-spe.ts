// tslint:disable:no-implicit-dependencies
import { DB as Admin } from 'abstracted-admin';
import { setupEnv } from './testing/helpers';
import { expect } from 'chai';

import { IFirebaseWatchEvent } from '../src';

setupEnv();

describe.skip('Watch →', () => {
  it('watcher picks up events', async () => {
    const db = await Admin.connect();
    const events: IFirebaseWatchEvent[] = [];
    const dispatch = (evt: IFirebaseWatchEvent) => events.push(evt);
    db.watch('/foo2/bar4', 'value', dispatch);
    await db.set('/foo2/bar4', {
      name: 'Henry',
      age: 55
    });
    await db.update('/foo2/bar4', {
      age: 65
    });
    await db.remove('/foo2/bar4');

    expect(events).to.have.lengthOf(3);
  });
});
