import { IListOptions, IListQueryOptions } from "@/types";
import { ISdk, IModel, IDatabaseSdk } from "@forest-fire/types";
import { DefaultDbCache } from "../DefaultDbCache";

/**
 * List.query() has a naturally more limited scope of options
 * than most of the List.xxx query operations. This function
 * narrows the options that these query shorthands have received
 * to just those options which are
 */
export function reduceOptionsForQuery<S extends ISdk, T extends IModel>(
  o: IListOptions<S, T>
): IListQueryOptions<S, T> {
  return {
    db: o.db || DefaultDbCache().get() as IDatabaseSdk<S>,
    logger: o.logger,
    offsets: o.offsets,
    paginate: o.paginate,
  };
}
