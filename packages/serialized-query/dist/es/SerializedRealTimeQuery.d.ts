import type { IDictionary } from 'common-types';
import { BaseSerializer } from './index';
import { IComparisonOperator, IRealQueryOrderType, IRealTimeQuery, ISimplifiedDatabase, IRtdbDataSnapshot } from '@forest-fire/types';
/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
export declare class SerializedRealTimeQuery<T = IDictionary> extends BaseSerializer<T> {
    static path<T = IDictionary>(path?: string): SerializedRealTimeQuery<T>;
    protected _orderBy: IRealQueryOrderType;
    startAt(value: any, key?: keyof T & string): this;
    endAt(value: any, key?: keyof T & string): this;
    equalTo(value: any, key?: keyof T & string): this;
    deserialize(db?: ISimplifiedDatabase): IRealTimeQuery;
    execute(db?: ISimplifiedDatabase): Promise<IRtdbDataSnapshot>;
    where<V>(operation: IComparisonOperator, value: V, key?: keyof T & string): this;
    /**
     * Ensures that when a `key` is passed in as part of the query modifiers --
     * such as "startAt", "endAt", etc. -- that the sorting strategy is valid.
     *
     * @param caller gives a simple string name for the method
     * which is currently being called to modify the search filters
     * @param key the key value that _might_ have been erroneously passed in
     */
    protected validateKey(caller: string, key: keyof T | undefined, allowed: IRealQueryOrderType[]): void;
}
