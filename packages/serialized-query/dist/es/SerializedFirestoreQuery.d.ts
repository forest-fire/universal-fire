import type { IDictionary } from 'common-types';
import type { IComparisonOperator, IFirestoreQuery, IFirestoreQueryOrderType, ISimplifiedDatabase } from './index';
import { BaseSerializer } from './index';
import type { IFirestoreQuerySnapshot } from '@forest-fire/types';
/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
export declare class SerializedFirestoreQuery<T = IDictionary> extends BaseSerializer<T> {
    static path<T = IDictionary>(path?: string): SerializedFirestoreQuery<T>;
    protected _orderBy: IFirestoreQueryOrderType;
    protected _db?: ISimplifiedDatabase;
    get db(): ISimplifiedDatabase;
    orderBy(child: keyof T & string): this;
    set db(value: ISimplifiedDatabase);
    deserialize(db?: ISimplifiedDatabase): IFirestoreQuery;
    execute(db?: ISimplifiedDatabase): Promise<IFirestoreQuerySnapshot>;
    where<V>(operation: IComparisonOperator, value: V, key?: keyof T & string): this;
}
