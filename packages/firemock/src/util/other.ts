import { firstKey, lastKey } from 'native-dash';
import { IDictionary} from 'common-types';
import type { IRtdbDataSnapshot } from '@forest-fire/types';

export function normalizeRef(r: string): string {
  r = r.replace('/', '.');
  r = r.slice(0, 1) === '.' ? r.slice(1) : r;

  return r;
}

export function parts(r: string) {
  return normalizeRef(r).split('.');
}

/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */
export function leafNode(r: string) {
  return parts(r).pop();
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function firstProp<T = IDictionary>(listOf: IDictionary<any>) {
  return listOf ? listOf[firstKey(listOf)] : {};
}

export function lastProp<T = IDictionary>(listOf: IDictionary<any>) {
  return listOf[lastKey(listOf)] as T;
}

export function objectIndex(obj: IDictionary, index: number) {
  const keys = Object.keys(obj);
  return keys ? obj[keys[index - 1]] : null;
}

export function removeKeys(obj: IDictionary, remove: string[]) {
  return Object.keys(obj).reduce((agg: IDictionary, v: any) => {
    if (remove.indexOf(v) === -1) {
      agg[v] = obj[v];
    }
    return agg;
  }, {});
}

/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */
export function join(...paths: string[]) {
  return paths
    .map((p) => {
      return p.replace(/[\/\\]/gm, '.');
    })
    .map((p) => (p.slice(-1) === '.' ? p.slice(0, p.length - 1) : p))
    .map((p) => (p.slice(0, 1) === '.' ? p.slice(1) : p))
    .join('.');
}

export function pathDiff(longPath: string, pathSubset: string) {
  const subset = pathSubset.split('.');
  const long = longPath.split('.');
  if (
    subset.length > long.length ||
    JSON.stringify(long.slice(0, subset.length)) !== JSON.stringify(subset)
  ) {
    throw new Error(`"${pathSubset}" is not a subset of ${longPath}`);
  }

  return long.length === subset.length
    ? ''
    : long.slice(subset.length - long.length).join('.');
}

export function orderedSnapToJS<T = any>(snap: IRtdbDataSnapshot) {
  const jsObject: IDictionary<T> = {};
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  snap.forEach((record: any) => (jsObject[record.key] = record.val()));

  return jsObject;
}

/**
 * Given a path, returns the parent path and child key
 */
export function keyAndParent(dotPath: string) {
  const sections = dotPath.split('.');
  const changeKey = sections.pop();
  const parent = sections.join('.');
  return { parent, key: changeKey };
}

/** converts a '/' delimited path to a '.' delimited one */
export function dotNotation(path: string) {
  path = path.slice(0, 1) === '/' ? path.slice(1) : path;
  return path ? path.replace(/\//g, '.') : undefined;
}

export function slashNotation(path: string) {
  return path.replace(/\./g, '/');
}

/** Get the parent DB path */
export function getParent(dotPath: string) {
  return keyAndParent(dotPath).parent;
}

/** Get the Key from the end of a path string */
export function getKey(dotPath: string) {
  return keyAndParent(dotPath).key;
}

export function stripLeadingDot(str: string) {
  return str.slice(0, 1) === '.' ? str.slice(1) : str;
}

export function removeDots(str?: string) {
  return str ? str.replace(/\./g, '') : undefined;
}
