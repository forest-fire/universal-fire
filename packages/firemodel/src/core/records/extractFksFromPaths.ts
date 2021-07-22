import { IFmPathValuePair } from "~/types";
import { ISdk } from "@forest-fire/types";
import { Record } from "~/core";
import { pathJoin } from "native-dash";
import { Model } from "~/models/Model";

export function extractFksFromPaths<S extends ISdk = ISdk, T extends Model = Model>(
  rec: Record<S, T>,
  prop: keyof T & string,
  paths: IFmPathValuePair[]
): (string & keyof T)[] {
  const pathToModel = rec.dbPath;
  const relnType = rec.META.relationship(prop).relType;
  return paths.reduce((acc, p) => {
    const fkProp = pathJoin(pathToModel, prop);

    if (p.path.includes(fkProp)) {
      const parts = p.path.split("/");
      const fkId = relnType === "hasOne" ? p.value : parts.pop();
      acc = acc.concat(fkId);
    }

    return acc;
  }, [] as (string & keyof T)[]);
}
