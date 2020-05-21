import { FirestoreAdmin as FA } from '@forest-fire/firestore-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';
export declare function FirestoreAdmin(config?: IAdminConfig | IMockConfig): Promise<FA>;
