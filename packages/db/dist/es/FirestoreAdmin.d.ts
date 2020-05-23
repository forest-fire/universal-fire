import type { IMockConfig, IAdminConfig } from '@forest-fire/types';
import { FirestoreAdmin as FA } from '@forest-fire/firestore-admin';
export declare function FirestoreAdmin(config?: IAdminConfig | IMockConfig): FA;
