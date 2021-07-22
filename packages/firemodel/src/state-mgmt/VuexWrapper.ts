import { IReduxAction, IVuexDispatch } from "~/types";

/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export function VeuxWrapper<O extends unknown = Record<string, unknown>>(
  vuexDispatch: IVuexDispatch<IReduxAction, O>
) {
  /** vuex wrapped redux dispatch function */
  return async (reduxAction: IReduxAction): Promise<O> => {
    const type = reduxAction.type;
    delete reduxAction.type;
    return vuexDispatch(type, reduxAction);
  };
}
