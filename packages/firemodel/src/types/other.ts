import type { FakerStatic } from "@forest-fire/types";
import { NamedFakes } from "~/types/constants";
import { Model } from "~/models/Model";
import { ConstructorFor } from "common-types";

export type MockHelper = {
  faker: FakerStatic;
}

/**
 * A function which receives the faker library and produces fake fixture data
 * when called. This type of function is leveraged from within the `@forest-fire/fixture`
 * repo and is not executed directly inside of **Firemodel** itself anymore.
 */
export type MockFunction<T extends Model> = (context: MockHelper) => T | Promise<T>;
export type FmMockType<T extends Model> = keyof typeof NamedFakes | MockFunction<T>;
export type IFmHasOne = string;
export type IFmFunctionToConstructor<T extends Model = Model> = () => ConstructorFor<T>;
export type IFmRelationshipDirectionality = "bi-directional" | "one-way";