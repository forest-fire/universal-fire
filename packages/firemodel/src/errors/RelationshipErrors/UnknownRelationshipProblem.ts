import { FireModelError } from "~/errors";
import { IFmRelationshipOperation } from "~/types";
import { Record } from "~/core";
import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
export class UnknownRelationshipProblem<
  T extends Model,
  S extends ISdk = "RealTimeClient"
> extends FireModelError {
  constructor(
    err: Error,
    rec: Record<T, S>,
    property: keyof T,
    operation: IFmRelationshipOperation | "n/a" = "n/a",
    whileDoing?: string
  ) {
    const message = `An unexpected error occurred while working with a "${operation}" operation on ${
      rec.modelName
    }::${String(property)}. ${
      whileDoing
        ? `This error was encounted while working on ${whileDoing}. `
        : ""
    }The error reported was [${err.name}]: ${err.message}`;
    super(message, "firemodel/unknown-relationship-problem");
    this.stack = err.stack;
  }
}
