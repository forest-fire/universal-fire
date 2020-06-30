import { FirestoreDb, IFirestoreDb } from '@forest-fire/firestore-db';
import { IClientApp, IClientAuth, IClientConfig, IMockConfig, SDK } from '@forest-fire/types';
export declare class FirestoreClient extends FirestoreDb implements IFirestoreDb {
    sdk: SDK;
    static connect(config: IClientConfig | IMockConfig): Promise<FirestoreClient>;
    protected _isAdminApi: boolean;
    protected _auth?: IClientAuth;
    protected _app: IClientApp;
    protected _config: IClientConfig | IMockConfig;
    constructor(config?: IClientConfig | IMockConfig);
    connect(): Promise<FirestoreClient>;
    auth(): Promise<IClientAuth>;
    protected loadAuthApi(): Promise<void>;
    protected loadFirestoreApi(): Promise<void>;
}
