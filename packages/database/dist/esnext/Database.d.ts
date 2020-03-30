import { FirebaseApp } from '@firebase/app-types';
import { FirebaseAuth } from '@firebase/auth-types';
import { FirebaseDatabase } from '@firebase/database-types';
import { FirebaseFirestore } from '@firebase/firestore-types';
declare type IConfig = Record<string, any>;
export declare abstract class Database {
    static connect<T extends Database>(constructor: new () => T, config: IConfig): Promise<T>;
    /**
     * The Firebase app.
     */
    protected _app: FirebaseApp | undefined;
    /**
     * The database.
     */
    protected _database: FirebaseDatabase | FirebaseFirestore | undefined;
    /**
     * Sets the `_app`.
     */
    protected set app(value: FirebaseApp);
    /**
     * Returns the `_app`.
     */
    protected get app(): FirebaseApp;
    /**
     * Sets the `_database`.
     */
    protected set database(value: FirebaseDatabase | FirebaseFirestore | undefined);
    /**
     * Returns the `_database`.
     */
    protected get database(): FirebaseDatabase | FirebaseFirestore | undefined;
    /**
     * Initializes the Firebase app.
     */
    protected abstract _initializeApp(config: IConfig): void;
    /**
     * Connects to the database.
     */
    protected abstract _connect(): Promise<this>;
    /**
     * Returns the authentication API of the database.
     */
    get auth(): FirebaseAuth;
}
export {};
