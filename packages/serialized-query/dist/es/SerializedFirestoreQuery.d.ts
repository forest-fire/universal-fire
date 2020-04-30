import type { IDictionary } from 'common-types';
import type { IComparisonOperator, IFirestoreQuery, IFirestoreQueryOrderType, ISimplifiedDatabase } from './@types/index';
import { SerializedQuery } from './index';
/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
export declare class SerializedFirestoreQuery<T = IDictionary> extends SerializedQuery<T> {
    static path<T extends object = IDictionary>(path?: string): SerializedFirestoreQuery<T>;
    protected _orderBy: IFirestoreQueryOrderType;
    protected _db?: ISimplifiedDatabase;
    get db(): ISimplifiedDatabase;
    orderBy(child: keyof T & string): this;
    set db(value: ISimplifiedDatabase);
    deserialize(db?: ISimplifiedDatabase): IFirestoreQuery;
    execute(db?: ISimplifiedDatabase): Promise<import("@firebase/firestore-types").QuerySnapshot<import("@firebase/firestore-types").DocumentData>>;
    where<V>(operation: IComparisonOperator, value: V, key?: keyof T & string): this;
}
