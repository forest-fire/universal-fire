import type { IDictionary } from "common-types";
import type { IFirestoreQuery, IRealTimeQuery } from "@forest-fire/types";
export declare enum RealQueryOrderType {
    orderByChild = "orderByChild",
    orderByKey = "orderByKey",
    orderByValue = "orderByValue"
}
export declare type IRealQueryOrderType = keyof typeof RealQueryOrderType;
export declare type IFirestoreQueryOrderType = IRealQueryOrderType | "orderBy";
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
export interface ISerializedIdentity<T> extends Omit<ISerializedRealTimeIdentity<T>, "orderBy"> {
    orderBy: IRealQueryOrderType | IFirestoreQueryOrderType;
}
export declare type IComparisonOperator = "=" | ">" | "<";
export interface ISimplifiedDatabase {
    ref: (path: string) => any | IRealTimeQuery | IFirestoreQuery;
}
export { IFirestoreQuery, IRealTimeQuery };
