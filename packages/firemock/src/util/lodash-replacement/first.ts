import { IDictionary } from 'common-types';

/**
 * **first**
 *
 * Returns the _first_ item in an array or dictionary. This
 * is intended as a direct replacement for `lodash.first()`
 *
 * @param items either an array (typically) or an object
 */
export function first<T = any>(items: T[] | IDictionary<T>) {
  if (Array.isArray(items)) {
    return items.slice(0, 1).pop();
  }
  if (typeof items === 'object') {
    const key = Object.keys(items).slice(0, 1).pop();
    return key ? items[key] : undefined;
  }

  return undefined;
}
