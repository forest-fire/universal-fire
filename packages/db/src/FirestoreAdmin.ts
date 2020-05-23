import { FirestoreAdmin as FSA } from '@forest-fire/firestore-admin';
import type { IAdminConfig, IMockConfig } from '@forest-fire/types';

/** The interface that the `FirestoreAdmin` class exposes */
export type IFirestoreAdmin = FSA;

export async function FirestoreAdmin(
  config?: IAdminConfig | IMockConfig
): Promise<IFirestoreAdmin> {
  return FSA.connect(config);
}
