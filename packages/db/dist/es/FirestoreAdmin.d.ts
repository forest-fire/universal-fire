import { IAdminConfig, IMockConfig } from '@forest-fire/types';
import { IFirestoreAdmin } from './index';
export declare function FirestoreAdmin(config?: IAdminConfig | IMockConfig): Promise<IFirestoreAdmin>;
