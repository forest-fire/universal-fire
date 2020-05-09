import { IDatabaseConfig } from '@forest-fire/types';
import { IRealTimeDb } from '@forest-fire/real-time-db';
import { IFirestoreDb } from '@forest-fire/firestore-db';

export class DB {
  /**
   * A static initializer which can hand back any of the supported SDK's for either
   * Firestore or Real-Time Database.
   *
   * @param constructor The DB/SDK class which you wish to use
   * @param config The database configuration
   */
  static async connect<T extends IRealTimeDb | IFirestoreDb>(
    constructor: new (config?: IDatabaseConfig) => T,
    config?: IDatabaseConfig
  ) {
    const db = new constructor(config);
    await db.connect();
    return db;
  }
}
