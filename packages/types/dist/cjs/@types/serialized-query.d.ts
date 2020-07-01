import { IFirestoreQuery, IRealTimeQuery } from './fire-proxies';
import { IDictionary } from 'common-types';
/**
 * Defines the public interface which any serializer must
 * conform to to be recognized as a Serialized Query in
 * `universal-fire`.
 */
export interface ISerializedQuery<T = any> {
    db: ISimplifiedDatabase;
    path: string;
    identity: ISerializedIdentity<T>;
    setDB: (db: ISimplifiedDatabase) => ISerializedQuery<T>;
    setPath: (path: string) => ISerializedQuery<T>;
    hashCode: () => number;
    limitToFirst: (value: number) => ISerializedQuery<T>;
    limitToLast: (value: number) => ISerializedQuery<T>;
    orderByChild: (child: keyof T & string) => ISerializedQuery<T>;
    orderByValue: () => ISerializedQuery<T>;
    orderByKey: () => ISerializedQuery<T>;
    startAt: (value: any, key?: keyof T & string) => ISerializedQuery<T>;
    endAt: (value: any, key?: keyof T & string) => ISerializedQuery<T>;
    equalTo: (value: any, key?: keyof T & string) => ISerializedQuery<T>;
    toJSON: () => ISerializedIdentity<T>;
    toString: () => string;
    deserialize: (db: ISimplifiedDatabase) => IFirestoreQuery | IRealTimeQuery;
    execute(db?: ISimplifiedDatabase): Promise<any>;
    where: (operation: IComparisonOperator, value: any, key?: (keyof T & string) | undefined) => ISerializedQuery<T>;
}
export interface ISerializedIdentity<T> extends Omit<ISerializedRealTimeIdentity<T>, 'orderBy'> {
    orderBy: IRealQueryOrderType | IFirestoreQueryOrderType;
}
export declare type IComparisonOperator = '=' | '>' | '<';
export interface ISimplifiedDatabase {
    ref: (path: string) => any | IRealTimeQuery | IFirestoreQuery;
}
export declare enum RealQueryOrderType {
    orderByChild = "orderByChild",
    orderByKey = "orderByKey",
    orderByValue = "orderByValue"
}
export declare type IRealQueryOrderType = keyof typeof RealQueryOrderType;
export declare type IFirestoreQueryOrderType = IRealQueryOrderType | 'orderBy';
export interface ISerializedRealTimeIdentity<T = IDictionary> {
    orderBy: IRealQueryOrderType;
    orderByKey?: keyof T;
    limitToFirst?: number;
    limitToLast?: number;
    startAt?: string;
    startAtKey?: string;
    endAt?: string;
    endAtKey?: string;
    equalTo?: string;
    equalToKey?: string;
    path: string;
}
