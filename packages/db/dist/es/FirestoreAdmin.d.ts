import { FirestoreAdmin as FSA } from '@forest-fire/firestore-admin';
import type { IAdminConfig, IMockConfig } from '@forest-fire/types';
/** The interface that the `FirestoreAdmin` class exposes */
export declare type IFirestoreAdmin = FSA;
export declare function FirestoreAdmin(config?: IAdminConfig | IMockConfig): Promise<IFirestoreAdmin>;
