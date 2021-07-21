import { Record, IModel } from "firemodel";
import { IDatabaseSdk  } from "@forest-fire/types";
import { IMockRelationshipConfig, IMockResponse } from "~/mocking/index"
import { processHasMany, processHasOne } from "./index";

import { IDictionary } from "common-types";

/**
 * Adds relationships to mocked records
 */
export function addRelationships<M extends IModel, D extends IDatabaseSdk<any>>(
  db: D,
  config: IMockRelationshipConfig,
  exceptions: IDictionary = {}
) {
  return async (record: Record<M>): Promise<Array<IMockResponse<M>>> => {
    const relns = record.META.relationships;
    const relnResults: Array<IMockResponse<M>> = [];

    if (config.relationshipBehavior !== "ignore") {
      for (const rel of relns) {
        if (
          !config.cardinality ||
          Object.keys(config.cardinality).includes(rel.property)
        ) {
          if (rel.relType === "hasOne") {
            const fkRec = await processHasOne<M>(record, rel, config, db);
            if (config.relationshipBehavior === "follow") {
              relnResults.push(fkRec);
            }
          } else {
            const cardinality = config.cardinality
              ? typeof config.cardinality[rel.property] === "number"
                ? config.cardinality[rel.property]
                : NumberBetween(config.cardinality[rel.property] as any)
              : 2;
            for (const i of Array(cardinality)) {
              const fkRec = await processHasMany<M>(record, rel, config, db);
              if (config.relationshipBehavior === "follow") {
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
