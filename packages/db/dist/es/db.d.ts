import type { IDatabaseConfig } from '@forest-fire/types';
import type { RealTimeClient } from '@forest-fire/real-time-client';
import type { RealTimeAdmin } from '@forest-fire/real-time-admin';
import type { FirestoreClient } from '@forest-fire/firestore-client';
import type { FirestoreAdmin } from '@forest-fire/firestore-admin';
import { SDK } from '.';
export declare type ISdkClient = RealTimeAdmin | RealTimeClient | FirestoreAdmin | FirestoreClient;
export declare class DB {
    /**
     * A static initializer which can hand back any of the supported SDK's for either
     * Firestore or Real-Time Database.
     *
     * @param sdk The Firebase SDK which will be used to connect
     * @param config The database configuration
     */
    static connect(sdk: SDK, config?: IDatabaseConfig): Promise<ISdkClient>;
}
