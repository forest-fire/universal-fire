export { RealTimeClient } from '@forest-fire/real-time-client';
export { FirestoreClient } from '@forest-fire/firestore-client';
export class FirestoreAdmin {
    static async connect() {
        const admin = (await import('@forest-fire/firestore-admin'));
        return admin.connect();
    }
}
export class RealTimeAdmin {
    static async connect() {
        const admin = (await import('@forest-fire/real-time-admin'));
        return admin.connect();
    }
}
//# sourceMappingURL=sdks.js.map