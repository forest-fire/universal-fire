import { DelayType, IFirebaseEventHandler, QueryValue } from "../@types";
import { IRtdbDataSnapshot, IRtdbDbEvent, IRtdbQuery, IRtdbReference } from '@forest-fire/types';
import { IDictionary } from 'common-types';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
/** tslint:ignore:member-ordering */
export declare abstract class Query<T = any> implements IRtdbQuery {
    path: string;
    protected _query: SerializedRealTimeQuery;
    protected _delay: DelayType;
    constructor(path: string | SerializedRealTimeQuery, delay?: DelayType);
    get ref(): IRtdbReference;
    limitToLast(num: number): Query<T>;
    limitToFirst(num: number): Query<T>;
    equalTo(value: QueryValue, key?: Extract<keyof T, string>): Query<T>;
    /** Creates a Query with the specified starting point. */
    startAt(value: QueryValue, key?: string): Query<T>;
    endAt(value: QueryValue, key?: string): Query<T>;
    /**
     * Setup an event listener for a given eventType
     */
    on(eventType: IRtdbDbEvent, callback: (a: IRtdbDataSnapshot, b?: null | string) => any, cancelCallbackOrContext?: (err?: Error) => void | null, context?: object | null): (a: IRtdbDataSnapshot, b?: null | string) => Promise<null>;
    once(eventType: 'value'): Promise<IRtdbDataSnapshot>;
    off(): void;
    /**
     * Returns a boolean flag based on whether the two queries --
     * _this_ query and the one passed in -- are equivalen in scope.
     */
    isEqual(other: Query): boolean;
    /**
     * When the children of a query are all objects, then you can sort them by a
     * specific property. Note: if this happens a lot then it's best to explicitly
     * index on this property in the database's config.
     */
    orderByChild(prop: string): Query<T>;
    /**
     * When the children of a query are all scalar values (string, number, boolean), you
     * can order the results by their (ascending) values
     */
    orderByValue(): Query<T>;
    /**
     * order is based on the order of the
     * "key" which is time-based if you are using Firebase's
     * _push-keys_.
     *
     * **Note:** this is the default sort if no sort is specified
     */
    orderByKey(): Query<T>;
    /** NOT IMPLEMENTED */
    orderByPriority(): Query<T>;
    toJSON(): {
        identity: string;
        query: IDictionary<any>;
    };
    toString(): string;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getKey(): string | null;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getParent(): IRtdbReference | null;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getRoot(): IRtdbReference;
    protected abstract addListener(pathOrQuery: string | SerializedRealTimeQuery<any>, eventType: IRtdbDbEvent, callback: IFirebaseEventHandler, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): Promise<IRtdbDataSnapshot>;
    /**
     * Reduce the dataset using _filters_ (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */
    private getQuerySnapShot;
}
