import { Model } from "~/models/Model";
import { CompositeKeyString, ForeignKey, isCompositeString, PrimaryKey } from "~/types";
import { reduceCompositeNotationToStringRepresentation } from "./reduceCompositeNotationToStringRepresentation";


/**
 * Given either a `ForeignKey` or `PrimaryKey` as input; this function will return
 * a fully qualified string reference.
 */
export function createCompositeKeyString<T extends Model>(input: PrimaryKey<T> | ForeignKey<T>): string | CompositeKeyString {
  if (isCompositeString(input)) {
    return input;
  } else if (typeof (input) === "string") {
    return input;
  } else {
    return reduceCompositeNotationToStringRepresentation<T>(input);
  }
}