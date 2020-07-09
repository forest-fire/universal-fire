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
export function last<T = any>(items: T[] | IDictionary<T>) {
  if (Array.isArray(items)) {
    return items.slice(-1).pop();
  }
  if (typeof items === 'object') {
    const key = Object.keys(items).slice(-1).pop();
    return key ? items[key] : undefined;
  }

  return undefined;
}
