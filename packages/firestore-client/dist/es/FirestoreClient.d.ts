import { FirestoreDb } from '@forest-fire/firestore-db';
import { IClientApp, IClientConfig, IClientSdk, IMockConfig } from '@forest-fire/types';
export declare class FirestoreClient extends FirestoreDb implements IClientSdk {
    static connect(config: IClientConfig | IMockConfig): Promise<FirestoreClient>;
    protected _app: IClientApp | undefined;
    protected _config: IClientConfig | IMockConfig;
    protected _isAdminApi: boolean;
    constructor(config: IClientConfig | IMockConfig);
    connect(): Promise<FirestoreClient>;
    auth(): Promise<import("@firebase/auth-types").FirebaseAuth>;
}
