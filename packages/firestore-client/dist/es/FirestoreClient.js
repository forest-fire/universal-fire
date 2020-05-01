import { firebase } from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { isClientConfig, isMockConfig } from '@forest-fire/types';
import { extractClientConfig, FireError } from '@forest-fire/utility';
export class FirestoreClient extends FirestoreDb {
    constructor(config) {
        super();
        this._isAdminApi = false;
        if (!config) {
            extractClientConfig();
        }
        if (isClientConfig(config)) {
            this._app = firebase.initializeApp(config);
        }
        else if (isMockConfig(config)) {
            //
        }
        else {
            throw new FireError(`The configuration passed to FirestoreClient was invalid!`, `invalid-configuration`);
        }
        this._config = config;
    }
    static async connect(config) {
        const obj = new FirestoreClient(config);
        await obj.connect();
        return obj;
    }
    async connect() {
        if (isClientConfig(this._config)) {
            // TODO: explain rationale of async import
            //  1. delay parsing JS until ready to connect
            //  2. provide bundling that helps users to understand cost of various deps
            //  3. _might_ make non-bocking resource where would have been blocking
            await import(
            /* webpackChunkName: 'firebase-firestore' */ '@firebase/firestore');
            this._database = this._app.firestore();
            // TODO: implement a way to validate when connection is established
        }
        return this;
    }
    async auth() {
        await import(/* webpackChunkName: 'firebase-auth' */ '@firebase/auth');
        if (this._app?.auth) {
            return this._app.auth();
        }
        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
    }
}
//# sourceMappingURL=FirestoreClient.js.map