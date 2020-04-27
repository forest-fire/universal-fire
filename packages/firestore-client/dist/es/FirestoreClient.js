import { firebase } from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { isClientConfig } from '@forest-fire/types';
export class FirestoreClient extends FirestoreDb {
    constructor(config) {
        super();
        this._isAdminApi = false;
        if (isClientConfig(config)) {
            this._app = firebase.initializeApp(config);
        }
        this._config = config;
    }
    async connect() {
        // TODO: explain rationale of async import
        //  1. delay parsing JS until ready to connect
        //  2. provide bundling that helps users to understand cost of various deps
        //  3. _might_ make non-bocking resource where would have been blocking
        await import(
        /* webpackChunkName: 'firebase-firestore' */ '@firebase/firestore');
        this._database = this._app?.firestore();
        // TODO: implement a way to validate when connection is established
    }
    async auth() {
        await import(/* webpackChunkName: 'firebase-auth' */ '@firebase/auth');
        if (this.app?.auth) {
            return this.app.auth();
        }
        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
    }
}
//# sourceMappingURL=FirestoreClient.js.map