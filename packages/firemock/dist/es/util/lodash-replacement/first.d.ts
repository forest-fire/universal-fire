import { IDictionary } from 'common-types';
/**
 * **first**
 *
 * Returns the _first_ item in an array or dictionary. This
 * is intended as a direct replacement for `lodash.first()`
 *
 * @param items either an array (typically) or an object
 */
export declare function first<T = any>(items: T[] | IDictionary<T>): T;
