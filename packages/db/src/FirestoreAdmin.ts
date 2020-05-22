import { FirestoreAdmin as FA } from '@forest-fire/firestore-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';
import { IFirestoreAdmin } from './index';

export async function FirestoreAdmin(
  config?: IAdminConfig | IMockConfig
): Promise<IFirestoreAdmin> {
  return FA.connect(config);
}
