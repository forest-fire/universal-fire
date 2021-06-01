import { NetworkDelay } from './index';

/**
 * Options to effect the behavior of a mock database/auth service
 */
export interface IMockServerOptions {
  /**
   * Allows setting a network delay which will be applied to all requests
   * to DB and Auth services. The values allowed are either a static number,
   * a range (represented as a tuple), or a named range provided by `NetworkDelay`.
   *
   * By default the network delay will be at [5, 20]. This represents a very fast response
   * while maintaining some variance to similulate the real world.
   *
   * > **Note:** all numbers are in miliseconds
   */
  networkDelay?: NetworkDelay | number | [number, number];
  /** not supported yet, for future integration of firebase rules */
  rules?: string;
}
