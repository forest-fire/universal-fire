import { IFmWatchEvent } from "firemodel";
import { pathJoin } from "native-dash";
import { ISdk } from "universal-fire";
import { Model } from "firemodel";

/**
 * **pathToState**
 *
 * Takes a **Firemodel** server event and determines the
 * appropriate path to the local state node.
 */
export function determineLocalStateNode<S extends ISdk = ISdk, T extends Model = Model>(
  payload: IFmWatchEvent<S, T>,
  mutation: string
) {
  return pathJoin(
    (payload.localPath || "").replace(`/${payload.localPostfix}`, ""),
    mutation
  );
}
