import { FirestoreDb, IFirestoreDb } from '@forest-fire/firestore-db';
import { IAbstractedDatabase, IClientApp, IClientAuth, IClientConfig, IMockConfig, SDK, FirebaseNamespace } from '@forest-fire/types';
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
    protected loadFirebaseApi(): Promise<typeof import("@firebase/app")>;
    protected loadAuthApi(): Promise<{
        default: typeof import("@firebase/auth");
    }>;
    protected loadFirestoreApi(): Promise<{
        default: typeof import("@firebase/firestore");
        registerFirestore(instance: import("@firebase/app-types").FirebaseNamespace): void;
    }>;
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    protected _connectMockDb(config: IMockConfig): Promise<void>;
    protected _connectRealDb(config: IClientConfig): Promise<void>;
}
