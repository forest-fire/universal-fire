import type { RealTimeAdmin } from '@forest-fire/real-time-admin';
import type { RealTimeClient } from '@forest-fire/real-time-client';
import type { FirestoreAdmin } from '@forest-fire/firestore-admin';
import type { FirestoreClient } from '@forest-fire/firestore-client';
/**
 * Provides a typing that includes all known supported SDK types
 */
export declare type IAbstractedDatabase = RealTimeAdmin | RealTimeClient | FirestoreAdmin | FirestoreClient;
/** The interface that the `RealTimeAdmin` class exposes */
export declare type IRealTimeAdmin = RealTimeAdmin;
/** The interface that the `RealTimeClient` class exposes */
export declare type IRealTimeClient = RealTimeClient;
/** The interface that the `FirestoreAdmin` class exposes */
export declare type IFirestoreAdmin = FirestoreAdmin;
/** The interface that the `FirestoreClient` class exposes */
export declare type IFirestoreClient = FirestoreClient;
