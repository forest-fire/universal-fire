import {
  IFmModelRelationshipMeta,
  IModel,
  Model,
  Record
} from "firemodel";
import { IDatabaseSdk, IMockDatabase, ISdk } from "@forest-fire/types";
import { IMockRelationshipConfig, IMockResponse } from "./mocking-types";
import { Mock } from "~/Mock";

export async function processHasOne<TSdk extends ISdk, T extends Model>(
  source: Record<TSdk, T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockRelationshipConfig,
  db: IDatabaseSdk<TSdk>
): Promise<IMockResponse<T>> {
  const fkMock = Mock<T>(rel.fkConstructor());
  const fkMockMeta = (await fkMock.generate(1)).pop();
  const prop: Extract<keyof IModel<T>, string> = rel.property as any;

  source.setRelationship(prop, fkMockMeta.compositeKey);

  if (config.relationshipBehavior === "link") {
    const predecessors = fkMockMeta.dbPath
      .replace(fkMockMeta.id, "")
      .split("/")
      .filter((i) => i);

    db.remove(fkMockMeta.dbPath);
  }

  return fkMockMeta;
}
