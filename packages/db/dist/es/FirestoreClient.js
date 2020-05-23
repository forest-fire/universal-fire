import { FirestoreClient as FC } from '@forest-fire/firestore-client';
export function FirestoreClient(config) {
    const obj = new FC(config);
    return obj;
}
//# sourceMappingURL=FirestoreClient.js.map