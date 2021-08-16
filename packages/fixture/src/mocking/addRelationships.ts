import { Record, Model } from 'firemodel';
import { IDatabaseSdk, ISdk } from '@forest-fire/types';
import {
  IMockRelationshipConfig,
  IMockResponse,
  processHasMany,
  processHasOne,
} from '~/mocking/index';

import { IDictionary } from 'common-types';

/**
 * Adds relationships to mocked records
 */
export function addRelationships<
  TSdk extends ISdk,
  M extends Model,
  D extends IDatabaseSdk<TSdk>
>(db: D, config: IMockRelationshipConfig, _exceptions: IDictionary = {}) {
  return async (record: Record<TSdk, M>): Promise<Array<IMockResponse<M>>> => {
    const relns = record.META.relationships;
    const relnResults: Array<IMockResponse<M>> = [];

    if (config.relationshipBehavior !== 'ignore') {
      for (const rel of relns) {
        if (
          !config.cardinality ||
          Object.keys(config.cardinality).includes(rel.property)
        ) {
          if (rel.relType === 'hasOne') {
            const fkRec = await processHasOne<TSdk, M>(record, rel, config, db);
            if (config.relationshipBehavior === 'follow') {
              relnResults.push(fkRec);
            }
          } else {
            const cardinality = config.cardinality
              ? typeof config.cardinality[rel.property] === 'number'
                ? config.cardinality[rel.property]
                : NumberBetween(
                    config.cardinality[rel.property] as [number, number]
                  )
              : 2;
            for (const _ of Array(cardinality)) {
              const fkRec = await processHasMany<TSdk, M>(record, rel, config);
              if (config.relationshipBehavior === 'follow') {
                relnResults.push(fkRec);
              }
            }
          }
        }
      }
    }

    return [
      {
        id: record.id,
        compositeKey: record.compositeKey,
        modelName: record.modelName,
        pluralName: record.pluralName,
        dbPath: record.dbPath,
        localPath: record.localPath,
        data: record.data,
        ...record,
      },
      ...relnResults,
    ];
  };
}

function NumberBetween(startEnd: [number, number]) {
  return (
    Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]
  );
}
