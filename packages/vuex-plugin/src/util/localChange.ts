import { FmEvents, IFmWatchEvent, Record } from 'firemodel';
import type { IFmEventActions, IFmLocalChange } from '~/types';
import { ISdk } from "universal-fire";
import { Model } from "firemodel";
import { IDictionary } from 'common-types';

/**
 * converts a "local change" event into the right data structure
 */
export function localChange<S extends ISdk = ISdk, T extends Model = Model>(event: IFmWatchEvent<S, T>): IFmLocalChange {
  const record = Record.createWith(event.modelConstructor, event.value);
  return {
    dbPath: record.dbPath,
    action: mapper(event.type),
    localPath: record.localPath,
    value: event.value,
    timestamp: new Date().getTime(),
  };
}

function mapper(evtType: string): IFmEventActions {
  const fields: IDictionary<IFmEventActions> = {
    [FmEvents.RECORD_ADDED_LOCALLY]: 'add',
    [FmEvents.RECORD_CHANGED_LOCALLY]: 'update',
    [FmEvents.RECORD_REMOVED_LOCALLY]: 'remove',
  };
  return fields[evtType] || 'unknown';
}
