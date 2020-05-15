import { IDictionary } from "common-types";
import { SerializedFirestoreQuery, SerializedRealTimeQuery } from "./index";

export interface ISimplifiedDb extends IDictionary {
  constructor: {
    name: string;
  };
}

export class SerializedQuery {
  static create(db: ISimplifiedDb, path: string = "/") {
    const name = db.constructor.name;
    if (["RealTimeClient", "RealTimeAdmin"].includes(name)) {
      return SerializedRealTimeQuery.path(path);
    } else {
      return SerializedFirestoreQuery.path(path);
    }
  }
}
