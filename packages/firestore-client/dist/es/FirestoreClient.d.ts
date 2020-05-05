import { FirestoreDb } from '@forest-fire/firestore-db';
import { IClientAuth, IClientConfig, IClientSdk, IMockConfig } from '@forest-fire/types';
export declare class FirestoreClient extends FirestoreDb implements IClientSdk {
    static connect(config: IClientConfig | IMockConfig): Promise<FirestoreClient>;
    protected _auth: IClientAuth | undefined;
    protected _config: IClientConfig | IMockConfig;
    protected _isAdminApi: boolean;
    constructor(config?: IClientConfig | IMockConfig);
    connect(): Promise<FirestoreClient>;
    auth(): Promise<IClientAuth>;
    protected loadAuthApi(): Promise<void>;
    protected loadFirestoreApi(): Promise<void>;
}
