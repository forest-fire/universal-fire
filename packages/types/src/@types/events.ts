import { IRtdbDbEvent } from './fire-proxies';

export interface IFirebaseWatchContext {
  eventType: IRtdbDbEvent;
  targetType: any;
  /**
   * this tagging has been added as optional to not break prior API but all
   * server events will set this variable so that when it is received by **Firemodel**
   * it can distiguish local versus server triggered events.
   */
  kind?: 'server-event';
}

export interface IPathSetter<T = any> {
  path: string;
  value: T;
}

/** A standard watch event coming from the Firebase DB */
export interface IValueBasedWatchEvent extends IFirebaseWatchContext {
  targetType: 'query';
  key: string;
  value: any;
  previousChildKey?: string;
}
/**
 * an event which states an array of paths which have changes rather than
 * a singular value object; this happens typically when the event is originated
 * from Firemodel (aka, not Firebase) but can happen also when abstracted-firebase
 * writes to the DB using a "multi-path set" operation.
 */
export interface IPathBasedWatchEvent extends IFirebaseWatchContext {
  targetType: 'path';
  key: string;
  paths: IPathSetter[];
}
