import type { RealTimeAdmin } from '@forest-fire/real-time-admin';
import type { RealTimeClient } from '@forest-fire/real-time-client';
import type { FirestoreAdmin } from '@forest-fire/firestore-admin';
import type { FirestoreClient } from '@forest-fire/firestore-client';

/**
 * Provides a typing that includes all known supported SDK types
 */
export type IAbstractedDatabase =
  | RealTimeAdmin
  | RealTimeClient
  | FirestoreAdmin
  | FirestoreClient;
