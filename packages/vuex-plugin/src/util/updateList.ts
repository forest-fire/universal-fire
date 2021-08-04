import { FireModelPluginError } from "../errors/FiremodelPluginError";
import { IDictionary } from "common-types";
import { IModel, Model, PropertyOf } from "firemodel";
import Vue from "vue";

interface IDictionaryWithId extends IDictionary {
  id: string;
}

/**
 * **updateList**
 *
 * Updates a module's state tree for a property which is based on a "list watcher";
 * the actual _list_ data will be based off the root of module state if no `moduleState`
 * is passed in; in other cases it will use the `moduleState` as an offset to arrive
 * at the root of the array.
 *
 * @param moduleState the module state tree
 * @param offset the offset from the root where the data is stored;
 * by default it is "all" but can be anything including _undefined_ (aka, no offset)
 * @param value the value of the record which has changed
 */
export function updateList<
  TModel extends Model,
  TState extends IDictionary<TModel[]> = IDictionary<TModel[]>,
  TId extends keyof TState & string = keyof TState & string
>(
  moduleState: TState,
  offset: TId,
  /** the new record value OR "null" if removing the record */
  value: TModel | null
): void {
  if (!offset) {
    throw new FireModelPluginError(
      '"updateList" was passed a falsy value for an offset; this is not currently allowed',
      'not-allowed'
    );
  }

  const existing: IModel<TModel>[] = moduleState[offset] || [];

  let found = false;
  const updated: IModel<TModel>[] = existing.map((i) => {
    if (value && i.id === value.id) {
      found = true;
    }
    return value && i.id === value.id ? value : i;
  });

  Vue.set(
    moduleState as Record<string, unknown>,
    offset,
    found ? updated : existing.concat(value as TModel)
  );

  // set<IDictionaryWithId>(
  //   moduleState,
  //   offset,
  //   found ? updated : existing.concat(value as IDictionaryWithId)
  // );
}
