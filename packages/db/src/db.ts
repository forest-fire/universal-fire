import type { IDatabaseConfig } from '@forest-fire/types';
import type { RealTimeClient } from '@forest-fire/real-time-client';
import type { RealTimeAdmin } from '@forest-fire/real-time-admin';
import type { FirestoreClient } from '@forest-fire/firestore-client';
import type { FirestoreAdmin } from '@forest-fire/firestore-admin';
import type { AbstractedDatabase } from '@forest-fire/abstracted-database';

export { AbstractedDatabase };

export const enum SDK {
  FirestoreAdmin = 'firestore-admin',
  FirestoreClient = 'firestore-client',
  RealTimeAdmin = 'real-time-admin',
  RealTimeClient = 'real-time-client',
}
/**
 * A class object which is one of the supported SDK types provided
 * by `universal-fire` (and underlying that ... **Firebase**)
 */
export type ISdkApi = (
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
   */
  static async connect(sdk: SDK, config?: IDatabaseConfig) {
    const constructor: new (
      config?: IDatabaseConfig
    ) => ISdkApi = extractConstructor(await import(`@forest-fire/${sdk}`));

    const db: ISdkApi = new constructor(config);
    await db.connect();
    return db;
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
