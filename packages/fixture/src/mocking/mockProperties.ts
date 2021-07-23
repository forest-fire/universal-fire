import {
  Model,
  Record
} from 'firemodel';
import { IDatabaseSdk, ISdk } from '@forest-fire/types';
import { IDictionary } from 'common-types';
import { IMockRelationshipConfig, mockValue } from './index';
import { getModelMeta } from '~/utils';

/** adds mock values for all the properties on a given model */
export function mockProperties<TSdk extends ISdk,T extends Model>(
  db: IDatabaseSdk<TSdk>,
  config: IMockRelationshipConfig = { relationshipBehavior: 'ignore' },
  exceptions: IDictionary
) {
  return async (record: Record<TSdk, T>): Promise<Record<TSdk, T>> => {
    const meta = getModelMeta(record);
    const props = meta.properties;

    const recProps: Partial<T> = {};
    // set properties on the record with mocks
    const context: IDictionary = {};

    for (const prop of props) {
      const p = prop.property as keyof T;
      recProps[p] = await mockValue<T>(db, prop, context);
    }

    // use mocked values but allow exceptions to override
    const finalized: T = { ...(recProps as any), ...exceptions };

    // write to mock db and retain a reference to same model
    record = await Record.add(record.modelConstructor, finalized, {
      silent: true,
    }) as Record<TSdk, T>;

    return record;
  };
}
