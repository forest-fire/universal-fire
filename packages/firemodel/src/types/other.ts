import { NamedFakes } from "~/types/constants";
import { Model } from "~/models/Model";
import { ConstructorFor, IDictionary } from "common-types";
import type { FakerStatic } from "@forest-fire/types"

/**
 * A function which receives the faker library and produces fake fixture data
 * when called. This type of function is leveraged from within the `@forest-fire/fixture`
 * repo and is not executed directly inside of **Firemodel** itself anymore.
 */
export type BespokeMock = (faker: FakerStatic) => any

export type FmMockType<T extends any> =
  | keyof typeof NamedFakes
  | BespokeMock;

export type IFmHasOne = string;

export type IFmFunctionToConstructor<T extends Model = Model> =
  () => ConstructorFor<T>;
export type IFmRelationshipDirectionality = "bi-directional" | "one-way";
