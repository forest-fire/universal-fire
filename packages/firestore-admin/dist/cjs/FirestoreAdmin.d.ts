import { IAdminApp, IAdminAuth, IAdminConfig, IAdminSdk, IMockConfig, SDK } from '@forest-fire/types';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { IAbstractedDatabase } from '@forest-fire/abstracted-database';
export declare class FirestoreAdmin extends FirestoreDb implements IAdminSdk, IAbstractedDatabase {
    sdk: SDK;
    static connect(config: IAdminConfig | IMockConfig): Promise<FirestoreAdmin>;
    protected _isAdminApi: boolean;
    protected _auth?: IAdminAuth;
    protected _app: IAdminApp;
    protected _config: IAdminConfig | IMockConfig;
    constructor(config?: IAdminConfig | IMockConfig);
    connect(): Promise<FirestoreAdmin>;
    auth(): Promise<IAdminAuth>;
    protected loadFirestoreApi(): Promise<void>;
}
