import { IAbstractedDatabase, IAdminApp, IAdminAuth, IAdminConfig, IAdminSdk, IMockConfig, SDK } from '@forest-fire/types';
import { FirestoreDb } from '@forest-fire/firestore-db';
import type { Mock as IMockApi } from 'firemock';
export declare class FirestoreAdmin extends FirestoreDb implements IAdminSdk, IAbstractedDatabase<IMockApi> {
    sdk: SDK;
    static connect(config: IAdminConfig | IMockConfig): Promise<FirestoreAdmin>;
    protected _isAdminApi: boolean;
    protected _auth?: IAdminAuth;
    protected _app: IAdminApp;
    protected _config: IAdminConfig | IMockConfig;
    constructor(config?: IAdminConfig | IMockConfig);
    connect(): Promise<FirestoreAdmin>;
    auth(): Promise<IAdminAuth>;
    protected _connectRealDb(config: IAdminConfig): Promise<void>;
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    protected _connectMockDb(config: IMockConfig): Promise<void>;
}
