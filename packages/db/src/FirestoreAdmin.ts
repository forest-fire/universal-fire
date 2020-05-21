import { FirestoreAdmin as FA } from '@forest-fire/firestore-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';

export async function FirestoreAdmin(config?: IAdminConfig | IMockConfig) {
  return FA.connect(config);
}
