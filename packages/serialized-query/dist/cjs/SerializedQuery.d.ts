import type { IDictionary } from 'common-types';
import type { IComparisonOperator, IFirestoreQuery, IFirestoreQueryOrderType, IRealQueryOrderType, IRealTimeQuery, ISerializedIdentity, ISimplifiedDatabase } from './index';
export declare abstract class SerializedQuery<T = IDictionary> {
    protected _endAtKey?: keyof T & string;
    protected _endAt?: string;
    protected _equalToKey?: keyof T & string;
    protected _equalTo?: string;
    protected _limitToFirst?: number;
    protected _limitToLast?: number;
    protected _orderKey?: keyof T & string;
    protected _path: string;
    protected _startAtKey?: keyof T & string;
    protected _startAt?: string;
    protected _db?: ISimplifiedDatabase;
    protected abstract _orderBy: IFirestoreQueryOrderType | IRealQueryOrderType;
    constructor(path?: string);
    get db(): ISimplifiedDatabase;
    get path(): string;
    get identity(): ISerializedIdentity<T>;
    /**
     * Allows the DB interface to be setup early, allowing clients
     * to call execute without any params.
     */
    setDB(db: ISimplifiedDatabase): this;
    setPath(path: string): this;
    /**
     * Returns a unique numeric hashcode for this query
     */
    hashCode(): number;
    limitToFirst(value: number): this;
    limitToLast(value: number): this;
    orderByChild(child: keyof T & string): this;
    orderByValue(): this;
    orderByKey(): this;
    startAt(value: any, key?: keyof T & string): this;
    endAt(value: any, key?: keyof T & string): this;
    equalTo(value: any, key?: keyof T & string): this;
    toJSON(): ISerializedIdentity<T>;
    toString(): string;
    /**
     * Generates a `Query` from the _state_ in this serialized query.
     */
    abstract deserialize(db?: ISimplifiedDatabase): IFirestoreQuery | IRealTimeQuery;
    /**
     * Execute the query as a one time fetch.
     */
    abstract execute(db?: ISimplifiedDatabase): Promise<any>;
    /**
     * Allows a shorthand notation for simple serialized queries.
     */
    abstract where<V>(operation: IComparisonOperator, value: V, key?: (keyof T & string) | undefined): this;
}
