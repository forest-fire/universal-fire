import { IFirestoreAdmin, IRealTimeAdmin } from './sdk-types';
export * from './proxy-symbols';

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
