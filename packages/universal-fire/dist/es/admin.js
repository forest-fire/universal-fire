export * from './proxy-symbols';
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
//# sourceMappingURL=admin.js.map