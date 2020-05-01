import { firebase } from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
<<<<<<< HEAD
import { isClientConfig, isMockConfig } from '@forest-fire/types';
=======
import { isClientConfig, isMockConfig, } from '@forest-fire/types';
>>>>>>> ae7a8bc... feat(firestore-db): use new serialized-query
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
            await import(
            /* webpackChunkName: 'firebase-firestore' */ '@firebase/firestore');
            this._database = this._app.firestore();
<<<<<<< HEAD
=======
            // TODO: implement a way to validate when connection is established
>>>>>>> ae7a8bc... feat(firestore-db): use new serialized-query
        }
        return this;
    }
    async auth() {
        await import(/* webpackChunkName: 'firebase-auth' */ '@firebase/auth');
<<<<<<< HEAD
        if (this._app && this._app.auth) {
=======
        if (this._app?.auth) {
>>>>>>> ae7a8bc... feat(firestore-db): use new serialized-query
            return this._app.auth();
        }
        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
    }
}
//# sourceMappingURL=FirestoreClient.js.map