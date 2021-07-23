import { IDictionary } from "common-types";
import { Store } from "vuex";
import { StoreWithPlugin } from "~/types";

let _store: Store<StoreWithPlugin>;

export function preserveStore<T extends StoreWithPlugin<IDictionary>>(store: Store<T>) {
  _store = store;
}

export function getStore<T extends StoreWithPlugin = StoreWithPlugin>() {
  return _store as unknown as Store<T>;
}
