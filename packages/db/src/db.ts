import { IDatabaseConfig, SDK } from '@forest-fire/types';
import type { RealTimeClient } from '@forest-fire/real-time-client';
import type { RealTimeAdmin } from '@forest-fire/real-time-admin';
import type { FirestoreClient } from '@forest-fire/firestore-client';
import type { FirestoreAdmin } from '@forest-fire/firestore-admin';
import type { AbstractedDatabase } from '@forest-fire/abstracted-database';
import { FireError } from '@forest-fire/utility';

export { SDK };

/**
 * A class object which is one of the supported SDK types provided
 * by `universal-fire`.
 */
export type IAbstractedDatabase = (
  | RealTimeAdmin
  | RealTimeClient
  | FirestoreAdmin
  | FirestoreClient
) &
  AbstractedDatabase;

export class DB {
  /**
   * A static initializer which can hand back any of the supported SDK's for either
   * Firestore or Real-Time Database.
   *
   * @param sdk The Firebase SDK which will be used to connect
   * @param config The database configuration
   *
   */
  static async connect(
    sdk: SDK,
    config?: IDatabaseConfig
  ): Promise<
    RealTimeAdmin | RealTimeClient | FirestoreClient | FirestoreAdmin
  > {
    const constructor: new (
      config?: IDatabaseConfig
    ) => IAbstractedDatabase = extractConstructor(
      await import(`@forest-fire/${sdk}`)
    );
    switch (sdk) {
      case SDK.RealTimeAdmin:
        return (new constructor(config) as RealTimeAdmin).connect();
      case SDK.RealTimeClient:
        return (new constructor(config) as RealTimeClient).connect();
      case SDK.FirestoreAdmin:
        return (new constructor(config) as FirestoreAdmin).connect();
      case SDK.FirestoreClient:
        return (new constructor(config) as FirestoreClient).connect();
      default:
        throw new FireError(
          `The SDK requested "${sdk}", is an unknown type!`,
          'invalid-sdk'
        );
    }
  }
}

function extractConstructor<T>(imported: {
  [key: string]: new (config?: IDatabaseConfig) => T;
}) {
  const keys = Object.keys(imported).filter((i) =>
    [
      'RealTimeClient',
      'RealTimeAdmin',
      'FirestoreAdmin',
      'FirestoreClient',
    ].includes(i)
  );

  return imported[keys[0]];
}
