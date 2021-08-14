import type { IFiremodelState } from "~/types";

/**
 * The default state for this plugin's **Vuex** state node
 */
export const state: () => IFiremodelState = () => ({
  authenticated: undefined,
  status: "unconfigured",
  queued: [],
  watching: [],
  localOnly: {},
  muted: [],
  currentUser: null
});
