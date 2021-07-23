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
  db: IDatabaseSdk<TSdk>
): Promise<IMockResponse<T>> {
  // by creating a mock we are giving any dynamic path segments
  // an opportunity to be mocked (this is best practice)
  const fkMockMeta = (await Mock<TSdk, T>(rel.fkConstructor(), db).generate(1)).pop();
  const prop: Extract<keyof IModel<T>, string> = rel.property as any;

  await record.addToRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    await db.remove(fkMockMeta.dbPath);
    return;
  }

  return fkMockMeta;
}
