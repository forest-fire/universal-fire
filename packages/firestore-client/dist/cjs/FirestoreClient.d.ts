import { FirestoreDb } from '@forest-fire/firestore-db';
import { IMockConfig, IClientSdk, IClientConfig } from '@forest-fire/types';
export declare class FirestoreClient extends FirestoreDb implements IClientSdk {
    static connect(config: IClientConfig | IMockConfig): Promise<FirestoreClient>;
    protected _config: IClientConfig | IMockConfig;
    protected _isAdminApi: boolean;
    constructor(config: IClientConfig | IMockConfig);
    connect(): Promise<void>;
    auth(): Promise<import("@firebase/auth-types").FirebaseAuth>;
}
