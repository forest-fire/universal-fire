import { FirestoreDb } from '@forest-fire/firestore-db';
import { IMockConfig } from '@forest-fire/types';
import type { IAdminApp, IAdminAuth, IAdminConfig, IAdminSdk } from '@forest-fire/types';
export declare class FirestoreAdmin extends FirestoreDb implements IAdminSdk {
    static connect(config: IAdminConfig | IMockConfig): Promise<FirestoreAdmin>;
    protected _isAdminApi: boolean;
    protected _auth?: IAdminAuth;
    protected _app?: IAdminApp;
    protected _config: IAdminConfig | IMockConfig;
    constructor(config?: IAdminConfig | IMockConfig);
    protected get app(): IAdminApp;
    protected set app(value: IAdminApp);
    connect(): Promise<FirestoreAdmin>;
    auth(): Promise<IAdminAuth>;
    protected loadFirestoreApi(): Promise<void>;
}
