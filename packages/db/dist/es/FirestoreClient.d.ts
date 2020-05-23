import type { IClientConfig, IMockConfig } from '@forest-fire/types';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
export declare function FirestoreClient(config?: IClientConfig | IMockConfig): FC;
