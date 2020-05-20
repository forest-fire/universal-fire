import { FirestoreDb } from '@forest-fire/firestore-db';
import type { IClientApp, IClientAuth, IClientConfig, IClientSdk, IMockConfig } from '@forest-fire/types';
export declare class FirestoreClient extends FirestoreDb implements IClientSdk {
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
