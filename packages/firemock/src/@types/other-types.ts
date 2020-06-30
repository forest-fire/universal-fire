import { IDictionary } from 'common-types';

/** named network delays */
export enum Delays {
  random = 'random',
  weak = 'weak-mobile',
  mobile = 'mobile',
  WiFi = 'WIFI',
}

export type DelayType = number | number[] | IDictionary<number> | Delays;
