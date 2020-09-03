import { IDictionary } from 'common-types';

/**
 * **IMockDelayedState**
 *
 * Provides both a synchronous "initial state" as well a asynchronous function which returns
 * a representation of state that will exist once "connected".
 */
export interface IMockDelayedState<TState extends IDictionary> {
  /** the initial state created immediately once the mock database is constructed */
  initial: TState;
  /**
   * an async function which returns the state to start with once the mock database
   * has been "connected".
   */
  connect: () => Promise<TState>;
}
