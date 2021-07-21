import type { IModel } from "@/types";
import type { FakerStatic } from "@forest-fire/types";
import { NamedFakes } from "@/types/constants";

export type MockHelper = {
  faker: FakerStatic;
}

/**
 * A function which receives the faker library and produces fake fixture data
 * when called. This type of function is leveraged from within the `@forest-fire/fixture`
 * repo and is not executed directly inside of **Firemodel** itself anymore.
 */
export type MockFunction<T extends IModel> = (context: MockHelper) => T | Promise<T>;
export type FmMockType<T extends IModel> = keyof typeof NamedFakes | MockFunction<T>;
export type IFmHasOne = string;
export type IFmFunctionToConstructor<X = any> = () => new () => X;
export type IFmRelationshipDirectionality = "bi-directional" | "one-way";