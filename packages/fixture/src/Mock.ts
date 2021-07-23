import { FireModel, IMockOptions } from 'firemodel';
import { IDatabaseSdk, ISdk } from '@forest-fire/types';
import { Model } from 'firemodel';
import { MockApi } from '~/mocking/MockApi';
import { capitalize } from 'native-dash';
import { FixtureError } from './errors/FixtureError';

/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export function Mock<TSdk extends ISdk, T extends Model>(
  modelConstructor: new () => T,
  db: IDatabaseSdk<TSdk> | undefined = undefined,
  options: IMockOptions = {}
) {
  if (!db) {
    if (FireModel.defaultDb) {
      db = FireModel.defaultDb;
    } else {
      throw new FixtureError(
        `You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`,
        'mock/no-database'
      );
    }
  }

  if (!db.isMockDb && !options.allowRealDatabase) {
    throw new FixtureError(
      `You are using Mock(${capitalize(
        modelConstructor.name
      )}) with a real database; typically a mock database is preferred`,
      'mock/real-database'
    );
  }

  return new MockApi<TSdk, T>(db, modelConstructor);
}
