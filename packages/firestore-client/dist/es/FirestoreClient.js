import '@firebase/firestore';
import firebase from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
export class FirestoreClient extends FirestoreDb {
    async _initializeApp(config) {
        this.app = firebase.initializeApp(config);
    }
    async _connect() {
        this.database = this.app.firestore();
        return this;
    }
    async auth() {
        await import('@firebase/auth');
        if (this.app.auth) {
            return this.app.auth();
        }
        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
    }
}
//# sourceMappingURL=FirestoreClient.js.map