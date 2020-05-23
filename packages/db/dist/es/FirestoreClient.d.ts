import type { IClientConfig, IMockConfig } from '@forest-fire/types';
import type { FirestoreClient as FSC } from '@forest-fire/firestore-client';
/** The interface that the `FirestoreClient` class exposes */
export declare type IFirestoreClient = FSC;
export declare function FirestoreClient(config?: IClientConfig | IMockConfig): Promise<IFirestoreClient>;
