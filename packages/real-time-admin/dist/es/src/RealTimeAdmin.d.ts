import { RealTimeDb } from '@forest-fire/real-time-db';
import { EventManager } from './EventManager';
import { IAdminConfig, IMockConfig, IAdminConfigCompleted, IAdminAuth } from '@forest-fire/types';
export interface IFirebaseListener {
    id: string;
    cb: (db: RealTimeAdmin) => void;
}
export declare class RealTimeAdmin extends RealTimeDb {
    protected _isAdminApi: boolean;
    /**
     * Instantiates a DB and then waits for the connection
     * to finish before resolving the promise.
     */
    protected _eventManager: EventManager;
    protected _clientType: string;
    protected _isAuthorized: boolean;
    protected _auth?: IAdminAuth;
    protected _config: IAdminConfigCompleted | IMockConfig;
    protected app: any;
    constructor(config?: IAdminConfig | IMockConfig);
    /**
     * Provides access to the Firebase Admin Auth API.
     *
     * > If using a _mocked_ database then the Auth API will be redirected to **firemock**
     * instead of the real Admin SDK for Auth. Be aware that this mocked API may not be fully implemented
     * but PR's are welcome if the part you need is not yet implemented. If you want to explicitly state
     * whether to use the _real_ or _mock_ Auth SDK then you can state this by passing in a `auth` parameter
     * as part of the configuration (using either "real" or "mocked" as a value)
     *
     * References:
     * - [Introduction](https://firebase.google.com/docs/auth/admin)
     * - [API](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth)
     */
    auth(): Promise<IAdminAuth>;
    goOnline(): void;
    goOffline(): void;
    connect(): Promise<this>;
    /**
     * listenForConnectionStatus
     *
     * in the admin interface we assume that ONCE connected
     * we remain connected; this is unlike the client API
     * which provides an endpoint to lookup
     */
    protected listenForConnectionStatus(): void;
}
