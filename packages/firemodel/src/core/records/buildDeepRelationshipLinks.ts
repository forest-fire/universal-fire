import { ISdk } from "@forest-fire/types";
import { IDictionary } from "common-types";
import { IModel, IRecordOptions, PropertyOf } from "~/types";
import { Record } from "~/core";
import { getModelMeta } from "~/util";
import { Model } from "~/models/Model";

/**
 * When creating a new record it is sometimes desirable to pass in
 * the "payload" of FK's instead of just the FK. This function facilitates
 * that.
 */
export async function buildDeepRelationshipLinks<
  S extends ISdk,
  T extends Model<T>
>(rec: Record<T, S>, property: keyof IModel<T> & string): Promise<void> {
  const meta = getModelMeta(rec).property(property);
  return meta.relType === "hasMany"
    ? processHasMany(rec, property)
    : processBelongsTo(rec, property);
}

async function processHasMany<S extends ISdk, T extends Model>(
  rec: Record<T, S>,
  property: keyof IModel<T> & string
) {
  const meta = getModelMeta<T, S>(rec).property(property);
  const fks: IDictionary = rec.get(property);
  for (const key of Object.keys(fks)) {
    const fk = fks[key as keyof typeof fks] as true | IDictionary;
    if (fk !== true) {
      const fkRecord = await Record.add(meta.fkConstructor(), fk, {
        setDeepRelationships: true,
      });
      await rec.addToRelationship(property, fkRecord.compositeKeyRef);
    }
  }
  // strip out object FK's
  const newFks = Object.keys(rec.get(property)).reduce(
    (foreignKeys: IDictionary<true>, curr: string) => {
      const fk = fks[curr];
      if (fk !== true) {
        delete foreignKeys[curr];
      }
      return foreignKeys;
    },
    {}
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (rec as any)._data[property] = newFks;

  return;
}

async function processBelongsTo<S extends ISdk, T extends Model>(
  rec: Record<T, S>,
  property: PropertyOf<T>
): Promise<void> {
  const fk = rec.get(property);
  const meta = getModelMeta(rec).property(property);
  meta.fkConstructor();
  if (fk && typeof fk === "object") {
    await Record.add<T[PropertyOf<T>], IRecordOptions<S>, S>(
      meta.fkConstructor() as new () => T[PropertyOf<T>],
      fk,
      {
        setDeepRelationships: true,
        db: rec.db,
      }
    );
  }
}
