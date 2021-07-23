import { IMockRelationshipConfig, Model, IDatabaseSdk, Record, getModelMeta } from "firemodel";
import { IDictionary } from "common-types";
import { mockValue } from "./index";

/** adds mock values for all the properties on a given model */
export function mockProperties<T extends Record<string, unknown>>(
  db: IDatabaseSdk,
  config: IMockRelationshipConfig = { relationshipBehavior: "ignore" },
  exceptions: IDictionary
) {
  return async (record: Record<T>): Promise<Record<T>> => {
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
    });

    return record;
  };
}
