import { IDictionary, wait } from "common-types";

import { IWatcherEventContext, IModel } from "~/types";
import { ISdk } from "@forest-fire/types";

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized: IDictionary<boolean | "timed-out"> = {};

export const hasInitialized = (
  watcherId?: string,
  value: true | "timed-out" = true
): IDictionary<boolean | "timed-out"> => {
  if (watcherId) {
    _hasInitialized[watcherId] = value;
  }

  return _hasInitialized;
};

/**
 * Waits for a newly started watcher to get back the first
 * data from the watcher. This indicates that the frontend
 * and Firebase DB are now in sync.
 */
export async function waitForInitialization<S extends ISdk, T extends IModel>(
  watcher: IWatcherEventContext<S, T>,
  timeout = 750
): Promise<void> {
  const startTime = new Date().getTime();

  let stopWaiting = false;
  function possibleProblem() {
    console.info(
      `A watcher [ ${watcher.watcherId
      } ] has not returned an event in the timeout window  [ ${timeout}ms ]. This might represent an issue but can also happen when a watcher starts listening to a path [ ${watcher.watcherPaths.join(
        ", "
      )} ] which has no data yet.`
    );
  }

  function ready<T>(watcher: IWatcherEventContext<S, T>) {
    return hasInitialized()[watcher.watcherId] ? true : false;
  }

  // poll for readiness; checking at each checkpoint if we need to
  // express that the expected timeframe has been exceeded.
  while (!ready(watcher) && !stopWaiting) {
    await wait(50);
    const currentTime = new Date().getTime();

    if (currentTime - startTime > timeout) {
      stopWaiting = true;
      possibleProblem();
    }
  }
}
