/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMockStore, IRtdbDataSnapshot, IRtdbSdk } from '@forest-fire/types';
import { SortingFunction } from 'common-types';
import { arrayToHash } from 'typed-conversions';
import { getKey, join } from '~/util';
import { get } from "native-dash";
import { reference } from './reference';

export function snapshot<
  TSdk extends IRtdbSdk = IRtdbSdk,
  T extends unknown = unknown
>(store: IMockStore<TSdk>, key: string, value: T[] | T): IRtdbDataSnapshot {
  const val = () => (Array.isArray(value) ? arrayToHash(value) : value);
  let sortingFunction: SortingFunction;

  const snapshotKey = getKey(join(key));

  return {
    get key() {
      return snapshotKey;
    },
    val,
    get ref() {
      return reference(store, snapshotKey);
    },

    toJSON() {
      return JSON.stringify(value);
    },

    child(path: string) {
      const _value = get(value, path, null);
      return _value ? snapshot(store, path, _value) : null;
    },

    hasChild(path: string): boolean {
      if (typeof value === 'object') {
        return Object.keys(value).indexOf(path) !== -1;
      }

      return false;
    },

    hasChildren(): boolean {
      if (typeof value === 'object') {
        return Object.keys(value).length > 0;
      }

      return false;
    },

    numChildren(): number {
      if (typeof value === 'object' && value) {
        return Object.keys(value).length;
      }

      return 0;
    },

    exists(): boolean {
      return value !== null;
    },

    forEach(actionCb: (a: IRtdbDataSnapshot) => boolean | void) {
      const cloned = (value as any).slice(0);
      const sorted = cloned.sort(sortingFunction);
      sorted.map((item: any) => {
        const noId = { ...{}, ...item };
        delete noId.id;
        const halt = actionCb(snapshot(store, item.id, noId));
        if (halt) {
          return true;
        }
      });

      return false;
    },

    /** NOTE: mocking proxies this call through to val(), no use of "priority" */
    exportVal() {
      return val();
    },

    getPriority(): string | number | null {
      return null;
    },
  };
  // return {
  //   sortingFunction(fn: SortingFunction) {
  //     sortingFunction = fn;
  //   },
  //   ...partialSnapshot,
  // };
}
