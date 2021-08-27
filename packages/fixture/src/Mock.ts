import { Model } from 'firemodel';
import { MockApi } from '~/mocking/MockApi';
import { RealTimeClient } from 'universal-fire';

/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export function Mock<T extends Model>(modelConstructor: new () => T) {
  /**
   * Specifying a SDK or DbType doesn't makes sense because this in-memory db is only intended to be used for generating data.
   */
  const rtdbClient = RealTimeClient.create({ mocking: true });
  return new MockApi<T>(rtdbClient, modelConstructor);
}
