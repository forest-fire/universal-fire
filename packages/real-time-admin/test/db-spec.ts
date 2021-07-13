// tslint:disable:no-implicit-dependencies
import { RealTimeAdmin } from '../src';

import * as helpers from './testing/helpers';

helpers.setupEnv();

describe('Connecting to Database', () => {
  it('can get a value from database once connected', async () => {
    const db = await RealTimeAdmin.connect();
    expect(db.isConnected).toBe(true);
    const root = await db.getValue('/');
    expect(root).toBeInstanceOf('object');
  });
});

describe('Write Operations', () => {
  let db: RealTimeAdmin;
  beforeAll(async () => {
    db = await RealTimeAdmin.connect();
  });
  afterEach(async () => {
    try {
      await db.remove('scratch');
    } catch (e) {
      //
    }
  });

  interface INameAndAge {
    name: string;
    age: number;
  }

  it('push() variables into database', async () => {
    await db.push<INameAndAge>('scratch/pushed', {
      name: 'Charlie',
      age: 25
    });
    await db.push('scratch/pushed', {
      name: 'Sandy',
      age: 32
    });
    const users = await db.getValue('scratch/pushed');
    expect(Object.keys(users).length).toBe(2);
    expect(helpers.valuesOf(users, 'name')).toEqual(expect.arrayContaining(['Charlie']));
    expect(helpers.valuesOf(users, 'name')).toEqual(expect.arrayContaining(['Sandy']));
  });

  it('set() sets data at a given path in DB', async () => {
    await db.set<INameAndAge>('scratch/set/user', {
      name: 'Charlie',
      age: 25
    });
    const user = await db.getValue<INameAndAge>('scratch/set/user');
    expect(user.name).toBe('Charlie');
    expect(user.age).toBe(25);
  });

  it('update() can "set" and then "update" contents', async () => {
    await db.update('scratch/update/user', {
      name: 'Charlie',
      age: 25
    });
    let user = await db.getValue<INameAndAge>('scratch/update/user');
    expect(user.name).toBe('Charlie');
    expect(user.age).toBe(25);
    await db.update('scratch/update/user', {
      name: 'Charles',
      age: 34
    });
    user = await db.getValue<INameAndAge>('scratch/update/user');
    expect(user.name).toBe('Charles');
    expect(user.age).toBe(34);
  });

  it('update() leaves unchanged attributes as they were', async () => {
    await db.update('scratch/update/user', {
      name: 'Rodney',
      age: 25
    });
    let user = await db.getValue<INameAndAge>('scratch/update/user');
    expect(user.name).toBe('Rodney');
    expect(user.age).toBe(25);
    await db.update('scratch/update/user', {
      age: 34
    });
    user = await db.getValue<INameAndAge>('scratch/update/user');
    expect(user.name).toBe('Rodney');
    expect(user.age).toBe(34);
  });

  it('remove() eliminates a path -- and all children -- in DB', async () => {
    await db.set('scratch/removal/user', {
      name: 'Rodney',
      age: 25
    });
    let user = await db.getValue<INameAndAge>('scratch/removal/user');
    expect(user.name).toBe('Rodney');
    await db.remove('scratch/removal/user');
    user = await db.getValue<INameAndAge>('scratch/removal/user');
    expect(user).toBe(null);
  }, 5000);
});

describe('Other Operations', () => {
  let db: RealTimeAdmin;
  beforeAll(async () => {
    db = await RealTimeAdmin.connect();
  });
  afterEach(async () => {
    await db.remove('scratch');
  });

  it('exists() tests to true/false based on existance of data', async () => {
    await db.set('/scratch/existance', 'foobar');
    let exists = await db.exists('/scratch/existance');
    expect(exists).toBe(true);
    await db.remove('/scratch/existance');
    exists = await db.exists('/scratch/existance');
    expect(exists).toBe(false);
  });
});
