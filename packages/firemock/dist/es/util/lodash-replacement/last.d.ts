import { IDictionary } from 'common-types';
/**
 * **last**
 *
 * Returns the _last_ item in an array or dictionary. This
 * is intended as a direct replacement for `lodash.last()`
 *
 * @param items either an array (most typically) or an object
 * (where it will return the _last_ key)
 */
export declare function last<T = any>(items: T[] | IDictionary<T>): T;
