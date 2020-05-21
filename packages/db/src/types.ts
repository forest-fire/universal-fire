import type { RealTimeAdmin } from '@forest-fire/real-time-admin';
import type { RealTimeClient } from '@forest-fire/real-time-client';
import type { FirestoreAdmin } from '@forest-fire/firestore-admin';
import type { FirestoreClient } from '@forest-fire/firestore-client';
import type { AbstractedDatabase } from '@forest-fire/abstracted-database';

/**
 * Provides an interface for the class `AbstractedDatabase`
 */
export type IAbstractedDatabase = AbstractedDatabase;

/** The interface that the `RealTimeAdmin` class exposes */
export type IRealTimeAdmin = RealTimeAdmin;
/** The interface that the `RealTimeClient` class exposes */
export type IRealTimeClient = RealTimeClient;
/** The interface that the `FirestoreAdmin` class exposes */
export type IFirestoreAdmin = FirestoreAdmin;
/** The interface that the `FirestoreClient` class exposes */
export type IFirestoreClient = FirestoreClient;
