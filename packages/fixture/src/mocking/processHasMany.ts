import {
  IFmModelRelationshipMeta,
  IModel,
  Model,
  Record
} from "firemodel";
import {IDatabaseSdk, ISdk} from "@forest-fire/types"
import { Mock } from "~/Mock";
import { IMockRelationshipConfig, IMockResponse } from "./mocking-types";

export async function processHasMany<TSdk extends ISdk, T extends Model>(
  record: Record<TSdk, T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockRelationshipConfig,
): Promise<IMockResponse<T>> {
  // by creating a mock we are giving any dynamic path segments
  // an opportunity to be mocked (this is best practice)
  const fkMockMeta = (await Mock<T>(rel.fkConstructor()).generate(1)).pop();
  const prop: Extract<keyof IModel<T>, string> = rel.property as any;
  console.log("processHasMany", { fkMockMeta, prop });
  await record.addToRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    await record.db.remove(fkMockMeta.dbPath);
    return;
  }

  return fkMockMeta;
}
