import { AbstractedDatabase } from '@forest-fire/abstracted-database';
import type { IAdminApp, IClientApp, IFirestoreDatabase, IAbstractedDatabase, ISerializedQuery, IAbstractedEvent } from '@forest-fire/types';
import { IFirestoreDb } from './firestore-types';
import type { Mock as IMockApi } from 'firemock';
export declare abstract class FirestoreDb extends AbstractedDatabase implements IFirestoreDb, IAbstractedDatabase<IMockApi> {
    protected _database?: IFirestoreDatabase;
    protected _app: IClientApp | IAdminApp;
    protected get database(): IFirestoreDatabase;
    protected set database(value: IFirestoreDatabase);
    protected _isCollection(path: string | ISerializedQuery): boolean;
    protected _isDocument(path: string | ISerializedQuery): boolean;
    get mock(): any;
    getList<T = any>(path: string | ISerializedQuery<T>, idProp?: string): Promise<T[]>;
    getPushKey(path: string): Promise<string>;
    getRecord<T = any>(path: string, idProp?: string): Promise<T>;
    getValue<T = any>(path: string): Promise<void>;
    update<T = any>(path: string, value: Partial<T>): Promise<void>;
    set<T = any>(path: string, value: T): Promise<void>;
    remove(path: string): Promise<void>;
    /**
     * watch
     *
     * Watch for firebase events based on a DB path or `SerializedQuery` (path plus query elements)
     *
     * @param target a database path or a SerializedQuery
     * @param events an event type or an array of event types (e.g., "value", "child_added")
     * @param cb the callback function to call when event triggered
     */
    watch(target: string | ISerializedQuery, events: IAbstractedEvent | IAbstractedEvent[], cb: any): void;
    unWatch(events?: IAbstractedEvent | IAbstractedEvent[], cb?: any): void;
    ref(path?: string): void;
    private _removeDocument;
    private _removeCollection;
}
