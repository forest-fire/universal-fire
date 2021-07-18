import type { IModel } from "./index";
import type { FakerStatic } from "../fire-types";
import { IDictionary } from "common-types";
import { NamedFakes } from "./constants";

export type MockHelper = {
  faker: FakerStatic;
}

/**
 * A function which receives the faker library and produces fake fixture data
 * when called. This type of function is leveraged from within the `@forest-fire/fixture`
 * repo and is not executed directly inside of **Firemodel** itself anymore.
 */
export type MockFunction<T extends IModel = Omit<IModel, "META"> & IDictionary> = (context: MockHelper) => T | Promise<T>;
export type FmMockType = keyof typeof NamedFakes | MockFunction;
export type IFmHasOne = string;
export type IFmFunctionToConstructor<X = any> = () => new () => X;
export type IFmRelationshipDirectionality = "bi-directional" | "one-way";