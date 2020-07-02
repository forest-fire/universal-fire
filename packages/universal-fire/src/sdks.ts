import { IFirestoreAdmin, IRealTimeAdmin } from './index';

export { RealTimeClient } from '@forest-fire/real-time-client';
export { FirestoreClient } from '@forest-fire/firestore-client';

export class FirestoreAdmin {
  static async connect() {
    const admin = ((await import(
      '@forest-fire/firestore-admin'
    )) as unknown) as IFirestoreAdmin;
    return admin.connect();
  }
}

export class RealTimeAdmin {
  static async connect() {
    const admin = ((await import(
      '@forest-fire/real-time-admin'
    )) as unknown) as IRealTimeAdmin;
    return admin.connect();
  }
}
