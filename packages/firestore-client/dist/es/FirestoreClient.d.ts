import { FirestoreDb, IFirestoreDb } from '@forest-fire/firestore-db';
import { IAbstractedDatabase, IClientApp, IClientAuth, IClientConfig, IMockConfig, SDK, FirebaseNamespace, IClientFirestoreDatabase } from '@forest-fire/types';
import type { Mock as IMockApi } from 'firemock';
export declare class FirestoreClient extends FirestoreDb implements IFirestoreDb, IAbstractedDatabase<IMockApi> {
    sdk: SDK;
    static connect(config: IClientConfig | IMockConfig): Promise<FirestoreClient>;
    protected _isAdminApi: boolean;
    protected _auth?: IClientAuth;
    protected _app: IClientApp;
    protected _firestore: any;
    protected _config: IClientConfig | IMockConfig;
    protected _authProviders: FirebaseNamespace['auth'];
    constructor(config?: IClientConfig | IMockConfig);
    connect(): Promise<FirestoreClient>;
    auth(): Promise<IClientAuth>;
    protected loadFirebaseAppApi(): Promise<import("@firebase/app-types").FirebaseApp>;
    protected loadAuthApi(): Promise<IClientAuth>;
    /**
     * This loads the firestore API but more importantly this makes the
     * firestore function available off the Firebase App API which provides
     * us instances of the of the firestore API.
     */
    protected loadFirestoreApi(): Promise<IClientFirestoreDatabase>;
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    protected _connectMockDb(config: IMockConfig): Promise<void>;
    protected _connectRealDb(config: IClientConfig): Promise<void>;
}
